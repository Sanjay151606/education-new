export default function TaskCard({ task, onStatusChange }) {
  const priorityColor = {
    high: "bg-red-100 text-red-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  }[task.priority];

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-slate-100">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-slate-800">{task.title}</h3>
        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColor}`}>{task.priority}</span>
      </div>
      {task.description && <p className="text-sm text-slate-500 mt-1">{task.description}</p>}

      {task.subtasks?.length > 0 && (
        <ul className="mt-3 space-y-1.5">
          {task.subtasks.map((s, i) => (
            <li key={i} className="text-sm flex items-center gap-2 text-slate-600">
              <span className="w-1.5 h-1.5 rounded-full bg-brain-400" />
              {s.step} <span className="text-xs text-slate-400">~{s.estimated_minutes}min</span>
            </li>
          ))}
        </ul>
      )}

      <select
        value={task.status}
        onChange={(e) => onStatusChange(task.id, e.target.value)}
        className="mt-3 text-sm border rounded-lg px-2 py-1 bg-slate-50"
      >
        <option value="pending">Pending</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
      </select>
    </div>
  );
}
