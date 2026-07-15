import { createBrowserRouter } from "react-router";
import { createElement } from "react";
import { LandingPage } from "./components/LandingPage";
import { AuthScreen } from "./components/AuthScreen";
import { HomeScreen } from "./components/HomeScreen";
import { PracticeSelector } from "./components/PracticeSelector";
import { PreExamScreen } from "./components/PreExamScreen";
import { ExamScreen } from "./components/ExamScreen";
import { ResultsScreen } from "./components/ResultsScreen";
import { AnswerReview } from "./components/AnswerReview";
import { Leaderboard } from "./components/Leaderboard";
import { Reports } from "./components/Reports";
import { Profile } from "./components/Profile";
import { AdminPanel } from "./components/AdminPanel";
import { RequireAuth } from "./components/RequireAuth";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/login", element: createElement(AuthScreen, { initialView: "login" }) },
  { path: "/signup", element: createElement(AuthScreen, { initialView: "signup" }) },
  { path: "/forgot-password", element: createElement(AuthScreen, { initialView: "forgot" }) },
  { path: "/welcome", element: createElement(AuthScreen, { initialView: "welcome" }) },
  {
    Component: RequireAuth,
    children: [
      { path: "/home", Component: HomeScreen },
      { path: "/practice", Component: PracticeSelector },
      { path: "/pre-exam", Component: PreExamScreen },
      { path: "/exam", Component: ExamScreen },
      { path: "/results", Component: ResultsScreen },
      { path: "/review", Component: AnswerReview },
      { path: "/leaderboard", Component: Leaderboard },
      { path: "/reports", Component: Reports },
      { path: "/profile", Component: Profile },
    ],
  },
  { path: "/admin", Component: AdminPanel },
  { path: "*", Component: LandingPage },
]);
