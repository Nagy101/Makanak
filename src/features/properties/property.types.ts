// ── Search / Filter Params ──
export interface PropertySearchParams {
  Type?: string;
  MinPrice?: number;
  MaxPrice?: number;
  MinBedrooms?: number;
  MinMaxGuests?: number;
  AmenityIds?: number[];
  GovernorateId?: number;
  CheckInDate?: string;
  CheckOutDate?: string;
  PageIndex?: number;
  PageSize?: number;
  Search?: string;
  Sort?: string;
  Latitude?: number;
  Longitude?: number;
  MaxDistance?: number;
}

// ── Property Image ──
export interface PropertyImage {
  id: number;
  imageUrl: string;
}

// ── Amenity ──
export interface Amenity {
  id: number;
  name: string;
  icon: string;
}

// ── Listing (summary in search results) ──
export interface PropertyListing {
  id: number;
  title: string;
  mainImageUrl: string;
  pricePerNight: number;
  governorateName: string;
  propertyStatus?: string;
  propertyType: string;
  averageRating: number;
  isAvailable?: boolean;
}

// ── Details (full single-property view) ──
export interface PropertyDetails extends PropertyListing {
  description: string;
  area: number;
  bedrooms: number;
  bathrooms: number;
  maxGuests: number;
  address: string;
  areaName: string;
  propertyImages: PropertyImage[];
  amenities: Amenity[];
}

// ── Paginated Response ──
export interface PaginatedData<T> {
  pageIndex: number;
  pageSize: number;
  totalCount: number;
  data: T[];
}

// ── API Envelope ──
export interface PropertyApiResponse<T> {
  statusCode: number;
  isSuccess: boolean;
  message?: string;
  data: T;
  errors?: string[] | null;
}
