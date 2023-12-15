import {useToastController} from '@tamagui/toast';
import React from 'react';

export function useToast() {
  const toast = useToastController();

  const show = React.useCallback(
    (
      message: string,
      options: {
        duration?: number;
      } = {},
    ) => {
      toast.show(message, {
        duration: options.duration,
      });
    },
    [toast],
  );

  const error = React.useCallback(
    (
      err: any,
      options: {
        duration?: number;
      } = {},
    ) => {
      const message = err?.response?.data?.message || err.message || err;
      toast.show(message, {
        duration: options.duration,
        burntOptions: {
          haptic: 'error',
        },
        customData: {
          type: 'error',
        },
      });
    },
    [toast],
  );

  return {
    show,
    error,
  };
}
