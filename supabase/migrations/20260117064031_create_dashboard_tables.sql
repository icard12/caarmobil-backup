/*
  # Create Dashboard Management System Tables

  1. New Tables
    - `customers`
      - `id` (uuid, primary key)
      - `name` (text) - Customer full name
      - `email` (text, unique) - Customer email address
      - `company` (text) - Company name
      - `status` (text) - Customer status (active, inactive, pending)
      - `total_spent` (numeric) - Total amount spent
      - `created_at` (timestamptz) - Account creation date
      
    - `products`
      - `id` (uuid, primary key)
      - `name` (text) - Product name
      - `category` (text) - Product category
      - `price` (numeric) - Product price
      - `stock` (integer) - Available stock
      - `status` (text) - Product status (active, out_of_stock)
      - `created_at` (timestamptz) - Product creation date
      
    - `orders`
      - `id` (uuid, primary key)
      - `customer_id` (uuid, foreign key) - Reference to customers
      - `product_id` (uuid, foreign key) - Reference to products
      - `order_number` (text, unique) - Order number
      - `amount` (numeric) - Order amount
      - `status` (text) - Order status (pending, completed, cancelled)
      - `quantity` (integer) - Quantity ordered
      - `created_at` (timestamptz) - Order creation date

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read all data
    - This is a demo dashboard, so we'll allow broad read access
*/

CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  company text,
  status text DEFAULT 'active',
  total_spent numeric DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  category text NOT NULL,
  price numeric NOT NULL,
  stock integer DEFAULT 0,
  status text DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  product_id uuid REFERENCES products(id) ON DELETE CASCADE,
  order_number text UNIQUE NOT NULL,
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  quantity integer DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to customers"
  ON customers FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO customers (name, email, company, status, total_spent) VALUES
  ('Alice Johnson', 'alice@techcorp.com', 'TechCorp Inc', 'active', 45000),
  ('Bob Smith', 'bob@digitalwave.com', 'Digital Wave Ltd', 'active', 32500),
  ('Carol Williams', 'carol@innovate.io', 'Innovate Solutions', 'active', 28000),
  ('David Brown', 'david@startup.co', 'StartUp Co', 'pending', 15000),
  ('Emma Davis', 'emma@enterprise.com', 'Enterprise Systems', 'active', 67000),
  ('Frank Miller', 'frank@cloud9.com', 'Cloud9 Services', 'inactive', 8500),
  ('Grace Wilson', 'grace@datatech.io', 'DataTech Analytics', 'active', 52000),
  ('Henry Taylor', 'henry@nexgen.com', 'NexGen Industries', 'active', 38000);

INSERT INTO products (name, category, price, stock, status) VALUES
  ('Professional Plan', 'Subscription', 299, 1000, 'active'),
  ('Enterprise Suite', 'Subscription', 999, 500, 'active'),
  ('Consulting Hours', 'Service', 150, 100, 'active'),
  ('Training Package', 'Service', 499, 50, 'active'),
  ('API Access', 'Feature', 199, 1000, 'active'),
  ('Premium Support', 'Service', 99, 200, 'active'),
  ('Custom Integration', 'Service', 2500, 10, 'active'),
  ('Analytics Module', 'Feature', 399, 300, 'active');

INSERT INTO orders (customer_id, product_id, order_number, amount, status, quantity) 
SELECT 
  c.id,
  p.id,
  'ORD-' || LPAD((ROW_NUMBER() OVER ())::text, 6, '0'),
  p.price * (1 + (random() * 2)::integer),
  CASE WHEN random() < 0.7 THEN 'completed' WHEN random() < 0.9 THEN 'pending' ELSE 'cancelled' END,
  1 + (random() * 3)::integer
FROM customers c
CROSS JOIN products p
WHERE random() < 0.3
LIMIT 20;
