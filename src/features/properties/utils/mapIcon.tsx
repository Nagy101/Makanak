import {
  Wifi, Waves, Snowflake, Car, Flame, CookingPot, Tv,
  Bath, Bed, Users, MapPin, Home, Star, Calendar,
  DoorOpen, Wind, Dumbbell, ShieldCheck, Coffee, UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  'fa-solid fa-wifi': Wifi,
  'fa-solid fa-person-swimming': Waves,
  'fa-solid fa-snowflake': Snowflake,
  'fa-solid fa-square-parking': Car,
  'fa-solid fa-fire-burner': Flame,
  'fa-solid fa-kitchen-set': CookingPot,
  'fa-solid fa-tv': Tv,
  'fa-solid fa-bath': Bath,
  'fa-solid fa-bed': Bed,
  'fa-solid fa-users': Users,
  'fa-solid fa-map-pin': MapPin,
  'fa-solid fa-home': Home,
  'fa-solid fa-star': Star,
  'fa-solid fa-calendar': Calendar,
  'fa-solid fa-door-open': DoorOpen,
  'fa-solid fa-wind': Wind,
  'fa-solid fa-dumbbell': Dumbbell,
  'fa-solid fa-shield': ShieldCheck,
  'fa-solid fa-coffee': Coffee,
  'fa-solid fa-utensils': UtensilsCrossed,
};

export function mapIcon(faString: string): LucideIcon {
  return iconMap[faString] || Home;
}
