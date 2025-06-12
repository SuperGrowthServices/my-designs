CREATE OR REPLACE FUNCTION public.update_part_shipping_status(part_id_arg uuid, new_status text, updater_id_arg uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = public
AS $function$
BEGIN
  -- Update the shipping status of the specified part in the 'parts' table
  UPDATE public.parts
  SET shipping_status = new_status
  WHERE id = part_id_arg;

  -- Insert a log entry into the part_activity_logs table, including who updated it
  INSERT INTO public.part_activity_logs(part_id, status, created_at, updated_by)
  VALUES (part_id_arg, new_status, NOW(), updater_id_arg);
END;
$function$; 