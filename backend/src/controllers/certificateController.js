const { pool } = require("../config/db");
const puppeteer = require("puppeteer");

exports.getMyCertificate = async (req, res) => {
  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.certificate_no,
        c.certificate_type,
        c.reference_id,
        c.file_path,
        c.created_at AS issued_at,
        u.full_name AS student_name
      FROM certificates c
      JOIN users u ON c.student_id = u.id
      WHERE c.student_id = ?
        AND c.certificate_type = 'final'
      ORDER BY c.created_at DESC
      LIMIT 1
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.json({
        success: true,
        data: null
      });
    }

    return res.json({
      success: true,
      data: rows[0]
    });
  } catch (err) {
    console.error("GET MY CERTIFICATE ERROR:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
};

exports.downloadMyCertificate = async (req, res) => {
  let browser;

  try {
    const studentId = req.user?.id;

    if (!studentId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const [rows] = await pool.query(
      `
      SELECT
        c.id,
        c.certificate_no,
        c.certificate_type,
        c.reference_id,
        c.created_at AS issued_at,
        u.full_name AS student_name
      FROM certificates c
      JOIN users u ON c.student_id = u.id
      WHERE c.student_id = ?
        AND c.certificate_type = 'final'
      ORDER BY c.created_at DESC
      LIMIT 1
      `,
      [studentId]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Certificate not found" });
    }

    const cert = rows[0];

    const issueDate = cert.issued_at
      ? new Date(cert.issued_at).toLocaleDateString("en-GB", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })
      : "N/A";

    const html = `
      <html>
        <head>
          <style>
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
              background: #f8fafc;
            }
            .page {
              width: 1123px;
              height: 794px;
              margin: 0 auto;
              background: #fffdf7;
              padding: 28px;
              box-sizing: border-box;
            }
            .outer {
              border: 8px solid #d4af37;
              border-radius: 16px;
              padding: 12px;
              height: 100%;
              box-sizing: border-box;
              background: white;
            }
            .inner {
              border: 2px solid #cbd5e1;
              border-radius: 12px;
              height: 100%;
              padding: 40px 50px;
              box-sizing: border-box;
              text-align: center;
            }
            .logo {
              width: 84px;
              height: 84px;
              border-radius: 50%;
              margin: 0 auto 16px;
              background: #dbeafe;
              border: 4px solid #d4af37;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 36px;
            }
            .title {
              font-family: Georgia, serif;
              font-size: 44px;
              font-weight: bold;
              color: #0f172a;
              margin: 0;
            }
            .subtitle {
              color: #1d4ed8;
              font-size: 20px;
              font-weight: 600;
              margin-top: 12px;
            }
            .line {
              width: 180px;
              height: 4px;
              background: #d4af37;
              margin: 18px auto 30px;
              border-radius: 999px;
            }
            .small {
              color: #64748b;
              font-size: 22px;
            }
            .name {
              font-family: Georgia, serif;
              font-size: 42px;
              font-weight: bold;
              color: #111827;
              margin: 20px 0 10px;
            }
            .name-line {
              width: 300px;
              height: 2px;
              background: #cbd5e1;
              margin: 0 auto 24px;
            }
            .desc {
              color: #334155;
              font-size: 20px;
              line-height: 1.8;
              max-width: 860px;
              margin: 0 auto;
            }
            .meta {
              display: flex;
              justify-content: space-between;
              gap: 20px;
              margin-top: 42px;
            }
            .meta-box {
              flex: 1;
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 16px;
            }
            .meta-label {
              font-size: 14px;
              color: #64748b;
            }
            .meta-value {
              margin-top: 8px;
              font-size: 18px;
              font-weight: bold;
              color: #1e293b;
            }
            .footer {
              display: flex;
              justify-content: space-between;
              align-items: end;
              margin-top: 56px;
            }
            .sign-box {
              width: 240px;
              text-align: center;
            }
            .sign-line {
              border-top: 1px solid #64748b;
              padding-top: 8px;
              margin-top: 38px;
              font-weight: 600;
              color: #1e293b;
            }
            .seal {
              width: 110px;
              height: 110px;
              border-radius: 50%;
              border: 4px solid #d4af37;
              background: #fef9c3;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 42px;
              margin: 0 auto;
            }
            .tiny {
              margin-top: 24px;
              font-size: 12px;
              color: #94a3b8;
            }
          </style>
        </head>
        <body>
          <div class="page">
            <div class="outer">
              <div class="inner">
                <div class="logo">🛡️</div>
                <h1 class="title">Certificate of Completion</h1>
                <div class="subtitle">Cyber Aware Nepal</div>
                <div class="line"></div>

                <div class="small">This is to certify that</div>
                <div class="name">${cert.student_name}</div>
                <div class="name-line"></div>

                <div class="desc">
                  has successfully completed the <b>Cyber Awareness Training Program</b>,
                  including all required videos, text learning, quizzes, and simulations
                  across the full course.
                </div>

                <div class="meta">
                  <div class="meta-box">
                    <div class="meta-label">Certificate No</div>
                    <div class="meta-value">${cert.certificate_no}</div>
                  </div>
                  <div class="meta-box">
                    <div class="meta-label">Issued Date</div>
                    <div class="meta-value">${issueDate}</div>
                  </div>
                  <div class="meta-box">
                    <div class="meta-label">Certificate Type</div>
                    <div class="meta-value">${cert.certificate_type}</div>
                  </div>
                </div>

                <div class="footer">
                  <div class="sign-box">
                    <div class="sign-line">Program Coordinator</div>
                    <div style="font-size: 14px; color: #64748b;">Cyber Aware Nepal</div>
                  </div>

                  <div>
                    <div class="seal">🏅</div>
                    <div style="font-size: 13px; color: #64748b; margin-top: 6px;">Official Seal</div>
                  </div>

                  <div class="sign-box">
                    <div class="sign-line">Verified Completion</div>
                    <div style="font-size: 14px; color: #64748b;">Training Platform Record</div>
                  </div>
                </div>

                <div class="tiny">
                  This certificate is digitally generated by Cyber Aware Nepal.
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      landscape: true,
      margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${cert.certificate_no}.pdf"`
    );

    return res.send(pdf);
  } catch (err) {
    console.error("DOWNLOAD CERTIFICATE ERROR:", err);
    return res.status(500).json({ error: "Failed to generate certificate PDF" });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};