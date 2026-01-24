import { LoginForm } from "./components/common/login-form";
import StudentPage from "./pages/StudentPage";
import TeacherPage from "./pages/TeacherPage";
import { Route, Routes } from "react-router-dom";
import AuthGuard from "./components/common/auth-guard";
import LoginGuard from "./components/common/login-guard";
import ChangePasswordForm from "./components/common/change-password-form";
function App() {
  return (
    <Routes>
      <Route element={<LoginGuard />}>
        <Route path="/login" element={<LoginForm />} />
      </Route>
      <Route path="/change-password" element={<ChangePasswordForm />} />

      <Route element={<AuthGuard />}>
        <Route path="/student" element={<StudentPage />} />
        <Route path="/teacher" element={<TeacherPage />} />
      </Route>
    </Routes>
  );
}

export default App;
