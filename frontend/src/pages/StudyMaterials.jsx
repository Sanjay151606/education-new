import { useEffect, useState } from "react";
import api from "../api/client";

export default function StudyMaterials() {
  const [materials, setMaterials] = useState([]);
  const [form, setForm] = useState({ title: "", original_text: "", subject: "" });
  const [loading, setLoading] = useState(false);

  const load = () => api.get("/api/materials/").then((res) => setMaterials(res.data));
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post("/api/materials/", form);
      setForm({ title: "", original_text: "", subject: "" });
      load();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Study Materials</h1>

      <form onSubmit={submit} className="bg-white rounded-2xl shadow-sm p-5 space-y-3">
        <input className="w-full border rounded-lg px-3 py-2" placeholder="Title"
          value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
        <input className="w-full border rounded-lg px-3 py-2" placeholder="Subject (optional)"
          value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <textarea className="w-full border rounded-lg px-3 py-2 h-32" placeholder="Paste your notes / textbook paragraph here..."
          value={form.original_text} onChange={(e) => setForm({ ...form, original_text: e.target.value })} required />
        <button disabled={loading} className="bg-brain-500 text-white px-4 py-2 rounded-lg disabled:opacity-50">
          {loading ? "Simplifying with AI..." : "Simplify with AI"}
        </button>
      </form>

      <div className="space-y-4">
        {materials.map((m) => (
          <div key={m.id} className="bg-white rounded-2xl shadow-sm p-5">
            <h3 className="font-semibold text-brain-600">{m.title}</h3>
            <p className="text-sm text-slate-700 mt-2 whitespace-pre-line">{m.simplified_text}</p>
            {m.summary_bullets?.length > 0 && (
              <ul className="list-disc list-inside text-sm text-slate-600 mt-2">
                {m.summary_bullets.map((b, i) => <li key={i}>{b}</li>)}
              </ul>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
