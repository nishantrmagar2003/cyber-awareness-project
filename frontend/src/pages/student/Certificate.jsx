import { useEffect, useMemo, useState } from "react";
import api from "../../services/api";
import "../../styles/certificate.css";

function getCertificateTypeLabel(certificate) {
  return (
    certificate?.certificate_label ||
    (certificate?.certificate_type === "module"
      ? "Module Certificate"
      : certificate?.certificate_type === "organization"
      ? "Organization Certificate"
      : "Final Program Certificate")
  );
}

function getCertificateTitle(certificate) {
  if (certificate?.certificate_type === "module" && certificate?.module_title) {
    return certificate.module_title;
  }

  if (certificate?.certificate_type === "final") {
    return "Cyber Aware Nepal General Cyber Awareness Program";
  }

  if (certificate?.certificate_type === "organization") {
    return "Organization Cybersecurity Training Program";
  }

  return "Cyber Aware Nepal Training Certificate";
}

function getHeroText(certificate) {
  const title = getCertificateTitle(certificate);

  if (certificate?.certificate_type === "final") {
    return (
      <>
        has successfully completed the full{" "}
        <span className="student-certificate-highlight">{title}</span>,
        including all required modules, topic lessons, quizzes, and simulations.
      </>
    );
  }

  if (certificate?.certificate_type === "module") {
    return (
      <>
        has successfully completed{" "}
        <span className="student-certificate-highlight">{title}</span> under the
        Cyber Aware Nepal learning platform.
      </>
    );
  }

  if (certificate?.certificate_type === "organization") {
    return (
      <>
        has successfully completed the required{" "}
        <span className="student-certificate-highlight">{title}</span>.
      </>
    );
  }

  return (
    <>
      has successfully completed the required{" "}
      <span className="student-certificate-highlight">
        Cyber Aware Nepal Training Program
      </span>
      .
    </>
  );
}

function getAchievementText(certificate) {
  if (certificate?.completion_summary) {
    return certificate.completion_summary;
  }

  if (certificate?.certificate_type === "module") {
    return `Successfully completed the assigned training module "${
      certificate?.module_title || "Assigned Training Module"
    }", including all required topic lessons, quizzes, and simulation exercises.`;
  }

  if (certificate?.certificate_type === "final") {
    return "Successfully completed the full Cyber Aware Nepal general cyber awareness program, including all general modules, topics, required lessons, quizzes, and practical simulations.";
  }

  if (certificate?.certificate_type === "organization") {
    return "Successfully completed the required organization cybersecurity training path.";
  }

  return "Successfully completed the required training path for this certificate.";
}

function renderTopicList(topics = []) {
  if (!Array.isArray(topics) || topics.length === 0) return null;

  return (
    <div className="student-certificate-topics">
      <h3 className="student-certificate-topics__title">Covered Topics</h3>

      <div className="student-certificate-topics__grid">
        {topics.map((topic, index) => (
          <div
            key={`${topic}-${index}`}
            className="student-certificate-topics__item"
          >
            {topic}
          </div>
        ))}
      </div>
    </div>
  );
}

