import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  SlidersHorizontal,
  X,
  MapPin,
  Calendar as CalendarIcon,
} from "lucide-react";
import { useLocalizedField } from "@/hooks/useLocalizedField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  useGovernorates,
  useAmenities,
  usePropertyTypes,
} from "@/features/lookup";
import type { PropertySearchParams } from "../property.types";
import {
  PROPERTY_SORT_OPTIONS,
  type PropertySortValue,
} from "@/constants/sortOptions";

interface Props {
  params: PropertySearchParams;
  onParamsChange: (params: PropertySearchParams) => void;
}

const toDateInputValue = (date: Date) => date.toISOString().split("T")[0];

const addDays = (dateValue: string, days: number) => {
  const date = new Date(`${dateValue}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateInputValue(date);
};

export default function PropertySearchFilter({
  params,
  onParamsChange,
}: Props) {
  const { t } = useTranslation();
  const localized = useLocalizedField();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<PropertySearchParams>({ ...params });

  // Load lookups from backend
  const { governorates, loading: loadingGov } = useGovernorates();
  const { amenities, loading: loadingAmenities } = useAmenities();
  const { propertyTypes, loading: loadingTypes } = usePropertyTypes();
  const today = toDateInputValue(new Date());
  const checkOutMinDate = draft.CheckInDate
    ? addDays(draft.CheckInDate, 1)
    : addDays(today, 1);

  const checkInInPast = !!draft.CheckInDate && draft.CheckInDate < today;
  const checkOutInvalid =
    !!draft.CheckInDate &&
    !!draft.CheckOutDate &&
    draft.CheckOutDate <= draft.CheckInDate;
  const hasValidDateRange =
    !!draft.CheckInDate &&
    !!draft.CheckOutDate &&
    !checkInInPast &&
    !checkOutInvalid;

  const activeFilterCount = [
    draft.Type,
    draft.GovernorateId,
    draft.MinPrice || draft.MaxPrice,
    draft.MinBedrooms,
    draft.MinMaxGuests,
    (draft.AmenityIds?.length ?? 0) > 0,
    draft.CheckInDate,
    draft.CheckOutDate,
  ].filter(Boolean).length;

  useEffect(() => {
    if (!hasValidDateRange) return;
    if (
      params.CheckInDate === draft.CheckInDate &&
      params.CheckOutDate === draft.CheckOutDate
    ) {
      return;
    }

    onParamsChange({
      ...params,
      CheckInDate: draft.CheckInDate,
      CheckOutDate: draft.CheckOutDate,
      PageIndex: 1,
    });
  }, [
    draft.CheckInDate,
    draft.CheckOutDate,
    hasValidDateRange,
    onParamsChange,
    params,
  ]);

  const handleCheckInChange = (value: string) => {
    const nextCheckIn = value || undefined;
    const shouldClearCheckOut =
      !!nextCheckIn &&
      !!draft.CheckOutDate &&
      draft.CheckOutDate <= nextCheckIn;

    setDraft({
      ...draft,
      CheckInDate: nextCheckIn,
      CheckOutDate: shouldClearCheckOut ? undefined : draft.CheckOutDate,
    });
  };

  const handleCheckOutChange = (value: string) => {
    setDraft({
      ...draft,
      CheckOutDate: value || undefined,
    });
  };

  const handleApplyFilters = () => {
    onParamsChange({ ...draft, PageIndex: 1 });
    setSheetOpen(false);
  };

  const handleClearFilters = () => {
    const cleared: PropertySearchParams = {
      PageIndex: 1,
      PageSize: params.PageSize || 12,
    };
    setDraft(cleared);
    onParamsChange(cleared);
    setSheetOpen(false);
  };

  const toggleAmenity = (id: number) => {
    const current = draft.AmenityIds || [];
    const next = current.includes(id)
      ? current.filter((a) => a !== id)
      : [...current, id];
    setDraft({ ...draft, AmenityIds: next });
  };

  return (
    <div className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex flex-col gap-3 px-4 py-3 md:flex-row md:flex-nowrap md:items-end md:gap-2">
        {/* Dates */}
        <div className="grid w-full min-w-0 grid-cols-2 gap-2 md:w-auto md:gap-3">
          <div className="space-y-1">
            <Label htmlFor="checkInDate" className="text-[11px] font-medium md:text-xs">
              {t("properties.checkIn")}
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:left-3 md:h-4 md:w-4" />
              <Input
                id="checkInDate"
                type="date"
                min={today}
                value={draft.CheckInDate || ""}
                onChange={(e) => handleCheckInChange(e.target.value)}
                className="h-10 w-full min-w-0 px-2 pl-8 text-xs md:h-11 md:w-[185px] md:pl-10 md:text-sm"
                placeholder={t("properties.checkIn")}
                aria-label={t("properties.checkIn")}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label htmlFor="checkOutDate" className="text-[11px] font-medium md:text-xs">
              {t("properties.checkOut")}
            </Label>
            <div className="relative">
              <CalendarIcon className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground md:left-3 md:h-4 md:w-4" />
              <Input
                id="checkOutDate"
                type="date"
                min={checkOutMinDate}
                value={draft.CheckOutDate || ""}
                onChange={(e) => handleCheckOutChange(e.target.value)}
                className="h-10 w-full min-w-0 px-2 pl-8 text-xs md:h-11 md:w-[185px] md:pl-10 md:text-sm"
                placeholder={t("properties.checkOut")}
                aria-label={t("properties.checkOut")}
              />
            </div>
          </div>
        </div>

        {(checkInInPast || checkOutInvalid) && (
          <p className="w-full text-sm text-destructive md:order-last">
            {checkInInPast
              ? t("properties.checkInPastError")
              : t("properties.checkOutAfterCheckInError")}
          </p>
        )}

        {/* Governorate quick select */}
        <div className="hidden md:block md:w-[180px]">
          <Select
            value={params.GovernorateId?.toString() || ""}
            onValueChange={(v) =>
              onParamsChange({
                ...params,
                GovernorateId: v ? Number(v) : undefined,
                PageIndex: 1,
              })
            }
            disabled={loadingGov}
          >
            <SelectTrigger className="h-11 w-full">
              <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
              <SelectValue
                placeholder={
                  loadingGov
                    ? t("common.loading")
                    : t("properties.allLocations")
                }
              />
            </SelectTrigger>
            <SelectContent>
              {governorates.map((g) => (
                <SelectItem key={g.id} value={g.id.toString()}>
                  {localized(g.nameEn, g.nameAr)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Sort */}
        {/* Sorting options come from backend */}
        <div className="hidden md:block md:w-[170px]">
          <SortSelect params={params} onParamsChange={onParamsChange} />
        </div>

        <div className="flex w-full gap-2 md:ml-auto md:w-auto">
          <Button
            variant="outline"
            className="h-11 flex-1 md:flex-none"
            onClick={handleClearFilters}
          >
            <X className="h-4 w-4 mr-2" /> {t("common.clearAll")}
          </Button>

          {/* Filters sheet */}
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="h-11 flex-1 md:flex-none relative">
                <SlidersHorizontal className="h-4 w-4 mr-2" />{" "}
                {t("properties.filters")}
                {activeFilterCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                    {activeFilterCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full max-w-full overflow-y-auto sm:w-[420px] sm:max-w-[420px]">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">
                {t("properties.filters")}
              </SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-8">
              {/* Property Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.propertyType")}
                </Label>
                <Select
                  value={draft.Type || ""}
                  onValueChange={(v) =>
                    setDraft({ ...draft, Type: v || undefined })
                  }
                  disabled={loadingTypes}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingTypes
                          ? t("common.loading")
                          : t("properties.anyType")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.priceRange")}{" "}
                  <span className="text-muted-foreground font-normal">
                    {t("properties.priceRangeUnit")}
                  </span>
                </Label>
                <div className="px-1">
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={[draft.MinPrice || 0, draft.MaxPrice || 10000]}
                    onValueChange={([min, max]) =>
                      setDraft({
                        ...draft,
                        MinPrice: min || undefined,
                        MaxPrice: max < 10000 ? max : undefined,
                      })
                    }
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>
                    {(draft.MinPrice || 0).toLocaleString()} {t("common.egp")}
                  </span>
                  <span>
                    {(draft.MaxPrice || 10000).toLocaleString()}{" "}
                    {t("common.egp")}
                  </span>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.minBedrooms")}
                </Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant={draft.MinBedrooms === n ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          MinBedrooms: draft.MinBedrooms === n ? undefined : n,
                        })
                      }
                    >
                      {n}+
                    </Button>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.minGuests")}
                </Label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8, 10].map((n) => (
                    <Button
                      key={n}
                      variant={draft.MinMaxGuests === n ? "default" : "outline"}
                      size="sm"
                      className="w-10 h-10"
                      onClick={() =>
                        setDraft({
                          ...draft,
                          MinMaxGuests:
                            draft.MinMaxGuests === n ? undefined : n,
                        })
                      }
                    >
                      {n}+
                    </Button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.amenities")}
                </Label>
                {loadingAmenities ? (
                  <p className="text-sm text-muted-foreground">
                    {t("properties.loadingAmenities")}
                  </p>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {amenities.map((a) => (
                      <label
                        key={a.id}
                        className="flex items-center gap-2.5 rounded-lg border p-3 cursor-pointer hover:bg-accent/5 transition-colors"
                      >
                        <Checkbox
                          checked={(draft.AmenityIds || []).includes(a.id)}
                          onCheckedChange={() => toggleAmenity(a.id)}
                        />
                        <span className="text-sm">
                          {localized(a.nameEn, a.nameAr) || a.name || "Unknown"}
                        </span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Governorate (mobile) */}
              <div className="space-y-3 md:hidden">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.location")}
                </Label>
                <Select
                  value={draft.GovernorateId?.toString() || ""}
                  onValueChange={(v) =>
                    setDraft({
                      ...draft,
                      GovernorateId: v ? Number(v) : undefined,
                    })
                  }
                  disabled={loadingGov}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        loadingGov
                          ? t("common.loading")
                          : t("properties.allLocations")
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {governorates.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>
                        {localized(g.nameEn, g.nameAr)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleClearFilters}
                >
                  <X className="h-4 w-4 mr-2" /> {t("common.clearAll")}
                </Button>
                <Button
                  className="flex-1 font-semibold"
                  onClick={handleApplyFilters}
                >
                  {t("properties.applyFilters")}
                </Button>
              </div>
            </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}

/**
 * SortSelect Component
 * Renders a Select dropdown for sorting options.
 * Sends SortingOptionsEnum value to backend.
 */
interface SortSelectProps {
  params: PropertySearchParams;
  onParamsChange: (params: PropertySearchParams) => void;
}

function SortSelect({ params, onParamsChange }: SortSelectProps) {
  const { t } = useTranslation();

  return (
    <Select
      value={params.Sort || ""}
      onValueChange={(v) =>
        onParamsChange({
          ...params,
          Sort: (v as PropertySortValue) || undefined,
          PageIndex: 1,
        })
      }
    >
      <SelectTrigger className="h-11 w-full sm:w-[170px]">
        <SelectValue placeholder={t("properties.sortBy")} />
      </SelectTrigger>
      <SelectContent>
        {PROPERTY_SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {t(option.labelKey)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
