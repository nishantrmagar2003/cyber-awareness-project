import React from "react"; // ✅ ADD THIS
import { Outlet } from "react-router-dom";

export default function PublicLayout() {
  return (
    <div>
      <Outlet />
    </div>
  );
}