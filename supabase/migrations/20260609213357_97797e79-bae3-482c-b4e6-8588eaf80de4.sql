
-- 1) handle_new_user: ignore client-supplied role; always default to 'worker'
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    'worker'::public.user_role
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $function$;

-- 2) Promote owner to 'business' when they create an organisation (server-side, RLS-checked path)
CREATE OR REPLACE FUNCTION public.promote_org_owner_to_business()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
     SET role = 'business'::public.user_role
   WHERE id = NEW.owner_id
     AND role IS DISTINCT FROM 'business'::public.user_role;
  RETURN NEW;
END; $$;

DROP TRIGGER IF EXISTS promote_owner_to_business ON public.organisations;
CREATE TRIGGER promote_owner_to_business
AFTER INSERT ON public.organisations
FOR EACH ROW EXECUTE FUNCTION public.promote_org_owner_to_business();

-- 3) Prevent org owners from deleting their own membership row
DROP POLICY IF EXISTS "self leaves" ON public.org_members;
CREATE POLICY "self leaves" ON public.org_members
FOR DELETE
USING (
  user_id = auth.uid()
  AND NOT EXISTS (
    SELECT 1 FROM public.organisations o
    WHERE o.id = org_members.org_id AND o.owner_id = auth.uid()
  )
);
