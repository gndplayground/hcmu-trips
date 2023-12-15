import { GuardRoute, SectionLoading } from "@components";
import { Trips } from "@pages/Trips";

import React, { Suspense } from "react";
import { createHashRouter } from "react-router-dom";

const LoginLazy = React.lazy(() =>
  import("../pages/Login").then((module) => ({
    default: module.Login,
  }))
);

const HomeLazy = React.lazy(() =>
  import("../pages/Home").then((module) => ({
    default: module.Home,
  }))
);

const TripAddLazy = React.lazy(() =>
  import("../pages/Trips/TripAdd").then((module) => ({
    default: module.TripAdd,
  }))
);

const TripDetailLazy = React.lazy(() =>
  import("../pages/Trips/TripDetail").then((module) => ({
    default: module.TripDetail,
  }))
);

function SupportSuspense(props: { children: React.ReactNode }) {
  return <Suspense fallback={<SectionLoading />}>{props.children}</Suspense>;
}

export const router = createHashRouter([
  {
    path: "/login",
    element: <LoginLazy />,
  },
  {
    path: "/",
    element: <HomeLazy />,
    children: [
      {
        path: "/",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <Trips />}</GuardRoute>
          </SupportSuspense>
        ),
      },
      {
        path: "/trips/add",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <TripAddLazy />}</GuardRoute>
          </SupportSuspense>
        ),
      },
      {
        path: "/trips/:id",
        element: (
          <SupportSuspense>
            <GuardRoute>{() => <TripDetailLazy />}</GuardRoute>
          </SupportSuspense>
        ),
      },
    ],
  },
]);
