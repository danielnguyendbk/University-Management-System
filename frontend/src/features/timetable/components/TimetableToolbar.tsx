import { AlertCircle, Download, Search, Wand2 } from "lucide-react";

import { Button } from "@/components/common/Button";
import { Input } from "@/components/common/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface TimetableToolbarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  filterDay: string;
  onFilterDayChange: (value: string) => void;
  filterRoom: string;
  onFilterRoomChange: (value: string) => void;
  filterLecturer: string;
  onFilterLecturerChange: (value: string) => void;
}

export const TimetableToolbar = ({
  searchTerm,
  onSearchTermChange,
  filterDay,
  onFilterDayChange,
  filterRoom,
  onFilterRoomChange,
  filterLecturer,
  onFilterLecturerChange,
}: Readonly<TimetableToolbarProps>) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            placeholder="Search courses, lecturers..."
            value={searchTerm}
            onChange={(event) => onSearchTermChange(event.target.value)}
            className="pl-10"
          />
        </div>

        <Select value={filterDay} onValueChange={onFilterDayChange}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filter by Day" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Days</SelectItem>
            <SelectItem value="Monday">Monday</SelectItem>
            <SelectItem value="Tuesday">Tuesday</SelectItem>
            <SelectItem value="Wednesday">Wednesday</SelectItem>
            <SelectItem value="Thursday">Thursday</SelectItem>
            <SelectItem value="Friday">Friday</SelectItem>
            <SelectItem value="Saturday">Saturday</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterRoom} onValueChange={onFilterRoomChange}>
          <SelectTrigger className="w-full lg:w-[180px]">
            <SelectValue placeholder="Filter by Room" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Rooms</SelectItem>
            <SelectItem value="A-301">A-301</SelectItem>
            <SelectItem value="B-105">B-105</SelectItem>
            <SelectItem value="C-201">C-201</SelectItem>
            <SelectItem value="D-102">D-102</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterLecturer} onValueChange={onFilterLecturerChange}>
          <SelectTrigger className="w-full lg:w-[200px]">
            <SelectValue placeholder="Filter by Lecturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Lecturers</SelectItem>
            <SelectItem value="Dr. Sarah Johnson">Dr. Sarah Johnson</SelectItem>
            <SelectItem value="Prof. Michael Chen">Prof. Michael Chen</SelectItem>
            <SelectItem value="Dr. Emily Brown">Dr. Emily Brown</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
          <Wand2 className="w-4 h-4 mr-2" />
          Auto Assign Rooms
        </Button>
        <Button variant="outline">
          <AlertCircle className="w-4 h-4 mr-2" />
          Check Conflicts
        </Button>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export to Excel
        </Button>
      </div>
    </div>
  );
};
