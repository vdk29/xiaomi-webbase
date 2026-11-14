import test from 'node:test';
import assert from 'node:assert/strict';
import {AI_CARDS,aiScreenMarkup,aiPanelMarkup,breathPhase} from '../js/rear-display-ai.js';
import {initialRearState,rearAction,rearTick} from '../js/rear-display-state.js';
test('six AI cards select distinct scenes; character imagery is the visual starting point',()=>{
 let s=initialRearState();assert.equal(s.ai,'character');assert.equal(AI_CARDS.length,6);
 for(const c of AI_CARDS){s=rearAction(s,'ai',c.id);assert.equal(s.ai,c.id);assert.match(aiScreenMarkup(s),new RegExp(`data-ai-kind="${c.id}"`));}
 assert.equal(rearAction(s,'ai','invalid').ai,s.ai);
});
test('AI focus preserves its chosen duration, completes, and stops when another card is selected',()=>{
 let s=rearAction(initialRearState(),'preset','300');s=rearAction(s,'timer');s=rearTick(s,2);assert.equal(s.remaining,298);s=rearAction(s,'ai','character');assert.equal(rearTick(s,20).remaining,298);
 s=rearAction(s,'timer');s=rearTick(s,400);assert.equal(s.remaining,0);assert.equal(s.timerRunning,false);s=rearAction(s,'timer');assert.equal(s.remaining,300);assert.equal(s.timerDuration,300);
});
test('breathing phases are deterministic; switching cards or submitting a template pauses ongoing activities',()=>{
 assert.equal(breathPhase(0),'Вдох');assert.equal(breathPhase(3),'Вдох');assert.equal(breathPhase(4),'Выдох');assert.equal(breathPhase(8),'Вдох');
 let s=rearAction(initialRearState(),'breath');s=rearTick(s,5);assert.equal(s.breathSeconds,5);s=rearAction(s,'ai','words');assert.equal(s.breathing,false);s={...s,timerRunning:true,breathing:true};s=rearAction(s,'generate','Персонаж панда');assert.equal(s.ai,'character');assert.equal(s.avatar,'panda');assert.equal(s.timerRunning,false);assert.equal(s.breathing,false);
});
test('water achievements reset deliberately, star scores and avatar greetings preserve their own state',()=>{
 let s=initialRearState();for(let i=0;i<8;i++)s=rearAction(s,'water');assert.equal(s.water,8);s=rearAction(s,'ai','water');assert.match(aiScreenMarkup(s),/rd-ai-celebrate/);s=rearAction(s,'water');assert.equal(s.water,0);
 s=rearAction(s,'greet');assert.equal(s.greetings,1);s=rearAction(s,'avatar','panda');assert.equal(s.avatar,'panda');assert.equal(s.greetings,0);assert.equal(rearAction(s,'avatar','invalid').avatar,'panda');
 for(let i=0;i<5;i++)s=rearAction(s,'hit');assert.equal(s.hits,5);s=rearAction(s,'ai','game');assert.match(aiScreenMarkup(s),/rd-ai-celebrate/);
});
test('illustration IDs are unique across the phone, enlarged card and selector; text prompts stay escaped',()=>{
 const s=initialRearState();s.ai='water';const html=aiScreenMarkup(s,'phone')+aiPanelMarkup(s);const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);assert.match(html,/Без подключения к AI-сервису/);
 s.ai='note';s.prompt='<img src=x onerror=alert(1)>';assert.ok(!aiScreenMarkup(s).includes('<img src=x'));assert.match(aiScreenMarkup(s),/&lt;img/);
});
