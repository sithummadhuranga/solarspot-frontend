# Member 1 Backend Handoff

## Scope
This frontend implementation assumes the following backend behavior for station management and administration.

## Station Edit Rules
1. Owner can edit only stations with status `pending` or `active`.
2. Admin can edit any station.
3. Rejected station owner edits are blocked unless backend introduces a dedicated resubmission flow.

## API Behavior Requirements
1. `GET /api/stations/pending`
- Must return oldest-first ordering (`createdAt` ascending).

2. `GET /api/stations`
- Must support query params used by frontend: `page`, `limit`, `search`, `lat`, `lng`, `radius`, `connectorType`, `minRating`, `isVerified`, `amenities`, `sortBy`.
- `amenities` is sent as a comma-separated string.

3. `GET /api/stations/nearby`
- Must return `distanceKm` per station and should be sorted by distance ascending.

## Backend Logger Requirements (No Frontend Logger)
Implement structured logs for these station lifecycle events:

1. `station.create`
- Fields: `event`, `actorId`, `stationId`, `timestamp`, `statusAfter`, `requestId`.

2. `station.update`
- Fields: `event`, `actorId`, `stationId`, `timestamp`, `changedFields`, `statusBefore`, `statusAfter`, `requestId`.

3. `station.approve`
- Fields: `event`, `actorId`, `stationId`, `timestamp`, `statusBefore`, `statusAfter`, `verifiedAt`, `requestId`.

4. `station.reject`
- Fields: `event`, `actorId`, `stationId`, `timestamp`, `statusBefore`, `statusAfter`, `rejectionReason`, `requestId`.

5. `station.delete`
- Fields: `event`, `actorId`, `stationId`, `timestamp`, `deletedAt`, `deletedBy`, `requestId`.

Recommended standard fields for all events:
- `level`, `service`, `environment`, `event`, `actorId`, `stationId`, `requestId`, `ip`, `userAgent`, `timestamp`.

## Audit Endpoint Expectations
For admin audit screens to be fully useful, backend should support:
1. Pagination response with `page`, `limit`, `total`, `totalPages`, `hasPrev`, `hasNext`.
2. Optional filters: `action`, `actor`, `fromDate`, `toDate`.

## Verification Checklist
1. Update station in `pending` and `active` status as owner: allowed.
2. Update station in `rejected` status as owner: forbidden.
3. Approve/reject operations produce logger events and audit rows.
4. Pending queue is oldest-first.
5. Amenities filtering returns expected station subsets.
