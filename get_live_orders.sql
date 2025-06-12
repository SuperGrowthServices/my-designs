CREATE OR REPLACE FUNCTION public.get_live_orders()
RETURNS jsonb
LANGUAGE plpgsql
AS $$
begin
  return (
    select
      jsonb_agg(
        jsonb_build_object(
          'order_id', o.id,
          'created_at', o.created_at,
          'order_status', o.status,
          'is_paid', o.is_paid,
          'customer_name', up.full_name,
          'customer_id', up.id,
          'customer_whatsapp', up.whatsapp_number,
          'invoice', (
            select jsonb_build_object(
              'total_amount', i.total_amount,
              'paid_at', i.paid_at,
              'delivery_address', i.delivery_address,
              'stripe_payment_intent_id', i.stripe_payment_intent_id,
              'subtotal', i.subtotal,
              'vat_amount', i.vat_amount,
              'service_fee', i.service_fee,
              'delivery_fee', i.delivery_fee,
              'delivery_option_name', del_opt.name,
              'delivery_option_estimated_days', del_opt.estimated_days
            ) 
            from invoices i
            left join delivery_options del_opt on i.delivery_option_id = del_opt.id
            where i.order_id = o.id limit 1
          ),
          'vehicles', (
            select jsonb_agg(distinct jsonb_build_object(
              'make', v.make,
              'model', v.model,
              'year', v.year
            ))
            from parts p
            join vehicles v on p.vehicle_id = v.id
            where p.order_id = o.id
          ),
          'part_count', (select count(*)::int from parts p_c where p_c.order_id = o.id),
          'parts', (
             select jsonb_agg(
               jsonb_build_object(
                 'part_name', p_d.part_name,
                 'description', p_d.description,
                 'quantity', p_d.quantity,
                 'shipping_status', p_d.shipping_status,
                 'vehicle', (
                    select jsonb_build_object(
                        'make', v.make,
                        'model', v.model,
                        'year', v.year
                    )
                    from vehicles v
                    where v.id = p_d.vehicle_id
                 ),
                 'bids', (
                   select jsonb_agg(
                     jsonb_build_object(
                       'price', b.price,
                       'vendor_name', v_up.business_name,
                       'status', b.status,
                       'vendor_whatsapp', v_up.whatsapp_number,
                       'vendor_pickup_address', (
                         select vpa.address 
                         from vendor_pickup_addresses vpa
                         where vpa.vendor_id = b.vendor_id and vpa.is_default = true
                         limit 1
                       ),
                       'vendor_maps_url', ( 
                         select vpa.google_maps_url
                         from vendor_pickup_addresses vpa
                         where vpa.vendor_id = b.vendor_id and vpa.is_default = true
                         limit 1
                       )
                     )
                   )
                   from bids b
                   join user_profiles v_up on b.vendor_id = v_up.id
                   where b.part_id = p_d.id
                 )
               )
             ) from parts p_d where p_d.order_id = o.id
          )
        )
      )
    from
      orders o
      join user_profiles up on o.user_id = up.id
    where
      o.status not in ('cancelled', 'refunded')
      and (
        o.status <> 'completed'
        or (
          o.status = 'completed' and exists (
            select 1
            from parts p
            where p.order_id = o.id and p.shipping_status is distinct from 'delivered'
          )
        )
      )
  );
end;
$$; 