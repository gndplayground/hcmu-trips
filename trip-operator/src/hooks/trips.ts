import { config } from "@configs";
import { APIResponse } from "@models/api";
import { TripWithInfo } from "@models/trip";
import { useMutation, useQuery } from "@tanstack/react-query";
import { axiosInstance } from "@utils/fetch";
import queryString from "query-string";
import { useToast } from "./useToast";

export function useGetTrip(
  options: {
    id?: number;
  } = {}
) {
  const { id } = options;
  return useQuery({
    queryKey: ["trip", id],
    queryFn: async () => {
      const result = await axiosInstance.get<
        APIResponse<{
          trip: TripWithInfo;
          start: {
            lng: number;
            lat: number;
          };
          to: {
            lng: number;
            lat: number;
          };
        }>
      >(`${config.API_ENDPOINT}/trips/${id}`);
      return result.data;
    },
    enabled: !!id,
  });
}

export function useGetListTrip(
  options: {
    page?: number;
    limit?: number;
    search?: string;

    operatorId?: number;
  } = {}
) {
  const { limit = 10, page = 1, operatorId, search } = options;
  return useQuery({
    queryKey: ["campaigns", limit, page, operatorId, search],
    queryFn: async () => {
      const query = queryString.stringify({
        limit,
        page,
        operatorId,
        search,
      });
      const result = await axiosInstance.get<
        APIResponse<TripWithInfo[], { hasNextPage: boolean }>
      >(`${config.API_ENDPOINT}/trips?${query}`);
      return result.data;
    },
  });
}

export function useCreateTrip() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: {
      startCoords: [number, number];
      toCoords: [number, number];
      outsideCustomerFullname: string;
      outsideCustomerPhone: string;
      startAddress: string;
      toAddress: string;
    }) => {
      const result = await axiosInstance.post<APIResponse<TripWithInfo>>(
        `${config.API_ENDPOINT}/trips`,
        data
      );
      return result.data;
    },
    onSuccess: () => {
      toast({
        description: "Create trip successfully",
      });
    },
    onError: (e) => {
      toast({
        error: e,
      });
    },
  });
}

export function useCancelTrip() {
  const { toast } = useToast();
  return useMutation({
    mutationFn: async (data: { id: number }) => {
      const result = await axiosInstance.post(
        `${config.API_ENDPOINT}/trips/${data.id}/cancel`
      );
      return result.data;
    },
    onSuccess: () => {
      toast({
        description: "Cancel trip successfully",
      });
    },
    onError: (e) => {
      toast({
        error: e,
      });
    },
  });
}
