import { createBrowserRouter } from "react-router";

import { AppLayout } from "@/app/layouts/AppLayout";
import { APP_ROUTES } from "@/constants/routes";
import { LoginPage } from "@/features/auth/pages/LoginPage";
import AdminAutoAssignmentPage from "@/features/admin/pages/AutoAssignmentPage";
import AdminClassroomsPage from "@/features/admin/pages/ClassroomsPage";
import AdminCoursesPage from "@/features/admin/pages/CoursesPage";
import AdminDashboardPage from "@/features/admin/pages/DashboardPage";
import AdminLecturersPage from "@/features/admin/pages/LecturersPage";
import AdminReportsPage from "@/features/admin/pages/ReportsPage";
import AdminSettingsPage from "@/features/admin/pages/SettingsPage";
import AdminUserManagementPage from "@/features/admin/pages/UserManagementPage";
import AdminWeeklySchedulePage from "@/features/admin/pages/WeeklySchedulePage";
import EmployeePage from "@/features/employee/pages/EmployeePage";
import LecturerPage from "@/features/lecturer/pages/LecturerPage";
import StaffAllocationPage from "@/features/staff/pages/StaffAllocationPage";
import StaffBookingsPage from "@/features/staff/pages/StaffBookingsPage";
import StaffDashboardPage from "@/features/staff/pages/StaffDashboardPage";
import StaffLookupPage from "@/features/staff/pages/StaffLookupPage";
import StaffSchedulePage from "@/features/staff/pages/StaffSchedulePage";
import StaffSectionsPage from "@/features/staff/pages/StaffSectionsPage";
import StudentPage from "@/features/student/pages/StudentPage";
import TimetablePage from "@/features/timetable/pages/TimetablePage";

export const appRouter = createBrowserRouter([
  {
    path: APP_ROUTES.login,
    Component: LoginPage,
  },
  {
    path: APP_ROUTES.home,
    Component: AppLayout,
    children: [
      { index: true, Component: AdminDashboardPage },
      { path: APP_ROUTES.classrooms.slice(1), Component: AdminClassroomsPage },
      { path: APP_ROUTES.courses.slice(1), Component: AdminCoursesPage },
      { path: APP_ROUTES.lecturers.slice(1), Component: AdminLecturersPage },
      { path: APP_ROUTES.timetable.slice(1), Component: TimetablePage },
      { path: APP_ROUTES.autoAssignment.slice(1), Component: AdminAutoAssignmentPage },
      { path: APP_ROUTES.weeklySchedule.slice(1), Component: AdminWeeklySchedulePage },
      { path: APP_ROUTES.reports.slice(1), Component: AdminReportsPage },
      { path: APP_ROUTES.userManagement.slice(1), Component: AdminUserManagementPage },
      { path: APP_ROUTES.settings.slice(1), Component: AdminSettingsPage },

      { path: APP_ROUTES.staffDashboard.slice(1), Component: StaffDashboardPage },
      { path: APP_ROUTES.staffSections.slice(1), Component: StaffSectionsPage },
      { path: APP_ROUTES.staffSchedule.slice(1), Component: StaffSchedulePage },
      { path: APP_ROUTES.staffAllocation.slice(1), Component: StaffAllocationPage },
      { path: APP_ROUTES.staffLookup.slice(1), Component: StaffLookupPage },
      { path: APP_ROUTES.staffBookings.slice(1), Component: StaffBookingsPage },
      { path: APP_ROUTES.staffBookingList.slice(1), Component: StaffBookingsPage },

      { path: APP_ROUTES.lecturerDashboard.slice(1), Component: LecturerPage },
      { path: APP_ROUTES.lecturerRequests.slice(1), Component: LecturerPage },
      { path: APP_ROUTES.employeeDashboard.slice(1), Component: EmployeePage },
      { path: APP_ROUTES.studentDashboard.slice(1), Component: StudentPage },
    ],
  },
]);
