const $=id=>document.getElementById(id);
const KEY='life-online-session';
let session=null,state=null,timer=null,working=false,polling=false;
export const online={get active(){return !!session;},get mine(){return !!state?.game&&state.playerId===state.game.current;},get host(){return !!state?.host;},get working(){return working;}};
export function initOnline(onState,onExit){
 const message=text=>$('online-message').textContent=text;
 async function request(path,body){
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),10000);
  try{const res=await fetch('/api/rooms'+path,{method:body?'POST':'GET',headers:{'Content-Type':'application/json',...(session?{Authorization:'Bearer '+session.token}:{})},body:body?JSON.stringify(body):undefined,signal:controller.signal});const data=await res.json();if(!res.ok)throw new Error(data.error);return data;}finally{clearTimeout(timeout);}
 }
 function apply(data){if(!session||data.code!==session.code||(state&&data.revision<state.revision))return;const changed=!state||state.revision!==data.revision;state=data;
  $('online-entry').hidden=true;$('room-panel').hidden=false;$('setup').hidden=true;
  $('room-title').textContent='ROOM '+data.code+(data.host?' · ホスト':'');
  $('room-members').textContent=data.members.map(p=>p.name+(p.id===data.playerId?'（あなた）':'')).join(' ／ ');
  $('online-start').hidden=!!data.game||!data.host;$('online-start').disabled=data.members.length<2||working;
  $('room-status').textContent=data.game?(data.game.over?'対戦終了':data.playerId===data.game.current?'あなたのターンです。':data.game.players[data.game.current].name+'のターンを待っています。'):data.host?'2〜4人そろったら開始できます。':'ホストの開始を待っています。';
  $('new-game').disabled=!data.host||working;
  if(changed)onState(data.game);
 }
 async function poll(){if(!session||polling||working)return;polling=true;try{apply(await request('/'+session.code));message('接続中 · 進行は自動で同期されます');}catch(e){message('接続を確認中：'+e.message+' 再接続を自動で試みます。');}finally{polling=false;}}
 async function enter(join){if(working)return;working=true;try{const name=$('online-name').value.trim(),code=$('room-code').value.trim().toUpperCase();const data=await request(join?'/'+code+'/join':'',{name});session={code:data.code,token:data.token};sessionStorage.setItem(KEY,JSON.stringify(session));state=null;apply(data);clearInterval(timer);timer=setInterval(poll,1000);message('参加しました。招待リンクを友達に共有してください。');}catch(e){message(e.message);}finally{working=false;if(state)apply(state);}}
 online.action=async(action,value)=>{if(working||!session)return;working=true;try{apply(await request('/'+session.code+'/action',{action,value,revision:state.revision}));message('進行を同期しました。');}catch(e){message(e.message);try{apply(await request('/'+session.code));}catch{}}finally{working=false;if(state){apply(state);onState(state.game);}}};
 online.leave=()=>{session=null;state=null;clearInterval(timer);sessionStorage.removeItem(KEY);$('online-entry').hidden=false;$('room-panel').hidden=true;message('退出しました。対戦中なら同じタブで退出せず再読み込みすると復帰できます。');onExit();};
 $('create-room').onclick=()=>enter(false);$('join-room').onclick=()=>enter(true);$('online-start').onclick=()=>online.action('start');$('leave-room').onclick=online.leave;
 $('copy-invite').onclick=async()=>{const url=new URL(location.href);url.searchParams.set('room',session.code);try{await navigator.clipboard.writeText(url.href);message('招待リンクをコピーしました。');}catch{message('招待リンク：'+url.href);}};
 $('room-code').value=new URL(location.href).searchParams.get('room')?.toUpperCase()||'';
 try{session=JSON.parse(sessionStorage.getItem(KEY));if(session?.code&&session?.token){$('setup').hidden=true;$('game').hidden=true;poll();timer=setInterval(poll,1000);}else session=null;}catch{session=null;}
}
