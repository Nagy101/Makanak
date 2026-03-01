import { useState, useCallback, useEffect, lazy, Suspense } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Upload, X, Trash2, Loader2, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGovernorates,
  useAmenities,
  usePropertyTypes,
} from "@/features/lookup";
import { useCreateProperty, useUpdateProperty } from "../useOwnerProperties";
import { useProperty } from "@/features/properties/useProperties";
import type {
  CreatePropertyPayload,
  EditPropertyPayload,
} from "../owner.types";

// Lazy-load the map component to avoid blocking initial render
const MapPicker = lazy(() => import("../components/MapPicker"));

const propertySchema = z.object({
  Title: z.string().min(3, "Title must be at least 3 characters"),
  Description: z.string().min(10, "Description must be at least 10 characters"),
  PropertyType: z.string().min(1, "Select a property type"),
  AreaName: z.string().min(1, "Area name is required"),
  Address: z.string().min(3, "Address is required"),
  PricePerNight: z.coerce.number().min(1, "Price must be at least 1"),
  Area: z.coerce.number().min(1, "Area must be at least 1"),
  Bedrooms: z.coerce.number().min(0, "Invalid"),
  Bathrooms: z.coerce.number().min(0, "Invalid"),
  MaxGuests: z.coerce.number().min(1, "At least 1 guest"),
  GovernorateId: z.coerce.number().min(1, "Select a governorate"),
  Latitude: z.coerce.number(),
  Longitude: z.coerce.number(),
});

type FormValues = z.infer<typeof propertySchema>;

