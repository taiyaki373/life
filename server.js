import http from 'node:http';
import {readFile} from 'node:fs/promises';
import {randomBytes,randomInt} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {createGame,roll,chooseJob,chooseEvent,getChoices,police,JOBS} from './game.js';
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status});};
const nameOf=value=>{if(typeof value!=='string'||!value.trim()||value.trim().length>16)fail('名前を1〜16文字で入力してください。');return value.trim();};
export function createServer(){
 const rooms=new Map();
 const view=(r,m)=>({code:r.code,revision:r.revision,host:m.token===r.members[0].token,playerId:r.members.indexOf(m),members:r.members.map((p,id)=>({id,name:p.name})),game:r.game});
 const files=new Map(['index.html','app.js','online.js','style.css','game.js','decisions.js','luxury.js'].map(f=>['/'+f,f]));files.set('/','index.html');
 const server=http.createServer(async(req,res)=>{
  const send=(status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(data));};
  try{
   const url=new URL(req.url,'http://localhost');
   if(url.pathname.startsWith('/api/')){
    if(req.headers.origin&&req.headers.origin!==`http://${req.headers.host}`&&req.headers.origin!==`https://${req.headers.host}`&&req.headers.origin!==`https://${String(req.headers['x-forwarded-host']||'').split(',')[0].trim()}`)fail('別サイトからの操作は許可されません。',403);
    let body={};if(req.method==='POST'){let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>4096)fail('リクエストが大きすぎます。',413);}try{body=JSON.parse(raw);}catch{fail('入力形式を確認してください。');}}
    const path=url.pathname.split('/').filter(Boolean);
    if(path[1]==='rooms'&&path.length===2&&req.method==='POST'){
     for(const [code,r] of rooms)if(Date.now()-r.touched>86400000)rooms.delete(code);
     if(rooms.size>=1000)fail('ルームが満員です。',503);
     let code;do{code=Array.from({length:6},()=> 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[randomInt(31)]).join('');}while(rooms.has(code));
     const member={name:nameOf(body.name),token:randomBytes(24).toString('hex')};const room={code,members:[member],game:null,revision:0,touched:Date.now()};rooms.set(code,room);return send(201,{...view(room,member),token:member.token});
    }
    const r=rooms.get(path[2]);if(!r||Date.now()-r.touched>86400000)fail('ルームが見つかりません。コードを確認してください。',404);
    if(path[3]==='join'&&req.method==='POST'){
     if(r.game)fail('対戦は開始済みです。');if(r.members.length>=4)fail('このルームは4人で満員です。');
     const member={name:nameOf(body.name),token:randomBytes(24).toString('hex')};r.members.push(member);r.revision++;r.touched=Date.now();return send(201,{...view(r,member),token:member.token});
    }
    const m=r.members.find(p=>req.headers.authorization===`Bearer ${p.token}`);if(!m)fail('ルームへの再参加が必要です。',401);
    r.touched=Date.now();
    if(path.length===3&&req.method==='GET')return send(200,view(r,m));
    if(path[3]==='action'&&req.method==='POST'){
     if(body.revision!==r.revision)fail('最新の進行を読み込みました。もう一度操作してください。',409);
     if(body.action==='start'||body.action==='restart'){
      if(m!==r.members[0])fail('開始・やり直しはホストが操作します。',403);
      if(body.action==='start'&&(r.game||r.members.length<2))fail('2〜4人そろってから開始してください。');
      if(body.action==='restart')r.game=null;else r.game=createGame(r.members.map(p=>p.name));
     }else{
      const g=r.game;if(!g||g.over)fail('対戦中ではありません。');if(r.members.indexOf(m)!==g.current)fail('自分のターンをお待ちください。',403);
      if(body.action==='roll'){if(g.pending)fail('先に行動を選んでください。');roll(g);}
      else if(body.action==='job'){if(g.pending?.type!=='job'||!Object.hasOwn(JOBS,body.value))fail('職業を確認してください。');chooseJob(g,body.value);}
      else if(body.action==='choice'){if(!getChoices(g).some(c=>c.id===body.value))fail('選択肢を確認してください。');chooseEvent(g,body.value);}
      else if(body.action==='police'){if(g.pending?.type!=='police'||typeof body.value!=='boolean')fail('選択肢を確認してください。');police(g,body.value);}
      else fail('不明な操作です。');
     }
     r.revision++;return send(200,view(r,m));
    }
    fail('APIが見つかりません。',404);
   }
   if(req.method!=='GET'&&req.method!=='HEAD')fail('未対応の操作です。',405);
   const file=files.get(url.pathname);if(!file)fail('ページが見つかりません。',404);
   const data=await readFile(fileURLToPath(new URL(file,import.meta.url)));
   res.writeHead(200,{'Content-Type':file.endsWith('.html')?'text/html; charset=utf-8':file.endsWith('.css')?'text/css; charset=utf-8':'text/javascript; charset=utf-8','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});res.end(req.method==='HEAD'?undefined:data);
  }catch(e){send(e.status||500,{error:e.status?e.message:'サーバーで問題が発生しました。'});}
 });
 return server;
}
if(process.argv[1]===fileURLToPath(import.meta.url))createServer().listen(Number(process.env.PORT)||3000,'0.0.0.0',()=>console.log('LIFE server: http://localhost:'+ (process.env.PORT||3000)));
