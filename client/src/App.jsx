import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/forms/Login";
import RegisterForm from "./pages/forms/RegisterForm";
import AdminDashboard from "./pages/dashboards/AdminDashboard";
import InstructorDashboard from "./pages/dashboards/InstructorDashboard";
import StudentDashboard from "./pages/dashboards/StudentDashboard";
import AllStudents from "./pages/admin-pages/AllStudents";
import CreateUserForm from "./pages/forms/CreateUserForm";
import EditUser from "./pages/forms/EditUser";
import AllInstructor from "./pages/admin-pages/AllInstructors";
import PendingUsers from "./pages/admin-pages/PendingUsers";
import AllCourses from "./pages/admin-pages/AllCourses";
import CourseForm from "./pages/forms/CourseForm";
import EditCourse from "./pages/forms/EditCourse";
import PaymentDashboard from "./pages/admin-pages/PaymentDashboard";
import Overview from "./pages/admin-pages/Overview";
import CreateStudentBillForm from "./pages/admin-pages/CreateStudentBillForm";
import EnrollStudentPage from "./pages/forms/EnrollStudentPage";
import ViewBatch from "./pages/batchProgress/VIewBatch";
import InstructorViewProgress from "./pages/batchProgress/InstructorViewprogress";
import StudentViewProgress from "./pages/batchProgress/StudentViewProgress";
import ViewCourse from "./pages/admin-pages/ViewCourse";
const ProtectedRoute = ({ children, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};
function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          {/*Login Routes */}
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<RegisterForm />} />
          {/*Dashboard Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/instructor"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <InstructorDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          {/*Admin Routes */}
          <Route
            path="/admin/all-students"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AllStudents />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/all-instructors"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AllInstructor />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approve-users"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PendingUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/all-courses"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <AllCourses />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <PaymentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/overview"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <Overview />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/create-enrollment"
            element={
              <ProtectedRoute allowedRoles={["admin","instructor"]}>
                <EnrollStudentPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/create-user"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <CreateUserForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-user/:id"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <EditUser />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-course"
            element={
              <ProtectedRoute allowedRoles={["admin","instructor"]}>
                <CourseForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/edit-course/:id"
            element={
              <ProtectedRoute allowedRoles={["admin","instructor"]}>
                <EditCourse />
              </ProtectedRoute>
            }
          />
          <Route
            path="/view-course/:id"
            element={
              <ProtectedRoute allowedRoles={["admin","instructor"]}>
                <ViewCourse />
              </ProtectedRoute>
            }
          />
          {/*Instructor Routes */}
          <Route
            path="/view-batch/:batchId"
            element={
              <ProtectedRoute allowedRoles={["instructor"]}>
                <ViewBatch />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student-progress-ipov/:studentId/:courseId"
            element={
              <ProtectedRoute allowedRoles={["admin", "instructor"]}>
                <InstructorViewProgress />
              </ProtectedRoute>
            }
          />
          {/*Student Routes */}
          <Route
            path="/student-progress/:studentId/:courseId"
            element={
              <ProtectedRoute allowedRoles={["student"]}>
                <StudentViewProgress />
              </ProtectedRoute>
            }
          />
         
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
