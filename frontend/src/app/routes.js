import { createBrowserRouter } from "react-router-dom";
import { Root } from "./components/Root";
import { LoginPage } from "./components/LoginPage";
import { Dashboard } from "./components/Dashboard";
import { Announcements } from "./components/Announcements";
import { Curriculum } from "./components/Curriculum";
import { CourseRegistration } from "./components/CourseRegistration";
import { WeeklySchedule } from "./components/WeeklySchedule";
import { ExamSchedule } from "./components/ExamSchedule";
import { Grades } from "./components/Grades";
import { Tuition } from "./components/Tuition";
import { EInvoice } from "./components/EInvoice";
import { SubmitRequest } from "./components/SubmitRequest";
import { RequestApproval } from "./components/RequestApproval";
import { Feedback } from "./components/Feedback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LoginPage,
  },
  {
    path: "/portal",
    Component: Root,
    children: [
      { index: true, Component: Dashboard },
      { path: "announcements", Component: Announcements },
      { path: "curriculum", Component: Curriculum },
      { path: "course-registration", Component: CourseRegistration },
      { path: "schedule", Component: WeeklySchedule },
      { path: "exam-schedule", Component: ExamSchedule },
      { path: "grades", Component: Grades },
      { path: "tuition", Component: Tuition },
      { path: "e-invoice", Component: EInvoice },
      { path: "submit-request", Component: SubmitRequest },
      { path: "request-approval", Component: RequestApproval },
      { path: "feedback", Component: Feedback },
    ],
  },
]);
