import type { RouteObject } from "react-router-dom";
import AuthPage from "./pages/auth-page";
import { RegisterPage } from "./pages/register-page";
import { InactivePage } from "./pages/inactive-page";

export const AuthRoute: RouteObject[] = [
  {
    path: '/login',
    Component: AuthPage
  },
  {
    path: '/inactive',
    Component: InactivePage
  },
  {
    path: '/register',
    Component: RegisterPage
  }
]