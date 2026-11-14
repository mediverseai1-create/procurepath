-- ProcurePath schema. Run in the Supabase SQL editor (or `supabase db push`).
create extension if not exists pgcrypto;

create table organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free' check (plan in ('free','growth','scale')),
  subscription_status text not null default 'none',
  created_at timestamptz not null default now()
);

create table memberships (
  user_id uuid not null references auth.users(id) on delete cascade,
  org_id uuid not null references organizations(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin','approver','requester')),
  primary key (user_id, org_id)
);

create or replace function is_member(o uuid) returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from memberships where org_id = o and user_id = auth.uid()) $$;

create or replace function is_admin(o uuid) returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from memberships where org_id = o and user_id = auth.uid() and role = 'admin') $$;

-- Every new user gets an organization and an admin membership.
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
declare o uuid;
begin
  insert into organizations(name) values (coalesce(new.raw_user_meta_data->>'company', 'My company')) returning id into o;
  insert into memberships(user_id, org_id, role) values (new.id, o, 'admin');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();

create table vendors (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  category text,
  contact_email text,
  country text,
  status text not null default 'pending' check (status in ('pending','approved','blocked')),
  has_soc2 boolean not null default false,
  has_dpa boolean not null default false,
  handles_pii boolean not null default false,
  years_in_business int,
  risk_score int,
  risk_tier text,
  risk_notes text,
  created_at timestamptz not null default now()
);

create table requests (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  requester_id uuid not null references auth.users(id),
  title text not null,
  description text,
  category text,
  vendor_id uuid references vendors(id) on delete set null,
  amount numeric(14,2) not null check (amount >= 0),
  currency text not null default 'USD',
  needed_by date,
  status text not null default 'pending_approval'
    check (status in ('draft','pending_approval','approved','rejected','ordered')),
  required_steps text[] not null default '{}',
  ai_summary text,
  created_at timestamptz not null default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  request_id uuid not null references requests(id) on delete cascade,
  step text not null,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  decided_by uuid references auth.users(id),
  comment text,
  decided_at timestamptz,
  created_at timestamptz not null default now()
);

create table rfx_projects (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  request_id uuid references requests(id) on delete set null,
  title text not null,
  brief text,
  criteria jsonb not null default '[]',
  status text not null default 'open' check (status in ('open','awarded','closed')),
  created_at timestamptz not null default now()
);

create table bids (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  rfx_id uuid not null references rfx_projects(id) on delete cascade,
  vendor_id uuid not null references vendors(id) on delete cascade,
  price numeric(14,2) not null,
  scores jsonb not null default '{}',
  notes text,
  created_at timestamptz not null default now()
);

create table contracts (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  vendor_id uuid references vendors(id) on delete set null,
  title text not null,
  value numeric(14,2) not null default 0,
  start_date date,
  end_date date,
  auto_renew boolean not null default false,
  notice_days int not null default 30,
  body text,
  ai_review jsonb,
  created_at timestamptz not null default now()
);

create table purchase_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  request_id uuid references requests(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  po_number text not null,
  amount numeric(14,2) not null,
  received_amount numeric(14,2) not null default 0,
  status text not null default 'open' check (status in ('open','closed')),
  created_at timestamptz not null default now(),
  unique (org_id, po_number)
);

create table invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  po_id uuid references purchase_orders(id) on delete set null,
  vendor_id uuid references vendors(id) on delete set null,
  invoice_number text not null,
  amount numeric(14,2) not null,
  status text not null default 'review' check (status in ('review','matched','exception','paid')),
  match_result jsonb,
  created_at timestamptz not null default now()
);

create table usage_events (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references organizations(id) on delete cascade,
  kind text not null,
  created_at timestamptz not null default now()
);

-- Webhook idempotency log. RLS on, no policies: service role only.
create table payment_events (
  id text primary key,
  org_id uuid references organizations(id) on delete set null,
  type text,
  payload jsonb,
  created_at timestamptz not null default now()
);

create index on requests(org_id, created_at desc);
create index on approvals(request_id);
create index on usage_events(org_id, created_at);

-- Row Level Security
alter table organizations enable row level security;
alter table memberships enable row level security;
alter table payment_events enable row level security;
create policy org_read on organizations for select using (is_member(id));
create policy org_update on organizations for update using (is_admin(id)) with check (is_admin(id));
create policy mem_read on memberships for select using (is_member(org_id));

create or replace function can_approve(o uuid) returns boolean
language sql security definer stable set search_path = public as
$$ select exists (select 1 from memberships where org_id = o and user_id = auth.uid() and role in ('admin','approver')) $$;

do $$ declare t text; begin
  -- approvals and requests are updated only by approvers/admins (decisions); requesters cannot self-approve via the API.
  foreach t in array array['vendors','requests','approvals','rfx_projects','bids','contracts','purchase_orders','invoices','usage_events'] loop
    execute format('alter table %I enable row level security', t);
    execute format('create policy %I_sel on %I for select using (is_member(org_id))', t, t);
    execute format('create policy %I_ins on %I for insert with check (is_member(org_id))', t, t);
    execute format('create policy %I_upd on %I for update using (is_member(org_id)) with check (is_member(org_id))', t, t);
    execute format('create policy %I_del on %I for delete using (is_admin(org_id))', t, t);
  end loop;
end $$;

drop policy requests_upd on requests;
drop policy approvals_upd on approvals;
create policy requests_upd on requests for update using (can_approve(org_id)) with check (can_approve(org_id));
create policy approvals_upd on approvals for update using (can_approve(org_id)) with check (can_approve(org_id));

-- Plan and subscription columns are not editable from the client.
revoke update on organizations from authenticated;
grant update (name) on organizations to authenticated;
