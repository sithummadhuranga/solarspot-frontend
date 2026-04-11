import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getStations,
  searchStations,
  getNearbyStations,
  getPendingStations,
  getStation,
  getStationStats,
  createStation,
  updateStation,
  approveStation,
  rejectStation,
  deleteStation,
  featureStation,
} from '@/api/stations.api'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type { Station, NearbyStation } from '@/types/station.types'
import type { StationQueryParams, NearbyQueryParams, CreateStationDto, UpdateStationDto, RejectStationDto } from '@/types/station.types'

// ─── Query key factory (convention from project spec) ─────────────────────────
export const stationKeys = {
  all:     ['stations'] as const,
  lists:   () => [...stationKeys.all, 'list'] as const,
  list:    (filters: StationQueryParams) => [...stationKeys.lists(), filters] as const,
  searches: () => [...stationKeys.all, 'search'] as const,
  search:  (q: string, page: number, limit: number) => [...stationKeys.searches(), { q, page, limit }] as const,
  nearby:  (params: NearbyQueryParams) => [...stationKeys.all, 'nearby', params] as const,
  pending: () => [...stationKeys.all, 'pending'] as const,
  details: () => [...stationKeys.all, 'detail'] as const,
  detail:  (id: string) => [...stationKeys.details(), id] as const,
  stats:   (id: string) => [...stationKeys.all, 'stats', id] as const,
}

// ─── Queries ──────────────────────────────────────────────────────────────────

export function useStationsList(params: StationQueryParams = {}) {
  return useQuery<PaginatedResponse<Station>>({
    queryKey:    stationKeys.list(params),
    queryFn:     () => getStations(params),
    placeholderData: keepPreviousData,
    staleTime:   30_000,
  })
}

export function useNearbyStations(params: NearbyQueryParams | null) {
  return useQuery<ApiResponse<NearbyStation[]>>({
    queryKey:  params ? stationKeys.nearby(params) : stationKeys.nearby({ lat: 0, lng: 0 }),
    queryFn:   () => getNearbyStations(params!),
    enabled:   params !== null,
    staleTime: 60_000,
  })
}

export function useStationSearch(q: string | undefined, page = 1, limit = 10) {
  const query = q?.trim() ?? ''
  return useQuery<PaginatedResponse<Station>>({
    queryKey: stationKeys.search(query, page, limit),
    queryFn:  () => searchStations({ q: query, page, limit }),
    enabled:  query.length > 0,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

export function usePendingStations(page = 1) {
  return useQuery<PaginatedResponse<Station>>({
    queryKey: [...stationKeys.pending(), { page }],
    queryFn:  () => getPendingStations(page),
    staleTime: 0,
  })
}

export function useStation(id: string | undefined) {
  return useQuery<ApiResponse<Station>>({
    queryKey: stationKeys.detail(id ?? ''),
    queryFn:  () => getStation(id!),
    enabled:  Boolean(id),
    staleTime: 60_000,
  })
}

export function useStationStats(id: string | undefined) {
  return useQuery<ApiResponse<unknown>>({
    queryKey: stationKeys.stats(id ?? ''),
    queryFn:  () => getStationStats(id!),
    enabled:  Boolean(id),
    staleTime: 60_000,
  })
}

// ─── Mutations ────────────────────────────────────────────────────────────────

export function useCreateStation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Station>, Error, CreateStationDto>({
    mutationFn: (dto: CreateStationDto) => createStation(dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station submitted for review!')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to submit station')
    },
  })
}

export function useUpdateStation(id: string) {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Station>, Error, UpdateStationDto>({
    mutationFn: (dto: UpdateStationDto) => updateStation(id, dto),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station updated successfully')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to update station')
    },
  })
}

export function useApproveStation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Station>, Error, string>({
    mutationFn: (id: string) => approveStation(id),
    onSuccess: (_data, id: string) => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.pending() })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station approved')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to approve station')
    },
  })
}

export function useRejectStation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Station>, Error, { id: string; dto: RejectStationDto }>({
    mutationFn: ({ id, dto }: { id: string; dto: RejectStationDto }) =>
      rejectStation(id, dto),
    onSuccess: (_data, { id }: { id: string; dto: RejectStationDto }) => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.pending() })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station rejected')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to reject station')
    },
  })
}

export function useDeleteStation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<null>, Error, string>({
    mutationFn: (id: string) => deleteStation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      void queryClient.invalidateQueries({ queryKey: stationKeys.pending() })
      toast.success('Station deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to delete station')
    },
  })
}

export function useFeatureStation() {
  const queryClient = useQueryClient()

  return useMutation<ApiResponse<Station>, Error, string>({
    mutationFn: (id: string) => featureStation(id),
    onSuccess: (_data, id: string) => {
      void queryClient.invalidateQueries({ queryKey: stationKeys.detail(id) })
      void queryClient.invalidateQueries({ queryKey: stationKeys.lists() })
      toast.success('Station featured')
    },
    onError: (err: Error) => {
      toast.error(err.message ?? 'Failed to feature station')
    },
  })
}
