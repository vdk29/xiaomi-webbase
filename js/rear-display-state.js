import {REAR_DISPLAY_SCENARIOS,REAR_TRACKS,REAR_ROUTE,aiTemplate} from './rear-display-data.js?v=20261115-2';
export function initialRearState(){return {scenario:'personal',wallpaper:'clock',theme:'blue',motion:true,camera:'photo',recording:false,recordSeconds:0,shot:false,notification:'call',call:'incoming',callSeconds:0,messageRead:false,alarmSnoozed:false,reminderDone:false,track:0,playing:false,progress:0,player:'Spotify',route:0,navElapsed:0,cardElapsed:0,weatherIndex:0,pickupIndex:0,calendarDone:false,splitAmount:2400,splitPeople:4,card:'weather',rain:false,shopping:[false,false,false],note:'Купить кофе по дороге домой',flight:0,ai:'water',water:0,waterPrevious:0,word:0,wordBack:false,generated:false,prompt:''};}
export function rearAction(state,action,value){
 const s={...state};
 switch(action){
  case 'scenario':if(REAR_DISPLAY_SCENARIOS.some(x=>x.id===value)){s.scenario=value;s.shot=false;if(value==='music')s.playing=true;}break;
  case 'next':s.scenario=REAR_DISPLAY_SCENARIOS[(REAR_DISPLAY_SCENARIOS.findIndex(x=>x.id===s.scenario)+1)%REAR_DISPLAY_SCENARIOS.length].id;break;
  case 'wallpaper':if(['clock','orbit','pet','photo','ai','case','character','seaside'].includes(value))s.wallpaper=value;break;
  case 'theme':if(['black','white','blue','red'].includes(value))s.theme=value;break;
  case 'camera':if(['photo','portrait','video','group'].includes(value)){s.camera=value;s.recording=false;s.recordSeconds=0;s.shot=false;}break;
  case 'capture':if(s.camera==='video'){s.recording=!s.recording;s.recordSeconds=0}else s.shot=true;break;
  case 'notification':if(['call','message','alarm','reminder'].includes(value)){s.notification=value;s.call='incoming';s.messageRead=false;s.alarmSnoozed=false;s.reminderDone=false;}break;
  case 'answer':s.call='active';s.callSeconds=0;break;
  case 'decline':s.call='declined';break;
  case 'hangup':s.call='ended';break;
  case 'read':s.messageRead=true;break;
  case 'snooze':s.alarmSnoozed=true;break;
  case 'reminder':s.reminderDone=!s.reminderDone;break;
  case 'play':s.playing=!s.playing;break;
  case 'track':s.track=(s.track+Number(value)+REAR_TRACKS.length)%REAR_TRACKS.length;s.progress=0;break;
  case 'player':if(['Spotify','YouTube Music'].includes(value))s.player=value;break;
  case 'route':s.route=(s.route+1)%REAR_ROUTE.length;s.navElapsed=0;break;
  case 'card':if(['weather','shopping','note','flight','pickup','calendar'].includes(value))s.card=value;break;
  case 'weather':s.weatherIndex=(s.weatherIndex+1)%4;s.rain=s.weatherIndex===1;s.cardElapsed=0;break;
  case 'check':{const n=Number(value);if(n>=0&&n<3){s.shopping=[...s.shopping];s.shopping[n]=!s.shopping[n];}break;}
  case 'note':s.note=String(value).slice(0,60);s.generated=false;break;
  case 'flight':s.flight=(s.flight+1)%3;break;
  case 'ai':if(['water','words','split','note'].includes(value))s.ai=value;s.generated=false;break;
  case 'generate':s.prompt=String(value).slice(0,80);s.ai=aiTemplate(s.prompt);if(s.ai==='note')s.note=s.prompt.slice(0,60);s.generated=true;break;
  case 'splitAmount':if(Number.isFinite(Number(value)))s.splitAmount=Math.min(1000000,Math.max(0,Number(value)));break;
  case 'splitPeople':if(Number.isFinite(Number(value)))s.splitPeople=Math.min(50,Math.max(1,Math.floor(Number(value))));break;
  case 'pickup':s.pickupIndex=(s.pickupIndex+1)%3;break;
  case 'calendar':s.calendarDone=!s.calendarDone;break;
  case 'water':s.waterPrevious=s.water;s.water=(s.water+1)%9;break;
  case 'word':s.word=(s.word+1)%3;s.wordBack=false;break;
  case 'flip':s.wordBack=!s.wordBack;break;
  case 'suspend':if(s.call==='active')s.call='ended';s.playing=false;s.recording=false;break;
 }
 return s;
}
export function rearTick(state,seconds=1){const s={...state};const dt=Math.max(0,Math.min(3600,Math.floor(seconds)));if(s.scenario==='navigation'){s.navElapsed+=dt;if(s.navElapsed>=6){s.route=(s.route+Math.floor(s.navElapsed/6))%REAR_ROUTE.length;s.navElapsed%=6;}}if(s.scenario==='cards'&&s.card==='weather'){s.cardElapsed+=dt;if(s.cardElapsed>=8){s.weatherIndex=(s.weatherIndex+Math.floor(s.cardElapsed/8))%4;s.rain=s.weatherIndex===1;s.cardElapsed%=8;}}if(s.playing){s.progress=Math.min(REAR_TRACKS[s.track].duration,s.progress+dt);if(s.progress===REAR_TRACKS[s.track].duration)s.playing=false;}if(s.recording)s.recordSeconds+=dt;if(s.call==='active')s.callSeconds+=dt;return s;}
export const rearSeconds=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
