import {useMutation, useQuery} from '@tanstack/react-query';
import {axiosInstance} from '../utils/fetch';
import {Trip, TripDriverAction} from '../models/trip';
import {DirectionResponse} from '../models/map';
import {decodeRouteToPolyLines} from '../utils/map';
import {decodeRoute} from '../test';

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

export function useTripAction(
  options: {
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
  } = {},
) {
  return useMutation({
    mutationFn: async (data: {
      tripId: number;
      action: TripDriverAction;
      coords: number[];
    }) => {
      console.log(`/trips/${data.tripId}/driver-action`, {
        action: data.action,
        coords: data.coords,
      });
      await axiosInstance.post(`/trips/${data.tripId}/driver-action`, {
        action: data.action,
        coords: data.coords,
      });
    },
    onSuccess: options.onSuccess,
    onError: options.onError,
  });
}

export function useGetTripDirections(options: {
  tripId?: number;
  type?: 'on_the_way' | 'driving';
  startCoords?: number[];
  enabled?: boolean;
}) {
  return useQuery({
    queryKey: ['tripRoutes', options.tripId, options.type, options.startCoords],
    queryFn: async () => {
      const data = await axiosInstance.post<{data: DirectionResponse}>(
        `/trips/${options.tripId}/directions`,
        {
          type: options.type,
          startCoords: options.startCoords,
        },
      );

      return {
        detail: data.data.data,
        raw: decodeRoute(data.data.data?.routes[0]?.overview_polyline.points),
        route: decodeRouteToPolyLines(
          data.data.data?.routes[0]?.overview_polyline.points,
        ),
      };
    },
    enabled:
      !!options.tripId &&
      !!options.type &&
      !!options.startCoords &&
      options.enabled,
  });
}
