import {phoneModel} from './phone-model-data.js?v=20261118-2';
import {phoneFinish} from './phone-finishes.js?v=20261118-1';
import {hyperOSMarkup,mountHyperOS} from './hyperos.js?v=20261118-2';
// Shared pose for the volumetric WebGL body and interactive DOM glass surfaces.
export const PHONE_DIMENSIONS=Object.freeze({height:163.39,width:77.6,depth:8.39});
export const nearestAngle=(from,to)=>{const delta=wrapAngle(to-from);return Math.round((from+(delta===-180&&to-from>0?180:delta))*1e9)/1e9;};
export const wrapAngle=n=>{const v=Number(n);return Number.isFinite(v)?((v+180)%360+360)%360-180:0;};
export function viewAngle(pose){return Math.acos(Math.min(1,Math.abs(Math.cos(pose.pitch*Math.PI/180)*Math.cos(pose.yaw*Math.PI/180))))*180/Math.PI;}
export function privacyOpacity(angle,enabled){return enabled?Math.min(.97,Math.max(0,(Math.abs(angle)-12)/45)) : 0;}
export function fitModel(pose,width,height,available,dimensions=PHONE_DIMENSIONS){
 const rad=Math.PI/180,cx=Math.cos(pose.pitch*rad),sx=Math.sin(pose.pitch*rad),cy=Math.cos(pose.yaw*rad),sy=Math.sin(pose.yaw*rad),cz=Math.cos(pose.roll*rad),sz=Math.sin(pose.roll*rad);let extent=0,vertical=0;
 for(const x of [-width/2,width/2])for(const y of [-height/2,height/2])for(const z of [-width*dimensions.depth/dimensions.width/2,width*dimensions.depth/dimensions.width/2]){const rx=x*cz-y*sz,ry=x*sz+y*cz,xx=rx*cy+z*sy,zz=-rx*sy+z*cy,depth=ry*sx+zz*cx;extent=Math.max(extent,Math.abs(xx)*1800/(1800-depth));vertical=Math.max(vertical,Math.abs(ry*cx-zz*sx)*1800/(1800-depth));}
 return Math.min(1,Math.max(.2,Math.min((available-20)/Math.max(1,extent*2),(height+16)/Math.max(1,vertical*2))));
}
export function modelFacesMarkup(){return `${Array.from({length:24},(_,i)=>`<span class="rd-model-corner" data-corner="${i}" aria-hidden="true"></span>`).join('')}<div class="rd-model-side rd-side-left" aria-hidden="true"></div><div class="rd-model-side rd-side-right" aria-hidden="true"><i></i><i></i></div><div class="rd-model-side rd-side-top" aria-hidden="true"></div><div class="rd-model-side rd-side-bottom" aria-hidden="true"><i></i></div><div class="rd-model-front"><div class="rd-front-glass">${hyperOSMarkup()}</div></div>`;}
export function orbitPadMarkup(){return '';}
export function orbitControlsMarkup(){return `<div class="rd-orbit-controls"><p>↔ поворот · ↕ прокрутка на телефоне · мышью — свободно</p><div class="rd-orbit-presets"><button type="button" data-orbit="back">Сзади</button><button type="button" data-orbit="front">Спереди</button><button type="button" data-orbit="reset">Ракурс</button></div></div>`;}
export function privacyControlsMarkup(){return '';}
export function mountPhone3D(root,{modelId='xiaomi-18-pro'}={}){
 const phone=root.querySelector('.rd-phone'),model=root.querySelector('.rd-device3d'),viewport=root.querySelector('.rd-orbit-viewport');
 let solid=null;const hyperos=mountHyperOS(root);
 let shape=phoneModel(modelId);let pose={yaw:-25,pitch:-6,roll:-1},enabled=false,scope='full',active=true,drag=null,destroyed=false,geometry='',finish=phoneFinish('black'),frame=null;
 function paint(){if(destroyed)return;
  const w=phone.offsetWidth,h=phone.offsetHeight;if(geometry!==`${w}:${h}:${shape.id}`){geometry=`${w}:${h}:${shape.id}`;const radius=Math.min(w*.14,h*.07),depth=w*shape.depth/shape.width;model.style.setProperty('--body-radius',radius+'px');model.style.setProperty('--body-depth',depth+'px');model.style.setProperty('--half-depth',depth/2+'px');model.style.setProperty('--front-glass-rise',w*.13/shape.width+'px');model.style.setProperty('--camera-rise',w*shape.cameraRise/shape.width+'px');root.querySelectorAll('[data-corner]').forEach(e=>{const n=Number(e.dataset.corner),corner=Math.floor(n/6),angle=[180,270,0,90][corner]+(n%6+.5)*15,theta=angle*Math.PI/180,cx=[radius,w-radius,w-radius,radius][corner],cy=[radius,radius,h-radius,h-radius][corner];e.style.left=(cx+radius*Math.cos(theta))+'px';e.style.top=(cy+radius*Math.sin(theta))+'px';e.style.width=(2*radius*Math.sin(Math.PI/24)+2)+'px';e.style.transform=`translate(-50%,-50%) rotateZ(${angle+90}deg) rotateX(90deg)`;});}
  const scale=fitModel(pose,phone.offsetWidth,phone.offsetHeight,viewport.clientWidth,shape);solid?.render(pose,scale);model.style.transform=`scale(${scale}) rotateX(${pose.pitch}deg) rotateY(${pose.yaw}deg) rotateZ(${pose.roll}deg)`;model.style.setProperty('--privacy-opacity',privacyOpacity(viewAngle(pose),enabled));model.dataset.privacyScope=scope;model.dataset.privacy=enabled?'on':'off';root.dataset.privacy=enabled?'on':'off';viewport.dataset.dragging=String(!!drag?.committed);hyperos.scenario(root.dataset.scenario==='privacy');
  root.querySelectorAll('[data-privacy=full]').forEach(b=>{const on=enabled&&scope==='full';b.textContent=on?'Защита экрана включена':'Защита экрана выключена';b.setAttribute('aria-pressed',String(on));});
  root.querySelectorAll('[data-privacy=message]').forEach(b=>{const on=enabled&&scope==='notification';b.textContent=on?'Уведомление защищено':'Защита уведомления';b.setAttribute('aria-pressed',String(on));});
 }
 function queuePaint(){if(frame===null)frame=requestAnimationFrame(()=>{frame=null;paint();});}
 function setFinish(id){finish=phoneFinish(id);root.dataset.finish=finish.id;model.style.setProperty('--phone-finish',finish.hex);solid?.setFinish(finish.id);const path=`assets/preorder/${finish.id==='red'?'20261107':'20261106'}/${shape.id}-${finish.id}.webp`;root.querySelectorAll('.rd-phone-photo,.rd-island-texture').forEach(e=>e.src=path);root.querySelector('.rd-phone-photo').alt=`Задняя панель ${shape.name}`;}
 function setModel(id){const next=phoneModel(id);if(shape.id===next.id&&root.dataset.phoneVariant===next.id){if(root.dataset.renderer==='photo'&&root.dataset.modelLoading==='false')solid?.setModel(next.id);return;}shape=next;root.dataset.phoneVariant=shape.id;phone.style.setProperty('--phone-aspect',`${shape.width}/${shape.height}`);root.querySelector('figcaption strong').textContent=shape.name;hyperos.syncDevice();solid?.setModel(shape.id);setFinish(finish.id);geometry='';paint();}
 function setPose(next){for(const axis of ['yaw','pitch','roll'])if(next[axis]!==undefined)pose[axis]=nearestAngle(pose[axis],next[axis]);paint();}
 function click(e){const preset=e.target.closest('[data-hs-open]');if(preset){setPose({yaw:180,pitch:0,roll:0});hyperos.open(preset.dataset.hsOpen);}const orbit=e.target.closest('[data-orbit]'),privacy=e.target.closest('button[data-privacy]');if(orbit){const action=orbit.dataset.orbit;setPose({yaw:action==='front'?180:0,pitch:0,roll:0});if(action==='front')hyperos.open('home');}if(privacy){const desired=privacy.dataset.privacy==='message'?'notification':'full';enabled=scope===desired?!enabled:true;scope=desired;paint();}}
 function down(e){
  if(!active||e.isPrimary===false||e.button!==0||e.target.closest('button,input,textarea,a'))return;
  const touch=e.pointerType==='touch'||e.pointerType==='pen';
  if(touch&&!e.target.closest('.rd-phone'))return;
  drag={id:e.pointerId,x:e.clientX,y:e.clientY,pose:{...pose},width:viewport.clientWidth,height:phone.offsetHeight,rollOnly:!touch&&e.shiftKey,touch,committed:!touch};
  // Leave touch gestures to the browser until a horizontal drag is unambiguous.
  if(!touch){e.preventDefault();viewport.focus({preventScroll:true});viewport.setPointerCapture(e.pointerId);paint();}
 }
 function move(e){
  if(!drag||drag.id!==e.pointerId)return;
  const dx=e.clientX-drag.x,dy=e.clientY-drag.y;
  if(!drag.committed){
   if(Math.abs(dy)>=8&&Math.abs(dy)>=Math.abs(dx)){drag=null;return;}
   if(Math.abs(dx)<8||Math.abs(dx)<Math.abs(dy)*1.3)return;
   drag.committed=true;viewport.setPointerCapture(e.pointerId);
  }
  if(e.cancelable)e.preventDefault();
  const turn=dx/Math.max(240,drag.width)*180,tilt=drag.touch?0:dy/Math.max(320,drag.height)*150;
  if(drag.rollOnly)pose={...drag.pose,roll:drag.pose.roll+turn};else pose={yaw:drag.pose.yaw+turn,pitch:drag.pose.pitch-tilt,roll:drag.pose.roll};queuePaint();
 }
 function up(e){if(!drag||e.pointerId!==drag.id)return;const committed=drag.committed;drag=null;if(frame!==null){cancelAnimationFrame(frame);frame=null;}if(viewport.hasPointerCapture(e.pointerId))viewport.releasePointerCapture(e.pointerId);if(committed)paint();}
 function lost(e){if(e.target===viewport)up(e);}
 function nativeDrag(e){e.preventDefault();}
 function cancelDrag(){if(!drag)return;const id=drag.id;drag=null;if(viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);paint();}
 function doubleClick(e){if(!e.target.closest('button,input,a,[data-hyperos]'))setPose({yaw:0,pitch:0,roll:0});}
 function key(e){if(e.target!==viewport||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Home'].includes(e.key))return;e.preventDefault();if(e.key==='Home')setPose({yaw:0,pitch:0,roll:0});else setPose({yaw:pose.yaw+({'ArrowLeft':-15,'ArrowRight':15}[e.key]||0),pitch:pose.pitch+({'ArrowUp':15,'ArrowDown':-15}[e.key]||0)});}
 viewport.querySelectorAll('img').forEach(img=>img.draggable=false);viewport.addEventListener('dragstart',nativeDrag);viewport.addEventListener('dblclick',doubleClick);window.addEventListener('blur',cancelDrag);
 const resize=new ResizeObserver(paint);resize.observe(viewport);root.addEventListener('click',click);viewport.addEventListener('pointerdown',down);viewport.addEventListener('pointermove',move);viewport.addEventListener('pointerup',up);viewport.addEventListener('pointercancel',up);viewport.addEventListener('lostpointercapture',lost);viewport.addEventListener('keydown',key);paint();
 import('./phone-solid.js?v=20261118-2').then(async module=>{if(destroyed)return;try{const instance=await module.mountSolidPhone(phone,root,{modelId:shape.id});if(destroyed){instance.dispose();return;}solid=instance;solid.setModel(shape.id);solid.setFinish(finish.id);if(!active)solid.pause();paint();}catch(error){root.dataset.renderer='photo';phone.querySelector('.rd-solid-canvas')?.remove();root.querySelector('.rd-model-status').textContent='Фото устройства · объёмный режим недоступен';console.warn('Phone 3D fallback:',error.message);}}).catch(error=>{root.dataset.renderer='photo';console.warn('Phone 3D fallback:',error.message);});
 setModel(shape.id);
 return {setFinish,setModel,brightness:hyperos.brightness,setBrightness:hyperos.setBrightness,reset(){enabled=false;scope='full';hyperos.reset();setPose({yaw:['hyperos','privacy'].includes(root.dataset.scenario)?180:0,pitch:0,roll:0});},sync(){paint();},tick(now){hyperos.tick(now);},front(){setPose({yaw:180,pitch:0,roll:0});hyperos.open('home');},privacy(){setPose({yaw:180,pitch:0,roll:0});},back(){setPose({yaw:0,pitch:0,roll:0});},pause(){if(frame!==null){cancelAnimationFrame(frame);frame=null;}active=false;hyperos.pause();solid?.pause();if(drag){const id=drag.id;drag=null;if(viewport.hasPointerCapture(id))viewport.releasePointerCapture(id);}paint();},resume(){active=true;hyperos.resume();solid?.resume();paint();},destroy(){if(frame!==null)cancelAnimationFrame(frame);cancelDrag();destroyed=true;hyperos.destroy();solid?.dispose();resize.disconnect();viewport.removeEventListener('dragstart',nativeDrag);viewport.removeEventListener('dblclick',doubleClick);window.removeEventListener('blur',cancelDrag);root.removeEventListener('click',click);for(const [event,fn]of[['pointerdown',down],['pointermove',move],['pointerup',up],['pointercancel',up],['lostpointercapture',lost],['keydown',key]])viewport.removeEventListener(event,fn);}};
}
