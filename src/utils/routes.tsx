import { Outlet, RouteObject, createBrowserRouter } from "react-router-dom";
import { Layout } from "../components/Layout";
import { OkSwapWidget } from "../components/OkSwapWidget";
import { OkSwapWidgetWithPrivyProvider } from "../components/OkSwapWidgetWithPrivyProvider";

const routeConstants = [
  {
    path: "/swap1",
    element: (
      <OkSwapWidget tokenAddress="0x645C7Aa841087E2e7f741C749aB27422fF5BbA8E" />
    ),
  },
  {
    path: "/swap2",
    element: (
      <OkSwapWidgetWithPrivyProvider tokenAddress="0x645C7Aa841087E2e7f741C749aB27422fF5BbA8E" />
    ),
  },
];

const routes: RouteObject[] = [
  {
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    children: [
      ...Object.values(routeConstants).map((route) => {
        return {
          path: route.path,
          element: route.element,
        };
      }),
    ],
  },
];

export default createBrowserRouter(routes);
