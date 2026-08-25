import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-sm sticky top-0 z-10">
      <Link to="/" className="text-xl font-bold text-brain-600">🧠 BrainGraph</Link>
      <div className="flex gap-6 items-center text-sm font-medium">
        <Link to="/dashboard" className="hover:text-brain-600">Dashboard</Link>
        <Link to="/tasks" className="hover:text-brain-600">Tasks</Link>
        <Link to="/materials" className="hover:text-brain-600">Study Materials</Link>
        <Link to="/focus" className="hover:text-brain-600">Focus Mode</Link>
        <Link to="/progress" className="hover:text-brain-600">Progress</Link>
        {user ? (
          <button
            onClick={() => { logout(); navigate("/login"); }}
            className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            Logout
          </button>
        ) : (
          <Link to="/login" className="px-3 py-1.5 rounded-lg bg-brain-500 text-white hover:bg-brain-600">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
