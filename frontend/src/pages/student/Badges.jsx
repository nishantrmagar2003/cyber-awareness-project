import { useState } from "react";

export default function Badges() {
  const [badges] = useState([
    { id: 1, name: "Phishing Defender", description: "Completed phishing awareness module" },
    { id: 2, name: "Password Master", description: "Created strong passwords" },
    { id: 3, name: "Cyber Safe User", description: "Finished basic cybersecurity training" }
  ]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Badges</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {badges.map((badge) => (
          <div
            key={badge.id}
            className="bg-white shadow rounded-lg p-4 border"
          >
            <h2 className="text-lg font-semibold">{badge.name}</h2>
            <p className="text-gray-600 text-sm mt-2">{badge.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}