import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function LoginGuard() {
  const authCredential = useSelector((state) => state.auth);
  console.log(authCredential);
  if (authCredential.role == "teacher") {
    return <Navigate to="/teacher" replace />;
  } else if (authCredential.role == "student") {
    return <Navigate to="/student" replace />;
  }

  return <Outlet />;
}

export default LoginGuard;
