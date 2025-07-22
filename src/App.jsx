import { Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";

// 🔁 Lazy load all routes
const Signup = lazy(() => import("./pages/Signup"));
const Login = lazy(() => import("./pages/Login"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Catalog = lazy(() => import("./components/Catalog"));
const StaffDashboardView = lazy(() =>
  import("./components/staff/StaffDashboardView")
);
const StudentDashboardView = lazy(() =>
  import("./components/student/StudentDashboardView")
);
const Books = lazy(() => import("./components/Books"));
const NotFound = lazy(() => import("./pages/NotFound"));

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

      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-lg text-gray-600 dark:text-gray-300">
            Loading...
          </div>
        }
      >
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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </>
  );
}
