
-- Revoke EXECUTE from public/anon on all SECURITY DEFINER functions
-- and from authenticated on internal trigger functions that should not be callable via API.

REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_org_aggregates(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.get_member_org(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_org_with_code(text) FROM PUBLIC, anon;

-- Trigger-only functions: should never be called directly via the API by any role
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.promote_org_owner_to_business() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

-- Re-grant to service_role to keep admin paths working
GRANT EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_org_aggregates(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_member_org(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.join_org_with_code(text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.handle_new_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.promote_org_owner_to_business() TO service_role;
GRANT EXECUTE ON FUNCTION public.touch_updated_at() TO service_role;
