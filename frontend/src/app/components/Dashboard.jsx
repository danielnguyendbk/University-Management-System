import { BookOpen, TrendingUp, DollarSign, Clock, AlertCircle } from "lucide-react";
import { PageHeader } from "./common/PageHeader";
import { StatCard } from "./common/StatCard";

const upcomingClasses = [
  { id: 1, course: "Data Structures & Algorithms", time: "09:00 AM", room: "A-301", lecturer: "Dr. Smith" },
  { id: 2, course: "Database Management Systems", time: "11:00 AM", room: "B-205", lecturer: "Prof. Johnson" },
  { id: 3, course: "Web Development", time: "02:00 PM", room: "C-104", lecturer: "Dr. Williams" },
];

const recentAnnouncements = [
  { id: 1, title: "Spring Semester Registration Open", date: "March 20, 2026", important: true },
  { id: 2, title: "Library Hours Extended", date: "March 18, 2026", important: false },
  { id: 3, title: "Career Fair - April 2026", date: "March 15, 2026", important: true },
];

export function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Dashboard" subtitle="Welcome back, John Doe" />

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Student profile">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Student Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Full Name</p>
            <p className="font-medium text-gray-900">John Doe</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Student ID</p>
            <p className="font-medium text-gray-900">2021001234</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Program</p>
            <p className="font-medium text-gray-900">Computer Science - B.S.</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Academic Status</p>
            <span className="inline-flex px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
              Active
            </span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Quick statistics">
        <StatCard
          label="Current Courses"
          value="6"
          note="18 Credits"
          icon={<BookOpen className="w-5 h-5" />}
        />
        <StatCard
          label="Current GPA"
          value="3.75"
          note="+0.12 from last semester"
          icon={<TrendingUp className="w-5 h-5" />}
        />
        <StatCard
          label="Tuition Status"
          value="$4,500"
          note="Overdue"
          icon={<DollarSign className="w-5 h-5" />}
        />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6" aria-label="Schedule and announcements">
        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Today's Schedule</h2>
            <Clock className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingClasses.map((cls) => (
              <div key={cls.id} className="flex gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-16 text-center">
                  <p className="text-sm font-semibold text-[#1E3A8A]">{cls.time}</p>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1">{cls.course}</p>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>Room: {cls.room}</span>
                    <span>•</span>
                    <span>{cls.lecturer}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[#1E3A8A] font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View Full Schedule →
          </button>
        </article>

        <article className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Announcements</h2>
            <span className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded-full font-medium">
              3 New
            </span>
          </div>
          <div className="space-y-3">
            {recentAnnouncements.map((announcement) => (
              <div
                key={announcement.id}
                className={`p-4 rounded-lg border ${
                  announcement.important
                    ? "bg-blue-50 border-blue-200"
                    : "bg-gray-50 border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {announcement.important && (
                    <AlertCircle className="w-4 h-4 text-[#1E3A8A] flex-shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm mb-1">
                      {announcement.title}
                    </p>
                    <p className="text-xs text-gray-500">{announcement.date}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 py-2 text-sm text-[#1E3A8A] font-medium hover:bg-blue-50 rounded-lg transition-colors">
            View All Announcements →
          </button>
        </article>
      </section>

      <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6" aria-label="Quick actions">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <BookOpen className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Register Courses</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <DollarSign className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Pay Tuition</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <Clock className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">View Schedule</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:border-[#1E3A8A] hover:bg-blue-50 transition-colors text-center">
            <TrendingUp className="w-6 h-6 text-[#1E3A8A] mx-auto mb-2" />
            <p className="text-sm font-medium text-gray-900">Check Grades</p>
          </button>
        </div>
      </section>
    </div>
  );
}
