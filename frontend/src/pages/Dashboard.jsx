import { useEffect, useState } from "react";
import api from "../api/client";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [rec, setRec] = useState(null);

  useEffect(() => {
    api.post("/api/ai/recommendations", {}).then((res) => setRec(res.data)).catch(() => {});
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Hi {user?.full_name?.split(" ")[0] || "there"} 👋</h1>

      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h2 className="font-semibold mb-2 text-brain-600">Today's AI Recommendations</h2>
        {rec ? (
          <>
            <ul className="list-disc list-inside space-y-1 text-slate-700">
              {rec.recommendations.map((r, i) => <li key={i}>{r}</li>)}
            </ul>
            <div className="flex gap-4 mt-4 text-sm text-slate-500">
              <span>Focus block: <b>{rec.suggested_focus_minutes} min</b></span>
              <span>Break: <b>{rec.suggested_break_minutes} min</b></span>
            </div>
            <p className="mt-3 text-sm italic text-focus-500">{rec.motivational_note}</p>
          </>
        ) : (
          <p className="text-slate-400 text-sm">Loading suggestions...</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <a href="/tasks" className="bg-brain-500 text-white rounded-2xl p-5 hover:bg-brain-600">
          <p className="text-lg font-semibold">📋 Manage Tasks</p>
          <p className="text-sm opacity-90">Break work into small steps</p>
        </a>
        <a href="/focus" className="bg-focus-500 text-white rounded-2xl p-5 hover:opacity-90">
          <p className="text-lg font-semibold">⏱ Start Focus Session</p>
          <p className="text-sm opacity-90">Pomodoro-style timer</p>
        </a>
      </div>
    </div>
  );
}
