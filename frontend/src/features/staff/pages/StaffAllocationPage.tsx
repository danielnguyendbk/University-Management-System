import { AlertTriangle, Building2, CheckCircle, RefreshCw, Wand2 } from "lucide-react";
import type { ComponentType } from "react";

import { Button } from "@/components/common/Button";
import { AllocationTable } from "../components/AllocationTable";
import { ConflictList } from "../components/ConflictList";
import { useStaffAllocation, type StaffAllocationTab } from "../hooks/useStaffAllocation";

const STAFF_ALLOCATION_TABS: Array<{
  key: StaffAllocationTab;
  label: string;
  icon: ComponentType<{ className?: string }>;
}> = [
  { key: "allocation", label: "Danh sách phân phòng", icon: Building2 },
  { key: "conflicts", label: "Xung đột lịch", icon: AlertTriangle },
];

const StaffAllocationPage = () => {
  const {
    activeTab,
    setActiveTab,
    isRunning,
    runDone,
    allocations,
    conflicts,
    runAutoAssign,
  } = useStaffAllocation();

  return (
    <div className="p-5 md:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Phân phòng & Kiểm tra xung đột</h1>
          <p className="text-sm text-gray-500 mt-0.5">Học kỳ 1, Năm học 2024-2025</p>
        </div>
        <Button onClick={runAutoAssign} disabled={isRunning} className="bg-blue-600 hover:bg-blue-700 gap-2 text-sm">
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
          {isRunning ? "Đang phân công..." : "Phân công tự động"}
        </Button>
      </div>

      {runDone && (
        <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-xl text-sm text-green-800">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Phân công tự động hoàn tất!</p>
            <p className="text-xs text-green-700 mt-0.5">
              Đã phân 22 lớp học phần thành công. 3 lớp không thể phân tự động do ràng buộc đặc biệt,
              cần xử lý thủ công.
            </p>
          </div>
        </div>
      )}

      <div className="flex border-b border-gray-200">
        {STAFF_ALLOCATION_TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;

          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
                isActive ? "border-blue-600 text-blue-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.key === "conflicts" ? `${tab.label} (${conflicts.length})` : tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === "allocation" ? (
        <AllocationTable items={allocations} />
      ) : (
        <ConflictList conflicts={conflicts} />
      )}
    </div>
  );
};

export default StaffAllocationPage;
