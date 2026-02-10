import { useQuery, keepPreviousData } from '@tanstack/react-query';
import * as propertyService from './property.service';
import type { PropertySearchParams } from './property.types';

export function useProperties(params: PropertySearchParams) {
  return useQuery({
    queryKey: ['properties', params],
    queryFn: () => propertyService.getProperties(params),
    placeholderData: keepPreviousData,
    staleTime: 2 * 60 * 1000,
  });
}

export function useProperty(id: number) {
  return useQuery({
    queryKey: ['property', id],
    queryFn: () => propertyService.getPropertyById(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}
