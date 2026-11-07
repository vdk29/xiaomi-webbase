-- Device memory is not a model-car scale or a warehouse accounting code.
create or replace function public.webbase_network_key(value text) returns text language plpgsql immutable set search_path='' as $$
declare s text; m text[]; pair jsonb;
begin
 s:=lower(normalize(coalesce(value,''),NFKC)); s:=translate(s,'ё‐‑–—','е----');
 s:=replace(replace(replace(replace(s,'гб','gb'),'тб','tb'),'GB','gb'),'TB','tb');
 for m in select regexp_matches(s,'(([0-9]+)\s*(?:gb)?\s*[+/]\s*([0-9]+)(?:\s*(gb|tb))?)','g') loop
 if m[2]::int between 2 and 64 and (m[3]::int*(case when m[4]='tb' then 1024 else 1 end))>=16 then
 s:=replace(s,m[1],m[2]||'/'||(m[3]::int*case when m[4]='tb' then 1024 else 1 end)||'gb');end if;end loop;
 s:=regexp_replace(s,'xiaomi\s+(redmi|poco)\M','\1','g');
 for pair in select e.value from jsonb_array_elements('[["черный", "black"], ["чёрный", "black"], ["черная", "black"], ["чёрная", "black"], ["черное", "black"], ["белый", "white"], ["белая", "white"], ["белое", "white"], ["синий", "blue"], ["синяя", "blue"], ["голубой", "sky blue"], ["голубая", "sky blue"], ["зелёный", "green"], ["зеленый", "green"], ["зеленая", "green"], ["зелёная", "green"], ["красный", "red"], ["красная", "red"], ["розовый", "pink"], ["розовая", "pink"], ["фиолетовый", "purple"], ["фиолетовая", "purple"], ["серый", "gray"], ["серая", "gray"], ["серебристый", "silver"], ["оранжевый", "orange"], ["бежевый", "beige"], ["желтый", "yellow"], ["жёлтый", "yellow"]]'::jsonb) as e loop
 s:=regexp_replace(s,'(^|[[:space:](),])'||replace(pair->>0,'ё','е')||'($|[[:space:](),])','\1'||(pair->>1)||'\2','g');end loop;
 return trim(regexp_replace(translate(s,'()','  '),'\s+',' ','g'));
end;$$;

update public.webbase_network_warehouses set key=public.webbase_network_key(raw_name);
reindex index public.webbase_network_product_name_idx;
reindex index public.webbase_network_product_source_idx;
