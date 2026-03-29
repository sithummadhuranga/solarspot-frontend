import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'
import {
  getStations,
  getNearbyStations,
  getPendingStations,
  getStation,
  createStation,
  updateStation,
  approveStation,
  rejectStation,
  deleteStation,
} from '@/api/stations.api'
import { extractApiErrorMessage } from '@/lib/apiError'
import type { StationQueryParams, NearbyQueryParams, CreateStationDto, UpdateStationDto, RejectStationDto } from '@/types/station.types'

// ─── Query key factory (convention from project spec) ─────────────────────────
export const stationKeys = {
  all:     ['stations'] as const,
  lists:   () => [...stationKeys.all, 'list'] as const,
  list:    (filters: StationQueryParams) => [...stationKeys.lists(), filters] as const,
  nearby:  (params: NearbyQueryParams) => [...stationKeys.all, 'nearby', params] as const,
  pending: () => [...stationKeys.all, 'pending'] as const,
  details: () => [...stationKeys.all, 'detail'] as const,
  detail:  (id: string) => [...stationKeys.details(), id] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useStationsList(params: StationQueryParams = {}) {
  return useQuery({
    queryKey:    stationKeys.list(params),
    queryFn:     () => getStations(params),
    placeholderData: keepPreviousData,
    staleTime:   30_000,
    refetchOnWindowFocus: false,
    retry: (failureCount, error) => {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return false
      }
      return failureCount < 1
    },
  })
}

export function useNearbyStations(params: NearbyQueryParams | null) {
  return useQuery({
    queryKey:  params ? stationKeys.nearby(params) : stationKeys.nearby({ lat: 0, lng: 0 }),
    queryFn:   () => getNearbyStations(params!),
    enabled:   params !== null,
    staleTime: 60_000,
  })
}

export function usePendingStations(page = 1) {
  return useQuery({
    queryKey: [...stationKeys.pending(), { page }],
    queryFn:  () => getPendingStations(),
    staleTime: 0,
  })
}

export function useStation(id: string | undefined) {
  return useQuery({
    queryKey: stationKeys.detail(id ?? ''),
    queryFn:  () => getStation(id!),
    enabled:  Boolean(id),
    staleTime: 60_000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: CreateStationDto) => createStation(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station submitted for review!')
    },
    onError: (err: unknown) => {
      toast.error(extractApiErrorMessage(err, 'Failed to submit station'))
    },
  })
}

export function useUpdateStation(id: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (dto: UpdateStationDto) => updateStation(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station updated successfully')
    },
    onError: (err: unknown) => {
      toast.error(extractApiErrorMessage(err, 'Failed to update station'))
    },
  })
}

export function useApproveStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => approveStation(id),
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.pending() })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station approved')
    },
    onError: (err: unknown) => {
      toast.error(extractApiErrorMessage(err, 'Failed to approve station'))
    },
  })
}

export function useRejectStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: RejectStationDto }) =>
      rejectStation(id, dto),
    onSuccess: (_data, { id }) => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.pending() })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station rejected')
    },
    onError: (err: unknown) => {
      toast.error(extractApiErrorMessage(err, 'Failed to reject station'))
    },
  })
}

export function useDeleteStation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteStation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: stationKeys.pending() })
      toast.success('Station deleted')
    },
    onError: (err: unknown) => {
      toast.error(extractApiErrorMessage(err, 'Failed to delete station'))
    },
  })
}
