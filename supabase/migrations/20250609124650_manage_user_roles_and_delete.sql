-- Function to update user roles
create or replace function update_user_roles(p_user_id uuid, p_roles text[])
returns void as $$
begin
  -- First, remove all existing roles for the user from the user_roles table.
  delete from public.user_roles where user_id = p_user_id;

  -- Then, insert the new roles. The `unnest` function expands the array into a set of rows.
  if array_length(p_roles, 1) > 0 then
    insert into public.user_roles (user_id, role)
    select p_user_id, unnest(p_roles);
  end if;
end;
$$ language plpgsql security definer;

-- Function to delete a user. This is a protected action.
create or replace function delete_user_admin(p_user_id uuid)
returns void as $$
begin
  -- This requires the 'supabase_admin' client (or a client with the service_role key) to call.
  -- It permanently deletes the user from the auth.users table.
  perform auth.admin_delete_user(p_user_id);
end;
$$ language plpgsql security definer;
