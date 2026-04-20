-- Supabase schema for GuajiraTech product marketplace

create table if not exists services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null,
  icon text not null, -- svg path or class
  tag text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  description text,
  price numeric not null,
  price_old numeric,
  image_url text,
  created_at timestamptz not null default now()
);

-- Optional: allow anonymous insert for product offers if you configure RLS appropriately.
-- You can also create a sellers table if you want to track who offers each product.

create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  contact text,
  city text,
  total_orders integer default 0,
  total_spent numeric default 0,
  created_at timestamptz not null default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  client_id uuid references clients(id),
  type text not null, -- 'product' or 'service'
  item_id uuid not null, -- product_id or service_id
  item_name text not null,
  status text not null default 'pending', -- pending, in_progress, completed, cancelled
  total numeric not null,
  technician text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table services enable row level security;
alter table products enable row level security;
alter table sellers enable row level security;
alter table clients enable row level security;
alter table orders enable row level security;

-- Policies for services (admin only)
create policy "Allow all operations for authenticated users on services" on services
  for all using (auth.role() = 'authenticated');

-- Allow anonymous read for services
create policy "Allow anonymous read on services" on services
  for select using (true);

-- Policies for products
create policy "Allow anonymous insert on products" on products
  for insert with check (true);

create policy "Allow anonymous read on products" on products
  for select using (true);

-- Policies for sellers
create policy "Allow anonymous insert on sellers" on sellers
  for insert with check (true);

create policy "Allow anonymous read on sellers" on sellers
  for select using (true);

-- Policies for clients
create policy "Allow anonymous insert on clients" on clients
  for insert with check (true);

create policy "Allow anonymous read on clients" on clients
  for select using (true);

-- Policies for orders
create policy "Allow anonymous insert on orders" on orders
  for insert with check (true);

create policy "Allow anonymous read on orders" on orders
  for select using (true);

-- Insert default services
INSERT INTO services (title, description, icon, tag) VALUES
('Reparación de dispositivos', 'Laptops, celulares, tablets y más. Diagnóstico rápido, repuestos originales y garantía incluida.', '<svg viewBox="0 0 24 24" fill="none" stroke="#1e7fff" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></svg>', 'Desde $50.000 COP →'),
('Venta de hardware y accesorios', 'Computadores, periféricos, memorias, discos y accesorios de las mejores marcas del mercado.', '<svg viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2"><path d="M5 12H3l9-9 9 9h-2" /><path d="M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /></svg>', 'Ver catálogo →'),
('Desarrollo de software', 'Sistemas a medida, automatización de procesos y soluciones empresariales personalizadas.', '<svg viewBox="0 0 24 24" fill="none" stroke="#7f77dd" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>', 'Solicitar proyecto →'),
('Aplicaciones móviles', 'Apps nativas y multiplataforma para iOS y Android. Desde el diseño hasta la publicación en tiendas.', '<svg viewBox="0 0 24 24" fill="none" stroke="#1d9e75" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></svg>', 'Ver portafolio →'),
('Páginas web profesionales', 'Sitios web rápidos, seguros y optimizados para SEO. Tiendas online, portafolios y corporativos.', '<svg viewBox="0 0 24 24" fill="none" stroke="#ba7517" strokeWidth="2"><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>', 'Solicitar diseño →'),
('Redes e infraestructura', 'Diseño, instalación y mantenimiento de redes LAN/WAN, servidores, cámaras y sistemas de seguridad.', '<svg viewBox="0 0 24 24" fill="none" stroke="#d85a30" strokeWidth="2"><rect x="2" y="2" width="20" height="8" rx="2" /><rect x="2" y="14" width="20" height="8" rx="2" /><line x1="6" y1="6" x2="6.01" y2="6" /><line x1="6" y1="18" x2="6.01" y2="18" /></svg>', 'Más información →');
