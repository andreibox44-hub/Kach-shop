-- База данных для личного кабинета KACH.
-- Как применить: Supabase → ваш проект → SQL Editor → New query → вставьте весь этот файл → Run.
-- Запускать можно повторно: ничего не сломается.

-- 1. Профили покупателей
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text default '',
  email text default '',
  phone text default '',
  addresses jsonb not null default '[]'::jsonb,
  favorites jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);

drop policy if exists "profiles: insert own" on public.profiles;
create policy "profiles: insert own" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own" on public.profiles
  for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

-- Профиль создаётся автоматически при регистрации (по почте или через Google)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', ''),
    coalesce(new.email, '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Заказы (видны вам в Supabase → Table Editor → orders)
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  number text not null,
  user_id uuid references auth.users (id) on delete set null,
  customer jsonb not null,
  items jsonb not null,
  total numeric,
  status text not null default 'new',
  created_at timestamptz not null default now()
);

create index if not exists orders_user_id_idx on public.orders (user_id);

alter table public.orders enable row level security;

-- Оформить заказ может любой посетитель: гость (user_id пустой) или вошедший покупатель (только на себя)
drop policy if exists "orders: create" on public.orders;
create policy "orders: create" on public.orders
  for insert to anon, authenticated
  with check (user_id is null or user_id = (select auth.uid()));

-- Покупатель видит только свои заказы
drop policy if exists "orders: read own" on public.orders;
create policy "orders: read own" on public.orders
  for select to authenticated using (user_id = (select auth.uid()));

-- 3. Онлайн-оплата (Stripe, PayPal). Отметку «оплачен» ставит только функция payments.
alter table public.orders
  add column if not exists pay_token uuid unique,
  add column if not exists payment_status text not null default 'unpaid',
  add column if not exists payment_provider text,
  add column if not exists payment_ref text,
  add column if not exists paid_amount numeric,
  add column if not exists currency text,
  add column if not exists paid_at timestamptz;

alter policy "orders: create" on public.orders
  with check (
    (user_id is null or user_id = (select auth.uid()))
    and status = 'new' and payment_status = 'unpaid'
    and payment_provider is null and payment_ref is null and paid_amount is null and paid_at is null
  );

-- Цены для оплаты (в евро). Должны совпадать с ценами в js/products.js.
create table if not exists public.product_prices (
  product_id text not null,
  size text not null,
  price numeric(10,2) not null check (price > 0),
  primary key (product_id, size)
);
alter table public.product_prices enable row level security;
drop policy if exists "prices: read all" on public.product_prices;
create policy "prices: read all" on public.product_prices for select to anon, authenticated using (true);
