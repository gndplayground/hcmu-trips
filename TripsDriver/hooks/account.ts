import {useMutation, useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../utils/fetch';
import {Driver, DriverStatus} from '../models/user';

export function useGetMe(options: {enabled?: boolean} = {}) {
  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const data = await axiosInstance.get<{data: Driver | null}>(
        '/trips/current',
      );
      return data.data.data;
    },
    refetchInterval: 5000,
    enabled: options.enabled,
  });
}

export function useUpdateStatus(options: {
  cb?: (status: DriverStatus) => void;
}) {
  return useMutation({
    mutationFn: async (status: DriverStatus) => {
      await axiosInstance.put('/drivers/me/status', {status});
      options.cb && options.cb(status);
    },
  });
}

export function useUpdateLocation() {
  return useMutation({
    mutationFn: async (coords: number[]) => {
      await axiosInstance.put('/drivers/location', {coords});
    },
  });
}
