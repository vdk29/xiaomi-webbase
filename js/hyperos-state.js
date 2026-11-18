export const HS_APPS=['gallery','settings','calculator','notes','weather','music','smart-home','clock','phone','messages','browser','camera'];
export const initialHyperOS=()=>({view:'home',wifi:true,bluetooth:true,airplane:false,silent:false,brightness:90,volume:65,dark:false,wallpaper:'amber',note:'Забрать заказ по дороге домой',gallery:0,photoOpen:false,playing:false,track:0,progress:0,lamp:true,alarm:true,number:'',calling:false,message:'',sent:[],camera:0,shots:0,notifications:true,calc:{display:'0',operand:null,op:null,next:false}});
export function calculatorKey(current,key){
 const c={...current};const value=()=>Number(c.display);
 const format=n=>Number.isFinite(n)?String(Number(n.toPrecision(11))):'Ошибка';
 const calculate=()=>{const n=value(),a=c.operand;return c.op==='+'?a+n:c.op==='−'?a-n:c.op==='×'?a*n:c.op==='÷'?a/n:n;};
 if(key==='AC')return {display:'0',operand:null,op:null,next:false};
 if(/^[0-9.]$/.test(key)){if(c.next||c.display==='Ошибка'){if(c.display==='Ошибка'){c.operand=null;c.op=null;}c.display='0';c.next=false;}if(key==='.')c.display+=c.display.includes('.')?'':'.';else c.display=c.display==='0'?key:(c.display.length<12?c.display+key:c.display);return c;}
 if(c.display==='Ошибка')return c;
 if(key==='±'){c.display=format(-value());return c;}if(key==='%'){c.display=format(value()/100);return c;}
 if(['+','−','×','÷','='].includes(key)){if(c.op&&!c.next)c.display=format(calculate());c.operand=Number(c.display);c.op=key==='='?null:key;c.next=true;}
 return c;
}
export function hyperOSAction(state,action,value){const s={...state};
 if(action==='open'&&[...HS_APPS,'home','controls','notifications','lock','about'].includes(value)){s.view=value;s.photoOpen=false;}
 else if(['wifi','bluetooth','airplane','silent','dark','lamp','alarm','playing'].includes(action))s[action]=!s[action];
 else if(['brightness','volume'].includes(action)&&Number.isFinite(Number(value)))s[action]=Math.min(100,Math.max(0,Number(value)));
 else if(action==='wallpaper')s.wallpaper=s.wallpaper==='amber'?'blue':'amber';
 else if(action==='note')s.note=String(value).slice(0,160);
 else if(action==='gallery'&&Number(value)>=0&&Number(value)<6){s.gallery=Number(value);s.photoOpen=true;}
 else if(action==='photoBack')s.photoOpen=false;
 else if(action==='track'){s.track=(s.track+Number(value)+3)%3;s.progress=0;}
 else if(action==='dial'&&/^[0-9*#]$/.test(value))s.number=(s.number+value).slice(0,15);
 else if(action==='backspace')s.number=s.number.slice(0,-1);
 else if(action==='call'&&s.number)s.calling=!s.calling;
 else if(action==='clear')s.notifications=false;
 else if(action==='message')s.message=String(value).slice(0,100);
 else if(action==='send'&&s.message.trim()){s.sent=[...s.sent.slice(-4),s.message.trim()];s.message='';}
 else if(action==='camera')s.camera=1-s.camera;
 else if(action==='capture')s.shots++;
 else if(action==='calc')s.calc=calculatorKey(s.calc,value);
 return s;
}
// Always leave the local demonstration readable, even with the range at zero.
export function hyperOSBrightness(value){const n=Number(value);return .6+Math.max(0,Math.min(100,Number.isFinite(n)?n:100))*.004;}
