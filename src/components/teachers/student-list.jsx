import { useState } from "react";

export default function StudentList({
  students,
  loading,
  onFilter,
  onSelectStudent,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedRiskLevel, setSelectedRiskLevel] = useState("");

  // Get unique values for filters
  const uniqueClasses = [...new Set(students.map((s) => s.class_id))].sort();
  const uniqueRiskLevels = [...new Set(students.map((s) => s.risk_level))];

  const handleFilterChange = (search, classId, riskLevel) => {
    onFilter({
      search: search || undefined,
      class_id: classId || undefined,
      risk_level: riskLevel || undefined,
    });
  };

  const getRiskLevelColor = (riskLevel) => {
    switch (riskLevel) {
      case "Xanh":
        return "bg-green-100 text-green-800";
      case "Vàng":
        return "bg-yellow-100 text-yellow-800";
      case "Đỏ":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-card p-4 rounded-lg border border-border">
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Tìm kiếm
          </label>
          <input
            type="text"
            placeholder="Tên hoặc mã học sinh..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              handleFilterChange(
                e.target.value,
                selectedClass,
                selectedRiskLevel
              );
            }}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Lớp
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              handleFilterChange(searchTerm, e.target.value, selectedRiskLevel);
            }}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả lớp</option>
            {uniqueClasses.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Mức độ rủi ro
          </label>
          <select
            value={selectedRiskLevel}
            onChange={(e) => {
              setSelectedRiskLevel(e.target.value);
              handleFilterChange(searchTerm, selectedClass, e.target.value);
            }}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">Tất cả mức độ</option>
            {uniqueRiskLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">
            Đang tải dữ liệu...
          </div>
        ) : students.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            Không có học sinh nào
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted border-b border-border">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Mã học sinh
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Họ và tên
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Lớp
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Mức độ rủi ro
                  </th>
                  <th className="px-4 py-3 text-left font-semibold text-foreground">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {students.map((student) => (
                  <tr
                    key={student.student_id}
                    className="hover:bg-muted/50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-foreground">
                      {student.student_id}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground font-medium">
                      {student.full_name}
                    </td>
                    <td className="px-4 py-3 text-sm text-foreground">
                      {student.class_id}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getRiskLevelColor(
                          student.risk_level
                        )}`}
                      >
                        {student.risk_level}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => onSelectStudent(student)}
                        className="px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-xs font-medium"
                      >
                        Cập nhật
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && students.length > 0 && (
        <div className="text-sm text-muted-foreground text-right">
          Tổng số: {students.length} học sinh
        </div>
      )}
    </div>
  );
}
