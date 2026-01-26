import type { RouteObject } from "react-router-dom";
import { DashboardPage } from "./pages/dashboard";

export const DashboardRoute: RouteObject[] = [
  {
    path: "/dashboard",
    Component: DashboardPage
  }
]