DECLARE
    result JSONB;
BEGIN
    WITH latest_part_status AS (
        SELECT
            part_id,
            FIRST_VALUE(status) OVER (PARTITION BY part_id ORDER BY created_at DESC) as last_status
        FROM part_activity_logs
    )
    SELECT jsonb_agg(
        jsonb_build_object(
            'part_id', p.id,
            'part_name', p.part_name,
            'quantity', p.quantity,
            'order_id', o.id,
            'order_created_at', o.created_at,
            'current_status', COALESCE(lps.last_status, 'pending_pickup'),
            'delivery_info', jsonb_build_object(
                'option_name', del_opt.name,
                'estimated_days', del_opt.estimated_days,
                'delivery_address', inv.delivery_address,
                'customer_name', up.full_name,
                'whatsapp_number', up.whatsapp_number,
                'google_maps_url', up.google_maps_url
            ),
            'vendor_info', (
                SELECT
                    jsonb_build_object(
                        'name', v_up.business_name,
                        'whatsapp_number', v_up.whatsapp_number,
                        'pickup_address', vpa.address,
                        'google_maps_url', vpa.google_maps_url
                    )
                FROM bids b
                JOIN user_profiles v_up ON b.vendor_id = v_up.id
                JOIN vendor_pickup_addresses vpa ON v_up.id = vpa.vendor_id AND vpa.is_default = true
                WHERE b.part_id = p.id AND b.status = 'accepted'
                LIMIT 1
            )
        )
    )
    INTO result
    FROM parts p
    JOIN orders o ON p.order_id = o.id
    JOIN user_profiles up ON o.user_id = up.id
    JOIN invoices inv ON o.id = inv.order_id
    LEFT JOIN delivery_options del_opt ON inv.delivery_option_id = del_opt.id
    LEFT JOIN latest_part_status lps ON p.id = lps.part_id
    WHERE
        o.is_paid = true
        AND COALESCE(lps.last_status, 'pending_pickup') != 'delivered'
        AND EXISTS (
            SELECT 1
            FROM bids b
            WHERE b.part_id = p.id AND b.status = 'accepted'
        );

    RETURN COALESCE(result, '[]'::jsonb);
END; 