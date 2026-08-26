create table if not exists public.ai_usage (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  request_type text not null default 'workspace_ai',
  created_at timestamptz not null default now()
);

alter table public.ai_usage enable row level security;

create policy "Users can read own ai usage"
on public.ai_usage
for select
to authenticated
using (auth.uid() = user_id);

create policy "Users can insert own ai usage"
on public.ai_usage
for insert
to authenticated
with check (auth.uid() = user_id);

create index if not exists ai_usage_user_id_created_at_idx
on public.ai_usage(user_id, created_at);