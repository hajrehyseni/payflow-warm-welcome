DROP POLICY IF EXISTS "self leaves" ON public.org_members;
CREATE POLICY "self leaves" ON public.org_members
  FOR DELETE TO authenticated
  USING (
    (user_id = auth.uid())
    AND NOT EXISTS (
      SELECT 1 FROM public.organisations o
      WHERE o.id = org_members.org_id AND o.owner_id = auth.uid()
    )
  );