import { useState, useEffect } from "react";
import { BASE_URL } from "../../utils";

export default function CheckInList() {
  const [checkins, setCheckins] = useState([]);
  const [filteredCheckins, setFilteredCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    class_id: "",
    search: "",
    sentiment: "",
  });
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const fetchCheckins = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${BASE_URL}/teacher/checkins`);
        if (!response.ok) throw new Error("Failed to fetch check-ins");
        const data = await response.json();
        setCheckins(data);
        setFilteredCheckins(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCheckins();
  }, []);

  useEffect(() => {
    let filtered = checkins;

    if (filters.class_id) {
      filtered = filtered.filter((c) => c.class_id === filters.class_id);
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.student_name.toLowerCase().includes(searchLower) ||
          c.student_id.toLowerCase().includes(searchLower),
      );
    }

    if (filters.sentiment) {
      filtered = filtered.filter((c) => c.ai_sentiment === filters.sentiment);
    }

    setFilteredCheckins(filtered);
  }, [filters, checkins]);

  const getMoodColor = (rating) => {
    if (rating <= 1) return "bg-red-100 text-red-800";
    if (rating === 2) return "bg-orange-100 text-orange-800";
    if (rating === 3) return "bg-yellow-100 text-yellow-800";
    if (rating === 4) return "bg-blue-100 text-blue-800";
    return "bg-green-100 text-green-800";
  };

  const getMoodLabel = (rating) => {
    const labels = ["", "Rất buồn", "Buồn", "Bình thường", "Vui", "Rất vui"];
    return labels[rating] || "Không xác định";
  };

  const getUniqueClasses = () => {
    return [...new Set(checkins.map((c) => c.class_id))].sort();
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString("vi-VN");
  };

  const renderMediaPreview = (file_path, file_type) => {
    if (!file_path) return null;

    const fullPath = `${BASE_URL}${file_path}`;

    return (
      <div className="mt-3 pt-3 border-t border-gray-200">
        <p className="text-sm font-medium text-gray-700 mb-2">Tệp đính kèm:</p>
        {file_type === "audio" && (
          <audio controls className="w-full">
            <source src={fullPath} type="audio/mpeg" />
            Trình duyệt của bạn không hỗ trợ phần tử audio.
          </audio>
        )}
        {file_type === "image" && (
          <img
            src={fullPath || "/placeholder.svg"}
            alt="Check-in attachment"
            className="max-w-full h-auto rounded max-h-64"
          />
        )}
        {file_type === "video" && (
          <video controls className="w-full max-h-64 rounded">
            <source src={fullPath} type="video/mp4" />
            Trình duyệt của bạn không hỗ trợ phần tử video.
          </video>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <p className="text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <p className="font-medium">Lỗi: {error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4">Bộ lọc</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm (Tên/Mã học sinh)
            </label>
            <input
              type="text"
              placeholder="Nhập tên hoặc mã học sinh..."
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Class Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lớp
            </label>
            <select
              value={filters.class_id}
              onChange={(e) =>
                setFilters({ ...filters, class_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tất cả lớp</option>
              {getUniqueClasses().map((cls) => (
                <option key={cls} value={cls}>
                  {cls}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Check-in List */}
      <div className="space-y-4">
        {filteredCheckins.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Không tìm thấy check-in nào phù hợp</p>
          </div>
        ) : (
          filteredCheckins.map((checkin) => (
            <div
              key={checkin.form_id}
              className="border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow"
            >
              <button
                onClick={() =>
                  setExpandedId(
                    expandedId === checkin.form_id ? null : checkin.form_id,
                  )
                }
                className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {checkin.student_name}
                      </h3>
                      <span className="text-sm text-gray-600">
                        ({checkin.student_id})
                      </span>
                      <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-1 rounded">
                        {checkin.class_id}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        Trạng thái tâm trạng:{" "}
                        <span
                          className={`inline-block px-2 py-1 rounded font-medium ${getMoodColor(checkin.mood_rating)}`}
                        >
                          {getMoodLabel(checkin.mood_rating)}
                        </span>
                      </span>
                      <span>{formatDate(checkin.created_at)}</span>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {expandedId === checkin.form_id ? "▼" : "▶"}
                  </div>
                </div>
              </button>

              {expandedId === checkin.form_id && (
                <div className="px-4 pb-4 border-t border-gray-200 bg-gray-50">
                  {checkin.original_feedback && (
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">
                        Phản hồi từ học sinh:
                      </p>
                      <p className="text-gray-700 bg-white p-3 rounded border border-gray-200">
                        {checkin.original_feedback}
                      </p>
                    </div>
                  )}

                  {renderMediaPreview(checkin.file_path, checkin.file_type)}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600">Tổng check-in</p>
          <p className="text-2xl font-bold text-blue-900">{checkins.length}</p>
        </div>
        <div className="p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-gray-600">Có tệp đính kèm</p>
          <p className="text-2xl font-bold text-green-900">
            {checkins.filter((c) => c.file_path).length}
          </p>
        </div>
        <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
          <p className="text-sm text-gray-600">Lớp học</p>
          <p className="text-2xl font-bold text-yellow-900">
            {getUniqueClasses().length}
          </p>
        </div>
        <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-gray-600">Học sinh</p>
          <p className="text-2xl font-bold text-purple-900">
            {new Set(checkins.map((c) => c.student_id)).size}
          </p>
        </div>
      </div>
    </div>
  );
}
