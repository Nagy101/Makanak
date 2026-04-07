export const PropertySort = {
  NameAsc: "NameAsc",
  NameDesc: "NameDesc",
  DateCreatedAsc: "DateCreatedAsc",
  DateCreatedDesc: "DateCreatedDesc",
  PriceAsc: "PriceAsc",
  PriceDesc: "PriceDesc",
} as const;

export type PropertySortValue =
  (typeof PropertySort)[keyof typeof PropertySort];

export interface SortOptionItem {
  value: PropertySortValue;
  labelKey: string;
}

export const PROPERTY_SORT_OPTIONS: SortOptionItem[] = [
  { value: PropertySort.DateCreatedDesc, labelKey: "properties.newestFirst" },
  { value: PropertySort.DateCreatedAsc, labelKey: "properties.oldestFirst" },
  { value: PropertySort.PriceDesc, labelKey: "properties.priceHighToLow" },
  { value: PropertySort.PriceAsc, labelKey: "properties.priceLowToHigh" },
];
