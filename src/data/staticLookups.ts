export const GOVERNORATES = [
  { id: 1, nameEn: "Cairo", nameAr: "القاهرة" },
  { id: 2, nameEn: "Giza", nameAr: "الجيزة" },
  { id: 3, nameEn: "Alexandria", nameAr: "الإسكندرية" },
  { id: 4, nameEn: "Dakahlia", nameAr: "الدقهلية" },
  { id: 5, nameEn: "Red Sea", nameAr: "البحر الأحمر" },
  { id: 6, nameEn: "Beheira", nameAr: "البحيرة" },
  { id: 7, nameEn: "Fayoum", nameAr: "الفيوم" },
  { id: 8, nameEn: "Gharbia", nameAr: "الغربية" },
  { id: 9, nameEn: "Ismailia", nameAr: "الإسماعيلية" },
  { id: 10, nameEn: "Monufia", nameAr: "المنوفية" },
  { id: 11, nameEn: "Minya", nameAr: "المنيا" },
  { id: 12, nameEn: "Qalyubia", nameAr: "القليوبية" },
  { id: 13, nameEn: "New Valley", nameAr: "الوادي الجديد" },
  { id: 14, nameEn: "Suez", nameAr: "السويس" },
  { id: 15, nameEn: "Aswan", nameAr: "أسوان" },
  { id: 16, nameEn: "Assiut", nameAr: "أسيوط" },
  { id: 17, nameEn: "Beni Suef", nameAr: "بني سويف" },
  { id: 18, nameEn: "Port Said", nameAr: "بورسعيد" },
  { id: 19, nameEn: "Damietta", nameAr: "دمياط" },
  { id: 20, nameEn: "Sharkia", nameAr: "الشرقية" },
  { id: 21, nameEn: "South Sinai", nameAr: "جنوب سيناء" },
  { id: 22, nameEn: "Kafr El Sheikh", nameAr: "كفر الشيخ" },
  { id: 23, nameEn: "Matruh", nameAr: "مطروح" },
  { id: 24, nameEn: "Luxor", nameAr: "الأقصر" },
  { id: 25, nameEn: "Qena", nameAr: "قنا" },
  { id: 26, nameEn: "North Sinai", nameAr: "شمال سيناء" },
  { id: 27, nameEn: "Sohag", nameAr: "سوهاج" },
] as const;

export const AMENITIES = [
  { id: 6, name: "WiFi", icon: "fa-solid fa-wifi" },
  { id: 7, name: "Swimming Pool", icon: "fa-solid fa-person-swimming" },
  { id: 8, name: "Air Conditioning", icon: "fa-solid fa-snowflake" },
  { id: 9, name: "Free Parking", icon: "fa-solid fa-square-parking" },
  { id: 10, name: "BBQ Grill", icon: "fa-solid fa-fire-burner" },
  { id: 11, name: "Kitchen", icon: "fa-solid fa-kitchen-set" },
  { id: 12, name: "TV", icon: "fa-solid fa-tv" },
] as const;

export const PROPERTY_TYPES = [
  "Apartment",
  "Villa",
  "Chalet",
  "Studio",
  "Duplex",
  "Penthouse",
  "Townhouse",
] as const;

export const SORT_OPTIONS = [
  { value: "PriceAsc", label: "Price: Low to High" },
  { value: "PriceDesc", label: "Price: High to Low" },
  { value: "RatingDesc", label: "Highest Rated" },
  { value: "Newest", label: "Newest First" },
] as const;
