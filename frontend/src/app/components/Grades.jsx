import { TrendingUp, Award, BookOpen } from "lucide-react";

const semesters = [
  {
    name: "Fall 2025",
    gpa: 3.85,
    courses: [
      { code: "CS201", name: "Algorithms", credits: 4, grade: "A", points: 4.0 },
      { code: "CS202", name: "Operating Systems", credits: 3, grade: "A-", points: 3.7 },
      { code: "MATH301", name: "Discrete Mathematics", credits: 3, grade: "A", points: 4.0 },
      { code: "ENG201", name: "Technical Writing", credits: 2, grade: "B+", points: 3.3 },
    ]
  },
  {
    name: "Summer 2025",
    gpa: 3.65,
    courses: [
      { code: "CS250", name: "Software Testing", credits: 3, grade: "A-", points: 3.7 },
      { code: "BUS101", name: "Business Fundamentals", credits: 2, grade: "B+", points: 3.3 },
    ]
  },
  {
    name: "Spring 2025",
    gpa: 3.75,
    courses: [
      { code: "CS301", name: "Data Structures", credits: 3, grade: "A", points: 4.0 },
      { code: "CS302", name: "Database Systems", credits: 4, grade: "A-", points: 3.7 },
      { code: "CS303", name: "Web Development", credits: 3, grade: "B+", points: 3.3 },
      { code: "MATH201", name: "Linear Algebra", credits: 3, grade: "A", points: 4.0 },
    ]
  },
];

const getGradeColor = (grade) => {
  if (grade.startsWith("A")) return "text-green-700 bg-green-50";
  if (grade.startsWith("B")) return "text-blue-700 bg-blue-50";
  if (grade.startsWith("C")) return "text-amber-700 bg-amber-50";
  return "text-gray-700 bg-gray-50";
};

export function Grades() {
  const totalCredits = semesters.reduce(
    (sum, sem) => sum + sem.courses.reduce((s, c) => s + c.credits, 0),
    0
  );
  
  const cumulativeGPA = 3.75;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Academic Performance</h1>
        <p className="text-gray-600 mt-1">View your grades and GPA</p>
      </div>

      {/* GPA Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-[#1E3A8A] to-[#2563eb] rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <p className="text-blue-100">Cumulative GPA</p>
            <Award className="w-6 h-6 text-blue-200" />
          </div>
          <p className="text-5xl font-bold mb-1">{cumulativeGPA.toFixed(2)}</p>
          <p className="text-sm text-blue-100">Out of 4.0</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Credits Earned</p>
            <BookOpen className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{totalCredits}</p>
          <p className="text-sm text-gray-600 mt-1">Credits completed</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Academic Standing</p>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-2xl font-semibold text-green-600">Dean's List</p>
          <p className="text-sm text-gray-600 mt-1">Excellent performance</p>
        </div>
      </div>

      {/* Semester Grades */}
      {semesters.map((semester) => (
        <div key={semester.name} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">{semester.name}</h2>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-500">Semester GPA</p>
                  <p className="text-xl font-bold text-[#1E3A8A]">{semester.gpa.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Course Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Course Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Grade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Points
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {semester.courses.map((course, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{course.code}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-900">{course.name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900">{course.credits}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full font-semibold text-sm ${getGradeColor(course.grade)}`}>
                        {course.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{course.points.toFixed(1)}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">Total Credits</span>
              <span className="font-semibold text-gray-900">
                {semester.courses.reduce((sum, c) => sum + c.credits, 0)}
              </span>
            </div>
          </div>
        </div>
      ))}

      {/* Grade Scale */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Grading Scale</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-900">A (4.0)</p>
            <p className="text-sm text-green-700">93-100</p>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <p className="font-semibold text-green-900">A- (3.7)</p>
            <p className="text-sm text-green-700">90-92</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900">B+ (3.3)</p>
            <p className="text-sm text-blue-700">87-89</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900">B (3.0)</p>
            <p className="text-sm text-blue-700">83-86</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="font-semibold text-blue-900">B- (2.7)</p>
            <p className="text-sm text-blue-700">80-82</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold text-amber-900">C+ (2.3)</p>
            <p className="text-sm text-amber-700">77-79</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold text-amber-900">C (2.0)</p>
            <p className="text-sm text-amber-700">73-76</p>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <p className="font-semibold text-amber-900">C- (1.7)</p>
            <p className="text-sm text-amber-700">70-72</p>
          </div>
        </div>
      </div>
    </div>
  );
}
