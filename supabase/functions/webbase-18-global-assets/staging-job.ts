import {createClient} from 'npm:@supabase/supabase-js@2.95.0';
import manifest from './manifest.json' with {type:'json'};

// One-time, fixed-path maintenance job. It cannot accept an arbitrary path or URL.
// The worker secret stays in Vault and is sent only by a server-side pg_net call.
Deno.serve(async req => {
 if(req.method!=='POST')return new Response('Method not allowed',{status:405});
 const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
 const token=req.headers.get('x-webbase-worker')||'';
 const {data:allowed,error:authError}=await db.rpc('webbase_network_worker_auth',{p_token:token});
 if(authError||allowed!==true)return new Response('Forbidden',{status:403});
 const body=await req.json().catch(()=>null);
 if(!body||!['stage','verify','links'].includes(body.action))return new Response('Invalid action',{status:400});
 const results=[];
 for(const entry of manifest){
  try{
   if(body.action==='stage'){
    const {data,error}=await db.storage.from('webbase-products').createSignedUploadUrl(entry.path);
    if(error)throw error;
    results.push({path:entry.path,signedUrl:data.signedUrl});
   }else if(body.action==='links'){
    const {data,error}=await db.storage.from('webbase-products').createSignedUrl(entry.path,3600);
    if(error)throw error;
    results.push({path:entry.path,signedUrl:data.signedUrl});
   }else{
    const {data,error}=await db.storage.from('webbase-products').download(entry.path);
    if(error)throw error;
    const bytes=await data.arrayBuffer();
    const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');
    if(bytes.byteLength!==entry.byte_size||hash!==entry.sha256)throw Error('Checksum mismatch');
    results.push({path:entry.path,verified:true,bytes:bytes.byteLength});
   }
  }catch(error){results.push({path:entry.path,error:String(error)});}
 }
 return Response.json({action:body.action,results});
});
