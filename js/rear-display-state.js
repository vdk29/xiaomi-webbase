import {REAR_DISPLAY_SCENARIOS,REAR_TRACKS,REAR_ROUTE,aiTemplate} from './rear-display-data.js?v=20261114-2';
export function initialRearState(){return {scenario:'personal',wallpaper:'clock',theme:'blue',motion:true,auto:false,camera:'photo',recording:false,recordSeconds:0,shot:false,notification:'call',call:'incoming',callSeconds:0,messageRead:false,alarmSnoozed:false,reminderDone:false,track:0,playing:false,progress:0,player:'Spotify',route:0,card:'weather',rain:false,shopping:[false,false,false],note:'Купить кофе по дороге домой',flight:0,remaining:60,timerRunning:false,ai:'water',water:0,word:0,wordBack:false,breathing:false,breathSeconds:0,hits:0,generated:false,prompt:''};}
export function rearAction(state,action,value){
 const s={...state};
 switch(action){
  case 'scenario':if(REAR_DISPLAY_SCENARIOS.some(x=>x.id===value)){s.scenario=value;s.shot=false;}break;
  case 'next':s.scenario=REAR_DISPLAY_SCENARIOS[(REAR_DISPLAY_SCENARIOS.findIndex(x=>x.id===s.scenario)+1)%REAR_DISPLAY_SCENARIOS.length].id;break;
  case 'wallpaper':if(['clock','orbit','pet','photo','ai','case'].includes(value))s.wallpaper=value;break;
  case 'theme':if(['black','white','blue','red'].includes(value))s.theme=value;break;
  case 'motion':s.motion=!s.motion;break;
  case 'auto':s.auto=!s.auto;break;
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
  case 'route':s.route=(s.route+1)%REAR_ROUTE.length;break;
  case 'card':if(['weather','shopping','note','flight'].includes(value))s.card=value;break;
  case 'weather':s.rain=!s.rain;break;
  case 'check':{const n=Number(value);if(n>=0&&n<3){s.shopping=[...s.shopping];s.shopping[n]=!s.shopping[n];}break;}
  case 'note':s.note=String(value).slice(0,60);break;
  case 'flight':s.flight=(s.flight+1)%3;break;
  case 'preset':if([60,300,1500].includes(Number(value))){s.remaining=Number(value);s.timerRunning=false;}break;
  case 'timer':if(!s.remaining)s.remaining=60;s.timerRunning=!s.timerRunning;break;
  case 'reset':s.remaining=60;s.timerRunning=false;break;
  case 'ai':if(['water','breath','words','game','focus','note'].includes(value))s.ai=value;s.generated=false;break;
  case 'generate':s.prompt=String(value).slice(0,80);s.ai=aiTemplate(s.prompt);s.generated=true;break;
  case 'water':s.water=(s.water+1)%9;break;
  case 'breath':s.breathing=!s.breathing;break;
  case 'word':s.word=(s.word+1)%3;s.wordBack=false;break;
  case 'flip':s.wordBack=!s.wordBack;break;
  case 'hit':s.hits++;break;
  case 'suspend':if(s.call==='active')s.call='ended';s.auto=false;s.playing=false;s.recording=false;s.timerRunning=false;s.breathing=false;break;
 }
 return s;
}
export function rearTick(state,seconds=1){const s={...state};const dt=Math.max(0,Math.min(3600,Math.floor(seconds)));if(s.timerRunning){s.remaining=Math.max(0,s.remaining-dt);if(!s.remaining)s.timerRunning=false;}if(s.playing){s.progress=Math.min(REAR_TRACKS[s.track].duration,s.progress+dt);if(s.progress===REAR_TRACKS[s.track].duration)s.playing=false;}if(s.recording)s.recordSeconds+=dt;if(s.call==='active')s.callSeconds+=dt;if(s.breathing)s.breathSeconds+=dt;return s;}
export const rearSeconds=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
