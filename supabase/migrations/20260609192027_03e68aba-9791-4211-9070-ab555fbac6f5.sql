
-- ROLES enum
CREATE TYPE public.user_role AS ENUM ('worker','business');

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL DEFAULT '',
  role public.user_role NOT NULL DEFAULT 'worker',
  onboarding_complete BOOLEAN NOT NULL DEFAULT false,
  hourly_rate NUMERIC(10,2) NOT NULL DEFAULT 14.50,
  weekly_target NUMERIC(10,2) NOT NULL DEFAULT 600.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own profile select" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "own profile insert" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "own profile update" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- ORGANISATIONS
CREATE TABLE public.organisations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  join_code TEXT NOT NULL UNIQUE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan TEXT NOT NULL DEFAULT 'pilot',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.organisations TO authenticated;
GRANT ALL ON public.organisations TO service_role;
ALTER TABLE public.organisations ENABLE ROW LEVEL SECURITY;

-- ORG MEMBERS
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organisations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member', -- 'owner' | 'admin' | 'member'
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, user_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- Security-definer helper: is user a member of org?
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID, _user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS(SELECT 1 FROM public.org_members WHERE org_id = _org_id AND user_id = _user_id);
$$;

CREATE POLICY "members read org" ON public.organisations FOR SELECT TO authenticated
  USING (public.is_org_member(id, auth.uid()) OR owner_id = auth.uid());
CREATE POLICY "owner creates org" ON public.organisations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());
CREATE POLICY "owner updates org" ON public.organisations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

CREATE POLICY "member reads own membership" ON public.org_members FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.is_org_member(org_id, auth.uid()));
CREATE POLICY "self joins as member" ON public.org_members FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "self leaves" ON public.org_members FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- SHIFTS (private to worker)
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workplace TEXT NOT NULL,
  shift_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INT NOT NULL DEFAULT 0,
  hourly_rate NUMERIC(10,2) NOT NULL,
  hours NUMERIC(8,2) NOT NULL,
  gross_pay NUMERIC(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.shifts TO authenticated;
GRANT ALL ON public.shifts TO service_role;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own shifts" ON public.shifts FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX shifts_user_date_idx ON public.shifts (user_id, shift_date DESC);

-- SAVINGS RULES (private to worker)
CREATE TABLE public.savings_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  rule_type TEXT NOT NULL DEFAULT 'shift-5', -- shift-1, shift-5, percent-3
  amount NUMERIC(10,2) NOT NULL DEFAULT 5,
  saved_total NUMERIC(12,2) NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.savings_rules TO authenticated;
GRANT ALL ON public.savings_rules TO service_role;
ALTER TABLE public.savings_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own savings" ON public.savings_rules FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AUTO-CREATE profile on signup using raw_user_meta_data
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.user_role, 'worker')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END; $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- AGGREGATE-ONLY function for business dashboard. No PII, no individual rows.
CREATE OR REPLACE FUNCTION public.get_org_aggregates(_org_id UUID)
RETURNS TABLE (
  active_workers INT,
  total_hours NUMERIC,
  engagement_pct INT,
  queries_avoided INT
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _is_member BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM public.org_members WHERE org_id = _org_id AND user_id = auth.uid())
    INTO _is_member;
  IF NOT _is_member THEN
    RAISE EXCEPTION 'not authorised';
  END IF;

  RETURN QUERY
  WITH members AS (
    SELECT user_id FROM public.org_members WHERE org_id = _org_id
  ),
  active AS (
    SELECT COUNT(DISTINCT s.user_id)::INT AS n
    FROM public.shifts s
    JOIN members m ON m.user_id = s.user_id
    WHERE s.shift_date >= (CURRENT_DATE - INTERVAL '30 days')
  ),
  hrs AS (
    SELECT COALESCE(SUM(s.hours),0)::NUMERIC AS h
    FROM public.shifts s
    JOIN members m ON m.user_id = s.user_id
    WHERE s.shift_date >= (CURRENT_DATE - INTERVAL '30 days')
  ),
  total AS (SELECT COUNT(*)::INT AS n FROM members)
  SELECT
    active.n,
    hrs.h,
    CASE WHEN total.n = 0 THEN 0 ELSE LEAST(100, ROUND(active.n::NUMERIC * 100 / total.n))::INT END,
    (active.n * 3)::INT
  FROM active, hrs, total;
END; $$;

GRANT EXECUTE ON FUNCTION public.get_org_aggregates(UUID) TO authenticated;

-- updated_at trigger for profiles
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profiles_touch BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER savings_touch BEFORE UPDATE ON public.savings_rules FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
