import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, SlidersHorizontal, X, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { useLocalizedField } from '@/hooks/useLocalizedField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useGovernorates, useAmenities, usePropertyTypes, useSortingOptions } from '@/features/lookup';
import type { PropertySearchParams } from '../property.types';

interface Props {
  params: PropertySearchParams;
  onParamsChange: (params: PropertySearchParams) => void;
}

export default function PropertySearchFilter({ params, onParamsChange }: Props) {
  const { t } = useTranslation();
  const localized = useLocalizedField();
  const [localSearch, setLocalSearch] = useState(params.Search || '');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [draft, setDraft] = useState<PropertySearchParams>({ ...params });

  // Load lookups from backend
  const { governorates, loading: loadingGov } = useGovernorates();
  const { amenities, loading: loadingAmenities } = useAmenities();
  const { propertyTypes, loading: loadingTypes } = usePropertyTypes();

  const activeFilterCount = [
    draft.Type,
    draft.GovernorateId,
    draft.MinPrice || draft.MaxPrice,
    draft.MinBedrooms,
    draft.MinMaxGuests,
    (draft.AmenityIds?.length ?? 0) > 0,
    draft.CheckInDate,
  ].filter(Boolean).length;

  const handleSearch = () => {
    onParamsChange({ ...params, Search: localSearch, PageIndex: 1 });
  };

  const handleApplyFilters = () => {
    onParamsChange({ ...draft, Search: localSearch, PageIndex: 1 });
    setSheetOpen(false);
  };

  const handleClearFilters = () => {
    const cleared: PropertySearchParams = { PageIndex: 1, PageSize: params.PageSize || 12 };
    setDraft(cleared);
    setLocalSearch('');
    onParamsChange(cleared);
    setSheetOpen(false);
  };

  const toggleAmenity = (id: number) => {
    const current = draft.AmenityIds || [];
    const next = current.includes(id) ? current.filter((a) => a !== id) : [...current, id];
    setDraft({ ...draft, AmenityIds: next });
  };

  return (
    <div className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur-sm">
      <div className="container mx-auto flex items-center gap-3 px-4 py-3">
        {/* Search bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t("properties.searchPlaceholder")}
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10 h-11"
          />
        </div>

        {/* Governorate quick select */}
        <Select
          value={params.GovernorateId?.toString() || ''}
          onValueChange={(v) => onParamsChange({ ...params, GovernorateId: v ? Number(v) : undefined, PageIndex: 1 })}
          disabled={loadingGov}
        >
          <SelectTrigger className="w-[180px] h-11 hidden md:flex">
            <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
            <SelectValue placeholder={loadingGov ? t("common.loading") : t("properties.allLocations")} />
          </SelectTrigger>
          <SelectContent>
            {governorates.map((g) => (
              <SelectItem key={g.id} value={g.id.toString()}>{localized(g.nameEn, g.nameAr)}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        {/* Sorting options come from backend */}
        <SortSelect
          params={params}
          onParamsChange={onParamsChange}
        />

        {/* Search button */}
        <Button onClick={handleSearch} size="lg" className="h-11 px-6 font-semibold">
          <Search className="h-4 w-4 mr-2" /> {t("common.search")}
        </Button>

        {/* Filters sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" className="h-11 relative">
              <SlidersHorizontal className="h-4 w-4 mr-2" /> {t("properties.filters")}
              {activeFilterCount > 0 && (
                <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-[10px]">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[380px] sm:w-[420px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle className="text-xl font-bold">{t("properties.filters")}</SheetTitle>
            </SheetHeader>

            <div className="mt-6 space-y-8">
              {/* Property Type */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">{t("properties.propertyType")}</Label>
                <Select 
                  value={draft.Type || ''} 
                  onValueChange={(v) => setDraft({ ...draft, Type: v || undefined })}
                  disabled={loadingTypes}
                >
                  <SelectTrigger><SelectValue placeholder={loadingTypes ? t("common.loading") : t("properties.anyType")} /></SelectTrigger>
                  <SelectContent>
                    {propertyTypes.map((t) => (
                      <SelectItem key={t.id} value={t.name}>{t.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Price Range */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">
                  {t("properties.priceRange")} <span className="text-muted-foreground font-normal">{t("properties.priceRangeUnit")}</span>
                </Label>
                <div className="px-1">
                  <Slider
                    min={0}
                    max={10000}
                    step={100}
                    value={[draft.MinPrice || 0, draft.MaxPrice || 10000]}
                    onValueChange={([min, max]) => setDraft({ ...draft, MinPrice: min || undefined, MaxPrice: max < 10000 ? max : undefined })}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{(draft.MinPrice || 0).toLocaleString()} {t("common.egp")}</span>
                  <span>{(draft.MaxPrice || 10000).toLocaleString()} {t("common.egp")}</span>
                </div>
              </div>

              {/* Bedrooms */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">{t("properties.minBedrooms")}</Label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <Button
                      key={n}
                      variant={draft.MinBedrooms === n ? 'default' : 'outline'}
                      size="sm"
                      className="w-10 h-10"
                      onClick={() => setDraft({ ...draft, MinBedrooms: draft.MinBedrooms === n ? undefined : n })}
                    >
                      {n}+
                    </Button>
                  ))}
                </div>
              </div>

              {/* Guests */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">{t("properties.minGuests")}</Label>
                <div className="flex gap-2">
                  {[2, 4, 6, 8, 10].map((n) => (
                    <Button
                      key={n}
                      variant={draft.MinMaxGuests === n ? 'default' : 'outline'}
                      size="sm"
                      className="w-10 h-10"
                      onClick={() => setDraft({ ...draft, MinMaxGuests: draft.MinMaxGuests === n ? undefined : n })}
                    >
                      {n}+
                    </Button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">{t("properties.dates")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={draft.CheckInDate || ''}
                      onChange={(e) => setDraft({ ...draft, CheckInDate: e.target.value || undefined })}
                      className="pl-10"
                      placeholder="Check-in"
                    />
                  </div>
                  <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="date"
                      value={draft.CheckOutDate || ''}
                      onChange={(e) => setDraft({ ...draft, CheckOutDate: e.target.value || undefined })}
                      className="pl-10"
                      placeholder="Check-out"
                    />
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-foreground">{t("properties.amenities")}</Label>
                {loadingAmenities ? (
                  <p className="text-sm text-muted-foreground">{t("properties.loadingAmenities")}</p>
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
                        <span className="text-sm">{localized(a.nameEn, a.nameAr) || a.name || 'Unknown'}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Governorate (mobile) */}
              <div className="space-y-3 md:hidden">
                <Label className="text-sm font-semibold text-foreground">{t("properties.location")}</Label>
                <Select
                  value={draft.GovernorateId?.toString() || ''}
                  onValueChange={(v) => setDraft({ ...draft, GovernorateId: v ? Number(v) : undefined })}
                  disabled={loadingGov}
                >
                  <SelectTrigger><SelectValue placeholder={loadingGov ? t("common.loading") : t("properties.allLocations")} /></SelectTrigger>
                  <SelectContent>
                    {governorates.map((g) => (
                      <SelectItem key={g.id} value={g.id.toString()}>{localized(g.nameEn, g.nameAr)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t">
                <Button variant="outline" className="flex-1" onClick={handleClearFilters}>
                  <X className="h-4 w-4 mr-2" /> {t("common.clearAll")}
                </Button>
                <Button className="flex-1 font-semibold" onClick={handleApplyFilters}>
                  {t("properties.applyFilters")}
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

/**
 * SortSelect Component
 * Renders a Select dropdown for sorting options fetched from the backend.
 * Sends numeric Sort ID (matching SortingOptionsEnum on backend).
 */
interface SortSelectProps {
  params: PropertySearchParams;
  onParamsChange: (params: PropertySearchParams) => void;
}

function SortSelect({ params, onParamsChange }: SortSelectProps) {
  const { sortingOptions, loading: loadingSortingOptions } = useSortingOptions();

  const { t } = useTranslation();

  return (
    <Select
      value={params.Sort?.toString() || ''}
      onValueChange={(v) => onParamsChange({ ...params, Sort: v ? Number(v) : undefined, PageIndex: 1 })}
      disabled={loadingSortingOptions}
    >
      <SelectTrigger className="w-[170px] h-11 hidden lg:flex">
        <SelectValue placeholder={loadingSortingOptions ? t("common.loading") : t("properties.sortBy")} />
      </SelectTrigger>
      <SelectContent>
        {sortingOptions.map((s) => (
          <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
