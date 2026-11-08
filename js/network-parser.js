import {networkKey,networkProductFields,networkWarehouseKey,isDemoName} from './network-identity.js?v=20261107-25';
import {classifyProduct} from './importer.js?v=20261108-2';
const isNameHeader=value=>/^номенклатура(?:$|[,. ])/i.test(clean(value))&&!/артикул/i.test(clean(value));
// 1C can leave an article blank on a real leaf. The explicit unit distinguishes
// it from category/model headings; all row, warehouse and grand totals still apply.
const hasUnit=value=>/,\s*(?:шт\.?|компл\.?|упак\.?|пар[аы]?|набор|рул\.?|кг|м|л)\s*$/iu.test(value);
const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
function quantity(value,row,column){if(value===undefined||value===null||value==='')return 0;const n=typeof value==='number'?value:Number(String(value).replace(/[\s\u00a0]/g,'').replace(',','.'));if(!Number.isSafeInteger(n)||Math.abs(n)>10000000)throw Error(`Строка ${row}, колонка ${column}: некорректное количество`);return n;}
export function parseNetworkRows(rows,{levels=[],filename='report.xlsx'}={}) {
 if(rows.length>50000)throw Error('Слишком много строк');
 const header=rows.findIndex(row=>row.some(value=>isNameHeader(value))&&row.some(value=>/^итого$/i.test(clean(value))));
 if(header<0)throw Error('Не найдены заголовки «Номенклатура» и «Итого»');
 const nameColumn=rows[header].findIndex(value=>isNameHeader(value));
 const skuColumn=rows[header].findIndex(value=>/артикул/i.test(clean(value)));
 const rowName=row=>clean(row[nameColumn])||(skuColumn>=0&&/^итого(?:\s|$)/i.test(clean(row[skuColumn]))?clean(row[skuColumn]):'');
 const totalColumn=rows[header].findIndex(value=>/^итого$/i.test(clean(value)));
 const qtyRow=rows.slice(header+1,header+5).findIndex(row=>row.some(value=>/^количество$/i.test(clean(value))));
 if(qtyRow<0)throw Error('Не найдена строка заголовков количества');
 const start=header+qtyRow+2;
 const columns=[];for(let c=0;c<rows[header].length;c++){const raw=clean(rows[header][c]);if(c!==nameColumn&&c!==skuColumn&&c!==totalColumn&&raw&&/^количество$/i.test(clean(rows[start-1]?.[c])))columns.push({column:c,key:networkWarehouseKey(raw),raw_name:raw});}
 if(!columns.length||new Set(columns.map(x=>x.key)).size!==columns.length)throw Error('Склады отсутствуют или заголовки дублируются');
 const finalRows=rows.map((r,i)=>({r,i})).filter(({r,i})=>i>=start&&/^итого(?:\s|$)/i.test(rowName(r)));
 const final=finalRows.at(-1);if(!final)throw Error('Нет общего итога отчёта');
 const haveHierarchy=levels.slice(start,final.i).some(level=>Number(level)>0);
 if(!haveHierarchy&&skuColumn<0)throw Error('В отчёте нет уровней группировки строк. Сохраните выгрузку 1С в XLSX с исходной структурой: так можно безопасно исключить промежуточные итоги.');
 const items=[],skipped=[],columnSums=columns.map(()=>0);let total=0,negative=0;const seen=new Set();
 for(let i=start;i<final.i;i++){
  const row=rows[i];let name=rowName(row);if(!name)continue;
  const next=rows.findIndex((r,j)=>j>i&&rowName(r));
  const blankSkuLeaf=skuColumn>=0&&!clean(row[skuColumn])&&hasUnit(name)&&!(haveHierarchy&&next>=0&&Number(levels[next]||0)>Number(levels[i]||0));
  if(/^итого(?:\s|$)/i.test(name)||(skuColumn>=0&&!clean(row[skuColumn])&&!blankSkuLeaf)||(skuColumn<0&&next>=0&&Number(levels[next]||0)>Number(levels[i]||0))){skipped.push({row:i+1,name,reason:'group_or_subtotal'});continue;}
  const sku=skuColumn>=0?clean(row[skuColumn]):'';const sourceName=name;if(isDemoName(sku)&&!isDemoName(name))name='(LDU) '+name;const sourceSkus=sku?[sku]:[];
  const key=networkKey(name);if(seen.has(key))throw Error(`Повторная товарная строка ${i+1}: ${name}`);seen.add(key);
  const values=columns.map((col,j)=>{const n=quantity(row[col.column],i+1,col.column+1);columnSums[j]+=n;if(n<0)negative++;return n;});
  const rowTotal=quantity(row[totalColumn],i+1,totalColumn+1);if(values.reduce((a,b)=>a+b,0)!==rowTotal)throw Error(`Строка ${i+1}: сумма складов не совпадает с итогом`);
  total+=rowTotal;items.push({key,raw_name:name,source_raw_name:sourceName,source_skus:sourceSkus,row:i+1,...networkProductFields(name),category:classifyProduct(name.replace(/^\(LDU\)\s*/i,'')),values,total:rowTotal});
 }
 const skuSeen=new Set();for(const item of items)for(const sku of item.source_skus){const id=(item.is_demo?'ldu:':'normal:')+sku.toLowerCase();if(skuSeen.has(id))throw Error(`Артикул ${sku} повторяется у разных товаров. Импорт отменён.`);skuSeen.add(id);}
 const expected=quantity(final.r[totalColumn],final.i+1,totalColumn+1);
 if(total!==expected)throw Error(`Сумма товаров ${total} не совпадает с общим итогом ${expected}`);
 columns.forEach((column,j)=>{if(columnSums[j]!==quantity(final.r[column.column],final.i+1,column.column+1))throw Error(`Итог склада «${column.raw_name}» не совпадает с товарными строками`);});
 const dateText=rows.slice(0,header).flat().map(clean).join(' ');const date=dateText.match(/(?:Период:|Дата[^:]*:)\s*(\d{2})\.(\d{2})\.(\d{4})/i);if(!date)throw Error('Не найдена дата отчёта');
 const report_date=`${date[3]}-${date[2]}-${date[1]}`;if(new Date(report_date).toISOString().slice(0,10)!==report_date)throw Error('Некорректная дата отчёта');
 return {filename,report_date,columns,items,skipped,total,negative,columnSums,headerRow:header+1,totalRow:final.i+1,version:1};
}
export function parseNetworkWorkbook(XLSX,workbook,options={}) {
 const sheet=workbook.Sheets.TDSheet||Object.values(workbook.Sheets).find(sheet=>Object.values(sheet).some(cell=>isNameHeader(cell?.v)));
 if(!sheet)throw Error('Не найден лист отчёта');
 const rows=XLSX.utils.sheet_to_json(sheet,{header:1,range:0,defval:null,blankrows:true});
 return parseNetworkRows(rows,{...options,levels:rows.map((_,i)=>sheet['!rows']?.[i]?.level||0)});
}
