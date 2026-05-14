import { Link } from "react-router";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import type { StaffQuickAction } from "../types/dashboard";

interface StaffQuickActionsProps {
  actions: StaffQuickAction[];
}

export const StaffQuickActions = ({ actions }: Readonly<StaffQuickActionsProps>) => {
  return (
    <Card className="shadow-sm border-0 ring-1 ring-gray-200 lg:col-span-1">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold text-gray-700">Thao tác nhanh</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className="grid grid-cols-2 gap-2">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.path}
                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all text-center ${action.bg}`}
              >
                <Icon className={`w-5 h-5 ${action.color}`} />
                <span className={`text-[11px] font-medium leading-tight ${action.color}`}>{action.label}</span>
              </Link>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
