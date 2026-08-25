import { useEffect, useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend,
} from "chart.js";
import api from "../api/client";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

export default function Progress() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/api/progress/").then((res) => setLogs(res.data.reverse()));
  }, []);

  const data = {
    labels: logs.map((l) => new Date(l.date).toLocaleDateString()),
    datasets: [
      {
        label: "Score",
        data: logs.map((l) => l.score ?? null),
        borderColor: "#3b7dff",
        backgroundColor: "#dfeaff",
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Your Progress</h1>
      <div className="bg-white rounded-2xl shadow-sm p-6">
        {logs.length > 0 ? <Line data={data} /> : <p className="text-slate-400 text-sm">No activity logged yet.</p>}
      </div>
    </div>
  );
}
