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
 $("register").onclick=async()=>{try{const {error}=await db.client.auth.signUp({email:$("email").value,password:$("password").value});if(error)throw error;$("authStatus").textContent="Аккаунт создан. Подтвердите почту, если требуется, и дождитесь одобрения администратора.";}catch(e){$("authStatus").textContent=e.message;}};
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
 const st=r.webbase_stock||{};card.innerHTML='<span class="category">'+safe(r.category||"Другое")+'</span><h3>'+safe(r.name)+'</h3><div class="stocks"><div><b>'+Number(st.display||0)+'</b><small>Витрина</small></div><div><b>'+Number(st.warehouse||0)+'</b><small>Склад</small></div></div>'+(st.ldu?'<p class="muted">LDU: '+Number(st.ldu)+'</p>':"");
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
 if(/^(итого|всего|номенклатура|остатки|товары|группа|подгруппа)$/.test(s)||/^(итого|всего)\s*[:(]/.test(s)||/\bpf\b/i.test(name))return null;
 if(/^(смартфоны|планшеты|телевизоры|наушники|аксессуары|смарт-часы|фитнес-браслеты|камеры|пылесосы)$/.test(s))return null;
 const groups=[["Аксессуары",/^(чехол|стекло|пленка|плёнка|кабель|зарядное устройство|зарядка|ремешок|адаптер|блок питания)\b/i],["Смартфоны",/^смартфон\s/i],["Планшеты",/^планшет\s/i],["Смарт-часы",/^(смарт-часы|умные часы)\s/i],["Фитнес-браслеты",/^фитнес-браслет\s/i],["Наушники",/^(наушники|гарнитура)\s/i],["Телевизоры",/^телевизор\s/i],["Камеры",/^камера\s/i],["Пылесосы",/^(пылесос|робот-пылесос)\s/i]];
 return groups.find(([_,re])=>re.test(name))?.[0]||null;
}
async function previewImport(){
 state.pending=[];$("preview").replaceChildren();const file=$("excel").files?.[0];if(!file)return;
 if(!window.XLSX)throw Error("Не загрузилась библиотека Excel.");
 const workbook=XLSX.read(await file.arrayBuffer(),{type:"array"}),sheet=workbook.Sheets[workbook.SheetNames[0]];
 const rows=XLSX.utils.sheet_to_json(sheet,{header:1,defval:"",raw:true});
 const candidates=[],review=[],seen=new Set();
 for(let i=0;i<rows.length;i++){
 const r=rows[i],name=String(r[0]??"").trim();
 if(!name||/\bpf\b/i.test(name))continue;
 const category=classify(name);if(!category)continue;
 const warehouse=qty(r[4]),display=qty(r[6]),total=qty(r[7]);
 if([warehouse,display,total].some(v=>v===null)){review.push("Строка "+(i+1)+": неверные остатки — "+name);continue;}
 if(total!==warehouse+display){review.push("Строка "+(i+1)+": итог не равен сумме склада и витрины — "+name);continue;}
 const key=norm(name);if(seen.has(key)){review.push("Строка "+(i+1)+": повтор — "+name);continue;}seen.add(key);
 candidates.push({external_id:key,name,category,warehouse,display});
 }
 state.pending=candidates;
 const box=$("preview");const title=document.createElement("p");title.textContent="К импорту: "+candidates.length+" · На проверку: "+review.length+" · Всего строк: "+rows.length;box.append(title);
 if(review.length){const p=document.createElement("p");p.className="warn";p.textContent=review.slice(0,8).join(" | ");box.append(p);}
 const wrapper=document.createElement("div");wrapper.className="preview";const table=document.createElement("table");table.innerHTML="<tr><th>Товар</th><th>Склад</th><th>Витрина</th></tr>"+candidates.slice(0,30).map(p=>"<tr><td>"+safe(p.name)+"</td><td>"+p.warehouse+"</td><td>"+p.display+"</td></tr>").join("");wrapper.append(table);box.append(wrapper);
 const button=document.createElement("button");button.textContent="Подтвердить импорт ("+candidates.length+")";button.disabled=!candidates.length||!!review.length;button.onclick=()=>applyImport(file.name).catch(e=>notice(e.message,true));box.append(button);
 if(review.length){const p=document.createElement("p");p.className="warn";p.textContent="Импорт заблокирован до исправления спорных строк. Это предотвращает повреждение остатков.";box.append(p);}
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
 const {data,error}=await db.client.from("webbase_products").upsert(part.map(({external_id,name,category})=>({external_id,name,category})),{onConflict:"external_id"}).select("id,external_id");
 if(error)throw error;
 const ids=new Map(data.map(r=>[r.external_id,r.id]));
 const {error:stockError}=await db.client.from("webbase_stock").upsert(part.map(p=>({product_id:ids.get(p.external_id),warehouse:p.warehouse,display:p.display,updated_by:state.user.id,updated_at:new Date().toISOString()})),{onConflict:"product_id"});
 if(stockError)throw stockError;
 }
 await db.client.from("webbase_imports").update({status:"applied"}).eq("id",batch.id);
 state.pending=[];await load();notice("Импорт завершён. Каталог обновлён.");
 }catch(e){await db.client.from("webbase_imports").update({status:"failed"}).eq("id",batch.id);throw Error("Импорт прерван. Часть строк могла сохраниться; проверьте остатки. "+e.message);}
}
boot().catch(e=>{console.error(e);$("authStatus").textContent=e.message;});
})();