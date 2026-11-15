import test from 'node:test';
import assert from 'node:assert/strict';
import {initialHyperOS,hyperOSAction as action,calculatorKey,hyperOSGesture} from '../js/hyperos-state.js';
const keys=values=>values.reduce(calculatorKey,initialHyperOS().calc);
test('calculator handles chained arithmetic, decimal/percentage and recovery after division by zero without eval',()=>{
 assert.equal(keys(['2','+','3','×','4','=']).display,'20');assert.equal(keys(['1','.','5','+','2','.','5','=']).display,'4');assert.equal(keys(['2','0','0','%']).display,'2');assert.equal(keys(['8','÷','0','=']).display,'Ошибка');assert.equal(keys(['8','÷','0','=','2','+','3','=']).display,'5');assert.equal(keys(['5','±']).display,'-5');assert.equal(keys(['1','+','2','AC']).display,'0');assert.equal(keys(['.','.']).display,'0.');
});
test('app switching preserves edited notes, settings and calculator state; unknown applications are rejected',()=>{
 let s=initialHyperOS();s=action(s,'open','notes');s=action(s,'note','Забрать заказ');s=action(s,'open','home');assert.equal(s.note,'Забрать заказ');s=action(s,'wifi');assert.equal(s.wifi,false);s=action(s,'brightness','-1');assert.equal(s.brightness,0);s=action(s,'brightness','500');assert.equal(s.brightness,100);assert.equal(action(s,'brightness','bad').brightness,100);s=action(s,'open','smart-home');assert.equal(s.view,'smart-home');assert.equal(action(s,'open','javascript:alert(1)').view,'smart-home');assert.equal(action(s,'lamp').lamp,false);
});
test('demo dialer and messages keep local bounded state; no real call or message integration exists',()=>{
 let s=initialHyperOS();assert.equal(action(s,'call').calling,false);for(const n of ['8','9','9','9'])s=action(s,'dial',n);assert.equal(s.number,'8999');s=action(s,'call');assert.equal(s.calling,true);s=action(s,'call');assert.equal(s.calling,false);s=action(s,'message','Привет');s=action(s,'send');assert.deepEqual(s.sent,['Привет']);assert.equal(s.message,'');s=action(s,'message',' ');assert.equal(action(s,'send').sent.length,1);s=action(s,'note','x'.repeat(500));assert.equal(s.note.length,160);
});
test('swipe recognition distinguishes control center, notifications and home from taps and horizontal motion',()=>{
 const gesture={startY:10,startX:90,width:100,height:220,dx:0,dy:65,view:'home'};assert.equal(hyperOSGesture(gesture),'controls');assert.equal(hyperOSGesture({...gesture,startX:10}),'notifications');assert.equal(hyperOSGesture({...gesture,dy:4}),null);assert.equal(hyperOSGesture({...gesture,dx:100}),null);assert.equal(hyperOSGesture({...gesture,view:'lock',dy:-70}),'home');assert.equal(hyperOSGesture({...gesture,startY:200,dy:-70}),'home');assert.equal(hyperOSGesture({...gesture,startY:100,view:'notes',dy:70}),null);
});
