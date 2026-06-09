
-- Fix search_path on touch_updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- Revoke broad EXECUTE on security-definer helpers; keep only what callers need
REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.is_org_member(UUID, UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.get_org_aggregates(UUID) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.touch_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.is_org_member(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_org_aggregates(UUID) TO authenticated;
