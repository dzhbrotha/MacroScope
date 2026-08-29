-- 0002: let anyone read the indicator cache.
--
-- The modules are now readable without an account, but the cache was not: the
-- select policy from 0001 was scoped to authenticated, so every anonymous visit
-- got a 401 and fell back to calling the World Bank directly. That works, and
-- it is why nothing broke, but it turns a single cached query into nine live
-- ones and the quality of life index into a twenty five second wait on every
-- visit.
--
-- The table holds published World Bank series and nothing about any user, so
-- reading it needs no permission. Writing stays with authenticated readers, so
-- an anonymous visitor still cannot poison what everyone else reads.

drop policy if exists "Signed in users can read cache" on public.indicator_cache;

create policy "Anyone can read cache"
  on public.indicator_cache for select
  to anon, authenticated
  using (true);
