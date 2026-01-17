import { useState } from "react";
import MoodCheckIn from "../components/students/mood-check-in";
import ChatbotWindow from "../components/students/chatbot-window";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuthCredential } from "../features/auth/AuthSlice";
import { useSelector } from "react-redux";

export default function StudentPage() {
  const [activeTab, setActiveTab] = useState("mood");
  const studentId = useSelector((state) => state.auth.studentId);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(resetAuthCredential());
    navigate("/login");
  };
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-6 md:py-12">
      <div className="flex justify-end px-4">
        <button
          onClick={handleLogout}
          className="bg-blue-400 text-white px-6 py-2 rounded-md hover:cursor-pointer hover:bg-blue-500"
        >
          Đăng xuất
        </button>
      </div>
      <div className="container mx-auto px-4">
        {/* Page Header */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            Hệ Thống Hỗ Trợ Học Sinh
          </h1>
          <p className="text-gray-300 text-base md:text-lg">
            Nơi bạn có thể chia sẻ cảm xúc và được AI hỗ trợ tư vấn
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("mood")}
            className={`px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "mood"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            📊 Kiểm tra tâm trạng
          </button>
          <button
            onClick={() => setActiveTab("chat")}
            className={`px-6 md:px-8 py-3 rounded-lg font-semibold transition-all duration-200 ${
              activeTab === "chat"
                ? "bg-blue-600 text-white shadow-lg shadow-blue-600/50"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
          >
            💬 Chat với AI
          </button>
        </div>

        {/* Content */}
        <div className="max-w-4xl mx-auto">
          {activeTab === "mood" && <MoodCheckIn studentId={studentId} />}
          {activeTab === "chat" && <ChatbotWindow studentId={studentId} />}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Dành cho học sinh - Hệ thống phòng chống bạo lực học đường</p>
        </div>
      </div>
    </main>
  );
}
