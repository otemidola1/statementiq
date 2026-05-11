-- 1. profiles
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.profiles enable row level security;
create policy "Users can view own profile." on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile." on public.profiles for update using (auth.uid() = id);

-- 2. upload_batches
create table public.upload_batches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  status text not null default 'pending',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.upload_batches enable row level security;
create policy "Users can view own batches." on public.upload_batches for select using (auth.uid() = user_id);
create policy "Users can insert own batches." on public.upload_batches for insert with check (auth.uid() = user_id);

-- 3. source_files
create table public.source_files (
  id uuid default gen_random_uuid() primary key,
  batch_id uuid references public.upload_batches on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  file_name text not null,
  file_url text not null,
  status text not null default 'processing',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.source_files enable row level security;
create policy "Users can view own files." on public.source_files for select using (auth.uid() = user_id);
create policy "Users can insert own files." on public.source_files for insert with check (auth.uid() = user_id);

-- 4. transactions
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  file_id uuid references public.source_files on delete cascade,
  transaction_date date not null,
  description text not null,
  amount numeric not null,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.transactions enable row level security;
create policy "Users can view own transactions." on public.transactions for select using (auth.uid() = user_id);
create policy "Users can insert own transactions." on public.transactions for insert with check (auth.uid() = user_id);
create policy "Users can update own transactions." on public.transactions for update using (auth.uid() = user_id);

-- 5. recurring_charges
create table public.recurring_charges (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  merchant_name text not null,
  amount numeric not null,
  frequency text not null,
  next_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.recurring_charges enable row level security;
create policy "Users can view own recurring charges." on public.recurring_charges for select using (auth.uid() = user_id);
create policy "Users can insert own recurring charges." on public.recurring_charges for insert with check (auth.uid() = user_id);

-- 6. anomaly_flags
create table public.anomaly_flags (
  id uuid default gen_random_uuid() primary key,
  transaction_id uuid references public.transactions on delete cascade not null,
  user_id uuid references public.profiles on delete cascade not null,
  flag_type text not null,
  severity text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.anomaly_flags enable row level security;
create policy "Users can view own flags." on public.anomaly_flags for select using (auth.uid() = user_id);
create policy "Users can insert own flags." on public.anomaly_flags for insert with check (auth.uid() = user_id);

-- 7. reports
create table public.reports (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  report_type text not null,
  report_url text not null,
  share_token text,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.reports enable row level security;
create policy "Users can view own reports." on public.reports for select using (auth.uid() = user_id);
create policy "Users can insert own reports." on public.reports for insert with check (auth.uid() = user_id);

-- 8. clients
create table public.clients (
  id uuid default gen_random_uuid() primary key,
  accountant_id uuid references public.profiles on delete cascade not null,
  client_name text not null,
  client_email text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.clients enable row level security;
create policy "Accountants can view own clients." on public.clients for select using (auth.uid() = accountant_id);
create policy "Accountants can manage own clients." on public.clients for all using (auth.uid() = accountant_id);

-- 9. merchant_category_overrides
create table public.merchant_category_overrides (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  merchant_name text not null,
  new_category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.merchant_category_overrides enable row level security;
create policy "Users can manage own overrides." on public.merchant_category_overrides for all using (auth.uid() = user_id);

-- 10. subscriptions
create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  plan_name text not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.subscriptions enable row level security;
create policy "Users can view own subscriptions." on public.subscriptions for select using (auth.uid() = user_id);

-- 11. merchant_category_map
create table public.merchant_category_map (
  id uuid default gen_random_uuid() primary key,
  merchant_name text not null unique,
  category text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
alter table public.merchant_category_map enable row level security;
create policy "Anyone can read global map." on public.merchant_category_map for select using (true);
