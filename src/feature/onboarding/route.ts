import type { RouteObject } from "react-router-dom";
import { FirstAccessIntroPage } from "./pages/first-access-intro-page";

export const OnboardingRoute: RouteObject[] = [
  {
    path: "/primeiro-acesso",
    Component: FirstAccessIntroPage,
  },
];
