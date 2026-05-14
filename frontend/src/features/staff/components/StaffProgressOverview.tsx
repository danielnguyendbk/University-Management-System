import { TrendingUp } from "lucide-react";

import { Card, CardContent } from "@/components/common/Card";

export const StaffProgressOverview = () => {
  return (
    <Card className="shadow-sm border-0 ring-1 ring-gray-200">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-semibold text-gray-800">Tiến độ phân phòng HK1</span>
          </div>
          <span className="text-sm font-bold text-blue-700">161 / 186 lớp (86.6%)</span>
        </div>
        <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
            style={{ width: "86.6%" }}
          />
        </div>
        <div className="flex gap-4 mt-2.5 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />Đã phân: 161
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-400 inline-block" />Chờ phân: 25
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />Xung đột: 3
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
