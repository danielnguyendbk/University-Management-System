import { BookOpen, CheckCircle2, Circle, Lock } from "lucide-react";

const years = [
  {
    year: "Year 1",
    semesters: [
      {
        name: "Fall 2024",
        courses: [
          { code: "CS101", name: "Introduction to Programming", credits: 4, status: "completed", grade: "A" },
          { code: "MATH101", name: "Calculus I", credits: 4, status: "completed", grade: "A-" },
          { code: "ENG101", name: "English Composition", credits: 3, status: "completed", grade: "B+" },
          { code: "PHY101", name: "Physics I", credits: 4, status: "completed", grade: "A" },
        ]
      },
      {
        name: "Spring 2025",
        courses: [
          { code: "CS102", name: "Data Structures", credits: 4, status: "completed", grade: "A" },
          { code: "MATH102", name: "Calculus II", credits: 4, status: "completed", grade: "A-" },
          { code: "ENG102", name: "Technical Writing", credits: 2, status: "completed", grade: "B+" },
          { code: "PHY102", name: "Physics II", credits: 4, status: "completed", grade: "A" },
        ]
      }
    ]
  },
  {
    year: "Year 2",
    semesters: [
      {
        name: "Fall 2025",
        courses: [
          { code: "CS201", name: "Algorithms", credits: 4, status: "completed", grade: "A" },
          { code: "CS202", name: "Operating Systems", credits: 3, status: "completed", grade: "A-" },
          { code: "MATH301", name: "Discrete Mathematics", credits: 3, status: "completed", grade: "A" },
          { code: "ENG201", name: "Technical Writing", credits: 2, status: "completed", grade: "B+" },
        ]
      },
      {
        name: "Spring 2026 (Current)",
        courses: [
          { code: "CS301", name: "Data Structures & Algorithms", credits: 3, status: "in-progress" },
          { code: "CS302", name: "Database Management Systems", credits: 4, status: "in-progress" },
          { code: "CS303", name: "Web Development", credits: 3, status: "in-progress" },
          { code: "CS304", name: "Machine Learning", credits: 4, status: "in-progress" },
          { code: "MATH201", name: "Linear Algebra", credits: 3, status: "in-progress" },
        ]
      }
    ]
  },
  {
    year: "Year 3",
    semesters: [
      {
        name: "Fall 2026",
        courses: [
          { code: "CS401", name: "Software Engineering", credits: 4, status: "locked" },
          { code: "CS402", name: "Computer Networks", credits: 3, status: "locked" },
          { code: "CS403", name: "Artificial Intelligence", credits: 4, status: "locked" },
          { code: "ELEC1", name: "Technical Elective I", credits: 3, status: "locked" },
        ]
      },
      {
        name: "Spring 2027",
        courses: [
          { code: "CS404", name: "Mobile Development", credits: 3, status: "locked" },
          { code: "CS405", name: "Cloud Computing", credits: 3, status: "locked" },
          { code: "CS406", name: "Cybersecurity", credits: 3, status: "locked" },
          { code: "ELEC2", name: "Technical Elective II", credits: 3, status: "locked" },
        ]
      }
    ]
  },
  {
    year: "Year 4",
    semesters: [
      {
        name: "Fall 2027",
        courses: [
          { code: "CS497", name: "Senior Project I", credits: 3, status: "locked" },
          { code: "CS490", name: "Capstone Seminar", credits: 2, status: "locked" },
          { code: "ELEC3", name: "Technical Elective III", credits: 3, status: "locked" },
          { code: "ELEC4", name: "General Elective", credits: 3, status: "locked" },
        ]
      },
      {
        name: "Spring 2028",
        courses: [
          { code: "CS498", name: "Senior Project II", credits: 3, status: "locked" },
          { code: "CS499", name: "Professional Practice", credits: 2, status: "locked" },
          { code: "ELEC5", name: "Technical Elective IV", credits: 3, status: "locked" },
        ]
      }
    ]
  }
];

