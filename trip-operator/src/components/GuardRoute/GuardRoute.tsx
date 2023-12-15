import { useAuthStore } from "@stores";
import { User } from "@models/user";
import React from "react";
import { Navigate } from "react-router-dom";

export interface GuardRouteProps {
  children: (auth: { user: User }) => React.ReactNode;
}

export function GuardRoute(props: GuardRouteProps) {
  const { children } = props;
  const authStore = useAuthStore();

  if (authStore.isValidating && !authStore.user) return <></>;

  return !authStore.user ? (
    <Navigate to="/login" />
  ) : (
    <>
      {children({
        user: authStore.user,
      })}
    </>
  );
}