export default function AddEditPropertyPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const propertyId = id ? Number(id) : 0;
  const navigate = useNavigate();

  const { governorates } = useGovernorates();
  const { amenities } = useAmenities();
  const { propertyTypes } = usePropertyTypes();

  const { data: existingProperty, isLoading: loadingProperty } =
    useProperty(propertyId);

  const createMutation = useCreateProperty();
  const updateMutation = useUpdateProperty();
  const isPending = createMutation.isPending || updateMutation.isPending;

  // File state
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [mainImagePreview, setMainImagePreview] = useState<string>("");
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [existingGallery, setExistingGallery] = useState<
    { id: number; imageUrl: string }[]
  >([]);
  const [deletedImageIds, setDeletedImageIds] = useState<number[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      Latitude: 30.0444,
      Longitude: 31.2357,
    },
  });

  const lat = watch("Latitude");
  const lng = watch("Longitude");

  // Pre-fill on edit — run once when property data arrives
  useEffect(() => {
    if (!isEdit || !existingProperty) return;

    // Try to resolve GovernorateId immediately if the lookup is already loaded
    const govMatch = governorates.find(
      (g) =>
        g.nameEn?.toLowerCase() ===
          existingProperty.governorateName?.toLowerCase() ||
        g.nameAr?.toLowerCase() ===
          existingProperty.governorateName?.toLowerCase(),
    );

    // Try to resolve PropertyType name to match what the Select items use
    const typeMatch = propertyTypes.find(
      (t) =>
        t.name?.toLowerCase() === existingProperty.propertyType?.toLowerCase(),
    );

    reset({
      Title: existingProperty.title,
      Description: existingProperty.description,
      PropertyType: typeMatch?.name ?? existingProperty.propertyType,
      AreaName: existingProperty.areaName || "",
      Address: existingProperty.address || "",
      PricePerNight: existingProperty.pricePerNight,
      Area: existingProperty.area,
      Bedrooms: existingProperty.bedrooms,
      Bathrooms: existingProperty.bathrooms,
      MaxGuests: existingProperty.maxGuests,
      GovernorateId: govMatch?.id ?? 0,
      Latitude: 30.0444,
      Longitude: 31.2357,
    });
    setMainImagePreview(existingProperty.mainImageUrl);
    setExistingGallery(existingProperty.propertyImages || []);
    setSelectedAmenities(existingProperty.amenities?.map((a) => a.id) || []);
  }, [isEdit, existingProperty, reset]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fallback: if lookups arrived AFTER the property reset, re-sync the dropdowns
  useEffect(() => {
    if (!isEdit || !existingProperty || governorates.length === 0) return;
    const match = governorates.find(
      (g) =>
        g.nameEn?.toLowerCase() ===
          existingProperty.governorateName?.toLowerCase() ||
        g.nameAr?.toLowerCase() ===
          existingProperty.governorateName?.toLowerCase(),
    );
    if (match) setValue("GovernorateId", match.id);
  }, [isEdit, existingProperty, governorates, setValue]);

  useEffect(() => {
    if (!isEdit || !existingProperty || propertyTypes.length === 0) return;
    const match = propertyTypes.find(
      (t) =>
        t.name?.toLowerCase() === existingProperty.propertyType?.toLowerCase(),
    );
    if (match) setValue("PropertyType", match.name);
  }, [isEdit, existingProperty, propertyTypes, setValue]);

  const handleMainImage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        setMainImage(file);
        setMainImagePreview(URL.createObjectURL(file));
      }
    },
    [],
  );

  const handleGalleryImages = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(e.target.files || []);
      setGalleryFiles((prev) => [...prev, ...files]);
      setGalleryPreviews((prev) => [
        ...prev,
        ...files.map((f) => URL.createObjectURL(f)),
      ]);
    },
    [],
  );

  const removeGalleryFile = useCallback((index: number) => {
    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const removeExistingImage = useCallback((imageId: number) => {
    setDeletedImageIds((prev) => [...prev, imageId]);
    setExistingGallery((prev) => prev.filter((img) => img.id !== imageId));
  }, []);

  const toggleAmenity = useCallback((amenityId: number) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityId)
        ? prev.filter((id) => id !== amenityId)
        : [...prev, amenityId],
    );
  }, []);

  const handleMapChange = useCallback(
    (newLat: number, newLng: number) => {
      setValue("Latitude", newLat);
      setValue("Longitude", newLng);
    },
    [setValue],
  );

  const onSubmit = useCallback(
    (values: FormValues) => {
      if (!isEdit && !mainImage) return;

      const base = {
        ...values,
        MainImage: mainImage as File,
        GalleryImages: galleryFiles,
        AmenityIds: selectedAmenities,
      };

      if (isEdit) {
        const payload = {
          ...base,
          MainImage: mainImage || (undefined as unknown as File),
          DeletedImageIds: deletedImageIds,
        } as EditPropertyPayload;
        updateMutation.mutate(
          { id: propertyId, payload },
          { onSuccess: () => navigate("/owner") },
        );
      } else {
        createMutation.mutate(base as CreatePropertyPayload, {
          onSuccess: () => navigate("/owner"),
        });
      }
    },
    [
      isEdit,
      mainImage,
      galleryFiles,
      selectedAmenities,
      deletedImageIds,
      propertyId,
      navigate,
      createMutation,
      updateMutation,
    ],
  );

  if (isEdit && loadingProperty) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/owner")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold text-foreground">
          {isEdit ? "Edit Property" : "Add New Property"}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="Title">Title</Label>
              <Input
                id="Title"
                {...register("Title")}
                placeholder="Property title"
              />
              {errors.Title && (
                <p className="text-sm text-destructive">
                  {errors.Title.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="Description">Description</Label>
              <Textarea
                id="Description"
                {...register("Description")}
                placeholder="Describe your property…"
                rows={4}
              />
              {errors.Description && (
                <p className="text-sm text-destructive">
                  {errors.Description.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Property Type</Label>
                <Select
                  value={watch("PropertyType") || ""}
                  onValueChange={(v) => setValue("PropertyType", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.PropertyType && (
                  <p className="text-sm text-destructive">
                    {errors.PropertyType.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="PricePerNight">Price per Night (EGP)</Label>
                <Input
                  id="PricePerNight"
                  type="number"
                  {...register("PricePerNight")}
                  placeholder="0"
                />
                {errors.PricePerNight && (
                  <p className="text-sm text-destructive">
                    {errors.PricePerNight.message}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Governorate</Label>
                <Select
                  value={watch("GovernorateId")?.toString() || ""}
                  onValueChange={(v) => setValue("GovernorateId", Number(v))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select governorate" />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {g.nameEn || g.nameAr || "Unknown"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.GovernorateId && (
                  <p className="text-sm text-destructive">
                    {errors.GovernorateId.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="AreaName">Area Name</Label>
                <Input
                  id="AreaName"
                  {...register("AreaName")}
                  placeholder="e.g. Zamalek"
                />
                {errors.AreaName && (
                  <p className="text-sm text-destructive">
                    {errors.AreaName.message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="Address">Address</Label>
              <Input
                id="Address"
                {...register("Address")}
                placeholder="Full address"
              />
              {errors.Address && (
                <p className="text-sm text-destructive">
                  {errors.Address.message}
                </p>
              )}
            </div>

            {/* Map */}
            <div className="space-y-2">
              <Label>Pin Location on Map</Label>
              <div
                className="rounded-lg border overflow-hidden"
                style={{ height: 350, isolation: "isolate" }}
              >
                <Suspense
                  fallback={
                    <div className="h-full flex items-center justify-center bg-muted text-muted-foreground text-sm">
                      Loading map…
                    </div>
                  }
                >
                  <MapPicker lat={lat} lng={lng} onChange={handleMapChange} />
                </Suspense>
              </div>
              <div className="flex gap-4 text-xs text-muted-foreground">
                <span>Lat: {lat?.toFixed(5)}</span>
                <span>Lng: {lng?.toFixed(5)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Property Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="Area">Area (m²)</Label>
                <Input id="Area" type="number" {...register("Area")} />
                {errors.Area && (
                  <p className="text-sm text-destructive">
                    {errors.Area.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="Bedrooms">Bedrooms</Label>
                <Input id="Bedrooms" type="number" {...register("Bedrooms")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Bathrooms">Bathrooms</Label>
                <Input
                  id="Bathrooms"
                  type="number"
                  {...register("Bathrooms")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="MaxGuests">Max Guests</Label>
                <Input
                  id="MaxGuests"
                  type="number"
                  {...register("MaxGuests")}
                />
                {errors.MaxGuests && (
                  <p className="text-sm text-destructive">
                    {errors.MaxGuests.message}
                  </p>
                )}
              </div>
            </div>

            {/* Amenities */}
            <div className="space-y-3">
              <Label className="text-sm font-semibold">Amenities</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenities.map((a) => (
                  <label
                    key={a.id}
                    className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-accent/5 transition-colors"
                  >
                    <Checkbox
                      checked={selectedAmenities.includes(a.id)}
                      onCheckedChange={() => toggleAmenity(a.id)}
                    />
                    <span className="text-sm">
                      {a.nameEn || a.name || a.nameAr || "Unknown"}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Photos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Main Image */}
            <div className="space-y-2">
              <Label>
                Main Image{" "}
                {!isEdit && <span className="text-destructive">*</span>}
              </Label>
              <div className="flex items-center gap-4">
                {mainImagePreview ? (
                  <div className="relative h-32 w-48 rounded-lg overflow-hidden border">
                    <img
                      src={mainImagePreview}
                      alt="Main"
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview("");
                      }}
                      className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <label className="flex h-32 w-48 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      Upload Main Image
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleMainImage}
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Gallery */}
            <div className="space-y-2">
              <Label>Gallery Images</Label>
              <div className="flex flex-wrap gap-3">
                {/* Existing images (edit mode) */}
                {existingGallery.map((img) => (
                  <div
                    key={img.id}
                    className="relative h-24 w-32 rounded-lg overflow-hidden border"
                  >
                    <img
                      src={img.imageUrl}
                      alt=""
                      loading="lazy"
                      width={128}
                      height={96}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(img.id)}
                      className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                {/* New files */}
                {galleryPreviews.map((url, i) => (
                  <div
                    key={`new-${i}`}
                    className="relative h-24 w-32 rounded-lg overflow-hidden border"
                  >
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeGalleryFile(i)}
                      className="absolute top-1 right-1 rounded-full bg-destructive p-1 text-destructive-foreground"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}

                <label className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border hover:border-primary transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Add</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={handleGalleryImages}
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/owner")}
            className="hover:bg-muted hover:text-foreground"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isPending}
            className="min-w-[140px] font-semibold"
          >
            {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? "Update Property" : "Create Property"}
          </Button>
        </div>
      </form>
    </div>
  );
}
