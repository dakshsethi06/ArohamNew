import { ArohamProduct } from '@logic/types/product';
import { CartItem } from '@logic/types/cart';

export type { ArohamProduct, CartItem };

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
  items: any;
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
