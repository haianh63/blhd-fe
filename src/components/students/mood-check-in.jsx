import { Heart, Frown, Meh, Smile, Laugh, Send } from "lucide-react";
import axios from "axios";
import { useState } from "react";
import { BASE_URL } from "../../utils";

const MOOD_OPTIONS = [
  {
    value: 1,
    label: "Rất tệ",
    icon: Frown,
    color: "text-red-500",
    bg: "bg-red-50 hover:bg-red-100 dark:bg-red-900/20",
  },
  {
    value: 2,
    label: "Tệ",
    icon: Meh,
    color: "text-orange-500",
    bg: "bg-orange-50 hover:bg-orange-100 dark:bg-orange-900/20",
  },
  {
    value: 3,
    label: "Bình thường",
    icon: Meh,
    color: "text-amber-500",
    bg: "bg-amber-50 hover:bg-amber-100 dark:bg-amber-900/20",
  },
  {
    value: 4,
    label: "Tốt",
    icon: Smile,
    color: "text-emerald-500",
    bg: "bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-900/20",
  },
  {
    value: 5,
    label: "Rất tốt",
    icon: Laugh,
    color: "text-teal-500",
    bg: "bg-teal-50 hover:bg-teal-100 dark:bg-teal-900/20",
  },
];

export default function MoodCheckIn({ studentId }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleMoodSelect = (moodValue) => {
    setSelectedMood(moodValue);
    setFeedback("");
    setSubmitMessage("");
  };

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    setIsLoading(true);
    try {
      await axios.post(`${BASE_URL}/submit-checkin/`, {
        student_id: studentId,
        mood_rating: selectedMood,
        open_feedback: feedback || "",
      });

      setSubmitMessage("✓ Cảm ơn! Chúng tôi đã ghi nhận tâm trạng của bạn.");
      setSelectedMood(null);
      setFeedback("");

      setTimeout(() => setSubmitMessage(""), 3000);
    } catch (error) {
      setSubmitMessage("✗ Có lỗi xảy ra. Vui lòng thử lại.");
      console.error("Failed to submit mood:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 md:p-8 bg-gradient-to-br from-teal-50 via-white to-cyan-50 rounded-2xl shadow-lg border border-teal-100">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-br from-red-400 to-pink-400 rounded-full">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Kiểm tra tâm trạng
          </h2>
        </div>
        <p className="text-gray-600 text-base md:text-lg">
          Hôm nay bạn cảm thấy thế nào?
        </p>
      </div>

      {/* Mood Selection */}
      <div className="mb-8">
        <label className="block text-sm font-semibold text-gray-700 mb-4">
          Chọn cảm xúc của bạn:
        </label>
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {MOOD_OPTIONS.map((mood) => {
            const IconComponent = mood.icon;
            const isSelected = selectedMood === mood.value;

            return (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                className={`flex flex-col items-center justify-center py-3 px-2 md:py-4 md:px-3 rounded-xl transition-all duration-300 transform ${
                  isSelected
                    ? `${mood.bg} ring-3 ring-offset-2 ring-teal-500 shadow-lg scale-110`
                    : `${mood.bg} hover:shadow-md hover:scale-105`
                }`}
              >
                <IconComponent
                  className={`w-6 h-6 md:w-8 md:h-8 ${mood.color} mb-2`}
                />
                <span className="text-xs md:text-xs font-semibold text-gray-700 text-center leading-tight">
                  {mood.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {selectedMood !== null && (
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300 bg-white p-5 rounded-xl border-2 border-teal-200 shadow-sm">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            Bạn muốn chia sẻ thêm gì không? (Tùy chọn)
          </label>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Viết những gì đang làm bạn lo lắng, buồn vui, hay bất kỳ điều gì bạn muốn chia sẻ..."
            className="w-full p-4 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-base resize-none transition-all duration-200 bg-gradient-to-br from-white to-teal-50 placeholder:text-gray-400"
            rows={5}
          />
          <p className="text-xs text-gray-500 mt-2">
            Tin nhắn của bạn được bảo mật và chỉ nhằm mục đích hỗ trợ.
          </p>
        </div>
      )}

      {/* Submit Message */}
      {submitMessage && (
        <div
          className={`mb-4 p-4 rounded-lg text-center text-sm font-medium transition-all duration-300 animate-in fade-in ${
            submitMessage.includes("✓")
              ? "bg-emerald-100 text-emerald-700 border border-emerald-300"
              : "bg-red-100 text-red-700 border border-red-300"
          }`}
        >
          {submitMessage}
        </div>
      )}

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={selectedMood === null || isLoading}
        className="w-full py-3 px-4 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
      >
        <Send className="w-5 h-5" />
        {isLoading ? "Đang gửi..." : "Gửi kiểm tra"}
      </button>
    </div>
  );
}
