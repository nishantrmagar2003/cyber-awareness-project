import { useState } from "react";
import AppRoutes from "./routes/AppRoutes";
import SuperAdminLayout from "./layouts/SuperAdminLayout";
import OrgLayout from "./layouts/OrgLayout";
import LanguageToggle from "./components/common/LanguageToggle";

export default function App() {
  const [previewRole, setPreviewRole] = useState(null);

  if (previewRole) {
    return (
      <>
        <div className="fixed bottom-4 right-4 z-50">
          <button onClick={() => setPreviewRole(null)}>
            ⇄ Exit Preview
          </button>
        </div>

        {previewRole === "superadmin" ? <SuperAdminLayout /> : <OrgLayout />}
      </>
    );
  }

  return (
    <>
      <LanguageToggle />
      <AppRoutes />
    </>
  );
}