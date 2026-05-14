import { useEffect, useState } from "react";

import { staffDashboardService } from "../services/staffDashboardService";
import type { RecentSection, StaffQuickAction, StaffStatItem } from "../types/dashboard";

export const useStaffDashboard = () => {
  const [stats, setStats] = useState<StaffStatItem[]>([]);
  const [quickActions, setQuickActions] = useState<StaffQuickAction[]>([]);
  const [recentSections, setRecentSections] = useState<RecentSection[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [statsData, quickActionsData, recentSectionsData] = await Promise.all([
        staffDashboardService.getStats(),
        staffDashboardService.getQuickActions(),
        staffDashboardService.getRecentSections(),
      ]);

      setStats(statsData);
      setQuickActions(quickActionsData);
      setRecentSections(recentSectionsData);
    };

    void loadData();
  }, []);

  return {
    stats,
    quickActions,
    recentSections,
  };
};
