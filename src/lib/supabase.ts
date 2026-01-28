import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only create client if env vars are present, otherwise export a dummy or null
// This allows the app to run with SQLite without Supabase config
export const supabase = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

export interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  status: string;
  total_spent: number;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  costPrice: number;
  stock: number;
  minStock: number;
  status: string;
  image_url?: string;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id: string;
  product_id: string;
  order_number: string;
  amount: number;
  status: string;
  quantity: number;
  created_at: string;
}
