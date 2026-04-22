const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const puppeteer = require("puppeteer");

const { verifyToken } = require("../middleware/authMiddleware");
const { pool } = require("../config/db");

/* ===============================
   SAFE HTML ESCAPE
================================ */
function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/* ===============================
   ENRICH CERTIFICATE DATA
================================ */
async function enrichCertificate(certificate) {
  const enriched = {
    ...certificate,
    program_name: "Cyber Aware Nepal",
    certificate_label: "Final Certificate",
    module_title: null,
    module_titles: [],
    topic_titles: [],
    completion_summary:
      "Successfully completed the required cybersecurity awareness training path.",
  };

  if (certificate.certificate_type === "final") {
    const [moduleRows] = await pool.query(
      `
      SELECT m.title
      FROM modules m
      WHERE m.is_public = 1
        AND m.audience_type = 'general'
      ORDER BY m.id ASC
      `
    );

    const [topicRows] = await pool.query(
      `
      SELECT t.title
      FROM topics t
      JOIN modules m ON m.id = t.module_id
      WHERE m.is_public = 1
        AND m.audience_type = 'general'
      ORDER BY t.id ASC
      `
    );

    const moduleTitles = moduleRows.map((row) => row.title);
    const topicTitles = topicRows.map((row) => row.title);

    enriched.certificate_label = "Final Program Certificate";
    enriched.module_titles = moduleTitles;
    enriched.topic_titles = topicTitles;
    enriched.completion_summary = `Successfully completed the full Cyber Aware Nepal general cyber awareness program, including ${moduleTitles.length} general modules, ${topicTitles.length} topics, required lessons, quizzes, and practical simulations.`;
  }

  if (certificate.certificate_type === "module" && certificate.reference_id) {
    const [moduleRows] = await pool.query(
      `
      SELECT id, title
      FROM modules
      WHERE id = ?
      LIMIT 1
      `,
      [certificate.reference_id]
    );

    const moduleTitle = moduleRows[0]?.title || "Assigned Training Module";

    const [topicRows] = await pool.query(
      `
      SELECT title
      FROM topics
      WHERE module_id = ?
      ORDER BY id ASC
      `,
      [certificate.reference_id]
    );

    const topicTitles = topicRows.map((row) => row.title);

    enriched.certificate_label = "Module Certificate";
    enriched.module_title = moduleTitle;
    enriched.topic_titles = topicTitles;
    enriched.completion_summary = `Successfully completed the assigned training module "${moduleTitle}", including all required topic lessons, quizzes, and simulation exercises.`;
  }

  if (certificate.certificate_type === "organization") {
    enriched.certificate_label = "Organization Certificate";
    enriched.completion_summary =
      "Successfully completed the required organization cybersecurity training path.";
  }

  return enriched;
}

