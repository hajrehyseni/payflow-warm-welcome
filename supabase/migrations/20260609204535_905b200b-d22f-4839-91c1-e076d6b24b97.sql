
REVOKE EXECUTE ON FUNCTION public.get_org_aggregates(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.is_org_member(uuid, uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.join_org_with_code(text) FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_member_org(uuid) FROM anon;
