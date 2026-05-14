import { CheckCircle } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import { Button } from "@/components/common/Button";
import { Card, CardContent } from "@/components/common/Card";
import { CONFLICT_TYPE_CONFIG, SEVERITY_CONFIG } from "../constants/allocation";
import type { ConflictItem } from "../types/allocation";

interface ConflictListProps {
  conflicts: ConflictItem[];
}

export const ConflictList = ({ conflicts }: Readonly<ConflictListProps>) => {
  if (conflicts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 bg-white rounded-xl border border-gray-200 text-center">
        <CheckCircle className="w-12 h-12 text-green-500 mb-3" />
        <p className="font-semibold text-gray-700">Không phát hiện xung đột</p>
        <p className="text-sm text-gray-400 mt-1">Toàn bộ lịch phân phòng hợp lệ</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {conflicts.map((conflict) => {
        const severityInfo = SEVERITY_CONFIG[conflict.severity];
        const SeverityIcon = severityInfo.icon;
        const typeInfo = CONFLICT_TYPE_CONFIG[conflict.type];

        return (
          <Card
            key={conflict.id}
            className={`shadow-sm border ring-1 ${
              conflict.severity === "high" ? "ring-red-200" : "ring-orange-200"
            }`}
          >
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    conflict.severity === "high" ? "bg-red-100" : "bg-orange-100"
                  }`}
                >
                  <SeverityIcon
                    className={`w-5 h-5 ${
                      conflict.severity === "high" ? "text-red-600" : "text-orange-600"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <Badge className={`${severityInfo.className} text-xs`}>{severityInfo.label}</Badge>
                    <span
                      className={`text-[11px] font-semibold border px-2 py-0.5 rounded-full ${typeInfo.color}`}
                    >
                      {typeInfo.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {conflict.day} · {conflict.slot}
                    </span>
                    {conflict.room !== "—" && (
                      <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                        Phòng {conflict.room}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{conflict.desc}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                      <span className="font-semibold text-gray-800">LHP 1:</span> {conflict.section1}
                    </div>
                    {conflict.section2 !== "—" && (
                      <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-600">
                        <span className="font-semibold text-gray-800">LHP 2:</span> {conflict.section2}
                      </div>
                    )}
                  </div>
                </div>
                <Button size="sm" variant="outline" className="text-xs flex-shrink-0">
                  Xử lý
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};
