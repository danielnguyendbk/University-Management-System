import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import type { TimetableItem } from "../types";

interface TimetableTableProps {
  items: TimetableItem[];
}

const statusBadgeMap: Record<TimetableItem["status"], { className: string; label: string }> = {
  valid: { className: "bg-green-100 text-green-700 hover:bg-green-100", label: "Valid" },
  conflict: { className: "bg-red-100 text-red-700 hover:bg-red-100", label: "Conflict" },
  pending: { className: "bg-yellow-100 text-yellow-700 hover:bg-yellow-100", label: "Pending" },
};

export const TimetableTable = ({ items }: Readonly<TimetableTableProps>) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Course Code</TableHead>
              <TableHead>Course Name</TableHead>
              <TableHead>Lecturer</TableHead>
              <TableHead className="text-center">Students</TableHead>
              <TableHead>Day</TableHead>
              <TableHead>Time Slot</TableHead>
              <TableHead>Assigned Room</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const statusBadge = statusBadgeMap[item.status];

              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.courseCode}</TableCell>
                  <TableCell>{item.courseName}</TableCell>
                  <TableCell>{item.lecturer}</TableCell>
                  <TableCell className="text-center">{item.studentCount}</TableCell>
                  <TableCell>{item.day}</TableCell>
                  <TableCell>{item.timeSlot}</TableCell>
                  <TableCell>
                    {item.assignedRoom || <span className="text-gray-400 italic">Not assigned</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className={statusBadge.className}>{statusBadge.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
