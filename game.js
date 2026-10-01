import {LUXURY_ASSETS} from './luxury.js';
import {DECISIONS,LIFE_DECISIONS,risk,consequenceText} from './decisions.js';
export const GOAL = 80;
export const CASH_SCALE = 10;
export const JOBS = {
  office: { name: '会社員', icon: '▣', tagline: '堅実に、着実に。', type: '安定型', income: '200〜250万円 / ターン', color: '#647df1', description: '昇給やボーナスで資産を築く。会社倒産には気をつけて。' },
  gang: { name: '893', icon: '♠', tagline: 'ハイリスクな生き方。', type: '高収入型', income: '250〜300万円 / ターン', color: '#ba86db', description: '高い収入と警察リスク。スキップ権をうまく使おう。' },
  creator: { name: 'インフルエンサー', icon: '✦', tagline: 'そのバズが、人生を変える。', type: '成長型', income: '100〜400万円 / ターン', color: '#eb9970', description: 'バズ度20からスタート。炎上を乗り越え、人気者へ。' },
  gambler: { name: 'パチプロ', icon: '♣', tagline: '運も、実力のうち。', type: '一発逆転型', income: '勝ち +600万円 / 負け −400万円', color: '#74bc9c', description: '基本勝率50%。リサーチで次の勝率を上げよう。' }
};
export const STUDENT = [
 ['お小遣い',200000],['窓ガラスが割れる',-300000],['親友とけんか',-50000],['仲直り',100000],['文化祭',100000],['体育祭',100000],['修学旅行',-1000000],['入学・卒業',200000],['バイト',1000000]
];
export const EVENTS = {
 office: ['ボーナス','鬱','昇給','後輩と飲み','会社倒産','長期休暇','先輩と飲み','資格取得'],
 gang: ['金を貸す','恫喝して回収','マネーロンダリング','上納金','昇格イベント','抗争','ボランティア','薬物売買','オレオレ詐欺'],
 creator: ['案件','バズ','炎上','コラボ','機材新調','低迷','伸び悩み','ファンからプレゼント','ファンに嫌われる'],
 gambler: ['ゴミ箱あさり','リサーチ','店がイベント日','負け日','体調を崩す']
};
// All careers share these milestones; other spaces keep career-specific events.
export const LIFE_EVENTS = {
  30: {name:'結婚', label:'結婚', icon:'♡', cash:-3000000, detail:'大切な人と結婚式。新しい人生のスタート！', married:true},
  33: {name:'新婚旅行', label:'旅行', icon:'✈', cash:-2000000, detail:'ふたりで思い出の旅行へ。', unmarriedName:'ごほうび旅行', unmarriedDetail:'自分へのごほうびに、憧れの場所へ。'},
  36: {name:'赤ちゃん誕生', label:'誕生', icon:'☆', cash:1000000, detail:'新しい家族が増えた！ お祝いを受け取りました。', child:true},
  39: {name:'七五三のお祝い', label:'七五三', icon:'❀', cash:-500000, detail:'子どもの健やかな成長をお祝い。', noChildName:'親戚の七五三', noChildDetail:'親戚の子どもの成長を、お祝いしました。'},
  42: {name:'家族旅行', label:'旅行', icon:'✈', cash:-1500000, detail:'身近な人と過ごす、忘れられない休日。'},
  45: {name:'友人の結婚式', label:'祝儀', icon:'♡', cash:-300000, detail:'友人の晴れ姿に、ご祝儀と祝福を。'},
  46: {name:'ゴリゴリのロレックス購入',label:'ROLEX',icon:'♔',luxury:true,detail:'金色の輝きを腕に。買うか、コレクターズモデルに賭けるか。'},
  48: {name:'マイホーム購入', label:'家購入', icon:'⌂', cash:-15000000, detail:'念願のマイホームを手に入れた！'},
  51: {name:'車を購入', label:'車購入', icon:'◇', cash:-5000000, detail:'新しい車で、暮らしが少し便利に。'},
  54: {name:'子どもの入学式', label:'入学式', icon:'✎', cash:-1000000, detail:'新しい制服とランドセル。学びの一歩を応援。', noChildName:'親戚の入学祝い', noChildDetail:'親戚の新しい門出に、入学祝いを贈りました。'},
  57: {name:'親族のお葬式', label:'葬儀', icon:'❁', cash:-1000000, detail:'大切な人を見送り、思い出を胸に歩みます。'},
  58: {name:'ゴリゴリの高級車購入',label:'高級車',icon:'◆',luxury:true,detail:'街の視線を独り占め。フラッグシップか、限定スーパーカーか。'},
  60: {name:'結婚記念日', label:'記念日', icon:'♡', cash:-500000, detail:'これまでの感謝を伝えて、記念日をお祝い。', unmarriedName:'大切な人の誕生日', unmarriedDetail:'大切な人に、感謝を込めてプレゼント。'},
  62: {name:'健康診断', label:'健診', icon:'＋', cash:-200000, detail:'これからの人生のために、体をメンテナンス。'},
  64: {name:'宝くじ', label:'宝くじ', icon:'✦', cash:3000000, detail:'買うか見送るか。予算を決めて運試し。'},
  66: {name:'家の修繕', label:'修繕', icon:'⌂', cash:-2000000, detail:'毎日の暮らしを整えるために、住まいを修繕。'},
  68: {name:'子どもの卒業式', label:'卒業式', icon:'✎', cash:-500000, detail:'成長した姿に、思わず涙。卒業をお祝い。', noChildName:'親戚の卒業祝い', noChildDetail:'親戚の卒業をお祝いし、新しい門出を応援。'},
  70: {name:'同窓会', label:'同窓会', icon:'◎', cash:-200000, detail:'懐かしい仲間と再会。あの頃の話で盛り上がる。'},
  72: {name:'法事', label:'法事', icon:'❁', cash:-300000, detail:'家族で集まり、故人との思い出を分かち合う。'},
  74: {name:'人生経験を活かす大会', label:'大会', icon:'♔', cash:5000000, detail:'これまでの経験で、賞金のある大会に挑戦。'},
  76: {name:'孫の誕生', label:'誕生', icon:'☆', cash:-1000000, detail:'家族に新しい命。お祝いを贈りました。', noChildName:'親戚に赤ちゃん誕生', noChildDetail:'親戚に新しい家族が増え、お祝いを贈りました。'},
  78: {name:'金婚式', label:'金婚式', icon:'♡', cash:2000000, detail:'長い年月をともに。家族からお祝いを受け取りました。', unmarriedName:'人生の節目のお祝い', unmarriedDetail:'長い人生を歩んだあなたへ、身近な人からお祝い。'},
  79: {name:'趣味のある暮らし', label:'趣味', icon:'♣', cash:-500000, detail:'好きなことに時間を使う。まだまだ人生は続く。'}
};
export function lifeEventFor(p) {
 const e=LIFE_EVENTS[p.position];if(!e)return null;
 if(p.position===36&&!p.married)return {...e,name:'親戚の赤ちゃん誕生',detail:'親戚に新しい家族が増え、お祝いを贈りました。',child:false};
 if(p.position===76&&!p.children)return {...e,name:'親戚に赤ちゃん誕生',detail:'親戚に新しい家族が増え、お祝いを贈りました。',child:false};
 if(!p.married&&e.unmarriedName)return {...e,name:e.unmarriedName,detail:e.unmarriedDetail};
  if(!p.children&&e.noChildName)return {...e,name:e.noChildName,detail:e.noChildDetail};
 return e;
}
export const money = n => `${n < 0 ? '−' : ''}¥${Math.abs(n).toLocaleString('ja-JP')}`;
export function income(p) { return p.job === 'office' ? (p.promoted ? 2500000 : 2000000) : p.job === 'gang' ? (p.promoted ? 3000000 : 2500000) : p.job === 'creator' ? (p.buzz <= 20 ? 1000000 : p.buzz < 50 ? 1500000 : p.buzz < 80 ? 2500000 : 4000000) : 0; }
export function createGame(names) {
 return { version:5, players: names.map((name,id) => ({id,name,position:0,cash:300000,job:null,buzz:20,tickets:0,skip:0,noSalary:false,noPachinko:false,winRate:0.5,promoted:false,darkDone:false,married:false,children:0,joy:0,joyBonus:0,home:false,car:false,luxuryAssets:[],assetSaleTotal:0,assetsSold:false,retirementBase:null,retirementBonus:0,retired:false,finished:false})), current:0, round:1, pending:null, extra:false, over:false, settled:false, log:[], lastRoll:null };
}
function log(g,p,title,detail) { g.log.unshift({player:p.name,title,detail,round:g.round}); g.log=g.log.slice(0,1000); }
function delta(p,n) { p.cash+=n; return `${n>=0?'+':'−'}${money(Math.abs(n))}`; }
export function luxuryUpkeep(p){return (p.luxuryAssets||[]).reduce((total,a)=>total+(a.sold?0:LUXURY_ASSETS[a.assetKey].upkeep),0);}
export function livingCost(p) {
 return p.position<=20?50000:1000000+(p.job==='gang'?500000:0)+(p.children||0)*300000+(p.home?200000:0)+(p.car?100000:0)+luxuryUpkeep(p);
}
function chargeLiving(g,p) {
 log(g,p,'生活費',`${delta(p,-livingCost(p))}${p.position<=20?'（学生）':'（基本100万円・893は上納金50万円追加・子ども1人につき30万円・持ち家20万円・車10万円・高級品の維持費を加算）'}`);
}
function sellLuxury(g,p,rng){
 if(p.assetsSold)return;
 p.assetSaleTotal=0;
 for(const owned of p.luxuryAssets||[]){
  if(owned.sold)continue;
  const a=LUXURY_ASSETS[owned.assetKey];const up=rng()<a.upChance;
  const value=up?a.upValue:a.downValue;owned.sold=true;owned.saleValue=value;owned.market=up?'好況':'値下がり';
  p.cash+=value;p.assetSaleTotal+=value;
  log(g,p,'高級品を売却',`${a.name}：${owned.market}・売却＋${money(value)}（購入額 ${money(a.price)}）`);
 }
 p.assetsSold=true;
}
export function retireAtGameEnd(g,rng=Math.random) {
 if(g.settled||!g.over||!g.players.every(p=>p.finished))return;
 for(const p of g.players){
  if(p.retired)continue;
  sellLuxury(g,p,rng);
  p.joyBonus=(p.joy||0)*1000000;
  if(p.joyBonus){p.cash+=p.joyBonus;log(g,p,'人生の思い出ボーナス',`${p.joy}つの思い出から＋${money(p.joyBonus)}。1つにつき100万円を受け取りました。`);}
  p.retirementBase=p.cash;
  p.retirementBonus=Math.floor(Math.max(0,p.cash)*2/5);
  p.cash+=p.retirementBonus;p.retired=true;
  log(g,p,'退職・退職金',`退職前 ${money(p.retirementBase)}・退職金 ${money(p.retirementBonus)}（所持金の40%、負債時は0円）・最終所持金 ${money(p.cash)}`);
 }
 g.settled=true;
}
function end(g,rng=Math.random) {
 const p=g.players[g.current];
 if(p.position>=GOAL) {p.finished=true;g.extra=false;log(g,p,'ゴール！',`到着時の所持金 ${money(p.cash)}。全員ゴール後に退職金を精算します。`);}
 if(g.players.every(p=>p.finished)) {g.over=true;retireAtGameEnd(g,rng);return;}
 if(g.extra) return;
 do {g.current=(g.current+1)%g.players.length;if(g.current===0) g.round++;} while(g.players[g.current].finished);
}
function event(g,p) {
 let source,name,key;
 if(p.position<=20){
  source='student';
  name=!p.darkDone&&p.position>=12?'闇バイト':p.position===18?'教師逮捕':STUDENT[(p.position-1)%STUDENT.length][0];
  key=name;
 }else{
  const life=lifeEventFor(p);source=life?'life':'career';
  name=life?life.name:EVENTS[p.job][(p.position-21)%EVENTS[p.job].length];
  key=life?p.position:name;
 }
 g.pending={type:'event',source,name,key};
}
export function getChoices(g) {
 const pending=g.pending;if(!pending)return [];
 if(pending.type==='gamble'){
  const p=g.players[g.current];
  return [{id:'play',label:'パチンコを打つ',effect:`勝率 ${Math.round(p.winRate*100)}% · 勝ち＋600万円 / 負け−400万円（負債になっても全額支払う）`},
   {id:'pass',label:'今回は打たない',effect:'所持金の変化なし・次回勝率は50%に戻る'}];
 }
 if(pending.type!=='event')return [];
 if(pending.source==='life'&&pending.key===36&&!g.players[g.current].married)return [option('original','親戚にお祝いを贈る','−30万円・思い出＋1',{cash:-300000,joy:1}),option('small','小さな贈り物をする','−10万円',{cash:-100000}),option('skip','今回は見送る','所持金・状態の変化なし')];
 const choices=pending.source==='life'?LIFE_DECISIONS[pending.key]:DECISIONS[pending.key];
 return choices.map(c=>{
  const p=g.players[g.current];
  if(pending.key==='上納金'&&c.original)return p.promoted?risk(c.id,'取り分の回収を狙う',.6,{cash:2000000},{cash:-2000000}):{...c,effect:'−200万円'};
  if(['昇給','昇格イベント'].includes(pending.key)&&p.promoted&&c.id==='original')return risk(c.id,'昇給済みの実績で報奨金を狙う',.55,{cash:1000000},{cash:-1000000});
  return c;
 });
}
function incomeThenEvent(g,p,rng) {
 if(p.job==='gambler'&&!p.noPachinko){g.pending={type:'gamble',name:'今日のパチンコ'};return;}
 pay(g,p,rng);event(g,p);
}
export function chooseEvent(g,id,rng=Math.random) {
 if(g.over||!['event','gamble'].includes(g.pending?.type))return;
 const choice=getChoices(g).find(c=>c.id===id);if(!choice)return;
 const p=g.players[g.current],pending=g.pending;g.pending=null;
 if(pending.type==='gamble'){
  if(id==='play')pay(g,p,rng);
  else {p.winRate=0.5;log(g,p,'パチンコを見送る','今回は打たない。次回の基本勝率は50%。');}
  event(g,p);return;
 }
 log(g,p,`${pending.name}：選択`,choice.label);
 if(choice.buyAsset){
  const a=LUXURY_ASSETS[choice.buyAsset];p.cash-=a.price;
  p.luxuryAssets ||= [];p.luxuryAssets.push({assetKey:choice.buyAsset,sold:false});
  log(g,p,pending.name,`${a.name}を購入 ${money(-a.price)}。維持費 ${money(a.upkeep)}/ターン。全員ゴール後に売却。`);end(g,rng);return;
 }
 if(pending.key==='闇バイト')p.darkDone=true;
 if(choice.chance!==undefined){
  const success=rng()<choice.chance,changes=success?choice.success:choice.failure;
  applyChanges(p,changes);
  log(g,p,pending.name,`${choice.label} → ${success?'成功':'失敗'}：${consequenceText(changes)}`);end(g,rng);return;
 }
 if(choice.original){resolveEvent(g,p,rng);return;}
 applyChanges(p,choice);
 log(g,p,pending.name,`${choice.label} · ${choice.effect}`);
 end(g,rng);
}
function applyChanges(p,changes){
 if(changes.cash)p.cash+=changes.cash;
 if(changes.skip)p.skip+=changes.skip;
 if(changes.buzz)p.buzz=Math.max(0,Math.min(100,p.buzz+changes.buzz));
 if(changes.married)p.married=true;
 if(changes.child&&p.married)p.children=(p.children||0)+1;
 if(changes.joy)p.joy=(p.joy||0)+changes.joy;
 if(changes.car)p.car=true;
 if(changes.promoted)p.promoted=true;
 if(changes.tickets)p.tickets=Math.min(2,p.tickets+changes.tickets);
 if(changes.noSalary)p.noSalary=true;
 if(changes.noPachinko)p.noPachinko=true;
 if(changes.winRate!==undefined)p.winRate=changes.winRate;
}
function resolveEvent(g,p,rng) {
 if(p.position<=20) {
  if(p.position===18) {p.skip++; const liked=rng()<0.5;log(g,p,'教師逮捕',`${liked?'教師に好かれる':'教師に嫌われる'} ${delta(p,liked?200000:-200000)}・1ターン休み`);}
  else {const [name,n]=STUDENT[(p.position-1)%STUDENT.length];log(g,p,name,delta(p,n));}
  end(g,rng);return;
 }
 const life=lifeEventFor(p);
 if(life){
  if(life.married)p.married=true;
  if(life.child&&p.married)p.children=(p.children||0)+1;
  if(p.position===48)p.home=true;
  if(p.position===51)p.car=true;
  log(g,p,life.name,`${life.detail} ${delta(p,life.cash)}`);end(g,rng);return;
 }
 const name=EVENTS[p.job][(p.position-21)%EVENTS[p.job].length]; let detail='';
 if(p.job==='office') {
  if(name==='鬱'||name==='長期休暇') {detail=delta(p,name==='鬱'?-500000:-4000000)+'・次ターン給与なし';p.noSalary=true;}
  
  if(name==='会社倒産'){p.cash=p.cash>=0?Math.trunc(p.cash/2):Math.floor(p.cash*1.5);detail=`資産は半分・負債は1.5倍に：${money(p.cash)}`;}
  if(name==='後輩と飲み'){detail=delta(p,-2000000)+'・追加で1回振れます（出目1〜3、給与なし）';g.extra=true;}
  if(name==='先輩と飲み'){p.skip++;detail='1ターン休み';}
 } else if(p.job==='gang') {
  if(name==='上納金')detail=delta(p,p.promoted?2000000:-2000000);
  if(name==='抗争')detail=delta(p,rng()<0.5?1000000:-1000000);
  if(name==='薬物売買'||name==='オレオレ詐欺') {
   if(rng()<0.5){if(p.tickets){g.pending={type:'police',name};log(g,p,name,'警察に見つかった！ スキップ権を使うか選んでください。');return;}p.skip+=2;detail=`警察に見つかった！ ${delta(p,-3000000)}・2ターン休み・イベント収入なし`;}
   else detail='逃げ切った！ '+delta(p,4000000);
  }
 } else if(p.job==='creator') {
  const changes={'案件':[1500000,0],'バズ':[2000000,30],'炎上':[-1000000,-30],'コラボ':[200000,5],'機材新調':[-1500000,0],'低迷':[-200000,-10],'伸び悩み':[0,-5],'ファンからプレゼント':[700000,0],'ファンに嫌われる':[-700000,0]};
  const [cash,buzz]=changes[name];detail=cash?delta(p,cash):'';p.buzz=Math.max(0,Math.min(100,p.buzz+buzz));if(buzz)detail+=`・バズ度 ${buzz>0?'+':''}${buzz} → ${p.buzz}`;
 } else {
  if(name==='ゴミ箱あさり')detail=delta(p,rng()<0.5?500000:-100000);
  if(name==='負け日'){p.winRate=2/6;detail='次ターンの勝率 2/6';}
  if(name==='体調を崩す'){p.noPachinko=true;detail='次ターンはパチンコ不可';}
 }
 log(g,p,name,detail);end(g,rng);
}
function pay(g,p,rng) {
 if(p.job==='gambler') {
  if(p.noPachinko){p.noPachinko=false;log(g,p,'パチンコお休み','体調不良のため、このターンはプレイできません');}
  else {const win=rng()<p.winRate;const before=p.cash;if(win)p.cash+=6000000;else p.cash-=4000000;log(g,p,win?'パチンコ勝利！':'パチンコ負け',`${money(before)} → ${money(p.cash)}（勝率 ${Math.round(p.winRate*100)}%）`);}
  p.winRate=0.5;
 } else if(p.noSalary){p.noSalary=false;log(g,p,'給与なし','前回のイベントにより、このターンの給与はありません');}
 else log(g,p,'給与を受け取り',delta(p,income(p)));
}
export function roll(g,rng=Math.random) {
 if(g.over||g.pending)return;
 const p=g.players[g.current];
 if(p.skip>0){chargeLiving(g,p);p.skip--;g.lastRoll=null;log(g,p,'お休み',`あと${p.skip}ターン休み`);end(g,rng);return;}
 const extra=g.extra;g.extra=false;
 const dice=1+Math.floor(rng()*(extra?3:6));g.lastRoll=dice;p.position=Math.min(GOAL,p.position+dice);
 if(!extra)chargeLiving(g,p);
 log(g,p,`${dice}マス進む`,`${p.position} / ${GOAL}マス${extra?'（追加ロール）':''}`);
 if(p.position>20&&!p.job){p.cash+=1000000;g.pending={type:'job'};log(g,p,'社会人になりました','お祝い +¥100,000。職業を選んでください。');return;}
 if(p.job&&!extra)incomeThenEvent(g,p,rng);
 else event(g,p);
}
export function chooseJob(g,job,rng=Math.random) {
 if(g.pending?.type!=='job'||!JOBS[job])return;
 const p=g.players[g.current];p.job=job;g.pending=null;log(g,p,'就職',JOBS[job].name);incomeThenEvent(g,p,rng);
}
export function police(g,use,rng=Math.random) {
 if(g.pending?.type!=='police')return;
 const p=g.players[g.current];if(use&&p.tickets){p.tickets--;log(g,p,'スキップ権を使用',`警察イベントを無効化 ${delta(p,4000000)}`);}else{p.skip+=2;log(g,p,'警察に見つかる',`${delta(p,-3000000)}・2ターン休み・イベント収入なし`);}g.pending=null;end(g,rng);
}

