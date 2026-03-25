import { useState } from "react";
import { MessageSquare, Star, Send, CheckCircle2 } from "lucide-react";

export function Feedback() {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [category, setCategory] = useState("general");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRating(0);
    }, 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Feedback</h1>
        <p className="text-gray-600 mt-1">Share your thoughts and suggestions with us</p>
      </div>

      {submitted && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <div>
            <p className="font-medium text-green-900">Thank you for your feedback!</p>
            <p className="text-sm text-green-700">We appreciate you taking the time to help us improve.</p>
          </div>
        </div>
      )}

      {/* Feedback Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Feedback Category *
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setCategory("general")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "general"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "general" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">General</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("courses")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "courses"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "courses" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Courses</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("facilities")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "facilities"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "facilities" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Facilities</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("portal")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "portal"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "portal" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Student Portal</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("services")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "services"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "services" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Services</p>
              </button>
              <button
                type="button"
                onClick={() => setCategory("other")}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  category === "other"
                    ? "border-[#1E3A8A] bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <MessageSquare className={`w-5 h-5 mb-1 ${category === "other" ? "text-[#1E3A8A]" : "text-gray-400"}`} />
                <p className="font-medium text-gray-900 text-sm">Other</p>
              </button>
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Overall Rating *
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  onMouseEnter={() => setHoveredRating(value)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110"
                >
                  <Star
                    className={`w-10 h-10 ${
                      value <= (hoveredRating || rating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    }`}
                  />
                </button>
              ))}
              {rating > 0 && (
                <span className="ml-3 text-gray-600 self-center">
                  {rating === 1 && "Poor"}
                  {rating === 2 && "Fair"}
                  {rating === 3 && "Good"}
                  {rating === 4 && "Very Good"}
                  {rating === 5 && "Excellent"}
                </span>
              )}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject *
            </label>
            <input
              type="text"
              required
              placeholder="Brief summary of your feedback"
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A]"
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback *
            </label>
            <textarea
              required
              rows={8}
              placeholder="Please share your detailed feedback, suggestions, or concerns..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]/20 focus:border-[#1E3A8A] resize-none"
            ></textarea>
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="anonymous"
              className="w-4 h-4 text-[#1E3A8A] border-gray-300 rounded focus:ring-[#1E3A8A]"
            />
            <label htmlFor="anonymous" className="text-sm text-gray-700">
              Submit anonymously
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              Submit Feedback
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

      {/* Recent Feedback */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Your Recent Feedback</h2>
        </div>
        <div className="divide-y divide-gray-200">
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                    Student Portal
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="font-medium text-gray-900 mb-1">Great new interface!</p>
                <p className="text-sm text-gray-600 mb-2">
                  The new portal design is much more user-friendly. Love the clean layout and easy navigation.
                </p>
                <p className="text-xs text-gray-500">Submitted on March 20, 2026</p>
              </div>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Reviewed
              </span>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                    Facilities
                  </span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <Star className="w-4 h-4 text-gray-300" />
                  </div>
                </div>
                <p className="font-medium text-gray-900 mb-1">Library could use more study rooms</p>
                <p className="text-sm text-gray-600 mb-2">
                  The library is great but during finals week it's hard to find available study rooms.
                </p>
                <p className="text-xs text-gray-500">Submitted on March 10, 2026</p>
              </div>
              <span className="px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                Reviewed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Your Voice Matters</h3>
        <p className="text-sm text-blue-800">
          We review all feedback carefully. Your suggestions help us improve the university experience for everyone. 
          You can expect a response within 5-7 business days for non-anonymous submissions.
        </p>
      </div>
    </div>
  );
}
