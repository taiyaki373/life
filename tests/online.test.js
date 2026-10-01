import {test} from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from '../server.js';

test('online rooms enforce membership, host and turn ownership, sync choices and reject duplicate actions',async t=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port;
 const request=async(path,body,token)=>{const res=await fetch(base+'/api/rooms'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:body?JSON.stringify(body):undefined});return {status:res.status,data:await res.json()};};
 const {data:host}=await request('',{name:'ホスト'});assert.match(host.code,/^[A-Z2-9]{6}$/);assert.ok(host.token);assert.equal(host.host,true);
 assert.equal((await request('/'+host.code)).status,401);
 assert.equal((await request('/'+host.code+'/action',{action:'start',revision:0},host.token)).status,400);
 const {data:guest}=await request('/'+host.code+'/join',{name:'ゲスト'});
 assert.equal(guest.playerId,1);assert.equal(guest.host,false);assert.equal(guest.members[0].token,undefined);
 const action=(who,action,revision,value)=>request('/'+host.code+'/action',{action,revision,value},who.token);
 assert.equal((await action(guest,'start',1)).status,403);
 const started=await action(host,'start',1);assert.equal(started.status,200);assert.equal(started.data.game.players.length,2);
 assert.equal((await request('/'+host.code+'/join',{name:'途中参加'})).status,400);
 assert.equal((await action(guest,'roll',2)).status,403);
 assert.equal((await action(host,'roll',1)).status,409);
 const rolled=await action(host,'roll',2);assert.equal(rolled.status,200);assert.ok(rolled.data.game.pending);assert.ok(rolled.data.game.players[0].position>=1);
 assert.equal((await action(host,'roll',2)).status,409);
 assert.equal((await action(host,'roll',3)).status,400);
 assert.equal((await action(host,'choice',3,'invalid')).status,400);
 const {getChoices}=await import('../game.js');const selected=await action(host,'choice',3,getChoices(rolled.data.game)[0].id);assert.equal(selected.status,200);
 const resumed=await request('/'+host.code,undefined,guest.token);assert.deepEqual(resumed.data.game,selected.data.game);
 assert.equal((await action(guest,'restart',4)).status,403);
 assert.equal((await action(host,'restart',4)).data.game,null);
 assert.equal((await fetch(base+'/package.json')).status,404);
 const forbidden=await fetch(base+'/api/rooms',{method:'POST',headers:{Origin:'https://evil.example','Content-Type':'application/json'},body:JSON.stringify({name:'x'})});assert.equal(forbidden.status,403);
});

test('room limit is four and invalid names are rejected',async t=>{
 const server=createServer();await new Promise(r=>server.listen(0,'127.0.0.1',r));t.after(()=>new Promise(r=>server.close(r)));
 const base='http://127.0.0.1:'+server.address().port+'/api/rooms';
 const post=(url,name)=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name})});
 assert.equal((await post(base,'')).status,400);const host=await(await post(base,'A')).json();
 for(const name of ['B','C','D'])assert.equal((await post(base+'/'+host.code+'/join',name)).status,201);
 assert.equal((await post(base+'/'+host.code+'/join','E')).status,400);
});
