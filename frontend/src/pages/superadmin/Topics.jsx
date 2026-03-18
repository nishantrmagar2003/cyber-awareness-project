import GenericCRUDPage from "../../components/ui/GenericCRUDPage";
import "../../styles/topics.css";

const mockTopics = [
  { id:1, title:"What is Phishing?",        module:"Phishing Awareness", duration:"15 min", status:"Active",  created:"2024-01-16" },
  { id:2, title:"Types of Phishing Attacks",module:"Phishing Awareness", duration:"20 min", status:"Active",  created:"2024-01-17" },
  { id:3, title:"Creating Strong Passwords", module:"Password Security",  duration:"12 min", status:"Active",  created:"2024-01-21" },
  { id:4, title:"Password Manager Usage",   module:"Password Security",  duration:"18 min", status:"Active",  created:"2024-01-22" },
  { id:5, title:"Identifying Social Engineers", module:"Social Engineering", duration:"25 min", status:"Inactive", created:"2024-02-06" },
];

export default function Topics() {
  return (
    <GenericCRUDPage
      title="Topics Management"
      subtitle="Manage topics within training modules"
      apiBase="/api/topics"
      fields={[
        { key: "title",    label: "Topic Title" },
        { key: "module",   label: "Module",   options: ["Phishing Awareness","Password Security","Social Engineering","Network Security Basics","Advanced Threat Hunting"] },
        { key: "duration", label: "Duration (e.g. 15 min)" },
        { key: "content",  label: "Topic Content", type: "textarea" },
      ]}
      mockData={mockTopics}
    />
  );
}
