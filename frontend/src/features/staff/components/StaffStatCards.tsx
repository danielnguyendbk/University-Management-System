import { Card, CardContent } from "@/components/common/Card";

import type { StaffStatItem } from "../types/dashboard";

interface StaffStatCardsProps {
  stats: StaffStatItem[];
}

export const StaffStatCards = ({ stats }: Readonly<StaffStatCardsProps>) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((item) => {
        const Icon = item.icon;

        return (
          <Card key={item.title} className="shadow-sm border-0 ring-1 ring-gray-200">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{item.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{item.value}</p>
                  <p className={`text-[11px] mt-1 font-medium ${item.text}`}>{item.sub}</p>
                </div>
                <div className={`${item.color} w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
