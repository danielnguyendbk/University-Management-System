import { Bell, Pin, Calendar } from "lucide-react";
import { PageHeader } from "./common/PageHeader";

const announcements = [
  {
    id: 1,
    title: "Spring Semester Registration Open",
    content: "Course registration for Spring 2026 semester is now open. Please register before March 30, 2026 to avoid late fees. Priority registration is available for seniors and honors students.",
    date: "March 20, 2026",
    category: "Academic",
    pinned: true,
    important: true
  },
  {
    id: 2,
    title: "Campus Safety Guidelines Update",
    content: "New campus safety protocols have been implemented following recent campus security review. All students are required to review the updated guidelines on the portal and attend the mandatory safety orientation session.",
    date: "March 18, 2026",
    category: "Safety",
    pinned: true,
    important: true
  },
  {
    id: 3,
    title: "Library Hours Extended During Finals",
    content: "The university library will extend operating hours during the final examination period. New hours: Monday-Friday 7AM-2AM, Saturday-Sunday 9AM-12AM. Additional study rooms will be available.",
    date: "March 15, 2026",
    category: "Facilities",
    pinned: false,
    important: false
  },
  {
    id: 4,
    title: "Career Fair - April 2026",
    content: "Annual career fair will be held on April 15-16, 2026 in the University Hall. Over 100 companies will participate. Register early to secure your spot with top employers. Resume review sessions available March 25-30.",
    date: "March 10, 2026",
    category: "Career",
    pinned: false,
    important: true
  },
  {
    id: 5,
    title: "Student Health Services Update",
    content: "Student Health Services has expanded hours and added new services including mental health counseling and nutritional consulting. Book appointments through the student portal.",
    date: "March 8, 2026",
    category: "Health",
    pinned: false,
    important: false
  },
  {
    id: 6,
    title: "Spring Break - Campus Closure",
    content: "The university campus will be closed during spring break from April 1-7, 2026. Limited services will be available. Emergency contacts remain active 24/7.",
    date: "March 5, 2026",
    category: "General",
    pinned: false,
    important: false
  },
];

export function Announcements() {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <PageHeader
        title="Announcements"
        subtitle="Stay updated with university news and important notices"
      />

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          <button className="px-4 py-2 bg-[#1E3A8A] text-white rounded-lg text-sm font-medium">
            All
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Academic
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Safety
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Facilities
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Career
          </button>
          <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
            Important Only
          </button>
        </div>
      </div>

      <section aria-label="Announcements list">
        <ul className="space-y-4">
        {announcements.map((announcement) => (
          <li key={announcement.id}>
            <article
            className={`bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow ${
              announcement.important ? "border-[#1E3A8A]" : "border-gray-200"
            }`}
          >
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                announcement.important ? "bg-blue-100" : "bg-gray-100"
              }`}>
                <Bell className={`w-6 h-6 ${announcement.important ? "text-[#1E3A8A]" : "text-gray-600"}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {announcement.pinned && (
                      <Pin className="w-4 h-4 text-[#1E3A8A]" />
                    )}
                    <h3 className="font-semibold text-gray-900 text-lg">{announcement.title}</h3>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full flex-shrink-0 ${
                    announcement.category === "Academic" ? "bg-blue-50 text-blue-700" :
                    announcement.category === "Safety" ? "bg-red-50 text-red-700" :
                    announcement.category === "Facilities" ? "bg-green-50 text-green-700" :
                    announcement.category === "Career" ? "bg-purple-50 text-purple-700" :
                    announcement.category === "Health" ? "bg-amber-50 text-amber-700" :
                    "bg-gray-50 text-gray-700"
                  }`}>
                    {announcement.category}
                  </span>
                </div>
                
                <p className="text-gray-700 mb-3">{announcement.content}</p>
                
                <div className="flex items-center gap-4">
                  <time className="flex items-center gap-1.5 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {announcement.date}
                  </time>
                  {announcement.important && (
                    <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                      Important
                    </span>
                  )}
                </div>
              </div>
            </div>
            </article>
          </li>
        ))}
        </ul>
      </section>
    </div>
  );
}
