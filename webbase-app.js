(() => {
"use strict";
const $ = id => document.getElementById(id);
const db = window.WebBaseDB;
const state = { rows:[], admin:false, user:null, pending:[], editing:null };
const notice = (msg, bad=false) => { $("notice").textContent=msg; $("notice").className=bad?"error":""; };
const safe = v => String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s??"").trim().toLowerCase().replace(/ё/g,"е").replace(/\s+/g," ");
const qty = v => { if(v===null||v===undefined||v==="")return 0; const s=String(v).replace(/\s/g,"").replace(",","."); if(!/^\d+(?:\.0+)?$/.test(s))return null;const n=Number(s);return Number.isSafeInteger(n)&&n>=0?n:null; };
async function boot(){
 if(!db){$("authStatus").textContent="Не удалось загрузить Supabase SDK. Обновите страницу.";return;}
 db.client.auth.onAuthStateChange(()=>{setTimeout(()=>refreshSession().catch(e=>notice(e.message,true)),0);});
 await refreshSession();
 $("authForm").addEventListener("submit",async e=>{e.preventDefault();try{await db.signIn($("email").value,$("password").value);$("authStatus").textContent="Вход выполнен.";}catch(err){$("authStatus").textContent=err.message;}});
 $("refresh").onclick=()=>load().catch(e=>notice(e.message,true));
 $("search").oninput=render;$("category").onchange=render;
 $("excel").onchange=()=>previewImport().catch(e=>notice(e.message,true));
 $("saveStock").onclick=()=>saveStock().catch(e=>notice(e.message,true));
}
async function refreshSession(){
 const session=await db.getSession();state.user=session?.user||null;
 $("authPanel").hidden=!!state.user;$("workspace").hidden=!state.user;
 $("account").replaceChildren();
 if(!state.user){state.rows=[];return;}
 const button=document.createElement("button");button.className="secondary";button.textContent="Выйти";button.onclick=()=>db.signOut().catch(e=>notice(e.message,true));$("account").append(button);
 const {data,error}=await db.client.from("webbase_staff").select("role,active").eq("user_id",state.user.id).maybeSingle();
 if(error)throw error;
 if(!data?.active){$("workspace").hidden=true;$("authPanel").hidden=false;$("authStatus").textContent="Аккаунт "+state.user.email+" ещё не одобрен. Передайте администратору UUID: "+state.user.id;return;}
 state.admin=data.role==="admin";$("adminTools").hidden=!state.admin;
 await load();
}
async function load(){
 notice("Загружаю каталог…");
 const rows=[];for(let offset=0;;offset+=500){
 const {data,error}=await db.client.from("webbase_products").select("id,external_id,sku,name,category,model,memory,color,image_path,webbase_stock(warehouse,display,ldu)").eq("active",true).order("name").range(offset,offset+499);
 if(error)throw error;rows.push(...data);if(data.length<500)break;
 }
 state.rows=rows;
 const categories=[...new Set(rows.map(r=>r.category).filter(Boolean))].sort();
 const selected=$("category").value;$("category").innerHTML='<option value="">Все категории</option>'+categories.map(c=>'<option value="'+safe(c)+'">'+safe(c)+'</option>').join("");$("category").value=selected;
 notice(rows.length?"":"Каталог пока пуст. Администратор может импортировать выгрузку 1С.");render();
}
function render(){
 const search=norm($("search").value),category=$("category").value;
 const rows=state.rows.filter(r=>(!category||r.category===category)&&(!search||norm([r.name,r.sku,r.model,r.memory,r.color].join(" ")).includes(search)));
 $("count").textContent=rows.length+" товаров";
 const container=$("catalog");container.replaceChildren();
 for(const r of rows){
 const card=document.createElement("article");card.className="item";
 const st=r.webbase_stock||{};card.innerHTML='<span class="category">'+safe(r.category||"Другое")+'</span><h3>'+safe(r.name)+'</h3><p class="muted">Артикул: '+safe(r.sku||"—")+'</p><div class="stocks"><div><b>'+Number(st.display||0)+'</b><small>Витрина</small></div><div><b>'+Number(st.warehouse||0)+'</b><small>Склад</small></div></div>'+(st.ldu?'<p class="muted">LDU: '+Number(st.ldu)+'</p>':"");
 if(r.image_path){const img=document.createElement("img");img.alt=r.name;card.insertBefore(img,card.firstChild);db.getImageUrl(r.image_path).then(url=>{if(url)img.src=url}).catch(()=>{});}
 if(state.admin){const edit=document.createElement("button");edit.className="secondary";edit.textContent="Изменить остатки";edit.onclick=()=>{state.editing=r;$("editorName").textContent=r.name;$("warehouse").value=st.warehouse||0;$("display").value=st.display||0;$("ldu").value=st.ldu||0;$("editor").showModal();};card.append(edit);}
 container.append(card);
 }
}
async function saveStock(){
 if(!state.admin||!state.editing)return;
 const warehouse=qty($("warehouse").value),display=qty($("display").value),ldu=qty($("ldu").value);
 if([warehouse,display,ldu].some(x=>x===null))throw Error("Введите целые неотрицательные остатки.");
 const {error}=await db.client.from("webbase_stock").upsert({product_id:state.editing.id,warehouse,display,ldu,updated_at:new Date().toISOString(),updated_by:state.user.id},{onConflict:"product_id"});
 if(error)throw error;$("editor").close();await load();notice("Остатки сохранены.");
}

function classify(name){
 const s=norm(name);
 if(/^(смартфон|мобильный телефон)\s/.test(s))return "Смартфоны";
 if(/^планшет\s/.test(s))return "Планшеты";
 if(/^(смарт-часы|умные часы|часы)\s/.test(s))return "Смарт-часы";
 if(/^(фитнес-браслет|браслет)\s/.test(s))return "Фитнес-браслеты";
 if(/^(наушники|гарнитура|беспроводные наушники)\s/.test(s))return "Наушники";
 if(/^телевизор\s/.test(s))return "Телевизоры";
 if(/^(камера|видеокамера)\s/.test(s))return "Камеры";
 if(/^(пылесос|робот-пылесос)\s/.test(s))return "Пылесосы";
 if(/^(sim|сим-карта|сим карта)\b/i.test(s))return "SIM-карты";
 return "Аксессуары и другое";
}
function normalizeItemName(value){
 return String(value??"").replace(/^\s*\((?:ldu|лду)\)\s*/i,"").replace(/,\s*шт\s*\.?\s*$/i,"").replace(/\s+/g," ").trim();
}
function isDemo(row){
 return /\(\s*(?:ldu|лду)\s*\)/i.test(String(row[0]??"")+" "+String(row[3]??""));
}
function isPF(row){
 return /\(\s*(?:пф|pf)\s*\)/i.test(String(row[0]??"")+" "+String(row[3]??""));
}
async function previewImport(){
 state.pending=[];$("preview").replaceChildren();
 const file=$("excel").files?.[0];if(!file)return;
 if(!window.XLSX)throw Error("Не загрузилась библиотека Excel.");
 const workbook=XLSX.read(await file.arrayBuffer(),{type:"array"});
 const sheet=workbook.Sheets[workbook.SheetNames[0]];
 const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:"",raw:true});
 // Real 1C export: A=article, D=name, G=warehouse, H=defect, I=OV, J=total.
 const header=rows.findIndex(r=>norm(r[0]).includes("артикул")&&norm(r[3]).includes("номенклатура"));
 if(header<0)throw Error("Не найдены заголовки отчёта 1С (A: артикул, D: наименование). Импорт отменён.");
 const head=rows[header].map(norm);
 if(!head[6].includes("склад")||!head[8].includes("ов")||!head[9].includes("итого"))
   throw Error("Не совпадают колонки склада/витрины/итога. Импорт отменён.");
 const grouped=new Map(),review=[],excluded=[];
 for(let i=header+1;i<rows.length;i++){
   const r=rows[i],rawSku=String(r[0]??"").trim(),rawName=String(r[3]??"").trim();
   if(!rawName||!rawSku||norm(rawSku)==="итого")continue;
   if(isPF(r)){excluded.push(rawSku);continue;}
   const name=normalizeItemName(rawName),sku=rawSku.replace(/\s*\(\s*(?:ldu|лду)\s*\)?\s*$/i,"").trim();
   if(!name||!sku)continue;
   const warehouse=qty(r[6]),defect=qty(r[7]),ov=qty(r[8]),total=qty(r[9]);
   if([warehouse,defect,ov,total].some(x=>x===null)){review.push("Строка "+(i+1)+": неверное количество — "+name);continue;}
   if(warehouse+defect+ov!==total){review.push("Строка "+(i+1)+": G+H+I не равно J — "+name);continue;}
   // LDU is a display sample even if 1C places its count on the main warehouse.
   const demo=isDemo(r);
   const display=demo?warehouse+ov:ov;
   const stock=demo?0:warehouse;
   const key=norm(name);
   if(!grouped.has(key))grouped.set(key,{external_id:key,name,category:classify(name),skuList:new Set(),warehouse:0,display:0,ldu:0,defect:0});
   const p=grouped.get(key);p.skuList.add(sku);p.warehouse+=stock;p.display+=display;p.ldu+=demo?display:0;p.defect+=defect;
 }
 const candidates=[...grouped.values()].map(p=>({...p,sku:[...p.skuList].join(" / ")}));
 state.pending=candidates;
 const box=$("preview"),title=document.createElement("p");
 title.textContent="Карточек: "+candidates.length+" · LDU учтены на витрине · ПФ исключено: "+excluded.length+" · Спорных строк: "+review.length;
 box.append(title);
 if(review.length){const p=document.createElement("p");p.className="warn";p.textContent=review.slice(0,10).join(" | ");box.append(p);}
 const wrapper=document.createElement("div");wrapper.className="preview";
 const table=document.createElement("table");
 table.innerHTML="<tr><th>Артикул</th><th>Товар</th><th>Склад</th><th>ОВ</th><th>Брак</th></tr>"+candidates.slice(0,40).map(p=>"<tr><td>"+safe(p.sku)+"</td><td>"+safe(p.name)+"</td><td>"+p.warehouse+"</td><td>"+p.display+"</td><td>"+p.defect+"</td></tr>").join("");
 wrapper.append(table);box.append(wrapper);
 const button=document.createElement("button");button.textContent="Импортировать "+candidates.length+" карточек";
 button.disabled=!candidates.length||!!review.length;button.onclick=()=>applyImport(file.name).catch(e=>notice(e.message,true));box.append(button);
 if(review.length){const p=document.createElement("p");p.className="warn";p.textContent="Исправьте спорные строки в Excel. До этого импорт заблокирован.";box.append(p);}
 const warning=document.createElement("p");warning.className="muted";
 warning.textContent="ОВ включает LDU. Брак показывается только в предпросмотре и не прибавляется к доступному остатку. Существующие совпадающие карточки будут обновлены.";
 box.append(warning);
}
async function applyImport(filename){
 if(!state.admin||!state.pending.length)return;
 if(!confirm("Импортировать "+state.pending.length+" товаров в общую базу? Существующие совпадения будут обновлены."))return;
 notice("Сохраняю товары…");
 const {data:batch,error:batchError}=await db.client.from("webbase_imports").insert({filename,actor_id:state.user.id,status:"pending",recognized:state.pending.length}).select("id").single();
 if(batchError)throw batchError;
 try{
 for(let i=0;i<state.pending.length;i+=100){
 const part=state.pending.slice(i,i+100);
 const {data,error}=await db.client.from("webbase_products").upsert(part.map(({external_id,name,category,sku})=>({external_id,name,category,sku})),{onConflict:"external_id"}).select("id,external_id");
 if(error)throw error;
 const ids=new Map(data.map(r=>[r.external_id,r.id]));
 const {error:stockError}=await db.client.from("webbase_stock").upsert(part.map(p=>({product_id:ids.get(p.external_id),warehouse:p.warehouse,display:p.display,ldu:p.ldu,updated_by:state.user.id,updated_at:new Date().toISOString()})),{onConflict:"product_id"});
 if(stockError)throw stockError;
 }
 await db.client.from("webbase_imports").update({status:"applied"}).eq("id",batch.id);
 state.pending=[];await load();notice("Импорт завершён. Каталог обновлён.");
 }catch(e){await db.client.from("webbase_imports").update({status:"failed"}).eq("id",batch.id);throw Error("Импорт прерван. Часть строк могла сохраниться; проверьте остатки. "+e.message);}
}
boot().catch(e=>{console.error(e);$("authStatus").textContent=e.message;});
})();