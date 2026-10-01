import {online,initOnline} from './online.js';
import {GOAL,LIFE_EVENTS,JOBS,STUDENT,EVENTS,money,income,createGame,roll,chooseJob,police,getChoices,chooseEvent,livingCost,retireAtGameEnd,migrateGame,luxuryUpkeep} from './game.js';
const $=id=>document.getElementById(id);
const colors=['#7382de','#dd9370','#72aa95','#b88acb'];
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let game=null,busy=false;
const STORAGE='life-v1';
const luxurySummary=p=>{const assets=(p.luxuryAssets||[]).filter(a=>!a.sold);return [assets.filter(a=>a.assetKey.startsWith('rolex')).length?`ロレックス ${assets.filter(a=>a.assetKey.startsWith('rolex')).length}本`:'',assets.filter(a=>a.assetKey.startsWith('luxury')).length?`高級車 ${assets.filter(a=>a.assetKey.startsWith('luxury')).length}台`:''].filter(Boolean).join(' · ');};
function persist(){if(online.active)return;try{localStorage.setItem(STORAGE,JSON.stringify(game));}catch{ $('roll-note').textContent='保存できないため、この画面で続けて遊んでください。';}}
function careers(select=false){return Object.entries(JOBS).map(([id,j])=>`<${select?'button':'article'} ${select?`data-job="${id}"`:''} class="career-card" style="--job-color:${j.color}"><div class="career-top"><span class="job-icon">${j.icon}</span><span class="job-type">${j.type}</span></div><h3>${j.name}</h3><p class="career-tagline">${j.tagline}</p><p class="career-description">${j.description}</p><div class="career-income">${j.income}${select?' <span>→</span>':''}</div></${select?'button':'article'}>`).join('');}
$('career-cards').innerHTML=careers();
function names(){const count=Number($('player-count').value);$('name-fields').innerHTML=Array.from({length:count},(_,i)=>`<label class="name-field"><span style="background:${colors[i]}">${i+1}</span><input id="name-${i}" maxlength="16" aria-label="プレイヤー${i+1}の名前" placeholder="プレイヤー ${i+1}"></label>`).join('');}
$('player-count').onchange=names;names();
function modal(html){$('dialog-content').innerHTML=html+(game?.pending?'<button class="quiet restart-in-dialog" id="restart-choice">↺ スタートからやり直す</button>':'');if(game?.pending)$('restart-choice').onclick=confirmRestart;if(!$('dialog').open)$('dialog').showModal();}
function close(){$('dialog').close();}
function board(){
 const p=game.players[game.current];
 for(const [container,start,end] of [['student-board',1,20],['adult-board',21,GOAL]]){
  $(container).innerHTML=Array.from({length:end-start+1},(_,i)=>{const n=i+start;const people=game.players.filter(p=>p.position===n);const visited=n<p.position;const life=LIFE_EVENTS[n];const title=life?life.name:n<=20?(n===12?'闇バイト（12マス通過後に一度）':n===18?'教師逮捕':STUDENT[(n-1)%9][0]):p.job?EVENTS[p.job][(n-21)%EVENTS[p.job].length]:'職業別イベント';return `<div class="space ${visited?'visited':''} ${people.length?'occupied':''} ${n===GOAL?'goal':''} ${life?'life-space':''} ${life?.luxury?'luxury-space':''}" title="${n}：${esc(title)}"><span class="space-number">${String(n).padStart(2,'0')}</span><span class="space-symbol">${n===GOAL?'⚑':life?life.icon:n===12?'!':n===18?'⚡':n<=20?'·':['✦','◇','○','↗'][i%4]}</span>${life?`<span class="space-label">${life.label}</span>`:""}<div class="tokens">${people.map(q=>`<span style="--player-color:${colors[q.id]}" title="${esc(q.name)}">${q.id+1}</span>`).join('')}</div></div>`;}).join('');
 }
}
function render(){
 if(!game)return;$('setup').hidden=true;$('game').hidden=false;
 const p=game.players[game.current];
 $('turn-label').textContent=game.over?'ゲーム終了':`ROUND ${String(game.round).padStart(2,'0')} · ${p.name}のターン`;
 $('active-player').innerHTML=`<div class="active-name"><span class="avatar" style="--player-color:${colors[p.id]}">${p.id+1}</span><div><h2>${esc(p.name)}</h2><span class="muted small">${p.job?JOBS[p.job].name:'学生'} · ${p.position} / ${GOAL}マス</span></div></div><div class="balance"><span>所持金</span><strong>${money(p.cash)}</strong></div><div class="player-stats"><span>${p.job==='creator'?`バズ度 ${p.buzz}/100`:p.job==='gambler'?`次回勝率 ${Math.round(p.winRate*100)}%`:p.job?`給与 ${money(income(p))}`:'社会人まであと '+(21-p.position)+'マス'}</span><span>思い出 ${p.joy||0}個 · ゴール時に＋${money((p.joy||0)*1000000)}</span><span>休み ${p.skip}ターン${p.job==='gang'?` · 権利 ${p.tickets}/2`:''}</span><span>生活費 ${money(livingCost(p))} / ターン</span>${p.job?`<span>${p.married?'既婚':'未婚'} · 子ども ${p.children||0}人${p.home?' · 持ち家':''}${p.car?' · 車あり':''}</span>${luxurySummary(p)?`<span class="luxury-status">♔ ${luxurySummary(p)} · 維持費 ${money(luxuryUpkeep(p))}/ターン</span>`:''}`:''}</div>`;
 $('dice').textContent=game.lastRoll?['⚀','⚁','⚂','⚃','⚄','⚅'][game.lastRoll-1]:'⚀';
 $('dice-hint').textContent=game.over?'80マスの旅、おつかれさま！':p.skip?'このターンはお休みです。':game.extra?'もう一度！ 出目は1〜3。':'さあ、人生を動かそう。';
 $('roll').disabled=busy||!!game.pending||game.over||(online.active&&(!online.mine||online.working));
 $('roll-note').textContent=online.active?(online.mine?'あなたの端末から操作できます。':'自分のターンまでお待ちください。'):'出目は1〜6 · 止まったマスで行動を選択';
 $('roll').innerHTML=p.skip?'お休みを消化する <span>→</span>':game.extra?'追加で振る <span>↗</span>':'サイコロを振る <span>↗</span>';
 $('players').innerHTML=game.players.map(q=>`<div class="player-row ${q.id===p.id&&!game.over?'is-active':''}"><span class="avatar" style="--player-color:${colors[q.id]}">${q.id+1}</span><div class="player-info"><strong>${esc(q.name)}</strong><small>${q.finished?'⚑ ゴール':q.job?JOBS[q.job].name:'学生'} · ${q.position}マス</small></div><strong class="player-money ${q.cash<0?'negative':''}">${money(q.cash)}</strong></div>`).join('');
 $('history-count').textContent=game.log.length;
 $('history').innerHTML=game.log.length?game.log.map((e,i)=>`<div class="history-row"><span class="history-dot ${i===0?'latest':''}"></span><div><strong>${esc(e.title)}</strong><p>${esc(e.detail)}</p></div><span class="history-player">${esc(e.player)}<small>ROUND ${e.round}</small></span></div>`).join(''):'<div class="empty-history">最初のひと振りから、あなたの物語が始まります。</div>';
 board();persist();
 if(online.active&&!online.mine&&game.pending){
  close();
 }else if(game.pending?.type==='job'){
  modal(`<p class="eyebrow">A NEW CHAPTER</p><h2>${esc(p.name)}、社会人へようこそ。</h2><p class="muted">お祝い100万円を受け取りました。これからの職業を選ぼう。</p><div class="career-grid job-selection">${careers(true)}</div>`);
  document.querySelectorAll('[data-job]').forEach(el=>el.onclick=()=>{act('job',el.dataset.job);});
 } else if(game.pending?.type==='police'){
  modal(`<p class="eyebrow">UNEXPECTED EVENT</p><h2>警察に見つかった！</h2><p>警察スキップ権を1枚使えば、300万円の損失と2ターン休みを回避し、イベント収入400万円を受け取れます。</p><p class="muted">所持している権利：${p.tickets}枚</p><div class="modal-actions"><button class="primary" id="use-ticket">1枚使う</button><button class="secondary" id="save-ticket">使わず−300万円・2ターン休む</button></div>`);
  $('use-ticket').onclick=()=>{act('police',true);};$('save-ticket').onclick=()=>{act('police',false);};
 } else if(['event','gamble'].includes(game.pending?.type)){
  const pending=game.pending,choices=getChoices(game);
  modal(`<p class="eyebrow">${pending.source==='life'&&LIFE_EVENTS[pending.key]?.luxury?'BUBBLE LUXURY CLUB':'YOUR LIFE, YOUR CHOICE'}</p><div class="choice-player"><span class="avatar" style="--player-color:${colors[p.id]}">${p.id+1}</span><span>${esc(p.name)}の選択 · ${p.position} / ${GOAL}マス</span></div><h2>${esc(pending.name)}</h2><p class="muted">${pending.source==='life'&&LIFE_EVENTS[pending.key]?.luxury?'バブルの主役はあなた。購入額・維持費・売却リスクを比べて選ぼう。':'どうしますか？ 効果を確認して、あなたの行動を選んでください。'}</p><div class="choice-balance">現在の所持金 <strong>${money(p.cash)}</strong></div><div class="event-choices">${choices.map(c=>`<button class="event-choice" data-choice="${c.id}"><span class="choice-label">${esc(c.label)} <span>→</span></span><span class="choice-effect">${esc(c.effect)}</span></button>`).join('')}</div><button class="quiet choice-history" id="event-history">人生の記録を確認 ↗</button>`);
  document.querySelectorAll('[data-choice]').forEach(el=>el.onclick=()=>{act('choice',el.dataset.choice);});
  $('event-history').onclick=()=>$('history-dialog').showModal();
 }else if(game.over)showResults();
}
function showResults(){
 const ranked=[...game.players].sort((a,b)=>b.cash-a.cash);
 modal(`<p class="eyebrow">WHAT A LIFE!</p><h2>あなたの人生、ゴールしました。</h2><p class="muted">高級品売却と思い出ボーナスを加えた後、所持金の40％を退職金として支給しました。精算後の所持金でランキングします。</p><div class="results">${ranked.map((p,i)=>`<div class="result-row"><span>${i>0&&p.cash===ranked[i-1].cash?ranked.findIndex(q=>q.cash===p.cash)+1:i+1}</span><div><strong>${esc(p.name)}</strong><small>${JOBS[p.job].name}</small><div class="retirement-breakdown">${p.assetSaleTotal?`<span>高級品売却 ＋${money(p.assetSaleTotal)}</span>`:""}<span>思い出 ${p.joy||0}個 ＋${money(p.joyBonus||0)}</span><span>退職前 ${money(p.retirementBase??p.cash)}</span><span>退職金 ＋${money(p.retirementBonus||0)}</span></div></div><strong class="${p.cash<0?'negative':''}">${money(p.cash)}</strong></div>`).join('')}</div><div class="modal-actions"><button id="again" class="primary">もう一度遊ぶ →</button><button id="see-board" class="secondary">盤面を見る</button></div>`);
 $('again').textContent=online.active?(online.host?'同じメンバーでやり直す':'ルームから退出'):'もう一度遊ぶ →';$('again').onclick=()=>online.active?(online.host?online.action('restart'):online.leave()):reset();$('see-board').onclick=close;
}
function reset(){close();$('restart-dialog').close();$('history-dialog').close();game=null;busy=false;$('dice').classList.remove('rolling');$('new-game').disabled=false;try{localStorage.removeItem(STORAGE);}catch{}$('game').hidden=true;$('setup').hidden=false;$('save-note').textContent='';$('history-count').textContent='0';$('history').innerHTML='<div class="empty-history">最初のひと振りから、あなたの物語が始まります。</div>';window.scrollTo({top:0,behavior:'smooth'});}
$('history-button').onclick=()=>{if(!game)$('history').innerHTML='<div class="empty-history">人生をはじめると、ここに記録が残ります。</div>';$('history-dialog').showModal();};
$('close-history').onclick=()=>$('history-dialog').close();
$('history-dialog').addEventListener('click',e=>{if(e.target===$('history-dialog')){const r=$('history-dialog').getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)$('history-dialog').close();}});
$('start').onclick=()=>{game=createGame(Array.from({length:Number($('player-count').value)},(_,i)=>$('name-'+i).value.trim()||`プレイヤー ${i+1}`));render();};
function confirmRestart(){if(online.active&&!online.host)return;$('restart-dialog').querySelector('p').textContent=online.active?'全員の進行・所持金・記録をリセットし、同じメンバーで開始を待つルームに戻ります。':'現在の所持金・持ち物・進行・記録をリセットし、プレイヤー設定画面に戻ります。';$('restart-dialog').showModal();}
$('new-game').onclick=confirmRestart;
$('confirm-reset').onclick=()=>{if(online.active){$('restart-dialog').close();online.action('restart');}else reset();};
$('cancel-reset').onclick=()=>$('restart-dialog').close();
$('roll').onclick=async()=>{
 if(busy||game.pending||game.over||(online.active&&!online.mine))return;
 const rollingGame=game;busy=true;$('roll').disabled=true;$('new-game').disabled=true;
 if(!game.players[game.current].skip){$('dice').classList.add('rolling');for(let i=0;i<8;i++){ $('dice').textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random()*6)];await new Promise(r=>setTimeout(r,65));}$('dice').classList.remove('rolling');}
 if(game!==rollingGame)return;
 if(online.active){await online.action('roll');}else roll(game);busy=false;$('new-game').disabled=online.active&&!online.host;render();
};
$('dialog').addEventListener('cancel',e=>{if(game?.pending&&(!online.active||online.mine))e.preventDefault();});
$('rules-button').onclick=()=>{
 modal(`<p class="eyebrow">HOW TO PLAY</p><h2>人生ゲームの遊び方</h2><div class="rules"><h3>80マスの旅</h3><p>旅行やお祝いで得た思い出は、ゴール時に1つにつき100万円のボーナスになります。結婚していない場合、出産マスは親戚のお祝いになり、自分の子どもは増えません。初期所持金は30万円。サイコロで1〜6マス進み、止まったマスで行動を選びます。費用・収入・休み・確率は選択前に表示されます。収入を狙う選択では失敗して損失が出ることがあります。1〜20マスは学生、21〜80マスは社会人。社会人になると100万円を受け取り、職業を選びます。全員がゴールした時に退職金を精算し、その後の所持金で順位が決まります。所持金はマイナスでも続行できます。</p><h3>自分で選ぶ人生</h3><p>学生・職業・人生イベントは、原則2〜3つの選択肢から行動を決めます。結婚するか、式の規模をどうするか、旅行や買い物をするか、仕事で挑戦するかもあなた次第。闇バイトは断れます。パチプロは毎ターン打つか見送るかを選べます。選択が終わるまで次の人のターンには進みません。選択途中でリロードしても再開できます。</p><h3>リスクとリターン</h3><p>高い利益を狙うほど、失敗時の損失も大きくなります。例：成果報酬のバイトは60%で＋100万円、40%で−100万円。大きな案件は65%で＋250万円、35%で−200万円・バズ度−10。大きなバズ企画は60%で＋400万円・バズ度＋40、40%で−200万円・バズ度−15。通常の給与、就職祝い、退職金は確定の収入です。</p><h3>生活費と家族・住まい</h3><p>通常ターンと休みターンの生活費は、学生5万円、社会人100万円。893は上納金50万円も毎ターン支払います。子ども1人につき30万円、持ち家20万円、車10万円を毎ターン追加します。追加ロールでは生活費を払いません。社会人になるターンから社会人の生活費を適用し、イベントで増えた家族・資産の維持費は次ターンから発生します。結婚・出産・七五三・葬儀・法事など23種類の共通イベントも、選択で効果が変わります。</p><h3>バブルの高級品</h3><p>46マスはロレックス購入（ゴールド600万円／コレクターズ1200万円）、58マスは高級車購入（2000万円／限定スーパーカー4000万円）。購入も見送りも選べ、借金で購入できます。維持費を毎ターン支払い、全員ゴール後に値上がり・値下がりを抽選して売却。その後の所持金から退職金40%を計算します。価格と売却確率は、このゲーム独自の設定です。</p><h3>退職と最終精算</h3><p>退職マスはありません。全員が80マスにゴールした時に、高級品を売却した後の各プレイヤーの退職前所持金×40%（1円未満切り捨て）を一度だけ支給します。所持金0円以下の場合、退職金は0円。負債は消えず、最終所持金がマイナスのままでも終了します。ゴールが早かった人も、精算は全員到着後です。</p><h3>給与と追加ロール</h3><p>社会人は移動後、イベントより前に収入を受け取ります。休みターンの給与はありません。会社員の「後輩と飲み」は出目1〜3の追加ロールで、追加分の給与はありません。昇給は重複しません。</p><h3>学生の特別イベント</h3><p>闇バイトの勧誘は12マス目を通過した学生ターンに必ず一度発生します。断ると所持金の変化はありません。引き受けると、30%で1500万円獲得、70%で500万円を失い1ターン休み。警察スキップ権は使えません。18マス目に止まると教師逮捕で1ターン休み、50%ずつで±20万円です。</p><h3>職業ごとのルール</h3><p>会社員：通常200万円、昇給後250万円。893：通常250万円、昇格後300万円。警察スキップ権は最大2枚。セット品は50%で警察に見つかり、権利を使わなければ−300万円・2ターン休みです。</p><p>インフルエンサー：バズ度20で開始。0〜20で100万円、21〜49で150万円、50〜79で250万円、80〜100で400万円の収入。バズ度は0〜100に収まります。</p><p>パチプロ：毎ターン打つかどうかを選択でき、基本勝率50%。勝ちで600万円、負けで400万円を失います。所持金が少なくても全額を支払い、負債は0円に戻りません。イベントによる勝率変更は次の1ターンだけ。体調不良で遊べないターンでも勝率変更は消化します。</p><h3>このゲームで補った設定</h3><p>資料にないマス配置はイベントを順番に繰り返す固定配置です。闇バイトは通過判定、教師逮捕は停止判定。80マス目の給与・イベントを処理してゴールし、先にゴールした人は待機します。会社員の旧退職金マスは資格取得に置き換えました。ローカルプレイはこのブラウザに自動保存されます。オンライン対戦はルーム内で進行を同期し、同じタブの再読み込みで復帰できます。</p><a href="https://docs.google.com/document/d/1aIn2BpmrciqG16hB8tQzqngkCs0wXcawPm08FEuzkmE/edit" target="_blank" rel="noopener">元のルール資料を見る ↗</a></div><button class="primary" id="close-rules">わかった</button>`);
 $('close-rules').onclick=()=>{close();if(game?.pending)render();};
};
try {const saved=JSON.parse(localStorage.getItem(STORAGE));if(saved?.players?.length&&saved.players.every(p=>Number.isFinite(p.cash)&&Number.isInteger(p.position))){
 game=migrateGame(saved);render();}}catch{}

function act(action,value){close();if(online.active){online.action(action,value);return;}if(action==='job')chooseJob(game,value);else if(action==='police')police(game,value);else chooseEvent(game,value);render();}
initOnline(next=>{close();game=next;busy=false;if(game)render();else{$('game').hidden=true;$('setup').hidden=true;$('history-count').textContent='0';$('history').innerHTML='';}},()=>{const localSave=localStorage.getItem(STORAGE);reset();try{const saved=JSON.parse(localSave);if(saved?.players){game=migrateGame(saved);render();}}catch{}});
