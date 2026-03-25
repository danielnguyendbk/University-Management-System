import { FileText, Download, Eye, Calendar, DollarSign } from "lucide-react";

const invoices = [
  {
    id: "INV-2026-001",
    semester: "Spring 2026",
    issueDate: "2026-01-15",
    dueDate: "2026-03-25",
    amount: 4500,
    status: "unpaid",
    items: [
      { description: "Tuition Fee", amount: 4200 },
      { description: "Lab Fee - Computer Science", amount: 200 },
      { description: "Student Activity Fee", amount: 100 },
    ]
  },
  {
    id: "INV-2025-003",
    semester: "Fall 2025",
    issueDate: "2025-08-15",
    dueDate: "2025-09-15",
    paidDate: "2025-09-15",
    amount: 4500,
    status: "paid",
    items: [
      { description: "Tuition Fee", amount: 4200 },
      { description: "Lab Fee - Computer Science", amount: 200 },
      { description: "Student Activity Fee", amount: 100 },
    ]
  },
  {
    id: "INV-2025-002",
    semester: "Summer 2025",
    issueDate: "2025-05-10",
    dueDate: "2025-05-20",
    paidDate: "2025-05-20",
    amount: 3000,
    status: "paid",
    items: [
      { description: "Tuition Fee - Summer Session", amount: 2800 },
      { description: "Student Activity Fee", amount: 100 },
      { description: "Technology Fee", amount: 100 },
    ]
  },
  {
    id: "INV-2025-001",
    semester: "Spring 2025",
    issueDate: "2025-01-10",
    dueDate: "2025-01-18",
    paidDate: "2025-01-18",
    amount: 4500,
    status: "paid",
    items: [
      { description: "Tuition Fee", amount: 4200 },
      { description: "Lab Fee - Computer Science", amount: 200 },
      { description: "Student Activity Fee", amount: 100 },
    ]
  },
];

export function EInvoice() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-gray-900">Electronic Invoices</h1>
        <p className="text-gray-600 mt-1">View and download your tuition invoices</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Invoices</p>
            <FileText className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-semibold text-gray-900">{invoices.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Unpaid Invoices</p>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-semibold text-red-600">
            {invoices.filter(inv => inv.status === "unpaid").length}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-gray-500">Total Paid (2025)</p>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <p className="text-3xl font-semibold text-green-600">$12,000</p>
        </div>
      </div>

      {/* Invoices List */}
      <div className="space-y-4">
        {invoices.map((invoice) => (
          <div
            key={invoice.id}
            className={`bg-white rounded-lg shadow-sm border p-6 ${
              invoice.status === "unpaid" ? "border-red-200" : "border-gray-200"
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-start gap-6">
              {/* Left: Invoice Details */}
              <div className="flex-1">
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    invoice.status === "unpaid" ? "bg-red-100" : "bg-green-100"
                  }`}>
                    <FileText className={`w-6 h-6 ${
                      invoice.status === "unpaid" ? "text-red-600" : "text-green-600"
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{invoice.id}</h3>
                      {invoice.status === "unpaid" ? (
                        <span className="px-3 py-1 bg-red-50 text-red-700 text-xs font-medium rounded-full">
                          Unpaid
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3">{invoice.semester}</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Issue Date</p>
                          <p className="text-sm font-medium text-gray-900">{invoice.issueDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Due Date</p>
                          <p className="text-sm font-medium text-gray-900">{invoice.dueDate}</p>
                        </div>
                      </div>
                    </div>

                    {invoice.paidDate && (
                      <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-900">
                          <span className="font-medium">Paid on:</span> {invoice.paidDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Invoice Items */}
                <div className="pl-16">
                  <p className="text-sm font-medium text-gray-700 mb-2">Invoice Items:</p>
                  <div className="space-y-1">
                    {invoice.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-gray-600">{item.description}</span>
                        <span className="font-medium text-gray-900">${item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t border-gray-200 pt-2 mt-2 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Amount</span>
                      <span className="font-bold text-gray-900 text-lg">
                        ${invoice.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex lg:flex-col gap-3">
                <button className="flex-1 lg:flex-initial px-4 py-2 bg-[#1E3A8A] text-white rounded-lg hover:bg-[#1E3A8A]/90 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                  <Download className="w-4 h-4" />
                  Download PDF
                </button>
                <button className="flex-1 lg:flex-initial px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm text-gray-700 flex items-center justify-center gap-2">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                {invoice.status === "unpaid" && (
                  <button className="flex-1 lg:flex-initial px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-sm flex items-center justify-center gap-2">
                    <DollarSign className="w-4 h-4" />
                    Pay Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Invoice Information</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Electronic invoices are generated at the beginning of each semester</li>
          <li>• Download invoices in PDF format for your records</li>
          <li>• Invoices must be paid by the due date to avoid late fees</li>
          <li>• Contact the finance office if you have questions about charges</li>
        </ul>
      </div>
    </div>
  );
}