/* ===============================
   BUILD CERTIFICATE HTML
================================ */
function buildCertificateHtml(certificate) {
  const issueDate = certificate?.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const studentName = escapeHtml(certificate?.student_name || "Student");
  const certificateNo = escapeHtml(certificate?.certificate_no || "N/A");
  const certificateLabel = escapeHtml(
    certificate?.certificate_label || "Certificate"
  );
  const programName = escapeHtml(
    certificate?.program_name || "Cyber Aware Nepal"
  );
  const moduleTitle = escapeHtml(certificate?.module_title || "");
  const completionSummary = escapeHtml(certificate?.completion_summary || "");
  const topicTitles = Array.isArray(certificate?.topic_titles)
    ? certificate.topic_titles
    : [];

  let heroText = `
    has successfully completed the required
    <span class="highlight">${programName}</span>
    training requirements.
  `;

  if (certificate?.certificate_type === "final") {
    heroText = `
      has successfully completed the full
      <span class="highlight">${programName} General Cyber Awareness Program</span>,
      including all required modules, topic lessons, quizzes, and simulations.
    `;
  }

  if (certificate?.certificate_type === "module") {
    heroText = `
      has successfully completed
      <span class="highlight">${moduleTitle || "the assigned training module"}</span>
      under the ${programName} learning platform.
    `;
  }

  if (certificate?.certificate_type === "organization") {
    heroText = `
      has successfully completed the required
      <span class="highlight">${programName} Organization Training Program</span>.
    `;
  }

  const metaCards = [];

  metaCards.push(`
    <div class="meta-card">
      <div class="meta-label">Certificate No</div>
      <div class="meta-value">${certificateNo}</div>
    </div>
  `);

  metaCards.push(`
    <div class="meta-card">
      <div class="meta-label">Issued Date</div>
      <div class="meta-value">${escapeHtml(issueDate)}</div>
    </div>
  `);

  metaCards.push(`
    <div class="meta-card">
      <div class="meta-label">Certificate Type</div>
      <div class="meta-value">${certificateLabel}</div>
    </div>
  `);

  if (certificate?.certificate_type === "module" && moduleTitle) {
    metaCards.push(`
      <div class="meta-card">
        <div class="meta-label">Module Name</div>
        <div class="meta-value">${moduleTitle}</div>
      </div>
    `);
  }

  const topicBlocks =
    topicTitles.length > 0
      ? `
        <div class="topics-section">
          <div class="topics-title">Covered Topics</div>
          <div class="topics-grid ${
            topicTitles.length <= 3 ? "topics-grid-one-row" : ""
          }">
            ${topicTitles
              .map(
                (topic) => `
                <div class="topic-chip">${escapeHtml(topic)}</div>
              `
              )
              .join("")}
          </div>
        </div>
      `
      : "";

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <title>Certificate</title>
        <style>
          @page {
            size: A4 landscape;
            margin: 0;
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 297mm;
            height: 210mm;
            background: #ffffff;
            font-family: Arial, sans-serif;
            overflow: hidden;
          }

          body {
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .page {
            width: 297mm;
            height: 210mm;
            background: #ffffff;
            padding: 4mm;
          }

          .outer {
            width: 100%;
            height: 100%;
            border: 1.4mm solid #cfa63a;
            border-radius: 5mm;
            padding: 2mm;
            background: linear-gradient(135deg, #fffdf8 0%, #fffefb 55%, #fffaf0 100%);
          }

          .inner {
            width: 100%;
            height: 100%;
            border: 0.45mm solid #d8dee9;
            border-radius: 4mm;
            padding: 5mm 8mm 5mm;
            background:
              radial-gradient(circle at top left, rgba(209, 213, 219, 0.10), transparent 18%),
              radial-gradient(circle at bottom right, rgba(212, 167, 44, 0.06), transparent 20%),
              #ffffff;
          }

          .certificate-core {
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: flex-start;
            gap: 2.5mm;
          }

          .top-badge {
            width: 10mm;
            height: 10mm;
            border-radius: 50%;
            border: 0.8mm solid #cfa63a;
            background: linear-gradient(135deg, #f7fbff, #eef4ff);
            margin: 0 auto 1mm;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4.8mm;
            font-weight: bold;
            color: #1e3a8a;
          }

          .title {
            text-align: center;
            font-size: 8.8mm;
            line-height: 1.05;
            font-weight: 700;
            color: #0f172a;
            font-family: Georgia, "Times New Roman", serif;
            margin: 0;
            letter-spacing: 0.1px;
          }

          .brand {
            text-align: center;
            color: #2952cc;
            font-size: 4mm;
            font-weight: 700;
            margin-top: 1mm;
          }

          .brand-line {
            width: 18mm;
            height: 1.1mm;
            background: #cfa63a;
            border-radius: 999px;
            margin: 1.2mm auto 1.6mm;
          }

          .pill {
            display: table;
            margin: 0 auto 1.2mm;
            padding: 1.6mm 4.2mm;
            border-radius: 999px;
            background: linear-gradient(180deg, #eef4ff, #e7eefb);
            border: 0.35mm solid #c9d5ea;
            color: #3156c9;
            font-size: 2.9mm;
            font-weight: 700;
            white-space: nowrap;
          }

          .lead {
            text-align: center;
            font-size: 3.4mm;
            color: #64748b;
            margin: 0 0 0.6mm;
            line-height: 1.2;
          }

          .student-name {
            text-align: center;
            font-size: 7.2mm;
            line-height: 1.04;
            font-weight: 700;
            color: #0f172a;
            font-family: Georgia, "Times New Roman", serif;
            margin: 0;
            word-break: break-word;
          }

          .name-line {
            width: 28mm;
            height: 0.55mm;
            background: #cfd8e3;
            margin: 1mm auto 1.8mm;
            border-radius: 999px;
          }

          .hero-text {
            max-width: 205mm;
            margin: 0 auto;
            text-align: center;
            font-size: 3.1mm;
            line-height: 1.52;
            color: #475569;
            font-weight: 500;
          }

          .hero-text .highlight {
            color: #1f4acc;
            font-weight: 700;
          }

          .summary {
            max-width: 215mm;
            margin: 0 auto;
            text-align: center;
            font-size: 2.55mm;
            line-height: 1.45;
            color: #64748b;
          }

          .meta {
            display: grid;
            gap: 2mm;
            margin-top: 0.6mm;
          }

          .meta.meta-3 {
            grid-template-columns: repeat(3, 1fr);
          }

          .meta.meta-4 {
            grid-template-columns: repeat(4, 1fr);
          }

          .meta-card {
            min-height: 14.5mm;
            background: linear-gradient(180deg, #fbfcfe 0%, #f7fafc 100%);
            border: 0.35mm solid #d7dee8;
            border-radius: 3.2mm;
            padding: 2mm 2.5mm;
            text-align: center;
            display: flex;
            flex-direction: column;
            justify-content: center;
          }

          .meta-label {
            color: #64748b;
            font-size: 2.2mm;
            line-height: 1.2;
            margin-bottom: 1.1mm;
          }

          .meta-value {
            color: #111827;
            font-size: 3.4mm;
            line-height: 1.25;
            font-weight: 700;
            word-break: break-word;
          }

          .topics-section {
            margin-top: 0.5mm;
          }

          .topics-title {
            font-size: 3.2mm;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 1.2mm;
          }

          .topics-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 1.1mm 1.6mm;
          }

          .topics-grid-one-row {
            grid-template-columns: repeat(2, 1fr);
          }

          .topic-chip {
            min-height: 8.2mm;
            display: flex;
            align-items: center;
            background: #f8fafc;
            border: 0.35mm solid #d8e0ea;
            border-radius: 2.4mm;
            padding: 1.4mm 2.2mm;
            color: #475569;
            font-size: 2.45mm;
            line-height: 1.3;
            word-break: break-word;
          }

          .footer {
            margin-top: auto;
            padding-top: 1.2mm;
            display: grid;
            grid-template-columns: 1fr auto 1fr;
            gap: 6mm;
            align-items: end;
          }

          .footer-col {
            text-align: center;
          }

          .signature-mark {
            height: 5.4mm;
            display: flex;
            align-items: flex-end;
            justify-content: center;
            color: #334155;
            font-size: 3mm;
            font-family: "Brush Script MT", "Segoe Script", cursive;
            font-style: italic;
          }

          .sign-line {
            width: 78%;
            border-top: 0.35mm solid #b7c3d4;
            margin: 0.8mm auto 0.9mm;
          }

          .footer-title {
            color: #111827;
            font-size: 3.1mm;
            font-weight: 700;
            line-height: 1.2;
          }

          .footer-sub {
            color: #6b7280;
            font-size: 2.35mm;
            margin-top: 0.4mm;
            line-height: 1.25;
          }

          .seal-wrap {
            text-align: center;
            min-width: 26mm;
          }

          .seal {
            width: 10mm;
            height: 10mm;
            margin: 0 auto 0.8mm;
            border-radius: 50%;
            border: 0.8mm solid #cfa63a;
            background: linear-gradient(180deg, #fff9de 0%, #fff2b8 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 4mm;
          }

          .seal-title {
            color: #4b5563;
            font-size: 2.5mm;
            font-weight: 600;
            line-height: 1.2;
          }

          .bottom-note {
            text-align: center;
            color: #94a3b8;
            font-size: 1.95mm;
            line-height: 1.2;
            margin-top: 1mm;
          }
        </style>
      </head>
      <body>
        <div class="page">
          <div class="outer">
            <div class="inner">
              <div class="certificate-core">
                <div class="top-badge">🛡️</div>

                <h1 class="title">Certificate of Completion</h1>
                <div class="brand">${programName}</div>
                <div class="brand-line"></div>

                <div class="pill">${certificateLabel}</div>

                <div class="lead">This is to certify that</div>
                <h2 class="student-name">${studentName}</h2>
                <div class="name-line"></div>

                <div class="hero-text">${heroText}</div>
                <div class="summary">${completionSummary}</div>

                <div class="meta ${metaCards.length === 4 ? "meta-4" : "meta-3"}">
                  ${metaCards.join("")}
                </div>

                ${topicBlocks}

                <div class="footer">
                  <div class="footer-col">
                    <div class="signature-mark">Pawan Regami Magar</div>
                    <div class="sign-line"></div>
                    <div class="footer-title">Pawan Regami Magar</div>
                    <div class="footer-sub">Program Coordinator / Admin</div>
                  </div>

                  <div class="seal-wrap">
                    <div class="seal">🏅</div>
                    <div class="seal-title">Official Seal</div>
                  </div>

                  <div class="footer-col">
                    <div class="signature-mark">Bipul Ghimire</div>
                    <div class="sign-line"></div>
                    <div class="footer-title">Verified by Bipul Ghimire</div>
                    <div class="footer-sub">Verification Signatory</div>
                  </div>
                </div>

                <div class="bottom-note">
                  Official certificate issued by Cyber Aware Nepal and verified by the program administration.
                </div>
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  `;
}

/* ===============================
   GENERATE PDF FILE
================================ */
async function generateCertificatePdf(certificate, absolutePath) {
  fs.mkdirSync(path.dirname(absolutePath), { recursive: true });

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();

    await page.setViewport({
      width: 1400,
      height: 990,
      deviceScaleFactor: 1,
    });

    await page.setContent(buildCertificateHtml(certificate), {
      waitUntil: "networkidle0",
    });

    await page.pdf({
      path: absolutePath,
      format: "A4",
      landscape: true,
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "0mm",
        right: "0mm",
        bottom: "0mm",
        left: "0mm",
      },
      pageRanges: "1",
    });
  } finally {
    await browser.close();
  }
}

/* ===============================
   GET ALL MY CERTIFICATES
================================ */
router.get("/my", verifyToken, async (req, res) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.student_id,
        c.certificate_no,
        c.file_path,
        c.issued_at,
        c.certificate_type,
        c.reference_id,
        u.full_name AS student_name
      FROM certificates c
      JOIN users u ON u.id = c.student_id
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC, c.id DESC
      `,
      [studentId]
    );

    const enrichedCertificates = await Promise.all(
      rows.map((row) => enrichCertificate(row))
    );

    return res.json({
      success: true,
      data: enrichedCertificates,
    });
  } catch (err) {
    console.error("GET CERTIFICATES ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

/* ===============================
   DOWNLOAD MY LATEST CERTIFICATE
================================ */
router.get("/my/download", verifyToken, async (req, res) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.student_id,
        c.certificate_no,
        c.file_path,
        c.issued_at,
        c.certificate_type,
        c.reference_id,
        u.full_name AS student_name
      FROM certificates c
      JOIN users u ON u.id = c.student_id
      WHERE c.student_id = ?
      ORDER BY c.issued_at DESC, c.id DESC
      LIMIT 1
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Certificate not found",
      });
    }

    const certificate = await enrichCertificate(rows[0]);
    const cleanPath = String(certificate.file_path || "").replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), cleanPath);

    await generateCertificatePdf(certificate, absolutePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        error: "Certificate PDF file not found on server",
      });
    }

    return res.download(
      absolutePath,
      `${certificate.certificate_no || "certificate"}.pdf`
    );
  } catch (err) {
    console.error("DOWNLOAD MY CERTIFICATE ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

/* ===============================
   DOWNLOAD CERTIFICATE BY ID
================================ */
router.get("/:id/download", verifyToken, async (req, res) => {
  try {
    const studentId = req.user?.id;
    const certificateId = Number(req.params.id);

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (!certificateId) {
      return res.status(400).json({ error: "Invalid certificate id" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.student_id,
        c.certificate_no,
        c.file_path,
        c.issued_at,
        c.certificate_type,
        c.reference_id,
        u.full_name AS student_name
      FROM certificates c
      JOIN users u ON u.id = c.student_id
      WHERE c.id = ?
        AND c.student_id = ?
      LIMIT 1
      `,
      [certificateId, studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        error: "Certificate not found",
      });
    }

    const certificate = await enrichCertificate(rows[0]);
    const cleanPath = String(certificate.file_path || "").replace(/^\/+/, "");
    const absolutePath = path.join(process.cwd(), cleanPath);

    await generateCertificatePdf(certificate, absolutePath);

    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        error: "Certificate PDF file not found on server",
      });
    }

    return res.download(
      absolutePath,
      `${certificate.certificate_no || "certificate"}.pdf`
    );
  } catch (err) {
    console.error("DOWNLOAD CERTIFICATE ERROR:", err);
    return res.status(500).json({
      error: "Internal server error",
      details: err.message,
    });
  }
});

module.exports = router;