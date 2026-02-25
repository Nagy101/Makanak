// ═══════════════════════════════════════════════════════════════
//  Admin Dashboard — Strict TypeScript Types
//  Mirrors the exact JSON shapes returned by the 4 decoupled
//  /api/AdminDashboard/* endpoints.
// ═══════════════════════════════════════════════════════════════

/** Generic API response envelope shared by all 4 endpoints. */
export interface DashboardApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message: string;
  data: T;
  errors: string[] | null;
}

// ── Endpoint 1: /api/AdminDashboard/users-stats ────────────────
export interface UserStats {
  totalUsers: number;
  adminsCount: number;
  tenantsCount: number;
  ownersCount: number;
  pendingUsers: number;
  activeUsers: number;
  rejectsCount: number;
  bannedsCount: number;
  newsCount: number;
}

// ── Endpoint 2: /api/AdminDashboard/properties-stats ──────────
export interface PropertyStats {
  totalProperties: number;
  activeProperties: number;
  pendingApprovalProperties: number;
  rejectedProperties: number;
}

// ── Endpoint 3: /api/AdminDashboard/bookings-stats ────────────
export interface BookingsStats {
  totalBookings: number;
  pendingBookings: number;
  paymentReceived: number;
  completedBookings: number;
  cancelledBookings: number;
  checkedIn: number;
}

// ── Endpoint 4: /api/AdminDashboard/financial-stats ───────────
export interface FinancialStats {
  totalBookingVolume: number;
  totalPlatformEarnings: number;
  totalCashExpectedByOwners: number;
}

// ── Chart-specific data shapes (derived, not raw API) ─────────

/** Used by PropertiesDonutChart */
export interface PropertyChartEntry {
  name: string;
  value: number;
  fill: string;
}

/** Used by BookingsBarChart */
export interface BookingChartEntry {
  name: string;
  value: number;
  fill: string;
}

/** Used by UsersOverviewChart */
export interface UserRoleEntry {
  name: string;
  value: number;
  fill: string;
}

export interface UserStatusEntry {
  name: string;
  value: number;
  fill: string;
}
