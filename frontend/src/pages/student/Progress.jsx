import { useState } from "react";

export default function Progress() {
  const [completed, setCompleted] = useState(40);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Learning Progress</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <p className="mb-4 text-gray-600">
          Track your cybersecurity learning progress.
        </p>

        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-blue-600 h-4 rounded-full"
            style={{ width: `${completed}%` }}
          ></div>
        </div>

        <p className="mt-3 text-sm text-gray-600">
          Completed: {completed}%
        </p>

        <button
          onClick={() => setCompleted(Math.min(completed + 10, 100))}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Increase Progress
        </button>
      </div>
    </div>
  );
}