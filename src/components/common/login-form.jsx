import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { login } from "../../query/login";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { changeAuthCredential } from "../../features/auth/AuthSlice";

export function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const mutation = useMutation({
    mutationFn: ({ username, password }) => login({ username, password }),
    onSuccess: (res) => {
      dispatch(changeAuthCredential(res));
      if (res.role == "student") {
        navigate("/student");
      } else if (res.role === "teacher") {
        navigate("/teacher");
      }
    },

    onError: (err) => {
      setError(err.response?.data?.detail || "Đăng nhập thất bại");
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    mutation.mutate({ username, password });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Hệ thống Phòng chống Bạo lực
          </h1>
          <p className="text-gray-600">Đăng nhập vào hệ thống</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username/Student ID Input */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Tên đăng nhập / Mã học sinh
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError("");
              }}
              placeholder="Nhập tên đăng nhập hoặc mã học sinh"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError("");
              }}
              placeholder="Nhập mật khẩu"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={mutation.isPending}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {mutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>
        <div className="mt-3 text-center">
          Bạn muốn đổi mật khẩu ?{" "}
          <span
            className="text-blue-500 under underline hover:cursor-pointer hover:text-blue-700"
            onClick={() => navigate("/change-password")}
          >
            Đổi mật khẩu
          </span>
        </div>

        {/* Info Text */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">
            <strong>Giáo viên:</strong> Dùng tên đăng nhập của bạn
            <br />
            <strong>Học sinh:</strong> Dùng mã học sinh và mật khẩu được cấp
          </p>
        </div>
      </div>
    </div>
  );
}
