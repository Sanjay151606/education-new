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
  const { user, session, loading } = useAuth();
  // Show nothing while auth state is being determined
  if (loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'100vh',fontSize:'1.2rem',color:'#888'}}>Loading...</div>;
  // Allow access if session exists (user profile may still be loading from backend)
  return (session || user) ? children : <Navigate to="/login" replace />;
}

function PublicOnly({ children }) {
  const { session, loading } = useAuth();
  if (loading) return null;
  // Redirect already logged-in users away from login/register pages
  return session ? <Navigate to="/dashboard" replace /> : children;
}

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />
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
