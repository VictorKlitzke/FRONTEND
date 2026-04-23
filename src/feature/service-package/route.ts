import type { RouteObject } from 'react-router-dom';
import { ServicePackagePage } from './pages/service-package-page';

export const ServicePackageRoute: RouteObject[] = [
  {
    path: '/service-packages',
    Component: ServicePackagePage,
  },
];
