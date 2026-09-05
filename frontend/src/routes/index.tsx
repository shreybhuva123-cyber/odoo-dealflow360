import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { routes } from './route-config';

export const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
