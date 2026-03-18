import GenericCRUDPage from "../../components/ui/GenericCRUDPage";
import "../../styles/simulations.css";

const mockSims = [
  { id:1, title:"Phishing Email Simulation",  type:"Email",   difficulty:"Beginner",     status:"Active",   created:"2024-01-25" },
  { id:2, title:"Spear Phishing Attack",      type:"Email",   difficulty:"Intermediate", status:"Active",   created:"2024-02-01" },
  { id:3, title:"Vishing Call Simulation",    type:"Voice",   difficulty:"Intermediate", status:"Active",   created:"2024-02-10" },
  { id:4, title:"Ransomware Scenario",        type:"Malware", difficulty:"Expert",       status:"Inactive", created:"2024-02-25" },
  { id:5, title:"USB Drop Attack",            type:"Physical",difficulty:"Beginner",     status:"Active",   created:"2024-03-05" },
];

export default function Simulations() {
  return (
    <GenericCRUDPage
      title="Simulations Management"
      subtitle="Configure and manage cyber attack simulations"
      apiBase="/api/simulations"
      fields={[
        { key: "title",      label: "Simulation Title" },
        { key: "type",       label: "Simulation Type", options: ["Email","Voice","Physical","Malware","Social"] },
        { key: "difficulty", label: "Difficulty",      options: ["Beginner","Intermediate","Expert"] },
        { key: "description",label: "Description",     type: "textarea" },
      ]}
      mockData={mockSims}
    />
  );
}
