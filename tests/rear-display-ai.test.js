import test from 'node:test';
import assert from 'node:assert/strict';
import {AI_CARDS,aiScreenMarkup,aiPanelMarkup} from '../js/rear-display-ai.js';
import {initialRearState,rearAction,rearTick} from '../js/rear-display-state.js';
import {MAZE,mazeStep} from '../js/rear-display-games.js';
import {DAILY_CARDS,cardsMarkup,navDistance} from '../js/rear-display-daily.js';
test('six independently playable Global templates replace retired water and vocabulary cards',()=>{
 let s=initialRearState();assert.equal(s.ai,'coin');assert.deepEqual(AI_CARDS.map(c=>c.id),['coin','reaction','fortune','compliment','fruit','maze']);
 for(const c of AI_CARDS){s=rearAction(s,'ai',c.id);assert.equal(s.ai,c.id);assert.match(aiScreenMarkup(s),new RegExp(`data-ai-kind="${c.id}"`));}
 for(const old of ['water','words','split','note'])assert.equal(rearAction(s,'ai',old).ai,s.ai);
 assert.doesNotMatch(aiPanelMarkup(s),/water|созвезди|data-rd-action="motion"/);
});
test('reaction requires a ready phase and finite elapsed time; early taps and suspension recover',()=>{
 let s=initialRearState();assert.equal(rearAction(s,'reactionTap',100).reaction,'idle');s=rearAction(s,'reactionStart');assert.equal(rearAction(s,'reactionTap',100).reaction,'early');s=rearAction(s,'reactionGo');assert.equal(s.reaction,'go');assert.equal(rearAction(s,'reactionTap','bad').reaction,'go');s=rearAction(s,'reactionTap',231.7);assert.equal(s.reaction,'done');assert.equal(s.reactionMs,232);s=rearAction(s,'reactionStart');assert.equal(rearAction(s,'suspend').reaction,'idle');
});
test('maze blocks walls and boundaries but has a traversable path to the goal; reset is safe',()=>{
 const start={x:1,y:1};assert.deepEqual(mazeStep(start,'up'),start);assert.deepEqual(mazeStep(start,'left'),start);assert.deepEqual(mazeStep(start,'bogus'),start);
 let s=rearAction(initialRearState(),'ai','maze');for(const d of ['right','right','right','right','down','down','down','down'])s=rearAction(s,'maze',d);assert.deepEqual(s.maze,{x:5,y:5});assert.match(aiScreenMarkup(s),/Получилось/);assert.deepEqual(rearAction(s,'gameReset').maze,start);assert.equal(MAZE[5][5],'.');
});
test('coin, fortune and fruit controls progress independently and illustrations have unique IDs',()=>{
 let s=initialRearState();s=rearAction(s,'coin',1);assert.equal(s.coin,'Орёл');s=rearAction(s,'coin',0);assert.equal(s.coin,'Решка');assert.equal(s.throws,2);s=rearAction(s,'fortune');assert.equal(s.fortune,0);for(let i=0;i<4;i++)s=rearAction(s,'fortune');assert.equal(s.fortune,0);for(let i=0;i<1005;i++)s=rearAction(s,'fruit');assert.equal(s.fruit,999);
 for(const c of AI_CARDS){s=rearAction(s,'ai',c.id);const html=aiScreenMarkup(s,'phone')+aiPanelMarkup(s),ids=[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);assert.equal(new Set(ids).size,ids.length);assert.match(html,/AI-сервис не подключен/);}
 s=rearAction(s,'generate','<img src=x onerror=alert(1)>');assert.ok(!aiPanelMarkup(s).includes('<img src=x'));assert.match(aiPanelMarkup(s),/&lt;img/);
});
test('navigation and weather advance automatically; suspend stops music',()=>{
 let s=rearAction(initialRearState(),'scenario','navigation');assert.equal(navDistance(s),'180 м');s=rearTick(s,3);assert.equal(navDistance(s),'90 м');s=rearTick(s,3);assert.equal(s.route,1);s=rearAction(s,'scenario','cards');s=rearTick(s,8);assert.equal(s.weatherIndex,1);assert.match(cardsMarkup(s),/rd-daily-rain/);s=rearAction(s,'card','shopping');s=rearTick(s,80);assert.equal(s.weatherIndex,1);s=rearAction(s,'scenario','music');assert.equal(s.playing,true);assert.equal(rearAction(s,'suspend').playing,false);
});
test('six useful cards preserve checklist, pickup and calendar across AI interactions',()=>{
 let s=initialRearState();assert.equal(DAILY_CARDS.length,6);for(const [id]of DAILY_CARDS){s=rearAction(s,'card',id);assert.match(cardsMarkup(s),new RegExp(`rd-daily-${id}`));}assert.equal(rearAction(s,'card','invalid').card,s.card);s=rearAction(s,'pickup');s=rearAction(s,'calendar');s=rearAction(s,'check','1');s=rearAction(s,'ai','fortune');assert.equal(s.pickupIndex,1);assert.equal(s.calendarDone,true);assert.deepEqual(s.shopping,[false,true,false]);
});
