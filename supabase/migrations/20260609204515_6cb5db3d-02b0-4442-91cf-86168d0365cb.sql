
DROP POLICY IF EXISTS "self joins as member" ON public.org_members;

CREATE POLICY "owner inserts membership"
ON public.org_members
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  AND EXISTS (
    SELECT 1 FROM public.organisations o
    WHERE o.id = org_id AND o.owner_id = auth.uid()
  )
);

CREATE POLICY "owner updates membership"
ON public.org_members
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.organisations o
    WHERE o.id = org_members.org_id AND o.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.organisations o
    WHERE o.id = org_members.org_id AND o.owner_id = auth.uid()
  )
);

CREATE OR REPLACE FUNCTION public.join_org_with_code(_code text)
RETURNS TABLE(org_id uuid, org_name text)
LANGUAGE plpgsql
VOLATILE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  _uid uuid := auth.uid();
  _org_id uuid;
  _org_name text;
BEGIN
  IF _uid IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF _code IS NULL OR length(trim(_code)) = 0 THEN RAISE EXCEPTION 'invalid code'; END IF;

  SELECT o.id, o.name INTO _org_id, _org_name
  FROM public.organisations o
  WHERE upper(o.join_code) = upper(trim(_code))
  LIMIT 1;

  IF _org_id IS NULL THEN RAISE EXCEPTION 'invalid code'; END IF;

  INSERT INTO public.org_members (org_id, user_id, role)
  VALUES (_org_id, _uid, 'member')
  ON CONFLICT DO NOTHING;

  org_id := _org_id;
  org_name := _org_name;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.join_org_with_code(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.join_org_with_code(text) TO authenticated;

DROP POLICY IF EXISTS "members read org" ON public.organisations;

CREATE POLICY "owner reads org"
ON public.organisations
FOR SELECT
TO authenticated
USING (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION public.get_member_org(_org_id uuid)
RETURNS TABLE(id uuid, name text, plan text, pilot_started_at timestamptz)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT o.id, o.name, o.plan, o.pilot_started_at
  FROM public.organisations o
  WHERE o.id = _org_id
    AND EXISTS (
      SELECT 1 FROM public.org_members m
      WHERE m.org_id = o.id AND m.user_id = auth.uid()
    );
$$;

REVOKE ALL ON FUNCTION public.get_member_org(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_member_org(uuid) TO authenticated;
