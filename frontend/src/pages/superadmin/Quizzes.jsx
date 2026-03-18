import GenericCRUDPage from "../../components/ui/GenericCRUDPage";
import "../../styles/quizzes.css";

const mockQuizzes = [
  { id:1, title:"Phishing Quiz",        module:"Phishing Awareness", questions:10, passMark:"70%", status:"Active",  created:"2024-01-19" },
  { id:2, title:"Password Quiz",        module:"Password Security",  questions:8,  passMark:"75%", status:"Active",  created:"2024-01-24" },
  { id:3, title:"Social Eng Quiz",      module:"Social Engineering", questions:12, passMark:"70%", status:"Active",  created:"2024-02-08" },
  { id:4, title:"Network Security Quiz",module:"Network Security Basics", questions:15, passMark:"80%", status:"Inactive", created:"2024-02-20" },
];

export default function Quizzes() {
  return (
    <GenericCRUDPage
      title="Quizzes Management"
      subtitle="Create and manage module quizzes and assessments"
      apiBase="/api/quizzes"
      fields={[
        { key: "title",     label: "Quiz Title" },
        { key: "module",    label: "Module",    options: ["Phishing Awareness","Password Security","Social Engineering","Network Security Basics","Advanced Threat Hunting"] },
        { key: "questions", label: "Number of Questions", type: "number" },
        { key: "passMark",  label: "Pass Mark (%)", type: "text" },
        { key: "description", label: "Description", type: "textarea" },
      ]}
      mockData={mockQuizzes}
    />
  );
}
