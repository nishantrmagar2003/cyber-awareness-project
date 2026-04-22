import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import PageHeader from "../../components/ui/PageHeader";
import DataTable from "../../components/ui/DataTable";
import StatusBadge from "../../components/ui/StatusBadge";
import Modal from "../../components/ui/Modal";
import "../../styles/org-students.css";

const EMPTY_FORM = {
  full_name: "",
  email: "",
  phone: "",
  password: "",
};

function formatDate(dateValue) {
  if (!dateValue) return "-";

  try {
    return new Date(dateValue).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "-";
  }
}

function normalizeStatus(status) {
  if (!status) return "Inactive";

  const value = String(status).toLowerCase();

  if (value === "active") return "Active";
  if (value === "pending") return "Pending";
  if (value === "suspended") return "Suspended";
  return "Inactive";
}

function ProgressBar({ value = 0 }) {
  const safeValue = Number(value || 0);

  const colorClass =
    safeValue >= 80
      ? "os-progress__fill--green"
      : safeValue >= 50
        ? "os-progress__fill--indigo"
        : "os-progress__fill--amber";

  return (
    <div className="os-progress">
      <div className="os-progress__track">
        <div
          className={`os-progress__fill ${colorClass}`}
          style={{ width: `${safeValue}%` }}
        />
      </div>
      <span className="os-progress__value">{safeValue}%</span>
    </div>
  );
}

function StudentAvatar({ name }) {
  const initials = (name || "S")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return <div className="os-student-avatar">{initials}</div>;
}

