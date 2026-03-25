import { useState } from "react";
import { Send, FileText, Calendar, CheckCircle2 } from "lucide-react";

export function SubmitRequest() {
  const [requestType, setRequestType] = useState("leave");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Submit Request</h1>
        <p className="text-gray-600 mt-1">Submit leave requests or grade rechecks</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Request submitted successfully!</p>
            <p className="text-sm text-green-700">You will receive a notification once it's reviewed.</p>
          </div>
        </div>
      )}

      {/* Request Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Request Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Request Type *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRequestType("leave")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  requestType === "leave"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <Calendar className={`w-6 h-6 mb-2 ${requestType === "leave" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900">Leave Request</p>
                <p className="text-sm text-gray-600">Request absence from classes</p>
              </button>
              <button
                type="button"
                onClick={() => setRequestType("recheck")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  requestType === "recheck"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <FileText className={`w-6 h-6 mb-2 ${requestType === "recheck" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-semibold text-gray-900">Grade Recheck</p>
                <p className="text-sm text-gray-600">Request grade review</p>
              </button>
            </div>
          </div>

          {/* Course/Subject (for recheck) */}
          {requestType === "recheck" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Course *
              </label>
              <select
                required
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
              >
                <option value="">Select course</option>
                <option>CS301 - Data Structures</option>
                <option>CS302 - Database Systems</option>
                <option>CS303 - Web Development</option>
                <option>CS304 - Machine Learning</option>
                <option>MATH201 - Linear Algebra</option>
              </select>
            </div>
          )}

          {/* Date Range (for leave) */}
          {requestType === "leave" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  From Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  To Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              required
              placeholder={requestType === "leave" ? "e.g., Medical Leave" : "e.g., Midterm Exam Grade Review"}
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>

          {/* Content/Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {requestType === "leave" ? "Reason" : "Details"} *
            </label>
            <textarea
              required
              rows={6}
              placeholder={requestType === "leave" 
                ? "Please explain the reason for your leave request..."
                : "Please provide details about your grade recheck request..."
              }
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
            ></textarea>
          </div>

          {/* Attachment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Supporting Documents
            </label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center hover:border-gray-300 transition-colors">
              <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600 mb-1">
                Click to upload or drag and drop
              </p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
              <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Request
            </button>
            <button
              type="button"
              className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    Leave Request
                  </span>
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-full">
                    Pending
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-1">Medical Leave</p>
                <p className="text-sm text-gray-600 mb-2">March 18-20, 2026</p>
                <p className="text-xs text-gray-500">Submitted on March 17, 2026</p>
              </div>
            </div>
          </div>
          <div className="p-6 hover:bg-gray-50">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    Grade Recheck
                  </span>
                  <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                    Approved
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-1">Midterm Exam Review - CS301</p>
                <p className="text-sm text-gray-600 mb-2">Data Structures & Algorithms</p>
                <p className="text-xs text-gray-500">Submitted on March 10, 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
