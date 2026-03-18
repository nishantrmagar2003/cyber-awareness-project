import GenericCRUDPage from "../../components/ui/GenericCRUDPage";
import "../../styles/superadmin-modules.css";

const mockModules = [
  { id:1, title:"Phishing Awareness",      category:"Email Security", difficulty:"Beginner",  status:"Active",  created:"2024-01-15" },
  { id:2, title:"Password Security",       category:"Account Safety", difficulty:"Beginner",  status:"Active",  created:"2024-01-20" },
  { id:3, title:"Social Engineering",      category:"Human Threats",  difficulty:"Intermediate", status:"Active", created:"2024-02-05" },
  { id:4, title:"Network Security Basics", category:"Network",        difficulty:"Intermediate", status:"Inactive", created:"2024-02-18" },
  { id:5, title:"Advanced Threat Hunting", category:"Advanced",       difficulty:"Expert",    status:"Active",  created:"2024-03-10" },
];

export default function Modules() {
  return (
    <GenericCRUDPage
      title="Modules Management"
      subtitle="Create and manage cybersecurity training modules"
      apiBase="/api/modules"
      fields={[
        { key: "title",      label: "Module Title" },
        { key: "category",   label: "Category",   options: ["Email Security","Account Safety","Human Threats","Network","Advanced","Compliance"] },
        { key: "difficulty", label: "Difficulty", options: ["Beginner","Intermediate","Expert"] },
        { key: "description",label: "Description", type: "textarea" },
      ]}
      mockData={mockModules}
    />
  );
}
