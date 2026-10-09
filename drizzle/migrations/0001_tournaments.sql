ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS last_tournament_at timestamptz;
CREATE OR REPLACE FUNCTION public.report_tournament(_rounds int)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE pts int; last timestamptz;
BEGIN
  IF auth.uid() IS NULL THEN RETURN jsonb_build_object('applied', false); END IF;
  SELECT last_tournament_at INTO last FROM profiles WHERE id = auth.uid();
  IF last IS NOT NULL AND last > now() - interval '3 minutes' THEN RETURN jsonb_build_object('applied', false, 'reason', 'cooldown'); END IF;
  _rounds := greatest(0, least(3, _rounds));
  pts := CASE _rounds WHEN 3 THEN 40 WHEN 2 THEN 15 WHEN 1 THEN 5 ELSE -10 END;
  UPDATE profiles SET rating = greatest(0, rating + pts), last_tournament_at = now() WHERE id = auth.uid();
  RETURN jsonb_build_object('applied', true, 'points', pts);
END $$;
REVOKE ALL ON FUNCTION public.report_tournament(int) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.report_tournament(int) TO authenticated;