function CertificateCard({ certificate, downloadingId, onDownload }) {
  const issueDate = certificate?.issued_at
    ? new Date(certificate.issued_at).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : "N/A";

  const certificateTypeLabel = getCertificateTypeLabel(certificate);
  const achievementText = getAchievementText(certificate);
  const topicTitles = Array.isArray(certificate?.topic_titles)
    ? certificate.topic_titles
    : [];
  const isModuleCertificate = certificate?.certificate_type === "module";

  return (
    <div className="student-certificate-card-wrap">
      <div className="student-certificate-card-actions">
        <button
          onClick={() => onDownload(certificate)}
          disabled={downloadingId === certificate.id}
          className={`student-certificate-download-btn ${
            downloadingId === certificate.id
              ? "student-certificate-download-btn--disabled"
              : ""
          }`}
        >
          {downloadingId === certificate.id ? "Downloading..." : "Download PDF"}
        </button>
      </div>

      <div className="student-certificate-frame-outer">
        <div className="student-certificate-frame-inner">
          <div className="student-certificate-header">
            <div className="student-certificate-seal">🛡️</div>

            <h2 className="student-certificate-main-title">
              Certificate of Completion
            </h2>

            <p className="student-certificate-program">
              {certificate?.program_name || "Cyber Aware Nepal"}
            </p>

            <div className="student-certificate-divider" />
          </div>

          <div className="student-certificate-body">
            <div className="student-certificate-pill">
              {certificateTypeLabel}
            </div>

            <p className="student-certificate-label">This is to certify that</p>

            <h1 className="student-certificate-student-name">
              {certificate.student_name}
            </h1>

            <div className="student-certificate-name-line" />

            <div className="student-certificate-description">
              <p className="student-certificate-hero-text">
                {getHeroText(certificate)}
              </p>

              <p className="student-certificate-achievement-text">
                {achievementText}
              </p>
            </div>
          </div>

          <div
            className={`student-certificate-meta-grid ${
              isModuleCertificate
                ? "student-certificate-meta-grid--four"
                : "student-certificate-meta-grid--three"
            }`}
          >
            <div className="student-certificate-meta-box">
              <p>Certificate No</p>
              <h4>{certificate.certificate_no}</h4>
            </div>

            <div className="student-certificate-meta-box">
              <p>Issued Date</p>
              <h4>{issueDate}</h4>
            </div>

            <div className="student-certificate-meta-box">
              <p>Certificate Type</p>
              <h4>{certificateTypeLabel}</h4>
            </div>

            {isModuleCertificate && (
              <div className="student-certificate-meta-box">
                <p>Module Name</p>
                <h4>
                  {certificate?.module_title || "Assigned Training Module"}
                </h4>
              </div>
            )}
          </div>

          {renderTopicList(topicTitles)}

          <div className="student-certificate-signatures">
            <div className="student-certificate-signature-block">
              <div className="student-certificate-signature-name handwritten">
                Pawan Regami Magar
              </div>
              <div className="student-certificate-signature-line" />
              <p className="student-certificate-signature-title">
                Pawan Regami Magar
              </p>
              <p className="student-certificate-signature-subtitle">
                Program Coordinator / Admin
              </p>
            </div>

            <div className="student-certificate-signature-center">
              <div className="student-certificate-signature-seal">🏅</div>
              <p className="student-certificate-signature-subtitle">
                Official Seal
              </p>
            </div>

            <div className="student-certificate-signature-block">
              <div className="student-certificate-signature-name handwritten">
                Bipul Ghimire
              </div>
              <div className="student-certificate-signature-line" />
              <p className="student-certificate-signature-title">
                Verified by Bipul Ghimire
              </p>
              <p className="student-certificate-signature-subtitle">
                Verification Signatory
              </p>
            </div>
          </div>

          <div className="student-certificate-footer-note">
            Official certificate issued by Cyber Aware Nepal and verified by the
            program administration.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Certificate() {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState(null);

  const user = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "{}");
    } catch {
      return {};
    }
  }, []);

  const isOrgStudent = user?.role === "org_student";
  const isGeneralUser = user?.role === "general_user";

  useEffect(() => {
    loadCertificates();
  }, []);

  async function loadCertificates() {
    try {
      const res = await api.get("/certificates/my");
      const data = res?.data?.data;

      if (Array.isArray(data)) {
        setCertificates(data);
      } else if (data) {
        setCertificates([data]);
      } else {
        setCertificates([]);
      }
    } catch (err) {
      console.error("Certificate fetch error:", err);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDownload(certificate) {
    try {
      setDownloadingId(certificate.id);

      const res = await api.get(`/certificates/${certificate.id}/download`, {
        responseType: "blob",
      });

      const blob = new Blob([res.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${
        certificate?.certificate_no || "certificate"
      }-cyber-aware-nepal.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Certificate download error:", err);
      alert(err?.response?.data?.error || "Failed to download certificate");
    } finally {
      setDownloadingId(null);
    }
  }

  if (loading) {
    return (
      <div className="student-certificate-page">
        <div className="student-certificate-wrap">
          <div className="student-certificate-loading">
            Loading certificate...
          </div>
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="student-certificate-page">
        <div className="student-certificate-wrap">
          <div className="student-certificate-empty">
            <h1 className="student-certificate-page-title">Certificate</h1>

            {isGeneralUser ? (
              <p>
                Complete all general learning modules and topics successfully to
                unlock your final program certificate.
              </p>
            ) : isOrgStudent ? (
              <p>
                Complete your assigned organization training module(s) to unlock
                your module certificate(s).
              </p>
            ) : (
              <p>No certificate available yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="student-certificate-page">
      <div className="student-certificate-wrap">
        <div className="student-certificate-page-head">
          <p className="student-certificate-page-eyebrow">
            Cyber Awareness Certification
          </p>
          <h1 className="student-certificate-page-title">
            {isOrgStudent ? "My Module Certificates" : "My Certificates"}
          </h1>
          <p className="student-certificate-page-subtitle">
            {isOrgStudent
              ? "Certificates earned from completed assigned organization training modules."
              : "Your earned cybersecurity completion certificates."}
          </p>
        </div>

        <div className="student-certificate-list">
          {certificates.map((certificate) => (
            <CertificateCard
              key={certificate.id || certificate.certificate_no}
              certificate={certificate}
              downloadingId={downloadingId}
              onDownload={handleDownload}
            />
          ))}
        </div>
      </div>
    </div>
  );
}