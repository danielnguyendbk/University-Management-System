import { useEffect, useState } from "react";

import { staffAllocationService } from "../services/staffAllocationService";
import type { AllocationItem, ConflictItem } from "../types/allocation";

export type StaffAllocationTab = "allocation" | "conflicts";

export const useStaffAllocation = () => {
  const [activeTab, setActiveTab] = useState<StaffAllocationTab>("allocation");
  const [isRunning, setIsRunning] = useState(false);
  const [runDone, setRunDone] = useState(false);
  const [allocations, setAllocations] = useState<AllocationItem[]>([]);
  const [conflicts, setConflicts] = useState<ConflictItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [allocationData, conflictData] = await Promise.all([
        staffAllocationService.getAllocationList(),
        staffAllocationService.getConflicts(),
      ]);

      setAllocations(allocationData);
      setConflicts(conflictData);
    };

    void loadData();
  }, []);

  const runAutoAssign = () => {
    setIsRunning(true);
    setRunDone(false);

    window.setTimeout(() => {
      setIsRunning(false);
      setRunDone(true);
    }, 2000);
  };

  return {
    activeTab,
    setActiveTab,
    isRunning,
    runDone,
    allocations,
    conflicts,
    runAutoAssign,
  };
};
