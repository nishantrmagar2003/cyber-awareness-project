import GenericCRUDPage from "../../components/ui/GenericCRUDPage";
import "../../styles/videos.css";

const mockVideos = [
  { id:1, title:"Phishing Demo Video",       module:"Phishing Awareness", duration:"8:32",  status:"Active",  created:"2024-01-18" },
  { id:2, title:"Password Security Tutorial",module:"Password Security",  duration:"11:45", status:"Active",  created:"2024-01-23" },
  { id:3, title:"Social Engineering Explained", module:"Social Engineering", duration:"14:20", status:"Active", created:"2024-02-07" },
  { id:4, title:"Network Basics Overview",   module:"Network Security Basics", duration:"9:10", status:"Inactive", created:"2024-02-19" },
];

export default function Videos() {
  return (
    <GenericCRUDPage
      title="Videos Management"
      subtitle="Upload and manage training videos"
      apiBase="/api/videos"
      fields={[
        { key: "title",    label: "Video Title" },
        { key: "module",   label: "Module",   options: ["Phishing Awareness","Password Security","Social Engineering","Network Security Basics","Advanced Threat Hunting"] },
        { key: "duration", label: "Duration (e.g. 8:30)" },
        { key: "url",      label: "Video URL", type: "url" },
      ]}
      mockData={mockVideos}
    />
  );
}
