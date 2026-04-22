import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Sidebar from "../components/common/Sidebar";
import "../styles/student-layout.css";

export default function StudentLayout() {
  return (
    <div className="student-shell">
      <Sidebar />

      <div className="student-shell__content">
        <Navbar />
        <main className="student-shell__main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
