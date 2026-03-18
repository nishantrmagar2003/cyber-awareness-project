import { NavLink } from "react-router-dom";
import "../../styles/common/sidebar.css";

const STUDENT_LINKS = [
  { to: "/student/dashboard", label: "Dashboard" },
  { to: "/student/modules", label: "Modules" },
  { to: "/student/progress", label: "Progress" },
  { to: "/student/badges", label: "Badges" },
  { to: "/student/certificate", label: "Certificate" },
  { to: "/student/settings", label: "Settings" },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <h2>Cyber Aware</h2>
        <span>Nepal</span>
      </div>

      <nav className="sidebar-menu">
        {STUDENT_LINKS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `menu-item${isActive ? " active" : ""}`
            }
            end={item.to === "/student/dashboard"}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
