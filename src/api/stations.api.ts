import { axiosClient } from './axiosClient'
import type { ApiResponse, PaginatedResponse } from '@/types/api.types'
import type {
  Station,
  NearbyStation,
  CreateStationDto,
  UpdateStationDto,
  RejectStationDto,
  StationQueryParams,
  NearbyQueryParams,
} from '@/types/station.types'

// ─── List stations ─────────────────────────────────────────────────────────────
export async function getStations(
  params: StationQueryParams = {}
): Promise<PaginatedResponse<Station>> {
  const { data } = await axiosClient.get<PaginatedResponse<Station>>(
    '/stations',
    { params }
  )
  return data
}

// ─── Nearby stations ──────────────────────────────────────────────────────────
export async function getNearbyStations(
  params: NearbyQueryParams
): Promise<ApiResponse<NearbyStation[]>> {
  const { data } = await axiosClient.get<ApiResponse<NearbyStation[]>>(
    '/stations/nearby',
    { params }
  )
  return data
}

// ─── Moderation queue ─────────────────────────────────────────────────────────
export async function getPendingStations(): Promise<PaginatedResponse<Station>> {
  const { data } = await axiosClient.get<PaginatedResponse<Station>>(
    '/stations/pending'
  )
  return data
}

// ─── Single station ───────────────────────────────────────────────────────────
export async function getStation(id: string): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.get<ApiResponse<Station>>(
    `/stations/${id}`
  )
  return data
}

// ─── Create station ───────────────────────────────────────────────────────────
export async function createStation(
  dto: CreateStationDto
): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.post<ApiResponse<Station>>(
    '/stations',
    dto
  )
  return data
}

// ─── Edit station ─────────────────────────────────────────────────────────────
export async function updateStation(
  id: string,
  dto: UpdateStationDto
): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.put<ApiResponse<Station>>(
    `/stations/${id}`,
    dto
  )
  return data
}

// ─── Approve station ──────────────────────────────────────────────────────────
export async function approveStation(id: string): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.patch<ApiResponse<Station>>(
    `/stations/${id}/approve`
  )
  return data
}

// ─── Reject station ───────────────────────────────────────────────────────────
export async function rejectStation(
  id: string,
  dto: RejectStationDto
): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.patch<ApiResponse<Station>>(
    `/stations/${id}/reject`,
    dto
  )
  return data
}

// ─── Delete station (admin soft-delete) ───────────────────────────────────────
export async function deleteStation(id: string): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `/stations/${id}`
  )
  return data
}
