import { useState } from "react";
import { PageHeader } from "../../components/common/PageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { AdminScheduleTemplatesTab } from "./AdminScheduleTemplatesTab";
import { AdminGenerateTimetableTab } from "./AdminGenerateTimetableTab";
import { AdminFullTimetableTab } from "./AdminFullTimetableTab";
import { AdminCalendarBlocksTab } from "./AdminCalendarBlocksTab";
import { AdminScheduleImportTab } from "./AdminScheduleImportTab";

export function AdminTimetablePage() {
  const [refreshSignal, setRefreshSignal] = useState(0);

  const handleImportSuccess = () => {
    setRefreshSignal((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Thời khóa biểu"
        subtitle="Tạo, sinh và theo dõi lịch học toàn trường"
      />

      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="bg-white border border-gray-200 shadow-sm">
          <TabsTrigger value="import">Nhập dữ liệu</TabsTrigger>
          <TabsTrigger value="templates">Lịch mẫu</TabsTrigger>
          <TabsTrigger value="generate">Sinh lịch</TabsTrigger>
          <TabsTrigger value="full">Xem toàn trường</TabsTrigger>
          <TabsTrigger value="calendar">Ngày nghỉ</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <AdminScheduleImportTab onImportSuccess={handleImportSuccess} />
        </TabsContent>
        <TabsContent value="templates">
          <AdminScheduleTemplatesTab refreshSignal={refreshSignal} />
        </TabsContent>
        <TabsContent value="generate">
          <AdminGenerateTimetableTab />
        </TabsContent>
        <TabsContent value="full">
          <AdminFullTimetableTab />
        </TabsContent>
        <TabsContent value="calendar">
          <AdminCalendarBlocksTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
