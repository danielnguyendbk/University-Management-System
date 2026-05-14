import { RefreshCw } from "lucide-react";

import { StaffProgressOverview } from "../components/StaffProgressOverview";
import { StaffQuickActions } from "../components/StaffQuickActions";
import { StaffRecentSectionsTable } from "../components/StaffRecentSectionsTable";
import { StaffStatCards } from "../components/StaffStatCards";
import { useStaffDashboard } from "../hooks/useStaffDashboard";

const StaffDashboardPage = () => {
  const { stats, quickActions, recentSections } = useStaffDashboard();

  return (
    <div className="p-5 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Tổng quan — Phòng Đào tạo</h1>
          <p className="text-sm text-gray-500 mt-0.5">Học kỳ 1, Năm học 2024-2025 · Cập nhật lúc 08:30, 11/04/2025</p>
        </div>
        <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 bg-white border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Làm mới
        </button>
      </div>

      <StaffStatCards stats={stats} />
      <StaffProgressOverview />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <StaffQuickActions actions={quickActions} />
        <StaffRecentSectionsTable sections={recentSections} />
      </div>
    </div>
  );
};

export default StaffDashboardPage;
