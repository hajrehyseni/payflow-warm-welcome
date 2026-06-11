
-- 1) Restrict org_members SELECT to self only
DROP POLICY IF EXISTS "member reads own membership" ON public.org_members;
CREATE POLICY "member reads own membership"
  ON public.org_members
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Owners need to see all members of their org
CREATE POLICY "owner reads org members"
  ON public.org_members
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.organisations o
    WHERE o.id = org_members.org_id AND o.owner_id = auth.uid()
  ));

-- 2) Revoke EXECUTE from anon/public on SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_org_aggregates(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.get_member_org(uuid) FROM anon, public;
REVOKE EXECUTE ON FUNCTION public.join_org_with_code(text) FROM anon, public;

GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_aggregates(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_member_org(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.join_org_with_code(text) TO authenticated;