export default function Students() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      setErrorMessage("");

      const res = await api.get("/organizations/students");
      const rows = Array.isArray(res?.data?.data) ? res.data.data : [];

      const mapped = rows.map((student) => ({
        id: student.id,
        full_name: student.full_name || "Unnamed Student",
        email: student.email || "-",
        phone: student.phone || "-",
        status: normalizeStatus(student.status),
        joined: formatDate(student.created_at),
        progress: Number(student.progress || 0),
        raw_created_at: student.created_at || null,
      }));

      setStudents(mapped);
    } catch (error) {
      console.error("Get organization students error:", error);
      setStudents([]);
      setErrorMessage(
        error?.response?.data?.error || "Failed to load students"
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleAddStudent() {
    try {
      setSubmitting(true);
      setErrorMessage("");
      setSuccessMessage("");

      if (
        !form.full_name.trim() ||
        !form.email.trim() ||
        !form.password.trim()
      ) {
        setErrorMessage("Full name, email and password are required.");
        return;
      }

      if (form.phone.trim() && form.phone.trim().length > 20) {
        setErrorMessage("Phone number must be 20 characters or less.");
        return;
      }

      await api.post("/organizations/students", {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        password: form.password,
      });

      setSuccessMessage("Student created successfully.");
      setOpen(false);
      setForm(EMPTY_FORM);

      await fetchStudents();
    } catch (error) {
      console.error("Create organization student error:", error);
      setErrorMessage(
        error?.response?.data?.error || "Failed to create student"
      );
    } finally {
      setSubmitting(false);
    }
  }

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const term = search.toLowerCase();

      const matchesSearch =
        student.full_name.toLowerCase().includes(term) ||
        student.email.toLowerCase().includes(term) ||
        student.phone.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === "All Status" || student.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const totalStudents = filteredStudents.length;
  const activeStudents = filteredStudents.filter(
    (student) => student.status === "Active"
  ).length;

  const averageProgress =
    filteredStudents.length > 0
      ? Math.round(
          filteredStudents.reduce(
            (sum, student) => sum + Number(student.progress || 0),
            0
          ) / filteredStudents.length
        )
      : 0;

  const columns = [
    {
      key: "name",
      label: "Student",
      render: (row) => (
        <div className="os-student-cell">
          <StudentAvatar name={row.full_name} />

          <div className="os-student-cell__meta">
            <p className="os-student-cell__name">{row.full_name}</p>
            <p className="os-student-cell__line">{row.email}</p>
            <p className="os-student-cell__line os-student-cell__line--muted">
              {row.phone}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row) => <StatusBadge status={row.status} />,
    },
    {
      key: "progress",
      label: "Progress",
      render: (row) => <ProgressBar value={row.progress} />,
    },
    {
      key: "joined",
      label: "Joined",
      render: (row) => <span className="os-joined">{row.joined}</span>,
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <button
          onClick={() => navigate(`/organization/students/${row.id}`)}
          className="os-action-btn"
        >
          View Details
        </button>
      ),
    },
  ];

  return (
    <div className="os-page">
      <div className="os-page__header">
        <PageHeader
          title="Students"
          subtitle="Manage students enrolled in your organization"
          action={
            <button
              onClick={() => {
                setErrorMessage("");
                setSuccessMessage("");
                setOpen(true);
              }}
              className="os-primary-btn"
            >
              <span className="os-primary-btn__icon">＋</span>
              <span>Add Student</span>
            </button>
          }
        />
      </div>

      <section className="os-hero">
        <div className="os-hero__content">
          <div>
            <p className="os-hero__eyebrow">Student Management</p>
            <h2 className="os-hero__title">Organization Students Overview</h2>
            <p className="os-hero__subtitle">
              Track student enrollment, active participation, and average
              training progress from one place.
            </p>
          </div>

          <div className="os-hero__badge">
            <span className="os-hero__badge-label">Filtered Results</span>
            <strong className="os-hero__badge-value">
              {loading ? "..." : totalStudents}
            </strong>
          </div>
        </div>

        <div className="os-hero__stats">
          <div className="os-hero-stat">
            <span className="os-hero-stat__label">Total Students</span>
            <div className="os-hero-stat__row">
              <strong className="os-hero-stat__value">
                {loading ? "..." : totalStudents}
              </strong>
              <span className="os-hero-stat__icon">🎓</span>
            </div>
          </div>

          <div className="os-hero-stat">
            <span className="os-hero-stat__label">Active Students</span>
            <div className="os-hero-stat__row">
              <strong className="os-hero-stat__value">
                {loading ? "..." : activeStudents}
              </strong>
              <span className="os-hero-stat__icon">✅</span>
            </div>
          </div>

          <div className="os-hero-stat">
            <span className="os-hero-stat__label">Average Progress</span>
            <div className="os-hero-stat__row">
              <strong className="os-hero-stat__value">
                {loading ? "..." : `${averageProgress}%`}
              </strong>
              <span className="os-hero-stat__icon">📈</span>
            </div>
          </div>
        </div>
      </section>

      {errorMessage && (
        <div className="os-alert os-alert--error">{errorMessage}</div>
      )}

      {successMessage && (
        <div className="os-alert os-alert--success">{successMessage}</div>
      )}

      <section className="os-filter-card">
        <div className="os-filter-card__header">
          <div>
            <h3 className="os-filter-card__title">Search and Filter</h3>
            <p className="os-filter-card__subtitle">
              Find students by name, email, phone, or status.
            </p>
          </div>
        </div>

        <div className="os-filter-row">
          <div className="os-filter-field os-filter-field--grow">
            <label className="os-label">Search</label>
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="os-input"
            />
          </div>

          <div className="os-filter-field os-filter-field--select">
            <label className="os-label">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="os-select"
            >
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
              <option>Pending</option>
              <option>Suspended</option>
            </select>
          </div>
        </div>
      </section>

      <section className="os-table-card">
        <div className="os-table-card__header">
          <div>
            <h3 className="os-table-card__title">Student Directory</h3>
            <p className="os-table-card__subtitle">
              Detailed list of students in your organization.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="os-loading">Loading students...</div>
        ) : (
          <DataTable
            columns={columns}
            data={filteredStudents}
            emptyMessage="No students found."
          />
        )}
      </section>

      <Modal isOpen={open} onClose={() => setOpen(false)} title="Add Student">
        <div className="os-modal-form">
          <div className="os-form-group">
            <label className="os-label">Full Name</label>
            <input
              type="text"
              placeholder="e.g. Arun Sharma"
              value={form.full_name}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, full_name: e.target.value }))
              }
              className="os-input"
            />
          </div>

          <div className="os-form-group">
            <label className="os-label">Email Address</label>
            <input
              type="email"
              placeholder="e.g. arun@org.np"
              value={form.email}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, email: e.target.value }))
              }
              className="os-input"
            />
          </div>

          <div className="os-form-group">
            <label className="os-label">Phone Number</label>
            <input
              type="text"
              placeholder="e.g. 9841234567"
              value={form.phone}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, phone: e.target.value }))
              }
              className="os-input"
            />
          </div>

          <div className="os-form-group">
            <label className="os-label">Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className="os-input"
            />
          </div>

          <p className="os-form-note">
            This student will be created inside your organization.
          </p>

          <div className="os-modal-actions">
            <button
              onClick={handleAddStudent}
              disabled={submitting}
              className={`os-submit-btn ${
                submitting ? "is-disabled" : ""
              }`}
            >
              {submitting ? "Creating..." : "Add Student"}
            </button>

            <button
              onClick={() => setOpen(false)}
              disabled={submitting}
              className="os-cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}