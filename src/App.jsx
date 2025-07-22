import { Routes, Route } from "react-router-dom";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./data/DashboardLayout";
import Catalog from "./components/Catalog";
import StaffDashboardView from "./components/staff/StaffDashboardView";
import StudentDashboardView from "./components/student/StudentDashboardView";
import Books from "./components/Books";
import { Toaster } from "react-hot-toast";

export default function App() {
  return (
    <>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "#333",
            color: "#fff",
            borderRadius: 0,
          },
        }}
      />

      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/student/signup" element={<Signup />} />
        <Route path="/student/login" element={<Login />} />

        <Route
          path="/student"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StudentDashboardView />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="books" element={<Books />} />
        </Route>

        <Route path="/staff/signup" element={<Signup />} />
        <Route path="/staff/login" element={<Login />} />
        <Route
          path="/staff"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<StaffDashboardView />} />
          <Route path="catalog" element={<Catalog />} />
          <Route path="books" element={<Books />} />
        </Route>
      </Routes>
    </>
  );
}
