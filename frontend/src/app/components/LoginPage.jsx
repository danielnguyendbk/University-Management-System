import { useNavigate } from "react-router";
import { Calendar, AlertCircle } from "lucide-react";

const announcements = [
  {
    id: 1,
    title: "Spring Semester Registration Open",
    description: "Course registration for Spring 2026 semester is now open. Please register before March 30, 2026.",
    date: "March 20, 2026"
  },
  {
    id: 2,
    title: "Campus Safety Guidelines Update",
    description: "New campus safety protocols have been implemented. All students are required to review the updated guidelines.",
    date: "March 18, 2026"
  },
  {
    id: 3,
    title: "Library Hours Extended During Finals",
    description: "The university library will extend operating hours during the final examination period.",
    date: "March 15, 2026"
  },
  {
    id: 4,
    title: "Career Fair - April 2026",
    description: "Annual career fair will be held on April 15-16. Register early to secure your spot with top employers.",
    date: "March 10, 2026"
  }
];

const tuitionNotices = [
  {
    id: 1,
    title: "Tuition Fee - Spring 2026",
    amount: "$4,500",
    dueDate: "March 25, 2026",
    status: "overdue"
  },
  {
    id: 2,
    title: "Lab Fee - Computer Science",
    amount: "$200",
    dueDate: "March 30, 2026",
    status: "pending"
  },
  {
    id: 3,
    title: "Student Activity Fee",
    amount: "$150",
    dueDate: "April 5, 2026",
    status: "pending"
  }
];

export function LoginPage() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulate login and navigate to portal
    navigate("/portal");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1E3A8A] rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-gray-900">University Portal</h1>
              <p className="text-xs text-gray-500">Student Information System</p>
            </div>
          </div>
          <button
            onClick={handleLogin}
            className="px-6 py-2.5 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium"
          >
            Student Login
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* University Announcements - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">University Announcements</h2>
            <div className="space-y-4">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{announcement.title}</h3>
                      <p className="text-gray-600 text-sm mb-3">{announcement.description}</p>
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-gray-500">{announcement.date}</span>
                        <button className="text-sm text-[#1E3A8A] hover:underline font-medium">
                          View details →
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tuition Fee Notices - Takes 1 column */}
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Tuition Fee Notices</h2>
            <div className="space-y-4">
              {tuitionNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-100 p-5"
                >
                  <div className="flex items-start gap-3 mb-3">
                    {notice.status === "overdue" && (
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 text-sm mb-1">{notice.title}</h3>
                      <p className="text-lg font-bold text-gray-900">{notice.amount}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-600">Due: {notice.dueDate}</span>
                    {notice.status === "overdue" ? (
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                        Overdue
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                        Pending
                      </span>
                    )}
                  </div>
                </div>
              ))}
              
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-blue-900 font-medium mb-1">Need to pay fees?</p>
                <p className="text-xs text-blue-700">Login to access payment options and view detailed invoices.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
