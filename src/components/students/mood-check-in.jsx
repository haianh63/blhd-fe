import { useState, useRef } from "react";
import {
  Heart,
  Frown,
  Meh,
  Smile,
  Laugh,
  Send,
  Upload,
  X,
  ImageIcon,
  Video,
  Mic,
  Eye,
  EyeOff,
} from "lucide-react";
import axios from "axios";
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

const ALLOWED_FILE_TYPES = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
  video: ["video/mp4", "video/webm", "video/quicktime"],
  audio: ["audio/mpeg", "audio/wav", "audio/webm", "audio/ogg"],
};

export default function MoodCheckIn({ studentId }) {
  const [selectedMood, setSelectedMood] = useState(null);
  const [feedback, setFeedback] = useState("");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const fileInputRef = useRef(null);

  const handleMoodSelect = (moodValue) => {
    setSelectedMood(moodValue);
    setFeedback("");
    setSubmitMessage("");
  };

  const getFileType = (file) => {
    if (ALLOWED_FILE_TYPES.image.includes(file.type)) return "image";
    if (ALLOWED_FILE_TYPES.video.includes(file.type)) return "video";
    if (ALLOWED_FILE_TYPES.audio.includes(file.type)) return "audio";
    return null;
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const type = getFileType(file);
    if (!type) {
      setSubmitMessage(
        "✗ Định dạng tệp không được hỗ trợ. Hỗ trợ: ảnh, video, ghi âm.",
      );
      return;
    }

    setMediaFile(file);
    setMediaType(type);

    const reader = new FileReader();
    reader.onload = (event) => {
      setMediaPreview(event.target?.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveMedia = () => {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (selectedMood === null) return;

    setIsLoading(true);
    try {
      const formData = new FormData();

      // Chỉ thêm student_id nếu không phải ẩn danh
      if (!isAnonymous) {
        formData.append("student_id", studentId);
      }

      formData.append("mood_rating", selectedMood.toString());
      formData.append("open_feedback", feedback || "");

      if (mediaFile) {
        formData.append("media_file", mediaFile);
      }

      await axios.post(`${BASE_URL}/submit-checkin`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setSubmitMessage("✓ Cảm ơn! Chúng tôi đã ghi nhận tâm trạng của bạn.");
      setSelectedMood(null);
      setFeedback("");
      handleRemoveMedia();
      setIsAnonymous(false);

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
        <div className="mb-6 animate-in fade-in slide-in-from-top-2 duration-300 space-y-4">
          {/* Anonymous Toggle */}
          <div className="bg-white p-4 rounded-xl border-2 border-teal-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isAnonymous ? (
                  <EyeOff className="w-5 h-5 text-teal-600" />
                ) : (
                  <Eye className="w-5 h-5 text-gray-400" />
                )}
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    Gửi ẩn danh
                  </p>
                  <p className="text-xs text-gray-500">
                    {isAnonymous
                      ? "Mã sinh viên sẽ không được gửi"
                      : "Thông tin được ghi lại"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-300 ${
                  isAnonymous ? "bg-teal-500" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-all duration-300 ${
                    isAnonymous ? "translate-x-7" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Text Feedback */}
          <div className="bg-white p-5 rounded-xl border-2 border-teal-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Bạn muốn chia sẻ thêm gì không? (Tùy chọn)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Viết những gì đang làm bạn lo lắng, buồn vui, hay bất kỳ điều gì bạn muốn chia sẻ..."
              className="w-full p-4 border-2 border-teal-200 rounded-lg focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-200 text-base resize-none transition-all duration-200 bg-gradient-to-br from-white to-teal-50 placeholder:text-gray-400"
              rows={4}
            />
            <p className="text-xs text-gray-500 mt-2">
              Tin nhắn của bạn được bảo mật và chỉ nhằm mục đích hỗ trợ.
            </p>
          </div>

          {/* Media Upload */}
          <div className="bg-white p-5 rounded-xl border-2 border-teal-200 shadow-sm">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Thêm tệp đính kèm (Tùy chọn)
            </label>
            <p className="text-xs text-gray-600 mb-3">
              Hỗ trợ: Ảnh (JPG, PNG), Video (MP4), Ghi âm (MP3, WAV)
            </p>

            {!mediaFile ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-teal-300 rounded-lg p-6 text-center cursor-pointer hover:bg-teal-50 hover:border-teal-400 transition-all duration-200"
              >
                <Upload className="w-8 h-8 text-teal-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-700">
                  Nhấp để chọn tệp hoặc kéo thả
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Ảnh, video hoặc ghi âm
                </p>
              </div>
            ) : (
              <div className="bg-teal-50 border-2 border-teal-200 rounded-lg p-4">
                <div className="flex items-center gap-3 mb-3">
                  {mediaType === "image" && (
                    <ImageIcon className="w-6 h-6 text-teal-600" />
                  )}
                  {mediaType === "video" && (
                    <Video className="w-6 h-6 text-teal-600" />
                  )}
                  {mediaType === "audio" && (
                    <Mic className="w-6 h-6 text-teal-600" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {mediaFile.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(mediaFile.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  <button
                    onClick={handleRemoveMedia}
                    className="p-1 hover:bg-red-100 rounded transition-colors duration-200"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                {/* Media Preview */}
                {mediaType === "image" && mediaPreview && (
                  <img
                    src={mediaPreview || "/placeholder.svg"}
                    alt="Preview"
                    className="w-full max-h-40 object-cover rounded-lg"
                  />
                )}
                {mediaType === "video" && mediaPreview && (
                  <video
                    src={mediaPreview}
                    controls
                    className="w-full max-h-40 rounded-lg"
                  />
                )}
                {mediaType === "audio" && (
                  <audio
                    src={mediaPreview}
                    controls
                    className="w-full rounded-lg"
                  />
                )}
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileSelect}
              accept="image/*,video/*,audio/*"
              className="hidden"
            />
          </div>
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
