import * as T from '../vendor/three-0.160.1.module.min.js';
import {RGBELoader} from '../vendor/three-addons-0.160.1/RGBELoader.js';
import {GLTFLoader} from '../vendor/three-addons-0.160.1/GLTFLoader.js';
import {phoneFinish} from './phone-finishes.js?v=20261118-1';
import {phoneModel} from './phone-model-data.js?v=20261118-2';

// The body is a prebuilt, continuously curved mesh. Runtime only changes pose/materials.
export async function mountSolidPhone(phone,root,{modelId='xiaomi-18-pro'}={}){
 const renderer=new T.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 const constrained=matchMedia('(pointer:coarse)').matches||(navigator.hardwareConcurrency||8)<=4||navigator.connection?.saveData;
 renderer.setPixelRatio(Math.min(devicePixelRatio||1,constrained?1.25:1.6));renderer.setClearColor(0,0);renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.domElement.className='rd-solid-canvas';renderer.domElement.setAttribute('aria-hidden','true');phone.prepend(renderer.domElement);
 const scene=new T.Scene(),group=new T.Group(),camera=new T.PerspectiveCamera(30,1,100,4000);scene.add(group);camera.position.z=1800;
 scene.add(new T.HemisphereLight(0xe9f0ff,0x29303c,.35));
 for(const [x,y,z,power] of [[-700,750,1000,.25],[750,120,650,.15],[-100,-500,-850,.5]]){const l=new T.DirectionalLight(0xffffff,power);l.position.set(x,y,z);scene.add(l);}
 const key=new T.SpotLight(0xf5f8ff,350000,2500,Math.PI/3,.85,2);key.position.set(-300,400,650);key.target.position.set(0,0,0);key.castShadow=true;key.shadow.mapSize.setScalar(constrained?512:1024);key.shadow.camera.near=10;key.shadow.camera.far=2000;key.shadow.bias=-.0001;key.shadow.normalBias=.45;scene.add(key,key.target);
 // A studio softbox environment gives the curved metal continuous, moving reflections.
 const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=512;const ctx=canvas.getContext('2d');ctx.fillStyle='#3c4554';ctx.fillRect(0,0,1024,512);
 for(const [x,y,w,h,alpha] of [[90,60,180,390,1],[650,90,100,330,.85],[400,390,230,60,.65]]){ctx.save();ctx.filter='blur(22px)';ctx.globalAlpha=alpha;ctx.fillStyle='#f8fbff';ctx.fillRect(x,y,w,h);ctx.restore();}
 const environmentSource=new T.CanvasTexture(canvas);environmentSource.mapping=T.EquirectangularReflectionMapping;environmentSource.colorSpace=T.SRGBColorSpace;
 const pmrem=new T.PMREMGenerator(renderer);let environment=pmrem.fromEquirectangular(environmentSource);environmentSource.dispose();
 root.dataset.modelLoading='true';try{const hdr=await new RGBELoader().loadAsync('assets/preorder/models/studio-small-09-512.hdr?v=20261118-2');environment.dispose();environment=pmrem.fromEquirectangular(hdr);hdr.dispose();}catch{ /* A bundled procedural studio keeps geometry usable if the HDR fails. */ }scene.environment=environment.texture;pmrem.dispose();
 const loader=new GLTFLoader(),assets=new Map(),textures=new Set(),materials=new Set();
 let shape=phoneModel(modelId),finish=phoneFinish('black'),current=null,disposed=false,contextLost=false,active=root.dataset.active!=='false',dirty=true,size='',revision=0;
 let last={pose:{yaw:0,pitch:0,roll:0},scale:1},blueMap=null,bluePending=false;
 function physical(source,options){const m=new T.MeshPhysicalMaterial(options);materials.add(m);source.dispose();return m;}
 function prepare(asset){asset.traverse(o=>{if(!o.isMesh)return;const role=o.userData.materialRole||o.material.name;o.userData.role=role;const old=o.material;
  if(role==='finish_back')o.material=physical(old,{color:finish.hex,metalness:.08,roughness:.34,clearcoat:.55,clearcoatRoughness:.24,ior:1.48});
  else if(role==='finish_frame')o.material=physical(old,{color:finish.frame,metalness:1,roughness:.22,clearcoat:.45,clearcoatRoughness:.16});
  else if(role==='flash_photo')o.material=physical(old,{map:old.map,color:'#ffffff',metalness:.02,roughness:.34,clearcoat:.3});
  else if(role.startsWith('optical_photo'))o.material=physical(old,{map:old.map,color:'#ffffff',emissiveMap:old.map,emissive:'#52667a',emissiveIntensity:.6,metalness:.03,roughness:.16,envMapIntensity:.22,specularIntensity:.35,clearcoat:.18,clearcoatRoughness:.1,ior:1.52});
  else if(['camera_glass','optical_glass','front_glass'].includes(role))o.material=physical(old,{color:role==='optical_glass'?'#091626':'#070b11',metalness:role==='optical_glass'?.3:.08,roughness:role==='optical_glass'?.055:.1,clearcoat:1,clearcoatRoughness:.04,ior:1.52});
  else if(['wordmark','engraving'].includes(role)){const m=new T.MeshBasicMaterial({color:'#8a9297',map:old.map,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,toneMapped:false});materials.add(m);o.material=m;old.dispose();}
  o.castShadow=['finish_frame','optical_housing'].includes(role);o.receiveShadow=role==='finish_back';
  materials.add(o.material);for(const value of Object.values(o.material))if(value?.isTexture)textures.add(value);o.frustumCulled=false;
 });return asset;}
 function load(id){if(!assets.has(id)){const p=loader.loadAsync(phoneModel(id).asset).then(gltf=>{if(disposed){disposeAsset(gltf.scene,true);throw Error('Phone viewer disposed');}return prepare(gltf.scene);}).catch(error=>{assets.delete(id);throw error;});assets.set(id,p);}return assets.get(id);}
 function applyFinish(){if(!current||disposed)return;const f=finish,map=f.id==='blue'&&blueMap?.image?blueMap:null;current.traverse(o=>{if(!o.isMesh)return;const m=o.material;
  if(o.userData.role==='finish_back'){m.color.set(map?'#ffffff':f.hex);m.map=map;m.roughness=f.id==='blue'?.18:f.id==='white'?.36:f.id==='red'?.37:.34;m.metalness=f.id==='blue'?.16:.08;m.clearcoat=f.id==='blue'?1:.55;m.clearcoatRoughness=f.id==='blue'?.12:.24;m.needsUpdate=true;}
  else if(o.userData.role==='finish_frame'){m.color.set(f.frame);m.roughness=f.id==='blue'?.17:.23;}
  else if(o.userData.role==='wordmark')m.color.set(f.id==='white'?'#777e82':'#9a9fa2');
  else if(o.userData.role==='engraving')m.color.set(f.id==='white'?'#7f8589':'#626a70');
 });root.dataset.finishReady=f.id==='blue'&&!map?'':f.id;dirty=true;render();}
 function setFinish(id){finish=phoneFinish(id);applyFinish();if(finish.id==='blue'&&!blueMap&&!bluePending){bluePending=true;blueMap=new T.TextureLoader().load(finish.mapTexture||finish.texture,tex=>{if(disposed){tex.dispose();return;}tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.repeat.set(3,6);textures.add(tex);bluePending=false;applyFinish();},undefined,()=>{bluePending=false;blueMap=null;root.dataset.finishReady=finish.id;});}}
 async function setModel(id){const desired=phoneModel(id);if(current&&root.dataset.modelReady===desired.id&&shape.id===desired.id&&root.dataset.modelLoading==='false')return;const token=++revision;shape=desired;root.dataset.modelLoading='true';root.dataset.renderer='photo';
  try{const asset=await load(desired.id);if(disposed||token!==revision)return;if(current)group.remove(current);current=asset;group.add(asset);root.dataset.modelReady=desired.id;root.querySelector('.rd-model-status').textContent='3D-модель · по материалам Xiaomi';root.dataset.modelLoading='false';root.dataset.renderer=contextLost?'photo':'webgl';size='';dirty=true;applyFinish();render();}
  catch(error){if(disposed||token!==revision)return;root.dataset.modelLoading='false';root.dataset.renderer='photo';root.querySelector('.rd-model-status').textContent='Фото устройства · 3D недоступно';console.warn('Phone model fallback:',error.message);}
 }
 function render(pose=last.pose,scale=last.scale){if(disposed)return;if(scale!==last.scale||['yaw','pitch','roll'].some(k=>pose[k]!==last.pose[k]))dirty=true;last={pose:{...pose},scale};
  const w=phone.offsetWidth,h=phone.offsetHeight,cw=root.querySelector('.rd-orbit-viewport').clientWidth,ch=h+80;if(w<1||h<1||!current)return;
  if(size!==`${w}:${h}:${cw}`){size=`${w}:${h}:${cw}`;dirty=true;renderer.setSize(cw,ch,false);renderer.domElement.style.width=cw+'px';renderer.domElement.style.height=ch+'px';camera.aspect=cw/ch;camera.fov=T.MathUtils.radToDeg(2*Math.atan(ch/(2*1800)));camera.updateProjectionMatrix();current.scale.setScalar(w/(shape.width*.001));}
  group.rotation.set(-T.MathUtils.degToRad(pose.pitch),T.MathUtils.degToRad(pose.yaw),-T.MathUtils.degToRad(pose.roll),'XYZ');group.scale.setScalar(scale);
  if(active&&dirty&&!contextLost){renderer.shadowMap.needsUpdate=true;renderer.render(scene,camera);dirty=false;}
 }
 function lost(e){e.preventDefault();contextLost=true;root.dataset.renderer='photo';}function restored(){if(disposed)return;contextLost=false;root.dataset.renderer=current&&root.dataset.modelReady===shape.id?'webgl':'photo';dirty=true;render();}
 renderer.domElement.addEventListener('webglcontextlost',lost);renderer.domElement.addEventListener('webglcontextrestored',restored);
 function disposeAsset(asset,release=false){asset.traverse(o=>{if(!o.isMesh)return;o.geometry.dispose();if(release){for(const value of Object.values(o.material))if(value?.isTexture){value.dispose();value.image?.close?.();}o.material.dispose();}});}
 function dispose(){if(disposed)return;disposed=true;revision++;renderer.domElement.removeEventListener('webglcontextlost',lost);renderer.domElement.removeEventListener('webglcontextrestored',restored);for(const p of assets.values())p.then(disposeAsset).catch(()=>{});textures.forEach(t=>{t.dispose();t.image?.close?.();});materials.forEach(m=>m.dispose());environment.dispose();key.shadow.dispose();renderer.dispose();renderer.forceContextLoss();renderer.domElement.remove();}
 try{await setModel(shape.id);}catch(error){dispose();throw error;}
 return {render,setFinish,setModel,pause(){active=false;},resume(){active=true;if(!current||root.dataset.modelReady!==shape.id)setModel(shape.id);dirty=true;render();},dispose};
}
