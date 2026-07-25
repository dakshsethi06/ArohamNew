export interface ArohamProduct {
  id: number;
  slug: string;
  name: string;
  subtitle: string;
  category?: string;
  purpose?: string;
  price: number;
  original: number;
  rating?: number;
  reviews?: number;
  img: string;
  badges?: string[];
  shortDesc?: string;
  description?: string | string[];
  benefits?: string[];
  size?: string;
  material?: string;
  useFor?: string[];
  stock?: number;
}

export interface Astrologer {
  id: string;
  name: string;
  title: string;
  experience: string;
  rating: number;
  consultations: number;
  specialties: string[];
  languages: string[];
  avatar: string;
  status: "online" | "busy" | "offline";
  pricePerMin: number;
  bio?: string;
}

export interface CartItem extends ArohamProduct {
  qty: number;
}

export interface Message {
  id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  recommended_product_slug?: string | null;
}

export interface Address {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface Order {
  id: string;
  amount: number;
  status: "PENDING" | "CONFIRMED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  items: string;
  address?: Address;
  created_at: string;
  tracking_id?: string;
}

export interface Review {
  id: string;
  name: string;
  rating: number;
  text: string;
  date?: string;
}

export type ActiveTab = "home" | "consult" | "shop" | "profile" | "astrologer";
