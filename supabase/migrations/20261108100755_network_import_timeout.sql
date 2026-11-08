-- Large 1C snapshots exceed the 8 s REST role default (measured ~25 s for 1614 items).
-- Exempt only administrative publication RPCs; search/read queries keep the usual limit.
alter function public.webbase_unified_commit(uuid) set statement_timeout='120s';
alter function public.webbase_network_commit(uuid) set statement_timeout='120s';
notify pgrst,'reload schema';
