import {useMutation, useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../utils/fetch';
import {Place, ResultLocation, Route, Trip} from '../models/trip';

export function useGetCurrentTrip() {
  return useQuery({
    queryKey: ['currentTrip'],
    queryFn: async () => {
      const data = await axiosInstance.get<{data: Trip | null}>(
        '/trips/current',
      );

      return data.data.data;
    },
    refetchInterval: 5000,
  });
}

export function useGetCurrentDriverRoute(
  data: {tripId?: number},
  options: {
    enabled?: boolean;
  } = {
    enabled: true,
  },
) {
  return useQuery({
    queryKey: ['current-driver-route', data.tripId],
    queryFn: async () => {
      const result = await axiosInstance.get<{
        data: {
          route: {
            routes: Route[];
          };
          location: {
            lat: number;
            lng: number;
          };
        };
      }>(`/trips/${data.tripId}/current-driver-route`);

      return result.data.data;
    },
    refetchInterval: 3000,
    enabled: !!data.tripId && options.enabled,
  });
}

export function useGetTripSearchLocation(options: {
  search?: string;
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['trip-search-location', options.search],
    queryFn: async () => {
      const data = await axiosInstance.get<{
        data: {
          places: Place[];
          geocodes: ResultLocation[];
        };
      }>(`/trips/search-location?search=${options.search}`);

      return data.data.data;
    },
    enabled:
      options.search !== undefined &&
      options.search.length > 0 &&
      options.enabled,
  });
}

export function useCreateTrip(
  options: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  } = {},
) {
  return useMutation({
    mutationFn: async (data: {
      startCoords: [number, number];
      toCoords: [number, number];
      toAddress: string;
    }) => {
      await axiosInstance.post('/trips', data);
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

export function useCancelTrip(
  options: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  } = {},
) {
  return useMutation({
    mutationFn: async (data: {tripId: number}) => {
      await axiosInstance.post(`/trips/${data.tripId}/cancel`);
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

export function useRateTrip(
  options: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  } = {},
) {
  return useMutation({
    mutationFn: async (data: {
      tripId: number;
      rating: number;
      comment?: string;
    }) => {
      await axiosInstance.post(`/trips/${data.tripId}/rating`, {
        rating: data.rating,
        comment: data.comment,
      });
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}
