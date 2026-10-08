CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text NOT NULL UNIQUE,
  rating integer NOT NULL DEFAULT 0,
  wins integer NOT NULL DEFAULT 0,
  losses integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon, authenticated;
GRANT UPDATE (username) ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles are public" ON public.profiles FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Users rename themselves" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE INDEX profiles_rating_idx ON public.profiles (rating DESC);

CREATE TABLE public.match_reports (
  match_id text NOT NULL,
  reporter uuid NOT NULL,
  opponent uuid NOT NULL,
  won boolean NOT NULL,
  applied boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (match_id, reporter)
);
GRANT ALL ON public.match_reports TO service_role;
ALTER TABLE public.match_reports ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE base text; uname text; n int := 0;
BEGIN
  base := regexp_replace(coalesce(NEW.raw_user_meta_data->>'username', NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1), 'player'), '[^A-Za-z0-9_]', '', 'g');
  base := left(nullif(base,''), 16);
  IF base IS NULL THEN base := 'player'; END IF;
  uname := base;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE lower(username) = lower(uname)) LOOP
    n := n + 1; uname := base || (floor(random()*9000)+1000)::int;
    EXIT WHEN n > 20;
  END LOOP;
  INSERT INTO public.profiles (id, username) VALUES (NEW.id, uname);
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE OR REPLACE FUNCTION public.report_result(_match text, _opponent uuid, _won boolean)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE me uuid := auth.uid(); other public.match_reports; mine public.match_reports; w uuid; l uuid;
BEGIN
  IF me IS NULL OR _opponent IS NULL OR me = _opponent OR length(_match) < 8 OR length(_match) > 64 THEN
    RETURN json_build_object('applied', false, 'error', 'invalid');
  END IF;
  INSERT INTO public.match_reports (match_id, reporter, opponent, won)
  VALUES (_match, me, _opponent, _won) ON CONFLICT DO NOTHING;
  SELECT * INTO mine FROM public.match_reports WHERE match_id = _match AND reporter = me FOR UPDATE;
  SELECT * INTO other FROM public.match_reports WHERE match_id = _match AND reporter = _opponent FOR UPDATE;
  IF other IS NULL OR mine.applied OR other.applied OR other.opponent <> me OR mine.opponent <> _opponent OR other.won = mine.won THEN
    RETURN json_build_object('applied', false);
  END IF;
  IF mine.won THEN w := me; l := _opponent; ELSE w := _opponent; l := me; END IF;
  UPDATE public.profiles SET rating = rating + 25, wins = wins + 1 WHERE id = w;
  UPDATE public.profiles SET rating = greatest(0, rating - 20), losses = losses + 1 WHERE id = l;
  UPDATE public.match_reports SET applied = true WHERE match_id = _match;
  RETURN json_build_object('applied', true);
END $$;
REVOKE ALL ON FUNCTION public.report_result(text, uuid, boolean) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.report_result(text, uuid, boolean) TO authenticated;
REVOKE ALL ON FUNCTION public.handle_new_user() FROM public, anon, authenticated;