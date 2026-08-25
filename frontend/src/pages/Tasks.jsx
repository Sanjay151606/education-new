import { useEffect, useState } from "react";
import api from "../api/client";
import TaskCard from "../components/TaskCard";

export default function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");

  const load = () => api.get("/api/tasks/").then((res) => setTasks(res.data));
  useEffect(() => { load(); }, []);

  const addTask = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await api.post("/api/tasks/", { title, auto_breakdown: true });
    setTitle("");
    load();
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/api/tasks/${id}/status?status=${status}`);
    load();
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tasks</h1>
      <form onSubmit={addTask} className="flex gap-2">
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Write history essay"
          className="flex-1 border rounded-lg px-3 py-2"
        />
        <button className="bg-brain-500 text-white px-4 py-2 rounded-lg">Add + AI Breakdown</button>
      </form>
      <div className="grid gap-3">
        {tasks.map((t) => <TaskCard key={t.id} task={t} onStatusChange={updateStatus} />)}
      </div>
    </div>
  );
}
