import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { APP_ROUTES } from "@/constants/routes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/common/Card";
import { STATUS_CONFIG } from "../constants/dashboard";
import type { RecentSection } from "../types/dashboard";

interface StaffRecentSectionsTableProps {
  sections: RecentSection[];
}

export const StaffRecentSectionsTable = ({ sections }: Readonly<StaffRecentSectionsTableProps>) => {
  return (
    <Card className="shadow-sm border-0 ring-1 ring-gray-200 lg:col-span-2">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold text-gray-700">Lớp học phần gần đây</CardTitle>
        <Link to={APP_ROUTES.staffSections} className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-medium">
          Xem tất cả <ArrowRight className="w-3 h-3" />
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="text-xs">Mã lớp HP</TableHead>
                <TableHead className="text-xs">Tên môn học</TableHead>
                <TableHead className="text-xs text-center">SV</TableHead>
                <TableHead className="text-xs">Phòng</TableHead>
                <TableHead className="text-xs">Lịch</TableHead>
                <TableHead className="text-xs text-center">Trạng thái</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sections.map((section) => {
                const statusInfo = STATUS_CONFIG[section.status];
                const StatusIcon = statusInfo.icon;

                return (
                  <TableRow key={section.id} className="hover:bg-gray-50">
                    <TableCell className="font-mono text-xs font-semibold text-blue-700">{section.id}</TableCell>
                    <TableCell className="text-xs max-w-[160px] truncate">{section.name}</TableCell>
                    <TableCell className="text-xs text-center">{section.students}</TableCell>
                    <TableCell className="text-xs">
                      {section.room ? (
                        <span className="font-medium text-gray-800">{section.room}</span>
                      ) : (
                        <span className="text-gray-400 italic">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {section.day} · {section.slot}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className={`${statusInfo.className} text-[11px] gap-1`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusInfo.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
