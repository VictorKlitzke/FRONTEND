import type { RouteObject } from "react-router-dom";
import AuthPage from "./pages/auth-page";
import { RegisterPage } from "./pages/register-page";

export const AuthRoute: RouteObject[] = [
  {
    path: '/login',
    Component: AuthPage
  },
  {
    path: '/register',
    Component: RegisterPage
  }
]