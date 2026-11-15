import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync}from'node:fs';
import {initialRearState,rearAction,rearTick}from'../js/rear-display-state.js';
import {REAR_DISPLAY_SCENARIOS,REAR_MEDIA,aiTemplate}from'../js/rear-display-data.js';
test('nine independent scenarios cycle in order and invalid state options do not enter the simulator',()=>{let s=initialRearState();for(let i=0;i<9;i++)s=rearAction(s,'next');assert.equal(s.scenario,'personal');assert.equal(rearAction(s,'scenario','untrusted').scenario,'personal');assert.equal(REAR_DISPLAY_SCENARIOS.length,9);assert.equal(rearAction(s,'camera','random').camera,'photo');});
test('call buttons and camera modes actually change states, recording and capture remain simulated',()=>{let s=rearAction(initialRearState(),'answer');s=rearTick(s,12);assert.equal(s.call,'active');assert.equal(s.callSeconds,12);assert.equal(rearAction(s,'hangup').call,'ended');assert.equal(rearAction(s,'decline').call,'declined');s=rearAction(s,'camera','video');s=rearAction(s,'capture');assert.equal(rearTick(s,3).recordSeconds,3);s=rearAction(s,'camera','portrait');assert.equal(s.recording,false);assert.equal(rearAction(s,'capture').shot,true);});
test('silent player advances only while playing and switching tracks resets its progress',()=>{let s=initialRearState();assert.equal(rearTick(s,5).progress,0);s=rearAction(s,'play');s=rearTick(s,8);assert.equal(s.progress,8);s=rearAction(s,'track','-1');assert.equal(s.track,2);assert.equal(s.progress,0);s=rearTick(s,300);assert.equal(s.playing,false);});
test('suspend stops calls, music and camera recording before a hidden page can advance them',()=>{let s=rearAction(initialRearState(),'answer');s={...s,playing:true,recording:true};s=rearAction(s,'suspend');assert.equal(s.call,'ended');assert.equal(s.playing,false);assert.equal(s.recording,false);assert.equal(rearTick(s,60).progress,0);});
test('AI prompt selection is deterministic, bounded and explicitly a local template; shopping and route controls update',()=>{let s=rearAction(initialRearState(),'generate','Напомни пить воду');assert.equal(s.ai,'water');assert.equal(s.generated,true);assert.equal(aiTemplate('учу английские слова'),'words');assert.equal(aiTemplate('дыхание'),'note');assert.equal(aiTemplate('игра со звёздами'),'note');assert.equal(aiTemplate('неизвестная идея'),'note');for(let i=0;i<9;i++)s=rearAction(s,'water');assert.equal(s.water,0);s=rearAction(s,'check','1');assert.deepEqual(s.shopping,[false,true,false]);s=rearAction(s,'route');assert.equal(s.route,1);s=rearAction(s,'note','x'.repeat(90));assert.equal(s.note.length,60);});
test('media sources are explicit: local teaser stays local; third-party reviews are embeds, never copied videos',()=>{
 for(const m of REAR_MEDIA){if(m.kind==='local'){assert.ok(existsSync(new URL('../'+m.src,import.meta.url)));assert.ok(existsSync(new URL('../'+m.poster,import.meta.url)));}else if(m.kind==='youtube'){assert.match(m.videoId,/^[\w-]{11}$/);assert.ok(m.start>0);assert.equal(m.src,undefined);assert.ok(existsSync(new URL('../'+m.poster,import.meta.url)));}else assert.equal(m.kind,'demo');}
 const code=readFileSync(new URL('../js/rear-display-media.js',import.meta.url),'utf8');assert.match(code,/autoplay=0/);assert.match(code,/youtube-nocookie/);assert.match(code,/fallback/);assert.match(code,/removeAttribute\('src'\)/);
});

import {wrapAngle,viewAngle,privacyOpacity,fitModel,PHONE_DIMENSIONS,nearestAngle} from '../js/rear-display-3d.js';
test('3D angles wrap across full revolutions, fit narrow viewports and shade only oblique protected views',()=>{
 assert.equal(wrapAngle(725),5);assert.equal(wrapAngle(-725),-5);assert.equal(wrapAngle(Infinity),0);
 assert.equal(viewAngle({yaw:180,pitch:0}),0);assert.ok(viewAngle({yaw:235,pitch:0})>54);
 assert.equal(privacyOpacity(0,true),0);assert.equal(privacyOpacity(70,false),0);assert.ok(privacyOpacity(70,true)>.9);
 assert.equal(fitModel({yaw:0,pitch:0,roll:0},260,538,300),1);
 for(const yaw of [-180,-90,0,45,180])for(const pitch of [-180,-90,0,90,180])for(const roll of [-180,-90,0,90,180]){const scale=fitModel({yaw,pitch,roll},260,538,270);assert.ok(scale>0&&scale<=1);}
 assert.ok(fitModel({yaw:0,pitch:0,roll:90},260,538,270)<.5);
});

test('desktop rotations use nearest equivalent angle and model thickness follows real Pro Max dimensions',()=>{assert.equal(nearestAngle(170,-170),190);assert.equal(nearestAngle(350,0),360);assert.equal(nearestAngle(15,180),180);assert.equal(PHONE_DIMENSIONS.width,77.6);assert.equal(PHONE_DIMENSIONS.height,163.39);assert.equal(PHONE_DIMENSIONS.depth,8.39);assert.ok(320*PHONE_DIMENSIONS.depth/PHONE_DIMENSIONS.width>34);});

import {REAR_GEOMETRY,rearGeometryStyle,rearGlassMask,rearTextureMask} from '../js/rear-display-geometry.js';
import {REAR_ART,REAR_WALLPAPERS} from '../js/rear-display-art.js';
test('housing, glass and lens apertures share manufacturer-photo coordinates and preserve the actual display aspect',()=>{
 const {photo:p,housing:h,glass:g,lenses}=REAR_GEOMETRY;assert.equal(p.width,163);assert.equal(p.height,337);assert.ok(g.x>h.x&&g.y>h.y&&g.x+g.width<h.x+h.width&&g.y+g.height<h.y+h.height);assert.ok(Math.abs(g.width/g.height-976/596)<.002);
 for(const l of lenses){assert.ok(l.x-l.radius>g.x);assert.ok(l.y-l.radius>g.y);assert.ok(l.x+l.radius<g.x+g.width);assert.ok(l.y+l.radius<g.y+g.height);}
 assert.match(rearGeometryStyle(),/--glass-left:/);const mask=decodeURIComponent(rearGlassMask());assert.match(mask,/cx="20.5"/);assert.match(mask,/cy="19.5"/);assert.match(mask,/cy="58.5"/);assert.match(decodeURIComponent(rearTextureMask()),/id="texture"/);
});
test('all eight Xiaomi wallpaper choices resolve to sourced local imagery and work with the state reducer',()=>{
 assert.equal(REAR_WALLPAPERS.length,8);for(const w of REAR_WALLPAPERS){assert.ok(REAR_ART[w.art]);assert.ok(existsSync(new URL('../'+REAR_ART[w.art].src,import.meta.url)));assert.equal(rearAction(initialRearState(),'wallpaper',w.id).wallpaper,w.id);}
});
