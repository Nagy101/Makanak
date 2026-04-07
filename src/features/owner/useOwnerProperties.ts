import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import * as ownerService from "./owner.service";
import type {
  MyPropertiesParams,
  CreatePropertyPayload,
  EditPropertyPayload,
} from "./owner.types";
import { toast } from "sonner";
import { showApiErrorToast } from "@/lib/apiError";

const OWNER_KEY = ["owner", "properties"] as const;

export function useMyProperties(params: MyPropertiesParams) {
  return useQuery({
    queryKey: [...OWNER_KEY, params],
    queryFn: () => ownerService.getMyProperties(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePropertyPayload) =>
      ownerService.createProperty(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEY });
      toast.success("Property created successfully!");
    },
    onError: (error) => showApiErrorToast(error),
  });
}

export function useUpdateProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: number;
      payload: EditPropertyPayload;
    }) => ownerService.updateProperty(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: OWNER_KEY });
      // Invalidate the individual property detail cache so navigating back shows fresh data
      qc.invalidateQueries({ queryKey: ["property", id] });
      toast.success("Property updated successfully!");
    },
    onError: (error) => showApiErrorToast(error),
  });
}

export function useDeleteProperty() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ownerService.deleteProperty(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: OWNER_KEY });
      toast.success("Property deleted.");
    },
    onError: (error) => showApiErrorToast(error),
  });
}
