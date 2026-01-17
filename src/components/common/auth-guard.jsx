import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

function AuthGuard() {
  const authCredential = useSelector((state) => state.auth);

  if (authCredential.role == "") {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default AuthGuard;
