import type { RouteObject } from "react-router-dom";
import { AppointmentPage } from "./pages/appointment-page";
import { PublicAppointmentRequestPage } from "./pages/public-appointment-request-page";

export const AppointmentRoute: RouteObject[] = [
  {
    path: '/appointments',
    Component: AppointmentPage
  }
];

export const AppointmentPublicRoute: RouteObject[] = [
  {
    path: '/solicitar-agendamento',
    Component: PublicAppointmentRequestPage,
  },
];
