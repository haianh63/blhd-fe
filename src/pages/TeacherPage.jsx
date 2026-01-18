import { useState, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query"; // Import useQuery
import StudentList from "../components/teachers/student-list";
import BehaviorForm from "../components/teachers/behavior-form";
import BulkUpload from "../components/teachers/bulk-upload";
import CreateStudents from "../components/teachers/create-students";
import {
  Users,
  ClipboardCheck,
  FileUp,
  UserPlus,
  AlertCircle,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetAuthCredential } from "../features/auth/AuthSlice";
import { BASE_URL } from "../utils";
import { TeacherRegisterForm } from "../components/teachers/teacher-register-form";
import CheckInList from "../components/teachers/checkin-list";

// Hàm fetch data tách rời
const fetchStudents = async () => {
  const response = await fetch(`${BASE_URL}/teacher/students`);
  if (!response.ok) throw new Error("Không thể tải danh sách học sinh");
  return response.json();
};

export default function TeacherPage() {
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [activeTab, setActiveTab] = useState("list");
  const [filters, setFilters] = useState({}); // Lưu state filter để React Query không cần fetch lại

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  // React Query: Tự động quản lý loading, error và cache
  const {
    data: students = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["students"],
    queryFn: fetchStudents,
    staleTime: 1000 * 60 * 5, // Cache dữ liệu trong 5 phút
  });

  // Xử lý lọc dữ liệu trực tiếp từ "students" của React Query bằng useMemo
  // Điều này giúp hiệu năng tốt hơn vì không cần useEffect để setFilteredStudents
  const filteredStudents = useMemo(() => {
    let result = [...students];

    if (filters.class_id) {
      result = result.filter((s) => s.class_id === filters.class_id);
    }
    if (filters.risk_level) {
      result = result.filter((s) => s.risk_level === filters.risk_level);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(
        (s) =>
          s.full_name.toLowerCase().includes(searchLower) ||
          s.student_id.toLowerCase().includes(searchLower),
      );
    }
    return result;
  }, [students, filters]);

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
  };

  const handleStudentSelect = (student) => {
    setSelectedStudent(student);
    setActiveTab("form");
  };

  const handleBehaviorSubmitted = () => {
    setActiveTab("list");
    setSelectedStudent(null);
    queryClient.invalidateQueries({ queryKey: ["students"] });
  };

  const handleLogout = () => {
    dispatch(resetAuthCredential());
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="flex justify-end">
        <button
          onClick={handleLogout}
          className="bg-blue-400 text-white px-6 py-2 rounded-md hover:cursor-pointer hover:bg-blue-500"
        >
          Đăng xuất
        </button>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Hệ thống Phòng chống{" "}
              <span className="text-blue-600">Bạo lực Học đường</span>
            </h1>
            <p className="mt-2 text-lg text-slate-500">
              Nền tảng quản lý hành vi và hỗ trợ học sinh thời gian thực.
            </p>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-slate-200 w-fit">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <span className="text-sm font-medium text-slate-600">
              Hệ thống đang hoạt động
            </span>
          </div>
        </header>

        {/* Hiển thị lỗi từ React Query */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl text-red-800 shadow-sm animate-in fade-in slide-in-from-top-4">
            <AlertCircle className="w-5 h-5" />
            <p className="font-medium text-sm">Lưu ý: {error.message}</p>
          </div>
        )}

        <nav className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex flex-wrap gap-1">
          <TabButton
            active={activeTab === "list"}
            onClick={() => {
              setActiveTab("list");
              setSelectedStudent(null);
            }}
            icon={<Users className="w-4 h-4" />}
            label="Danh sách học sinh"
          />
          <TabButton
            active={activeTab === "form"}
            onClick={() => setActiveTab("form")}
            icon={<ClipboardCheck className="w-4 h-4" />}
            label="Cập nhật hàng ngày"
          />
          <TabButton
            active={activeTab === "bulk"}
            onClick={() => setActiveTab("bulk")}
            icon={<FileUp className="w-4 h-4" />}
            label="Nhập liệu hàng loạt"
          />
          <TabButton
            active={activeTab === "create"}
            onClick={() => setActiveTab("create")}
            icon={<UserPlus className="w-4 h-4" />}
            label="Tạo tài khoản học sinh"
          />
          <TabButton
            active={activeTab === "teacher-create"}
            onClick={() => setActiveTab("teacher-create")}
            icon={<UserPlus className="w-4 h-4" />}
            label="Tạo tài khoản giáo viên"
          />

          <TabButton
            active={activeTab === "checkins"}
            onClick={() => setActiveTab("checkins")}
            icon={<UserPlus className="w-4 h-4" />}
            label="Tâm sự của học sinh"
          />
        </nav>

        <main className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-200 min-h-[500px] overflow-hidden">
          <div className="p-6 md:p-8">
            {activeTab === "list" && (
              <div className="animate-in fade-in duration-500">
                <StudentList
                  students={filteredStudents}
                  loading={isLoading} // Sử dụng isLoading của React Query
                  onFilter={handleFilter}
                  onSelectStudent={handleStudentSelect}
                />
              </div>
            )}

            {activeTab === "form" && (
              <div className="max-w-2xl mx-auto animate-in zoom-in-95 duration-300">
                <BehaviorForm
                  student={selectedStudent}
                  onSubmitted={handleBehaviorSubmitted}
                />
              </div>
            )}

            {activeTab === "bulk" && (
              <div className="animate-in slide-in-from-bottom-4 duration-400">
                <BulkUpload onSubmitted={() => setActiveTab("list")} />
              </div>
            )}

            {activeTab === "create" && (
              <div className="animate-in fade-in">
                <CreateStudents />
              </div>
            )}

            {activeTab === "teacher-create" && (
              <div className="animate-in fade-in">
                <TeacherRegisterForm />
              </div>
            )}

            {activeTab === "checkins" && <CheckInList />}
          </div>
        </main>
      </div>
    </div>
  );
}

const TabButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`
      flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all duration-200
      ${
        active
          ? "bg-blue-600 text-white shadow-md shadow-blue-200"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      }
    `}
  >
    {icon}
    <span className="text-sm">{label}</span>
  </button>
);
