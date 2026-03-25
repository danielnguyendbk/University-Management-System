import { Check, X, Eye, Calendar, FileText } from "lucide-react";

const requests = [
  {
    id: 1,
    studentName: "Emily Johnson",
    studentId: "2021001235",
    type: "leave",
    title: "Medical Leave",
    course: "CS301 - Data Structures",
    dateRange: "March 24-26, 2026",
    submittedDate: "March 23, 2026",
    status: "pending",
    reason: "Medical appointment and recovery period required."
  },
  {
    id: 2,
    studentName: "Michael Chen",
    studentId: "2021001236",
    type: "recheck",
    title: "Midterm Grade Review",
    course: "CS302 - Database Systems",
    submittedDate: "March 22, 2026",
    status: "pending",
    reason: "Request to review midterm exam grading for question 3 and 5."
  },
  {
    id: 3,
    studentName: "Sarah Williams",
    studentId: "2021001237",
    type: "leave",
    title: "Family Emergency",
    course: "CS303 - Web Development",
    dateRange: "March 20-21, 2026",
    submittedDate: "March 19, 2026",
    status: "pending",
    reason: "Urgent family matter requiring immediate attention."
  },
];

export function RequestApproval() {
  const handleApprove = (requestId) => {
    console.log("Approving request:", requestId);
  };

  const handleReject = (requestId) => {
    console.log("Rejecting request:", requestId);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Request Approval</h1>
        <p className="text-gray-600 mt-1">Review and manage student requests</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Pending Requests</p>
          <p className="text-3xl font-semibold text-gray-900">3</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Approved Today</p>
          <p className="text-3xl font-semibold text-green-600">5</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Rejected Today</p>
          <p className="text-3xl font-semibold text-red-600">1</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <p className="text-sm text-gray-500 mb-1">Total This Month</p>
          <p className="text-3xl font-semibold text-gray-900">28</p>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Pending Requests</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              Filter
            </button>
            <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700">
              Sort
            </button>
          </div>
        </div>
        
        <div className="divide-y divide-gray-200">
          {requests.map((request) => (
            <div key={request.id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 space-y-3">
                  {/* Header */}
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      request.type === "leave" ? "bg-blue-100" : "bg-purple-100"
                    }`}>
                      {request.type === "leave" ? (
                        <Calendar className={`w-5 h-5 ${request.type === "leave" ? "text-blue-600" : "text-purple-600"}`} />
                      ) : (
                        <FileText className="w-5 h-5 text-purple-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                          request.type === "leave" 
                            ? "bg-blue-50 text-blue-700"
                            : "bg-purple-50 text-purple-700"
                        }`}>
                          {request.type === "leave" ? "Leave Request" : "Grade Recheck"}
                        </span>
                        <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                          Pending Review
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900">{request.title}</h3>
                    </div>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-13">
                    <div>
                      <p className="text-sm text-gray-500">Student</p>
                      <p className="font-medium text-gray-900">{request.studentName}</p>
                      <p className="text-sm text-gray-600">ID: {request.studentId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="font-medium text-gray-900">{request.course}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="pl-13">
                    {request.dateRange && (
                      <div className="mb-2">
                        <p className="text-sm text-gray-500">Period</p>
                        <p className="text-sm font-medium text-gray-900">{request.dateRange}</p>
                      </div>
                    )}
                    <div className="mb-2">
                      <p className="text-sm text-gray-500">Reason</p>
                      <p className="text-sm text-gray-900">{request.reason}</p>
                    </div>
                    <p className="text-xs text-gray-500">Submitted: {request.submittedDate}</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleApprove(request.id)}
                    className="px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request.id)}
                    className="px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Reject
                  </button>
                  <button className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700 flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Actions</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Leave Request - Alex Thompson</p>
              <p className="text-sm text-gray-600">CS304 - Machine Learning</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">March 23, 10:30 AM</span>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Approved
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Grade Recheck - Jessica Lee</p>
              <p className="text-sm text-gray-600">MATH201 - Linear Algebra</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">March 23, 09:15 AM</span>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Approved
              </span>
            </div>
          </div>
          <div className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <p className="font-medium text-gray-900">Leave Request - David Park</p>
              <p className="text-sm text-gray-600">CS301 - Data Structures</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">March 22, 04:20 PM</span>
              <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                Rejected
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
