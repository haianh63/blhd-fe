import { useState, useRef } from "react";
import { BASE_URL } from "../../utils";
import { useQueryClient } from "@tanstack/react-query";

export default function CreateStudents() {
  const [fileName, setFileName] = useState("");
  const [records, setRecords] = useState([]);
  const [responses, setResponses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const parseCSV = (text) => {
    const lines = text.trim().split("\n");
    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
    const records = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;

      const values = lines[i].split(",").map((v) => v.trim());
      const record = {};

      headers.forEach((header, index) => {
        record[header] = values[index];
      });

      if (record.student_id && record.full_name && record.class_id) {
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
    setShowResults(false);
    setResponses([]);
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
        `${BASE_URL}/teacher/create-students-bulk/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(records),
        }
      );

      if (!response.ok) throw new Error("Lỗi khi gửi dữ liệu");

      const result = await response.json();
      setResponses(result);
      setSuccess(true);
      setShowResults(true);
      setRecords([]);
      setFileName("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      queryClient.invalidateQueries({ queryKey: ["students"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi gửi dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const downloadCredentials = () => {
    if (responses.length === 0) return;

    const csv = [
      "Mã học sinh,Họ và tên,Tên đăng nhập,Mật khẩu",
      ...responses.map(
        (r) => `${r.student_id},${r.full_name},${r.username},${r.password}`
      ),
    ].join("\n");

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      `data:text/csv;charset=utf-8,${encodeURIComponent(csv)}`
    );
    element.setAttribute("download", "student-credentials.csv");
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="max-w-4xl">
      {!showResults ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Upload Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">
              Tạo tài khoản học sinh từ CSV
            </h2>

            <div
              className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-4xl mb-2">📋</div>
              <p className="font-medium text-foreground mb-1">
                {fileName || "Chọn hoặc kéo file CSV"}
              </p>
              <p className="text-sm text-muted-foreground">
                Định dạng: student_id, full_name, class_id
              </p>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* CSV Format Guide */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <h3 className="font-semibold text-foreground mb-2 text-sm">
              Hướng dẫn định dạng CSV
            </h3>
            <p className="text-xs text-muted-foreground mb-3">
              File CSV phải có các cột sau (thứ tự không quan trọng):
            </p>
            <div className="space-y-1 text-xs text-muted-foreground font-mono bg-background p-3 rounded">
              <div>student_id,full_name,class_id</div>
              <div className="mt-2 text-foreground">Ví dụ:</div>
              <div>HS001,Nguyễn Văn An,10A1</div>
              <div>HS002,Trần Thị Bình,10A1</div>
              <div>HS003,Lê Minh Hùng,10A2</div>
            </div>
          </div>

          {/* Preview */}
          {records.length > 0 && (
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="font-semibold text-foreground mb-3 text-sm">
                Dữ liệu được phát hiện: {records.length} học sinh
              </h3>
              <div className="overflow-x-auto">
                <table className="text-xs w-full">
                  <thead className="bg-muted">
                    <tr>
                      <th className="px-2 py-1 text-left text-foreground">
                        Mã học sinh
                      </th>
                      <th className="px-2 py-1 text-left text-foreground">
                        Họ và tên
                      </th>
                      <th className="px-2 py-1 text-left text-foreground">
                        Lớp
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {records.slice(0, 5).map((record, idx) => (
                      <tr key={idx} className="hover:bg-muted/50">
                        <td className="px-2 py-1 text-foreground">
                          {record.student_id}
                        </td>
                        <td className="px-2 py-1 text-foreground">
                          {record.full_name}
                        </td>
                        <td className="px-2 py-1 text-foreground">
                          {record.class_id}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {records.length > 5 && (
                <p className="text-xs text-muted-foreground mt-2">
                  ...và {records.length - 5} học sinh khác
                </p>
              )}
            </div>
          )}

          {/* Messages */}
          {error && (
            <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm">
              Lỗi: {error}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || records.length === 0}
            className={`w-full px-4 py-2 rounded-lg font-medium transition-colors ${
              loading || records.length === 0
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading
              ? "Đang xử lý..."
              : `Tạo tài khoản cho ${records.length} học sinh`}
          </button>
        </form>
      ) : (
        // Results View
        <div className="space-y-6">
          {success && (
            <div className="p-4 bg-green-100 border border-green-200 rounded-md text-green-800">
              <p className="font-semibold mb-1">Tạo tài khoản thành công!</p>
              <p className="text-sm">
                {responses.length} học sinh đã được tạo tài khoản
              </p>
            </div>
          )}

          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-foreground">
                Thông tin đăng nhập
              </h3>
              <button
                onClick={downloadCredentials}
                className="px-3 py-1 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
              >
                📥 Tải xuống CSV
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="text-xs w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-2 py-1 text-left text-foreground">
                      Mã học sinh
                    </th>
                    <th className="px-2 py-1 text-left text-foreground">
                      Họ và tên
                    </th>
                    <th className="px-2 py-1 text-left text-foreground">
                      Tên đăng nhập
                    </th>
                    <th className="px-2 py-1 text-left text-foreground">
                      Mật khẩu
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {responses.map((response, idx) => (
                    <tr key={idx} className="hover:bg-muted/50">
                      <td className="px-2 py-1 text-foreground font-medium">
                        {response.student_id}
                      </td>
                      <td className="px-2 py-1 text-foreground">
                        {response.full_name}
                      </td>
                      <td className="px-2 py-1 text-foreground font-mono">
                        {response.username}
                      </td>
                      <td className="px-2 py-1 text-foreground font-mono bg-muted/50 rounded px-1">
                        {response.password}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowResults(false);
                setResponses([]);
                setRecords([]);
              }}
              className="flex-1 px-4 py-2 border border-border rounded-lg font-medium text-foreground hover:bg-muted transition-colors"
            >
              Tạo thêm tài khoản
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
