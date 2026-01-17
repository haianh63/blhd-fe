import { useState } from "react";
import {
  User,
  ShieldAlert,
  CalendarCheck,
  MessageSquare,
  Save,
  Info,
} from "lucide-react";
import { BASE_URL } from "../../utils";
export default function BehaviorForm({ student, onSubmitted }) {
  const [attendance, setAttendance] = useState(true);
  const [disciplineScore, setDisciplineScore] = useState(10);
  const [teacherNote, setTeacherNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!student) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const today = new Date().toISOString().split("T")[0];

      const response = await fetch(`${BASE_URL}/teacher/submit-behavior/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: student.student_id,
          check_date: today,
          attendance,
          discipline_score: Number.parseInt(disciplineScore.toString()),
          teacher_note: teacherNote,
        }),
      });

      if (!response.ok) throw new Error("Failed to submit behavior");

      setSuccess(true);
      setAttendance(true);
      setDisciplineScore(10);
      setTeacherNote("");

      setTimeout(() => {
        onSubmitted();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!student) {
    return (
      <div className="bg-card border border-border rounded-lg p-8 text-center text-muted-foreground">
        Vui lòng chọn một học sinh từ danh sách
      </div>
    );
  }

  const getRiskColor = (level) => {
    switch (level?.toLowerCase()) {
      case "cao":
        return "text-red-600 bg-red-50 border-red-100";
      case "trung bình":
        return "text-amber-600 bg-amber-50 border-amber-100";
      default:
        return "text-emerald-600 bg-emerald-50 border-emerald-100";
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6">
      {/* Student Info Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-lg">
            <User className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-slate-800">
            Thông tin học sinh
          </h2>
        </div>

        <div className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                Họ và tên
              </p>
              <p className="text-xl font-bold text-slate-900">
                {student.full_name}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <span className="text-xs text-slate-400 block mb-1 italic">
                  Mã học sinh
                </span>
                <p className="font-mono font-bold text-slate-700">
                  #{student.student_id}
                </p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1 italic">
                  Lớp học
                </span>
                <p className="font-bold text-slate-700">{student.class_id}</p>
              </div>
              <div>
                <span className="text-xs text-slate-400 block mb-1 italic">
                  Mức độ rủi ro
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(
                    student.risk_level
                  )}`}
                >
                  {student.risk_level}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Input Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-8">
        {/* Attendance - Custom Radio Buttons */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <CalendarCheck className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">
              Điểm danh hôm nay
            </label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => setAttendance(true)}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                attendance === true
                  ? "border-blue-600 bg-blue-50 text-blue-700 ring-4 ring-blue-50"
                  : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  attendance === true ? "border-blue-600" : "border-slate-300"
                }`}
              >
                {attendance === true && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full" />
                )}
              </div>
              <span className="font-semibold">Có mặt</span>
            </button>

            <button
              type="button"
              onClick={() => setAttendance(false)}
              className={`flex items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all ${
                attendance === false
                  ? "border-red-600 bg-red-50 text-red-700 ring-4 ring-red-50"
                  : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  attendance === false ? "border-red-600" : "border-slate-300"
                }`}
              >
                {attendance === false && (
                  <div className="w-2 h-2 bg-red-600 rounded-full" />
                )}
              </div>
              <span className="font-semibold">Vắng mặt</span>
            </button>
          </div>
        </section>

        {/* Discipline Score - Modern Slider */}
        <section>
          <div className="flex justify-between items-end mb-4">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-blue-500" />
              <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                Chỉ số hành vi
              </label>
            </div>
            <span
              className={`text-3xl font-black ${
                disciplineScore > 7
                  ? "text-emerald-500"
                  : disciplineScore > 4
                  ? "text-amber-500"
                  : "text-red-500"
              }`}
            >
              {disciplineScore}
              <span className="text-sm text-slate-300 ml-1">/10</span>
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={disciplineScore}
            onChange={(e) => setDisciplineScore(Number(e.target.value))}
            className="w-full h-3 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <div className="flex justify-between text-xs font-bold text-slate-400 mt-3 px-1">
            <span className="flex items-center gap-1 hover:text-red-500 transition-colors">
              CẦN CHÚ Ý (0)
            </span>
            <span className="flex items-center gap-1 hover:text-emerald-500 transition-colors">
              TỐT (10)
            </span>
          </div>
        </section>

        {/* Teacher Note - Elegant Textarea */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare className="w-5 h-5 text-blue-500" />
            <label className="text-sm font-bold text-slate-700 uppercase tracking-tight">
              Nhận xét của giáo viên
            </label>
          </div>
          <textarea
            value={teacherNote}
            onChange={(e) => setTeacherNote(e.target.value)}
            placeholder="Viết nhận xét chi tiết về biểu hiện hoặc sự cố nếu có..."
            rows={4}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400 focus:bg-white focus:ring-4 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all resize-none"
          />
        </section>
      </div>

      {/* Messages & Actions */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center gap-3 text-emerald-700 animate-in fade-in slide-in-from-bottom-2">
            <CalendarCheck className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-medium">
              Dữ liệu đã được lưu an toàn vào hệ thống!
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="group relative w-full flex items-center justify-center gap-2 py-4 bg-slate-900 text-white font-bold rounded-2xl hover:bg-blue-600 disabled:opacity-50 disabled:bg-slate-400 transition-all duration-300 shadow-lg shadow-slate-200 active:scale-[0.98]"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Xác nhận & Lưu dữ liệu</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
