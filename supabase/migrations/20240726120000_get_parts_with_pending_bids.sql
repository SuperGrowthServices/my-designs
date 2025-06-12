create or replace function get_parts_with_pending_bids_for_user(user_id_param uuid)
returns table (
    id uuid,
    name text,
    vehicle text,
    order_id uuid,
    pending_bids_count bigint
) as $$
begin
    return query
    select
        p.id,
        p.name,
        p.vehicle,
        p.order_id,
        count(b.id) as pending_bids_count
    from
        parts p
    join
        orders o on p.order_id = o.id
    join
        bids b on p.id = b.part_id
    where
        o.user_id = user_id_param
        and b.status = 'pending'
    group by
        p.id, o.id
    having
        count(b.id) > 0;
end;
$$ language plpgsql; 