export function migrateGame(saved){
 if(!saved.version||saved.version<2){
  saved.over=false;
  for(const p of saved.players){p.finished=false;p.married=false;p.children=0;}
  saved.log.unshift({player:'お知らせ',title:'80マス版に更新',detail:'現在地を引き継ぎ、ゴールが80マスになりました。',round:saved.round});
 }
 if((saved.version||1)<5){
  for(const p of saved.players){
   p.cash*=CASH_SCALE;
   if(p.retirementBase!==undefined&&p.retirementBase!==null)p.retirementBase*=CASH_SCALE;
   p.retirementBonus=(p.retirementBonus||0)*CASH_SCALE;
  }
  // Old log entries describe the historical amount; keep them unchanged.
  saved.log.unshift({player:'お知らせ',title:'バブル版に更新',detail:'所持金・負債を10倍の金額に換算。過去の記録は当時の金額で残します。',round:saved.round});
 }
 if(saved.pending?.type==='event'&&LIFE_EVENTS[saved.players[saved.current].position]?.luxury){const e=LIFE_EVENTS[saved.players[saved.current].position];saved.pending={type:'event',source:'life',name:e.name,key:saved.players[saved.current].position};}
 if(saved.pending?.type==='event'&&saved.pending.key==='退職金'){saved.pending.key='資格取得';saved.pending.name='資格取得';}
 for(const p of saved.players){
  p.home ||= false;p.car ||= false;p.joy ||= 0;p.joyBonus ||= 0;p.luxuryAssets ||= [];p.assetSaleTotal ??= 0;p.assetsSold ??= false;
  p.retirementBonus ??= 0;p.retirementBase ??= null;p.retired ??= false;
 }
 saved.version=5;retireAtGameEnd(saved);return saved;
}
