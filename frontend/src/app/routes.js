import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Root";
import { LoginPage } from "./pages/auth/LoginPage";
import { Dashboard } from "./pages/student/Dashboard";
import { Announcements } from "./pages/student/Announcements";
import { Curriculum } from "./pages/student/Curriculum";
import { CourseRegistration } from "./pages/student/CourseRegistration";
import { WeeklySchedule } from "./pages/student/WeeklySchedule";
import { ExamSchedule } from "./pages/student/ExamSchedule";
import { Grades } from "./pages/student/Grades";
import { Tuition } from "./pages/student/Tuition";
import { EInvoice } from "./pages/student/EInvoice";
import { SubmitRequest } from "./pages/student/SubmitRequest";
import { RequestApproval } from "./components/RequestApproval";
import { Feedback } from "./pages/student/Feedback";
import { PortalHome } from "./components/PortalHome";
import { PortalRedirect } from "./components/PortalRedirect";
import { StudentPortalRoute, LecturerPortalRoute, AdminPortalRoute } from "./components/RolePortalRoute";
import { LecturerDashboard } from "./pages/lecturer/LecturerDashboard";
import { LecturerTeachingSchedule } from "./pages/lecturer/LecturerTeachingSchedule";
import { LecturerWeeklySchedule } from "./pages/lecturer/LecturerWeeklySchedule";
import { LecturerClassSections } from "./pages/lecturer/LecturerClassSections";
import { LecturerGradeEntry } from "./pages/lecturer/LecturerGradeEntry";
import { AdminDashboard } from "./pages/admin/AdminDashboard";
import { ManageStudentAccounts } from "./pages/admin/ManageStudentAccounts";
import { ManageLecturerAccounts } from "./pages/admin/ManageLecturerAccounts";
import { SectionAssignment } from "./pages/admin/SectionAssignment";
import { RegistrationSessions } from "./pages/admin/RegistrationSessions";
import { AdminTimetablePage } from "./pages/admin/AdminTimetablePage";
import { AdminRegistrationPage } from "./pages/admin/AdminRegistrationPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/portal",
    Component: PortalRedirect,
  },
  {
    path: "/portal/student",
    Component: StudentPortalRoute,
    children: [
      { index: true, Component: PortalHome },
      { path: "announcements", Component: Announcements },
      { path: "curriculum", Component: Curriculum },
      { path: "course-registration", Component: CourseRegistration },
      { path: "schedule", Component: WeeklySchedule },
      { path: "exam-schedule", Component: ExamSchedule },
      { path: "grades", Component: Grades },
      { path: "tuition", Component: Tuition },
      { path: "e-invoice", Component: EInvoice },
      { path: "submit-request", Component: SubmitRequest },
      { path: "feedback", Component: Feedback },
    ],
  },
  {
    path: "/portal/lecturer",
    Component: LecturerPortalRoute,
    children: [
      { index: true, Component: LecturerDashboard },
      { path: "announcements", Component: Announcements },
      { path: "teaching-schedule", Component: LecturerTeachingSchedule },
      { path: "schedule", Component: LecturerWeeklySchedule },
      { path: "sections", Component: LecturerClassSections },
      { path: "grade-entry", Component: LecturerGradeEntry },
      { path: "request-approval", Component: RequestApproval },
      { path: "feedback", Component: Feedback },
    ],
  },
  {
    path: "/portal/admin",
    Component: AdminPortalRoute,
    children: [
      { index: true, Component: AdminDashboard },
      { path: "announcements", Component: Announcements },
      { path: "student-accounts", Component: ManageStudentAccounts },
      { path: "lecturer-accounts", Component: ManageLecturerAccounts },
      { path: "section-assignment", Component: SectionAssignment },
      { path: "registration-sessions", Component: AdminRegistrationPage },
      { path: "timetable", Component: AdminTimetablePage },
    ],
  },
]);
