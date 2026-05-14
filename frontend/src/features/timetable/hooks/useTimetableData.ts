import { useEffect, useState } from "react";

import { timetableService } from "../services/timetableService";
import type { TimetableItem } from "../types";

export const useTimetableData = () => {
  const [items, setItems] = useState<TimetableItem[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const data = await timetableService.getTimetableItems();
      setItems(data);
    };

    void loadData();
  }, []);

  return { items };
};
