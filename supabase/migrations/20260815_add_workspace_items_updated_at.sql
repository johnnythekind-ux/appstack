alter table public.workspace_items
add column if not exists updated_at timestamptz not null default now();

create or replace function public.set_workspace_items_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists set_workspace_items_updated_at
on public.workspace_items;

update public.workspace_items
set updated_at = created_at;

create trigger set_workspace_items_updated_at
before update on public.workspace_items
for each row
execute function public.set_workspace_items_updated_at();