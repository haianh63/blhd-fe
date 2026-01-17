import { useState, useRef } from "react";
import {
  UploadCloud,
  FileSpreadsheet,
  Info,
  CheckCircle2,
  AlertCircle,
  Table,
  ArrowRight,
} from "lucide-react";
import { BASE_URL } from "../../utils";

export default function BulkUpload({ onSubmitted }) {
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((v) => v.trim());
      const record = {};

      headers.forEach((header, index) => {
        const value = values[index];
        if (header === "attendance") {
          record[header] = value.toLowerCase() === "true" || value === "1";
        } else if (header === "discipline_score") {
          record[header] = Number.parseInt(value);
        } else {
          record[header] = value;
        }
      });

      if (
        record.student_id &&
        record.check_date &&
        record.discipline_score !== undefined
      ) {
        records.push(record);
      }
    }

    return records;
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const csv = event.target?.result;
        const parsedRecords = parseCSV(csv);

        if (parsedRecords.length === 0) {
          setError("Không tìm thấy bản ghi hợp lệ trong file CSV");
          setRecords([]);
          return;
        }

        setRecords(parsedRecords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Lỗi khi phân tích file");
        setRecords([]);
      }
    };

    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (records.length === 0) {
      setError("Vui lòng chọn một file CSV hợp lệ");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      const response = await fetch(
        `${BASE_URL}/teacher/submit-behavior-bulk/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(records),
        }
      );

      if (!response.ok) throw new Error("Lỗi khi gửi dữ liệu");

      await response.json();
      setSuccess(true);
      setRecords([]);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";

      setTimeout(() => {
        onSubmitted();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500"
    >
      {/* Upload Area */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <UploadCloud className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">
                Tải lên dữ liệu
              </h2>
              <p className="text-sm text-slate-500">
                Hỗ trợ tệp định dạng .csv (tối đa 10MB)
              </p>
            </div>
          </div>

          <div
            className={`group relative border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer
              ${
                fileName
                  ? "border-emerald-200 bg-emerald-50/30"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-slate-50/50"
              }`}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <div
                className={`mb-4 p-4 rounded-full transition-transform group-hover:scale-110 ${
                  fileName ? "bg-emerald-100" : "bg-slate-100"
                }`}
              >
                {fileName ? (
                  <FileSpreadsheet className="w-8 h-8 text-emerald-600" />
                ) : (
                  <UploadCloud className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <p className="text-lg font-semibold text-slate-700 mb-1">
                {fileName || "Chọn hoặc kéo tệp CSV vào đây"}
              </p>
              <p className="text-sm text-slate-400">
                Hệ thống sẽ tự động phân tích dữ liệu sau khi tải lên
              </p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Format Quick Guide - Nằm ngay dưới khu vực upload */}
        <div className="bg-slate-50 border-t border-slate-200 p-6 flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-700 mb-3 uppercase tracking-wider">
              <Info className="w-4 h-4 text-indigo-500" />
              Cấu trúc tệp mẫu
            </h3>
            <div className="bg-white border border-slate-200 rounded-xl p-3 font-mono text-[11px] text-slate-600 leading-relaxed shadow-sm">
              <span className="text-indigo-600 font-bold italic">
                student_id, check_date, attendance, discipline_score,
                teacher_note
              </span>
              <div className="mt-1 border-t border-slate-100 pt-1 opacity-60">
                HS001, 2024-01-15, true, 10, Tốt
                <br />
                HS002, 2024-01-15, false, 5, Nghỉ không phép
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Data Preview Section */}
      {records.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden animate-in slide-in-from-bottom-4">
          <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Table className="w-5 h-5 text-indigo-400" />
              <span className="font-bold">
                Xem trước dữ liệu ({records.length} dòng)
              </span>
            </div>
            <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
              Chế độ xem tối giản
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <th className="px-6 py-4 text-center w-16">#</th>
                  <th className="px-6 py-4">Mã Học Sinh</th>
                  <th className="px-6 py-4">Ngày ghi nhận</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Điểm HV</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {records.slice(0, 5).map((record, idx) => (
                  <tr
                    key={idx}
                    className="hover:bg-indigo-50/30 transition-colors"
                  >
                    <td className="px-6 py-4 text-center text-slate-400 font-mono">
                      {idx + 1}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">
                      {record.student_id}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {record.check_date}
                    </td>
                    <td className="px-6 py-4">
                      {record.attendance ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                          <CheckCircle2 className="w-3 h-3" /> Có mặt
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          <AlertCircle className="w-3 h-3" /> Vắng mặt
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span
                        className={`font-bold ${
                          record.discipline_score >= 8
                            ? "text-emerald-600"
                            : "text-amber-600"
                        }`}
                      >
                        {record.discipline_score}/10
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {records.length > 5 && (
            <div className="p-4 text-center bg-slate-50/50 border-t border-slate-100">
              <p className="text-sm text-slate-500 italic">
                Cùng {records.length - 5} bản ghi khác đang chờ được xử lý...
              </p>
            </div>
          )}
        </div>
      )}

      {/* Notifications & Submit */}
      <div className="space-y-4">
        {error && (
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-700">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        )}

        {success && (
          <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm font-semibold">
              Tải lên hoàn tất! Dữ liệu đã được cập nhật thành công.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || records.length === 0}
          className="group relative w-full flex items-center justify-center gap-3 py-5 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 disabled:opacity-40 disabled:grayscale transition-all shadow-xl shadow-indigo-100 active:scale-[0.99]"
        >
          {loading ? (
            <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span className="text-lg">
                Xác nhận gửi {records.length} bản ghi
              </span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
