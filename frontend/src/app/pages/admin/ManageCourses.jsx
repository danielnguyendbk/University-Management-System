import { useState } from "react";
import { Tab, Tabs, Box } from "@mui/material";
import { PageHeader } from "../../components/common/PageHeader";
import { CourseListTab } from "./courses/CourseListTab";
import { ProgramCourseTab } from "./courses/ProgramCourseTab";

export function ManageCourses() {
  const [tab, setTab] = useState(0);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader title="Quản lý môn học" subtitle="Danh mục môn học và chương trình đào tạo theo ngành" />
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600 } }}>
          <Tab label="Danh mục môn học" />
          <Tab label="Chương trình đào tạo" />
        </Tabs>
      </Box>
      {tab === 0 && <CourseListTab />}
      {tab === 1 && <ProgramCourseTab />}
    </div>
  );
}
