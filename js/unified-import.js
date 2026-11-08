import {parseNetworkWorkbook} from './network-parser.js?v=20261108-2';
import {networkKey} from './network-identity.js?v=20261107-25';

export function parseUnifiedWorkbook(XLSX,workbook,options={}) {
 for(const sheet of Object.values(workbook.Sheets)) {
  const rows=XLSX.utils.sheet_to_json(sheet,{header:1,range:0,defval:'',blankrows:true,raw:true});
  const header=rows.findIndex(row=>row.some(v=>/номенклатура/i.test(String(v)))&&row.some(v=>/^итого$/i.test(String(v).trim())));
  if(header<0)continue;
  const sku=rows[header].some(v=>/артикул/i.test(String(v)));
  const quantities=rows.slice(header+1,header+5).find(row=>row.filter(v=>/^количество$/i.test(String(v).trim())).length>0);
  if(!sku||(quantities&&quantities.filter(v=>/^количество$/i.test(String(v).trim())).length>4)) {
   return {type:'network',report:parseNetworkWorkbook(XLSX,{Sheets:{Report:sheet}},{filename:options.filename})};
  }
  return {type:'local',rows};
 }
 throw Error('Не найдены заголовки отчёта 1С. Выберите полный отчёт магазина или всей сети.');
}
export async function parseUnifiedFile(file) {
 if(file.size>15*1024*1024)throw Error('Размер файла должен быть не больше 15 МБ');
 const buffer=await file.arrayBuffer();
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',buffer))).map(v=>v.toString(16).padStart(2,'0')).join('');
 const worker=new Worker(new URL('./unified-import-worker.js?v=20261108-2',import.meta.url));
 const result=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>{worker.terminate();reject(Error('Не удалось проверить Excel за отведённое время'))},60000);
  worker.onmessage=({data})=>{clearTimeout(timer);worker.terminate();data.error?reject(Error(data.error)):resolve(data.result)};
  worker.onerror=error=>{clearTimeout(timer);worker.terminate();reject(Error(error.message||'Не удалось прочитать Excel'))};
  worker.postMessage({buffer,filename:file.name},[buffer]);
 });
 if(result.type==='network')Object.assign(result.report,{file_hash:hash});
 return result;
}
export function localNetworkPreview(report,warehouses) {
 const selected=report.columns.map((col,index)=>({index,...warehouses.find(w=>w.key===col.key)}))
  .filter(w=>w.webbase_network_stores?.is_local&&w.company==='smart_orange'&&w.reviewed&&!w.excluded&&['warehouse','display'].includes(w.kind));
 if(!selected.some(w=>w.kind==='warehouse')||!selected.some(w=>w.kind==='display'))throw Error('Не найдены склад и ОВ Европолиса Smart Orange. Общая загрузка не изменит остатки — проверьте соответствия в «Управление сетью».');
 const groups=new Map();
 for(const item of report.items) {
  if(/\(\s*(пф|pf)\s*\)/i.test(item.raw_name+' '+(item.source_skus||[]).join(' ')))continue;
  const key=networkKey(item.raw_name.replace(/(^|[ (])ldu([ )-]|$)/ig,' '));
  const group=groups.get(key)||{warehouse:0,display:0,ldu:0};
  for(const col of selected){const n=item.values[col.index];if(item.is_demo)group.ldu+=n;else group[col.kind]+=n;}
  groups.set(key,group);
 }
 const quantities=[...groups.values()].map(g=>({warehouse:Math.max(0,g.warehouse),display:Math.max(0,g.display)+Math.max(0,g.ldu),ldu:Math.max(0,g.ldu)}));
 return {columns:selected.map(w=>report.columns[w.index].raw_name),warehouse:quantities.reduce((n,g)=>n+g.warehouse,0),display:quantities.reduce((n,g)=>n+g.display,0),ldu:quantities.reduce((n,g)=>n+g.ldu,0),positions:quantities.filter(g=>g.warehouse||g.display).length};
}
async function rpc(db,name,args){const{data,error}=await db.client.rpc(name,args);if(error)throw error;return data;}
export async function applyUnifiedReport(db,report,progress=()=>{}) {
 const columns=report.columns.map((c,i)=>({...c,total:report.columnSums[i]}));
 const imp=await rpc(db,'webbase_network_begin',{p_meta:{...report,items:undefined,columns,item_count:report.items.length}});
 if(imp.status==='archived')throw Error('Этот отчёт уже заменён более свежим. Выберите актуальный файл.');
 if(imp.status==='staging')for(let i=0;i<report.items.length;i+=75){progress(`Передаю позиции ${Math.min(i+75,report.items.length)} из ${report.items.length}…`);await rpc(db,'webbase_network_stage',{p_import:imp.id,p_items:report.items.slice(i,i+75)});}
 progress('Обновляю сеть и Европолис одной транзакцией…');
 const result=await rpc(db,'webbase_unified_commit',{p_import:imp.id});
 db.client.functions?.invoke('webbase-network-enrich',{body:{}}).catch(()=>{});
 return result;
}
