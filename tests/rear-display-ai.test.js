import test from 'node:test';
import assert from 'node:assert/strict';
import {AI_CARDS,aiScreenMarkup,aiPanelMarkup,splitResult} from '../js/rear-display-ai.js';
import {initialRearState,rearAction,rearTick} from '../js/rear-display-state.js';
import {DAILY_CARDS,cardsMarkup,navDistance} from '../js/rear-display-daily.js';
test('four practical AI cards select independent scenes without retired games or timer UI',()=>{
 let s=initialRearState();assert.equal(s.ai,'water');assert.deepEqual(AI_CARDS.map(c=>c.id),['water','words','split','note']);
 for(const c of AI_CARDS){s=rearAction(s,'ai',c.id);assert.equal(s.ai,c.id);assert.match(aiScreenMarkup(s),new RegExp(`data-ai-kind="${c.id}"`));}
 assert.equal(rearAction(s,'ai','game').ai,s.ai);assert.doesNotMatch(aiPanelMarkup(s),/data-rd-action="(hit|timer|breath|greet)"/);
});
test('AI examples update water, translation and split calculation without network calls',()=>{
 let s=initialRearState();for(let i=0;i<8;i++)s=rearAction(s,'water');assert.equal(s.water,8);s=rearAction(s,'water');assert.equal(s.water,0);
 s=rearAction(s,'flip');assert.equal(s.wordBack,true);s=rearAction(s,'word');assert.equal(s.word,1);assert.equal(s.wordBack,false);
 s=rearAction(s,'splitAmount','3600');s=rearAction(s,'splitPeople','6');assert.equal(splitResult(s),'600 ₽');assert.equal(rearAction(s,'splitPeople','0').splitPeople,1);assert.equal(rearAction(s,'splitPeople','100').splitPeople,50);assert.equal(rearAction(s,'splitAmount','bad').splitAmount,3600);
});
test('official previews are sourced, IDs unique, editable text escaped and persisted in both cards',()=>{
 let s=initialRearState();const html=aiScreenMarkup(s,'phone')+aiPanelMarkup(s);const ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);assert.match(html,/Без подключения к AI-сервису/);assert.match(html,/hyperos.mi.com\/ai-app-fe\/apps\/1.html/);
 s=rearAction(s,'generate','<img src=x onerror=alert(1)>');assert.ok(!aiScreenMarkup(s).includes('<img src=x'));assert.match(aiScreenMarkup(s),/&lt;img/);s=rearAction(s,'note','Новая заметка');assert.equal(s.generated,false);assert.match(aiScreenMarkup(s),/Новая заметка/);
});
test('navigation and weather start progressing on entry, independent of animation switches',()=>{
 let s=rearAction(initialRearState(),'scenario','navigation');assert.equal(navDistance(s),'180 м');s=rearTick(s,3);assert.equal(navDistance(s),'90 м');s=rearTick(s,3);assert.equal(s.route,1);assert.equal(s.navElapsed,0);s=rearAction(s,'route');assert.equal(s.route,2);
 s=rearAction(s,'scenario','cards');assert.equal(s.weatherIndex,0);s=rearTick(s,8);assert.equal(s.weatherIndex,1);assert.match(cardsMarkup(s),/rd-daily-rain/);s=rearAction(s,'card','shopping');s=rearTick(s,80);assert.equal(s.weatherIndex,1);
 s=rearAction(s,'scenario','music');assert.equal(s.playing,true);s=rearAction(s,'suspend');assert.equal(s.playing,false);
});
test('six useful cards maintain checklist, pickup and calendar state; invalid cards are ignored',()=>{
 let s=initialRearState();assert.equal(DAILY_CARDS.length,6);for(const [id]of DAILY_CARDS){s=rearAction(s,'card',id);assert.match(cardsMarkup(s),new RegExp(`rd-daily-${id}`));}assert.equal(rearAction(s,'card','invalid').card,s.card);s=rearAction(s,'pickup');assert.equal(s.pickupIndex,1);s=rearAction(s,'calendar');assert.equal(s.calendarDone,true);s=rearAction(s,'check','1');assert.deepEqual(s.shopping,[false,true,false]);
});
