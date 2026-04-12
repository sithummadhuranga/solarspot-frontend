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

export async function getStations(
  params: StationQueryParams = {}
): Promise<PaginatedResponse<Station>> {
  const { data } = await axiosClient.get<PaginatedResponse<Station>>(
    '/stations',
    { params }
  )
  return data
}

export async function searchStations(
  params: { q: string; page?: number; limit?: number }
): Promise<PaginatedResponse<Station>> {
  const { data } = await axiosClient.get<PaginatedResponse<Station>>(
    '/stations/search',
    { params }
  )
  return data
}

export async function getNearbyStations(
  params: NearbyQueryParams
): Promise<ApiResponse<NearbyStation[]>> {
  const { data } = await axiosClient.get<ApiResponse<NearbyStation[]>>(
    '/stations/nearby',
    { params }
  )
  return data
}

export async function getPendingStations(
  page = 1,
  limit = 10,
): Promise<PaginatedResponse<Station>> {
  const { data } = await axiosClient.get<PaginatedResponse<Station>>(
    '/stations/pending',
    { params: { page, limit } },
  )
  return data
}

export async function getStation(id: string): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.get<ApiResponse<Station>>(
    `/stations/${id}`
  )
  return data
}

export async function createStation(
  dto: CreateStationDto
): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.post<ApiResponse<Station>>(
    '/stations',
    dto
  )
  return data
}

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

export async function approveStation(id: string): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.patch<ApiResponse<Station>>(
    `/stations/${id}/approve`
  )
  return data
}

export async function rejectStation(
  id: string,
  dto: RejectStationDto
): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.patch<ApiResponse<Station>>(
    `/stations/${id}/reject`,
    { rejectionReason: (dto.rejectionReason ?? dto.reason)?.trim() },
  )
  return data
}

export async function deleteStation(id: string): Promise<ApiResponse<null>> {
  const { data } = await axiosClient.delete<ApiResponse<null>>(
    `/stations/${id}`
  )
  return data
}

export async function featureStation(id: string): Promise<ApiResponse<Station>> {
  const { data } = await axiosClient.patch<ApiResponse<Station>>(
    `/stations/${id}/feature`
  )
  return data
}

export async function getStationStats(id: string): Promise<ApiResponse<unknown>> {
  const { data } = await axiosClient.get<ApiResponse<unknown>>(
    `/stations/${id}/stats`
  )
  return data
}
