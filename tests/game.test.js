import test from 'node:test';
import assert from 'node:assert/strict';
import {GOAL,LIFE_EVENTS,createGame,roll,chooseJob,police,income,getChoices,chooseEvent,livingCost,retireAtGameEnd,EVENTS,migrateGame,luxuryUpkeep} from '../game.js';
const rng=(...values)=>()=>values.length?values.shift():0;
function settle(g,random=rng(0)){while(['event','gamble'].includes(g.pending?.type))chooseEvent(g,g.pending.type==='gamble'?'play':getChoices(g).find(c=>c.id==='original')?.id||getChoices(g)[0].id,random);}
function step(g,random=Math.random){roll(g,random);settle(g,random);}
function adult(job,position=20){const g=createGame(['A']);Object.assign(g.players[0],{job,position});return g;}
test('student dark job triggers exactly once, with mandatory unskippable penalty',()=>{
 const g=createGame(['A']);const p=g.players[0];p.position=10;p.tickets=2;
 step(g,rng(.2,.8));assert.equal(p.position,12);assert.equal(p.cash,-4750000);assert.equal(p.skip,1);assert.equal(p.tickets,2);assert.ok(p.darkDone);
 step(g);assert.equal(p.position,12);assert.equal(p.skip,0);
 step(g,rng(0));assert.equal(p.position,13);assert.equal(g.log.filter(x=>x.title==='闇バイト').length,1);
});
test('entering adulthood pauses for choice and awards transition bonus once',()=>{
 const g=createGame(['A']);const p=g.players[0];p.position=20;
 step(g,rng(0));assert.equal(g.pending.type,'job');assert.equal(p.cash,300000);
 chooseJob(g,'office');settle(g);assert.equal(p.cash,4300000);assert.equal(g.pending,null);
});
test('salary loss applies for one turn and promotion is capped',()=>{
 const g=adult('office',21);const p=g.players[0];step(g,rng(0));assert.equal(p.cash,800000);assert.ok(p.noSalary);
 step(g,rng(0));assert.equal(p.cash,-200000);assert.ok(p.promoted);assert.equal(income(p),2500000);assert.equal(p.noSalary,false);
});
test('extra roll stays with player, limited to 3, without duplicate salary',()=>{
 const g=createGame(['A','B']);const p=g.players[0];Object.assign(p,{job:'office',position:23});
 step(g,rng(0));assert.ok(g.extra);assert.equal(g.current,0);assert.equal(p.cash,-700000);
 step(g,rng(.99));assert.equal(g.lastRoll,3);assert.equal(p.position,27);assert.equal(p.cash,-700000);assert.equal(g.current,1);assert.equal(p.skip,1);
});
test('police ticket is an explicit choice; accepting arrest cancels event income',()=>{
 for(const use of [true,false]){const g=adult('gang',27);const p=g.players[0];p.tickets=1;step(g,rng(0,0));assert.equal(g.pending.type,'police');police(g,use);assert.equal(p.cash,use?5300000:-1700000);assert.equal(p.skip,use?0:2);assert.equal(p.tickets,use?0:1);}
});
test('police tickets never exceed two',()=>{const g=adult('gang',22);g.players[0].tickets=2;step(g,rng(0));assert.equal(g.players[0].tickets,2);});
test('buzz clamps to 0–100 and salary follows exact thresholds',()=>{
 const g=adult('creator',21);const p=g.players[0];p.buzz=90;step(g,rng(0));assert.equal(p.buzz,100);
 p.position=22;p.buzz=5;step(g,rng(0));assert.equal(p.buzz,0);
 for(const [buzz,pay] of [[0,1000000],[20,1000000],[21,1500000],[49,1500000],[50,2500000],[79,2500000],[80,4000000],[100,4000000]]){p.buzz=buzz;assert.equal(income(p),pay);}
});
test('pachinko losses add the full loss to debt without clearing balances',()=>{
 for(const cash of [-100000,0,1999990,2000000,3000000]){const g=adult('gambler',21);const p=g.players[0];p.cash=cash;step(g,rng(0,.9));assert.equal(p.cash,cash-1000000-4000000-300000);assert.equal(p.winRate,4/6);}
});
test('health restriction and modified win rate expire after the next turn',()=>{
 const g=adult('gambler',24);const p=g.players[0];step(g,rng(0,.1));assert.ok(p.noPachinko);const cash=p.cash;step(g,rng(0,.9));assert.equal(p.noPachinko,false);assert.equal(p.cash,cash-1100000);assert.equal(p.winRate,.5);
});
test('four-player games finish with every job and valid resource bounds',()=>{
 for(let seed=1;seed<=30;seed++){
  let s=seed;const random=()=>{s=(s*1664525+1013904223)>>>0;return s/2**32;};const g=createGame(['A','B','C','D']);const jobs=['office','gang','creator','gambler'];let actions=0;
  while(!g.over&&actions++<1000){if(g.pending?.type==='job')chooseJob(g,jobs[g.current],random);else if(g.pending?.type==='police')police(g,random()<0.5);else if(['event','gamble'].includes(g.pending?.type)){const choices=getChoices(g);chooseEvent(g,choices[Math.floor(random()*choices.length)].id,random);}else roll(g,random);}
  assert.ok(g.over,`seed ${seed}`);assert.ok(g.players.every(p=>p.finished&&p.position===GOAL&&Number.isFinite(p.cash)&&p.tickets<=2&&p.buzz>=0&&p.buzz<=100));
 }
});
test('all life events replace career events, and costs are charged before choices',()=>{
 for(const job of ['office','gang','creator','gambler'])for(const [space,e] of Object.entries(LIFE_EVENTS)){
  const g=adult(job,Number(space)-1);const p=g.players[0];const before=p.cash;
  roll(g,rng(0));if(g.pending.type==='gamble')chooseEvent(g,'play',rng(0));
  if(e.luxury){const beforeChoice=p.cash;chooseEvent(g,'skip');assert.equal(p.cash,beforeChoice);continue;}
  const c=getChoices(g).find(c=>c.id==='original');const reward=c.chance!==undefined?(c.success.cash||0):e.cash;
  assert.equal(p.cash,before-(job==='gang'?1500000:1000000)+(job==='gambler'?6000000:income(p)));
  chooseEvent(g,'original',rng(0));assert.equal(p.cash,before-(job==='gang'?1500000:1000000)+(job==='gambler'?6000000:income(p))+reward);
  assert.equal(g.log.filter(x=>x.title===e.name||x.title===e.unmarriedName||x.title===e.noChildName).length,1);
 }
});
test('family milestones track marriage and children; skipped milestones get appropriate names',()=>{
 const g=adult('office',29);const p=g.players[0];step(g,rng(0));assert.equal(p.married,true);
 p.position=35;step(g,rng(0));assert.equal(p.children,1);
 p.position=38;step(g,rng(0));assert.equal(g.log[0].title,'七五三のお祝い');
 const single=adult('office',32);step(single,rng(0));assert.equal(single.log[0].title,'ごほうび旅行');
 single.players[0].position=75;step(single,rng(0));assert.equal(single.log[0].title,'親戚に赤ちゃん誕生');
});
test('60 is a regular event space; 80 is the capped goal',()=>{
 const g=adult('office',59);const p=g.players[0];step(g,rng(0));assert.equal(p.position,60);assert.equal(p.finished,false);assert.equal(g.over,false);
 p.position=79;step(g,rng(.99));assert.equal(p.position,80);assert.ok(p.finished);assert.ok(g.over);
});
test('events wait for a real choice, cannot reroll, and reject unknown choices',()=>{
 const g=createGame(['A','B']);roll(g,rng(0));const p=g.players[0];
 assert.equal(g.pending.type,'event');assert.equal(p.cash,250000);assert.equal(g.current,0);assert.ok(getChoices(g).length>=2);
 const snapshot=JSON.stringify(g);roll(g);chooseEvent(g,'invalid');assert.equal(JSON.stringify(g),snapshot);
 chooseEvent(g,'books',rng(0));assert.equal(p.cash,300000);assert.equal(g.current,1);assert.equal(g.pending,null);
 chooseEvent(g,'books',rng(0));assert.equal(p.cash,300000);
});
test('declining dark work prevents its risk and repeated offers',()=>{
 const g=createGame(['A']);g.players[0].position=11;roll(g,rng(0));assert.equal(g.pending.name,'闇バイト');chooseEvent(g,'skip');
 assert.equal(g.players[0].cash,250000);assert.equal(g.players[0].skip,0);assert.ok(g.players[0].darkDone);
 roll(g,rng(0));assert.notEqual(g.pending.name,'闇バイト');
});
test('marriage, parenthood, house, and car follow selected alternatives',()=>{
 const g=adult('office',29);const p=g.players[0];roll(g,rng(0));assert.equal(p.married,false);chooseEvent(g,'skip');assert.equal(p.married,false);assert.equal(p.cash,1300000);
 p.position=29;roll(g,rng(0));chooseEvent(g,'small');assert.equal(p.married,true);assert.equal(p.cash,1300000);
 p.position=35;roll(g,rng(0));chooseEvent(g,'skip');assert.equal(p.children,0);
 p.position=47;roll(g,rng(0));chooseEvent(g,'rent');assert.equal(p.home,false);
 p.position=50;roll(g,rng(0));chooseEvent(g,'used');assert.equal(p.car,true);
});
test('gambling requires consent and skipping preserves cash and consumes modified odds',()=>{
 const g=adult('gambler',21);const p=g.players[0];p.winRate=4/6;roll(g,rng(0));assert.equal(g.pending.type,'gamble');assert.equal(p.cash,-700000);
 chooseEvent(g,'pass');assert.equal(p.cash,-700000);assert.equal(p.winRate,0.5);assert.equal(g.pending.type,'event');chooseEvent(g,'pro',rng(0));assert.equal(p.cash,-2200000);assert.equal(p.winRate,5/6);
});
test('choices survive JSON save/reload, including gambling before event resolution',()=>{
 const g=adult('gambler',29);roll(g,rng(0));const restored=JSON.parse(JSON.stringify(g));chooseEvent(restored,'pass');
 const restoredAgain=JSON.parse(JSON.stringify(restored));assert.equal(restoredAgain.pending.name,'結婚');chooseEvent(restoredAgain,'small');assert.equal(restoredAgain.players[0].married,true);assert.equal(restoredAgain.players[0].cash,-1700000);
});
test('every event on all 80 spaces offers valid distinct options',()=>{
 for(const job of ['office','gang','creator','gambler'])for(let space=1;space<=80;space++){
  const g=createGame(['A']);const p=g.players[0];Object.assign(p,{position:space-1,job:space>20?job:null,darkDone:space>12});
  roll(g,rng(0));if(g.pending.type==='job')chooseJob(g,job);if(g.pending.type==='gamble')chooseEvent(g,'pass');
  const choices=getChoices(g);assert.ok(choices.length>=2,`${job} space ${space}`);assert.equal(new Set(choices.map(c=>c.id)).size,choices.length);assert.ok(choices.every(c=>c.label&&c.effect));
 }
});
test('last space does not declare a winner until the player has chosen',()=>{
 const g=adult('office',79);roll(g,rng(0));assert.equal(g.players[0].finished,false);assert.equal(g.over,false);chooseEvent(g,'original');assert.ok(g.over);
});
test('income opportunities preview and apply actual loss as well as gain',()=>{
 const lose=adult('creator',20);roll(lose,rng(0));const c=getChoices(lose).find(c=>c.id==='original');assert.ok(c.effect.includes('65%'));assert.ok(c.effect.includes('−2,000,000円'));
 chooseEvent(lose,'original',rng(.99));assert.equal(lose.players[0].cash,-1700000);assert.equal(lose.players[0].buzz,10);assert.ok(lose.log[0].detail.includes('失敗'));
 const win=adult('creator',20);roll(win,rng(0));chooseEvent(win,'original',rng(0));assert.equal(win.players[0].cash,2800000);assert.ok(win.log[0].detail.includes('成功'));
});
test('high and low stake student jobs have similar expected returns with distinct downside',()=>{
 const g=createGame(['A']);g.players[0].position=8;roll(g,rng(0));const [large,small]=getChoices(g);
 assert.equal(large.chance*large.success.cash+(1-large.chance)*large.failure.cash,200000);
 assert.ok(Math.abs(small.chance*small.success.cash+(1-small.chance)*small.failure.cash-180000)<1e-8);
 assert.ok(large.success.cash>small.success.cash);assert.ok(large.failure.cash<small.failure.cash);
});
test('living costs include assets and family, apply during rest, and exclude extra rolls',()=>{
 const g=adult('office',29);const p=g.players[0];Object.assign(p,{children:2,home:true,car:true,skip:1});assert.equal(livingCost(p),1900000);
 roll(g,rng(0));assert.equal(p.cash,-1600000);assert.equal(p.position,29);assert.equal(p.skip,0);
 p.position=23;p.cash=10000000;roll(g,rng(0));chooseEvent(g,'original');assert.ok(g.extra);const cash=p.cash;
 roll(g,rng(0));chooseEvent(g,'recover');assert.equal(p.cash,cash-1000000); // only the event cost, no second living-cost charge
});
test('retirement is paid once at global game end, not when an earlier player finishes',()=>{
 const g=createGame(['A','B']);Object.assign(g.players[0],{job:'office',position:80,finished:true,cash:10000000});Object.assign(g.players[1],{job:'office',position:79,cash:-3500000});g.current=1;
 retireAtGameEnd(g);assert.equal(g.players[0].cash,10000000);assert.equal(g.players[0].retired,false);
 roll(g,rng(0));assert.equal(g.over,false);chooseEvent(g,'skip');assert.ok(g.over);assert.ok(g.settled);
 assert.equal(g.players[0].retirementBase,10000000);assert.equal(g.players[0].retirementBonus,4000000);assert.equal(g.players[0].cash,14000000);
 assert.equal(g.players[1].retirementBonus,0);assert.equal(g.players[1].cash,-2500000);
 const snapshot=JSON.stringify(g);retireAtGameEnd(g);assert.equal(JSON.stringify(g),snapshot);const restored=JSON.parse(snapshot);retireAtGameEnd(restored);assert.equal(JSON.stringify(restored),snapshot);
});
test('retirement applies to every career, floors fractions, and leaves debts negative',()=>{
 for(const job of ['office','gang','creator','gambler'])for(const cash of [-10000000,-1,0,1,999990,10000000]){
  const g=adult(job);const p=g.players[0];Object.assign(p,{position:80,finished:true,cash});g.over=true;retireAtGameEnd(g);
  const bonus=cash>0?Math.floor(cash*2/5):0;assert.equal(p.retirementBase,cash);assert.equal(p.retirementBonus,bonus);assert.equal(p.cash,cash+bonus);assert.ok(p.retired);
 }
});
test('retirement is absent from spaces; previous office payout slots now offer qualifications',()=>{
 assert.ok(Object.values(EVENTS).every(names=>!names.some(n=>n.includes('退職'))));const g=adult('office',27);roll(g,rng(0));assert.equal(g.pending.name,'資格取得');assert.ok(getChoices(g).every(c=>!c.effect.includes('＋1000万円')));
});
test('bankruptcy increases an existing debt instead of forgiving it',()=>{
 const g=adult('office',24);g.players[0].cash=-2000000;roll(g,rng(0));chooseEvent(g,'original');assert.equal(g.players[0].cash,-1500000);
});
test('luxury purchases require consent, can create debt, and increase upkeep',()=>{
 const g=adult('office',45);const p=g.players[0];roll(g,rng(0));assert.equal(g.pending.name,'ゴリゴリのロレックス購入');assert.equal(p.cash,1300000);assert.equal(p.luxuryAssets.length,0);
 const choices=getChoices(g);assert.ok(choices.find(c=>c.id==='gold').effect.includes('600万円'));chooseEvent(g,'gold');assert.equal(p.cash,-4700000);assert.equal(p.luxuryAssets[0].assetKey,'rolexGold');assert.equal(luxuryUpkeep(p),50000);assert.equal(livingCost(p),1050000);
 const before=p.cash;roll(g,rng(0));assert.equal(p.cash,before-1050000+2000000);chooseEvent(g,'skip');
});
test('luxury watch and car can both be declined with no asset or fee changes',()=>{
 for(const position of [45,57]){const g=adult('office',position);roll(g,rng(0));const before=g.players[0].cash;chooseEvent(g,'skip');assert.equal(g.players[0].cash,before);assert.equal(g.players[0].luxuryAssets.length,0);assert.equal(luxuryUpkeep(g.players[0]),0);}
});
test('luxury resale happens before retirement and can leave either wealth or debt',()=>{
 for(const [draw,value,cash,bonus] of [[0,90000000,72800000,20800000],[.99,16000000,-22000000,0]]){
  const g=adult('office');const p=g.players[0];Object.assign(p,{position:80,finished:true,cash:-38000000,luxuryAssets:[{assetKey:'luxuryLimited',sold:false}]});g.over=true;
  retireAtGameEnd(g,rng(draw));assert.equal(p.assetSaleTotal,value);assert.equal(p.cash,cash);assert.equal(p.retirementBonus,bonus);assert.equal(p.luxuryAssets[0].saleValue,value);assert.ok(p.assetsSold);assert.equal(luxuryUpkeep(p),0);
  const snapshot=JSON.stringify(g);retireAtGameEnd(g,()=>{throw Error('Must not reroll resale')});assert.equal(JSON.stringify(g),snapshot);const restored=JSON.parse(snapshot);retireAtGameEnd(restored,()=>{throw Error('Must not reroll resale after reload')});assert.equal(JSON.stringify(restored),snapshot);
 }
});
test('luxury resale waits for all players to reach the goal',()=>{
 const g=createGame(['A','B']);const p=g.players[0];Object.assign(p,{job:'office',position:80,finished:true,cash:-6000000,luxuryAssets:[{assetKey:'rolexGold',sold:false}]});Object.assign(g.players[1],{job:'office',position:79});g.current=1;
 retireAtGameEnd(g,rng(0));assert.equal(p.cash,-6000000);assert.equal(p.luxuryAssets[0].sold,false);
 roll(g,rng(0));chooseEvent(g,'skip',rng(.99));assert.ok(g.over);assert.equal(p.assetSaleTotal,2000000);assert.equal(p.cash,-4000000);assert.equal(p.retirementBonus,0);
});
test('bubble save migration scales actual cash and debt once, preserving historical logs',()=>{
 const g=createGame(['A','B']);g.version=4;g.players[0].cash=1234567;g.players[1].cash=-2000000;g.log=[{player:'A',title:'以前の記録',detail:'＋¥1,000',round:1}];migrateGame(g);
 assert.equal(g.players[0].cash,12345670);assert.equal(g.players[1].cash,-20000000);assert.equal(g.log[1].detail,'＋¥1,000');const snapshot=JSON.stringify(g);migrateGame(g);assert.equal(JSON.stringify(g),snapshot);
});
test('old settled retirement and pending luxury-square choices migrate without double payouts or invalid actions',()=>{
 const g=adult('office');g.version=4;Object.assign(g.players[0],{position:80,finished:true,cash:1400000,retirementBase:1000000,retirementBonus:400000,retired:true});g.over=true;g.settled=true;migrateGame(g);
 assert.equal(g.players[0].cash,14000000);assert.equal(g.players[0].retirementBonus,4000000);assert.equal(g.players[0].retirementBase,10000000);
 const pending=adult('office',46);pending.version=4;pending.pending={type:'event',source:'career',key:'鬱',name:'鬱'};migrateGame(pending);assert.equal(pending.pending.source,'life');assert.equal(pending.pending.key,46);chooseEvent(pending,'gold');assert.ok(Number.isFinite(pending.players[0].cash));
});
