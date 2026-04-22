import { createApi, API_BASE } from "../../lib/api";
import type { ApiResponse, UpdateProfileRequest, User } from "./auth.types";

const profileApi = createApi(`${API_BASE}`);

function toFormData(
  data: Record<string, File | string | number | boolean | null | undefined>,
): FormData {
  const fd = new FormData();
  Object.entries(data).forEach(([key, val]) => {
    if (val instanceof File) fd.append(key, val);
    else if (val !== undefined && val !== null) fd.append(key, String(val));
  });
  return fd;
}

export const getProfile = () =>
  profileApi.get<ApiResponse<User>>("/profile").then((r) => r.data.data);

export const updateProfile = (data: UpdateProfileRequest) =>
  profileApi
    .put<ApiResponse<User>>(
      "/profile",
      toFormData(
        data as unknown as Record<
          string,
          File | string | number | boolean | null | undefined
        >,
      ),
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    )
    .then((r) => r.data.data);
