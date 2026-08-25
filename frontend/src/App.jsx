import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Dashboard from "./pages/Dashboard";
import Tasks from "./pages/Tasks";
import StudyMaterials from "./pages/StudyMaterials";
import FocusMode from "./pages/FocusMode";
import Progress from "./pages/Progress";
import { useAuth } from "./context/AuthContext";

function Private({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? children : <Navigate to="/login" />;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<Private><Dashboard /></Private>} />
        <Route path="/tasks" element={<Private><Tasks /></Private>} />
        <Route path="/materials" element={<Private><StudyMaterials /></Private>} />
        <Route path="/focus" element={<Private><FocusMode /></Private>} />
        <Route path="/progress" element={<Private><Progress /></Private>} />
      </Routes>
    </>
  );
}
