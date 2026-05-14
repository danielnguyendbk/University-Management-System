import { CheckCircle, XCircle } from "lucide-react";

import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import type { AllocationItem } from "../types/allocation";

interface AllocationTableProps {
  items: AllocationItem[];
}

export const AllocationTable = ({ items }: Readonly<AllocationTableProps>) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-600">Mã lớp HP</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Tên môn</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-center">SV</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Yêu cầu phòng</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Lịch học</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600">Phòng phân</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-center">Sức chứa</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-center">Kết quả</TableHead>
              <TableHead className="text-xs font-semibold text-gray-600 text-center">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((row) => (
              <TableRow
                key={row.id}
                className={`hover:bg-gray-50 border-b border-gray-100 ${
                  row.status === "conflict" ? "bg-red-50/40" : ""
                }`}
              >
                <TableCell className="font-mono text-xs font-bold text-blue-700">{row.id}</TableCell>
                <TableCell className="text-xs font-medium text-gray-800">{row.name}</TableCell>
                <TableCell className="text-xs text-center">{row.students}</TableCell>
                <TableCell className="text-xs text-gray-500">{row.reqRoom}</TableCell>
                <TableCell className="text-xs text-gray-600 whitespace-nowrap">
                  {row.day} · {row.slot}
                </TableCell>
                <TableCell className="text-xs font-semibold text-gray-900">
                  {row.assigned || <span className="text-gray-300 italic font-normal">Chưa phân</span>}
                </TableCell>
                <TableCell className="text-xs text-center text-gray-600">
                  {row.capacity > 0 ? (
                    <span
                      className={row.capacity < row.students ? "text-red-600 font-semibold" : "text-green-600"}
                    >
                      {row.capacity}
                    </span>
                  ) : (
                    "—"
                  )}
                </TableCell>
                <TableCell className="text-center">
                  {row.status === "ok" && (
                    <Badge className="bg-green-100 text-green-700 hover:bg-green-100 text-[11px]">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Hợp lệ
                    </Badge>
                  )}
                  {row.status === "unassigned" && (
                    <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100 text-[11px]">
                      Chưa phân
                    </Badge>
                  )}
                  {row.status === "conflict" && (
                    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 text-[11px]">
                      <XCircle className="w-3 h-3 mr-1" />
                      Xung đột
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-center">
                  <button className="text-xs text-blue-600 hover:text-blue-800 font-medium px-2 py-1 rounded hover:bg-blue-50">
                    {row.assigned ? "Đổi phòng" : "Phân phòng"}
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
