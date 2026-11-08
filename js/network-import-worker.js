// Private XLSX stays inside the employee browser; only validated rows go to RLS-protected staging.
importScripts('../vendor/xlsx-0.18.5.full.min.js');
onmessage=async({data})=>{try{const{parseNetworkWorkbook}=await import('./network-parser.js?v=20261108-1');const workbook=XLSX.read(data.buffer,{type:'array',cellStyles:true});postMessage({result:parseNetworkWorkbook(XLSX,workbook,{filename:data.filename})});}catch(error){postMessage({error:error.message||String(error)})}};
