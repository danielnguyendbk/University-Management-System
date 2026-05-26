import { createBrowserRouter } from "react-router-dom";
import { LoginPage } from "./pages/auth/LoginPage";
import { ChangePasswordPage } from "./pages/auth/ChangePasswordPage";
import { ForgotPassword } from "./pages/auth/ForgotPassword";
import { ResetPassword } from "./pages/auth/ResetPassword";
import { ChangePassword } from "./pages/shared/ChangePassword";
import { Dashboard } from "./pages/student/Dashboard";
import { Announcements } from "./pages/student/Announcements";
import { Curriculum } from "./pages/student/Curriculum";
import { CourseRegistration } from "./pages/student/CourseRegistration";
import { WeeklySchedule } from "./pages/student/WeeklySchedule";
import { ExamSchedule } from "./pages/student/ExamSchedule";
import { StudentExams } from "./pages/student/StudentExams";
import { Grades } from "./pages/student/Grades";
import { Tuition } from "./pages/student/Tuition";
import { EInvoice } from "./pages/student/EInvoice";
import { SubmitRequest } from "./pages/student/SubmitRequest";
import { RequestApproval } from "./components/RequestApproval";
import { Feedback } from "./pages/student/Feedback";
import { PortalHome } from "./components/PortalHome";
import { PortalRedirect } from "./components/PortalRedirect";
import { StudentPortalRoute, LecturerPortalRoute, AdminPortalRoute } from "./components/RolePortalRoute";
import { PortalRoute } from "./components/PortalRoute";
import { LecturerDashboard } from "./pages/lecturer/LecturerDashboard";
import { LecturerTeachingSchedule } from "./pages/lecturer/LecturerTeachingSchedule";
import { LecturerWeeklySchedule } from "./pages/lecturer/LecturerWeeklySchedule";
import { LecturerClassSections } from "./pages/lecturer/LecturerClassSections";
import { LecturerGradeEntry } from "./pages/lecturer/LecturerGradeEntry";
import { LecturerExams } from "./pages/lecturer/LecturerExams";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageStudentAccounts } from "./pages/admin/ManageStudentAccounts";
import { ManageLecturerAccounts } from "./pages/admin/ManageLecturerAccounts";
import { StudentDetailPage } from "./pages/admin/StudentDetailPage";
import { LecturerDetailPage } from "./pages/admin/LecturerDetailPage";
import { SectionAssignment } from "./pages/admin/SectionAssignment";
import { RegistrationSessions } from "./pages/admin/RegistrationSessions";
import { Navigate, useLocation } from "react-router-dom";
import { ManageCourses } from "./pages/admin/ManageCourses";
import { NotificationsPage } from "./pages/notification/NotificationsPage";
import { createElement } from "react";
import { AdminTimetablePage } from "./pages/admin/AdminTimetablePage";
import { AdminRegistrationPage } from "./pages/admin/AdminRegistrationPage";
import { AdminExams } from "./pages/admin/AdminExams";
import { AdminTuition } from "./pages/admin/AdminTuition";


function AdminLegacyRedirect() {
  const location = useLocation();
  const suffix = location.pathname.replace(/^\/admin/, "");
  return createElement(Navigate, {
    to: `/portal/admin${suffix}${location.search}${location.hash}`,
    replace: true,
  });
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  { path: "/forgot-password", Component: ForgotPassword },
  { path: "/reset-password", Component: ResetPassword },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/change-password",
    Component: ChangePasswordPage,
  },
  {
    path: "/portal",
    Component: PortalRedirect,
  },
  {
    path: "/notifications",
    Component: PortalRoute,
    children: [{ index: true, Component: NotificationsPage }],
  },
  {
    path: "/portal/student",
    Component: StudentPortalRoute,
    children: [
      { index: true, Component: PortalHome },
      { path: "notifications", Component: NotificationsPage },
      { path: "announcements", Component: Announcements },
      { path: "curriculum", Component: Curriculum },
      { path: "course-registration", Component: CourseRegistration },
      { path: "schedule", Component: WeeklySchedule },
      { path: "exam-schedule", Component: ExamSchedule },
      { path: "exams", Component: StudentExams },
      { path: "grades", Component: Grades },
      { path: "tuition", Component: Tuition },
      { path: "e-invoice", Component: EInvoice },
      { path: "submit-request", Component: SubmitRequest },
      { path: "feedback", Component: Feedback },
      { path: "change-password", Component: ChangePassword },
    ],
  },
  {
    path: "/portal/lecturer",
    Component: LecturerPortalRoute,
    children: [
      { index: true, Component: LecturerDashboard },
      { path: "notifications", Component: NotificationsPage },
      { path: "announcements", Component: Announcements },
      { path: "teaching-schedule", Component: LecturerTeachingSchedule },
      { path: "schedule", Component: LecturerWeeklySchedule },
      { path: "sections", Component: LecturerClassSections },
      { path: "grade-entry", Component: LecturerGradeEntry },
      { path: "exams", Component: LecturerExams },         // Map /portal/lecturer/exams
      { path: "request-approval", Component: RequestApproval },
      { path: "feedback", Component: Feedback },
      { path: "change-password", Component: ChangePassword },
    ],
  },
  {
    path: "/portal/admin",
    Component: AdminPortalRoute,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "notifications", Component: NotificationsPage },
      { path: "announcements", Component: Announcements },
      { path: "students", Component: ManageStudentAccounts },
      { path: "students/:id", Component: StudentDetailPage },
      { path: "student-accounts", Component: ManageStudentAccounts },
      { path: "lecturers", Component: ManageLecturerAccounts },
      { path: "lecturers/:id", Component: LecturerDetailPage },
      { path: "lecturer-accounts", Component: ManageLecturerAccounts },
      { path: "section-assignment", Component: SectionAssignment },
      { path: "registration-sessions", Component: AdminRegistrationPage },
      { path: "registration-sessions/basic", Component: RegistrationSessions },
      { path: "timetable", Component: AdminTimetablePage },
      { path: "exams", Component: AdminExams },
      { path: "tuition", Component: AdminTuition },
      { path: "courses", Component: ManageCourses },
      { path: "registration-sessions", Component: RegistrationSessions },
      { path: "change-password", Component: ChangePassword },
    ],
  },
  {
    path: "/admin/*",
    Component: AdminLegacyRedirect,
  },
]);
