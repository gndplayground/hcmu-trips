import { AxiosError } from "axios";
import React from "react";

import { ToastPosition, useToast as useToastCore } from "@chakra-ui/toast";

export interface ToastOptions {
  position?: ToastPosition;

  duration?: number;

  title?: React.ReactNode;

  description?: React.ReactNode;

  status?: "info" | "warning" | "success" | "error" | "loading";

  error?: any;
}

export function useToast() {
  const toastCore = useToastCore({
    position: "top-right",
  });

  const toast = React.useCallback(
    (options: ToastOptions = {}) => {
      const { description, title, duration, position, error, status } = options;

      let descriptionFinal = error
        ? error?.message || error?.toString()
        : description;

      if (error?.isAxiosError) {
        const axiosErr = error as AxiosError;
        descriptionFinal =
          (axiosErr.response?.data as any)?.message || error.toString();
      }

      toastCore({
        description: descriptionFinal,
        title,
        duration,
        position,
        status: error ? "error" : status || "success",
      });
    },
    [toastCore]
  );

  return { toast };
}
