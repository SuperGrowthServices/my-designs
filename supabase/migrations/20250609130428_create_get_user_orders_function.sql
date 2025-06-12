create or replace function get_user_orders(p_user_id uuid)
returns json
language plpgsql
as $$
begin
  return (
    select
      json_agg(
        json_build_object(
          'id', o.id,
          'created_at', o.created_at,
          'status', o.status,
          'is_paid', o.is_paid,
          'invoice', (
            select
              json_build_object(
                'invoice_url', i.invoice_url,
                'total_amount', i.total_amount
              )
            from invoices i where i.order_id = o.id limit 1
          ),
          'parts', (
            select
              json_agg(
                json_build_object(
                  'part_name', p.part_name,
                  'quantity', p.quantity
                )
              )
            from parts p where p.order_id = o.id
          ),
          'vehicle', (
            select
              json_build_object(
                'make', v.make,
                'model', v.model,
                'year', v.year
              )
            from parts p
            join vehicles v on p.vehicle_id = v.id
            where p.order_id = o.id
            limit 1
          )
        )
      )
    from
      orders o
    where
      o.user_id = p_user_id
      and o.status <> 'cancelled'
      and not (
        o.status in ('open', 'ready_for_checkout')
        and o.is_paid = false
      )
  );
end;
$$;