const getStatusIcon = (status) => {
  if (status === "completed") return <CheckCircle2 className="w-5 h-5 text-green-600" />;
  if (status === "in-progress") return <Circle className="w-5 h-5 text-blue-600" />;
  return <Lock className="w-5 h-5 text-gray-400" />;
};

const getStatusColor = (status) => {
  if (status === "completed") return "bg-green-50 border-green-200";
  if (status === "in-progress") return "bg-blue-50 border-blue-200";
  return "bg-gray-50 border-gray-200";
};

export function Curriculum() {
  const totalCredits = years.reduce(
    (sum, year) => sum + year.semesters.reduce(
      (s, sem) => s + sem.courses.reduce((c, course) => c + course.credits, 0),
      0
    ),
    0
  );

  const completedCredits = years.reduce(
    (sum, year) => sum + year.semesters.reduce(
      (s, sem) => s + sem.courses.filter(c => c.status === "completed").reduce((c, course) => c + course.credits, 0),
      0
    ),
    0
  );

  const inProgressCredits = years.reduce(
    (sum, year) => sum + year.semesters.reduce(
      (s, sem) => s + sem.courses.filter(c => c.status === "in-progress").reduce((c, course) => c + course.credits, 0),
      0
    ),
    0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Curriculum</h1>
        <p className="text-gray-600 mt-1">Computer Science - Bachelor of Science Program</p>
      </div>

      {/* Progress Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total Credits Required</p>
          <p className="text-3xl font-semibold text-gray-900">{totalCredits}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Credits Completed</p>
          <p className="text-3xl font-semibold text-green-600">{completedCredits}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">In Progress</p>
          <p className="text-3xl font-semibold text-blue-600">{inProgressCredits}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Completion</p>
          <p className="text-3xl font-semibold text-[#1E3A8A]">
            {Math.round((completedCredits / totalCredits) * 100)}%
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">Degree Progress</span>
          <span className="text-sm text-gray-600">{completedCredits} / {totalCredits} Credits</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="bg-[#1E3A8A] h-3 rounded-full transition-all"
            style={{ width: `${(completedCredits / totalCredits) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-6">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <span className="text-sm text-gray-700">Completed</span>
          </div>
          <div className="flex items-center gap-2">
            <Circle className="w-5 h-5 text-blue-600" />
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-700">Locked</span>
          </div>
        </div>
      </div>

      {/* Curriculum by Year */}
      {years.map((yearData) => (
        <div key={yearData.year} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-[#1E3A8A] to-[#2563eb] px-6 py-4">
            <h2 className="text-xl font-semibold text-white">{yearData.year}</h2>
          </div>

          <div className="p-6 space-y-6">
            {yearData.semesters.map((semester) => (
              <div key={semester.name}>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{semester.name}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semester.courses.map((course) => (
                    <div
                      key={course.code}
                      className={`border rounded-lg p-4 ${getStatusColor(course.status)}`}
                    >
                      <div className="flex items-start gap-3">
                        {getStatusIcon(course.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <p className="font-semibold text-gray-900">{course.code}</p>
                            <span className="text-sm font-medium text-gray-600">{course.credits} cr</span>
                          </div>
                          <p className="text-sm text-gray-700 mb-2">{course.name}</p>
                          {course.grade && (
                            <span className="inline-flex px-2 py-0.5 bg-white border border-gray-200 rounded text-xs font-medium text-gray-900">
                              Grade: {course.grade}
                            </span>
                          )}
                          {course.status === "in-progress" && (
                            <span className="inline-flex px-2 py-0.5 bg-blue-100 border border-blue-200 rounded text-xs font-medium text-blue-900">
                              Current
                            </span>
                          )}
                          {course.status === "locked" && (
                            <span className="inline-flex px-2 py-0.5 bg-gray-100 border border-gray-200 rounded text-xs font-medium text-gray-600">
                              Not Available
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-3 text-sm text-gray-600">
                  Total: {semester.courses.reduce((sum, c) => sum + c.credits, 0)} credits
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
