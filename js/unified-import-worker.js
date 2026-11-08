// Parsing private XLSX data never blocks the main page or uploads the file itself.
importScripts('../vendor/xlsx-0.18.5.full.min.js');
onmessage=async({data})=>{try{
 const {parseUnifiedWorkbook}=await import('./unified-import.js?v=20261108-2');
 const workbook=XLSX.read(data.buffer,{type:'array',cellStyles:true});
 postMessage({result:parseUnifiedWorkbook(XLSX,workbook,{filename:data.filename})});
}catch(error){postMessage({error:error.message||String(error)})}};
