import {luxuryChoice} from './luxury.js';
// Choices define both visible consequences and the actual random outcomes.
const original=(label,effect)=>({id:'original',label,effect,original:true});
const option=(id,label,effect,changes={})=>({id,label,effect,...changes});
const skip=(label='今回は見送る')=>option('skip',label,'所持金・状態の変化なし');

const cashText=n=>`${n>=0?'＋':'−'}${Math.abs(n).toLocaleString('ja-JP')}円`;
export function consequenceText(changes){
 const parts=[];
 if(changes.cash!==undefined)parts.push(cashText(changes.cash));
 if(changes.buzz)parts.push(`バズ度${changes.buzz>0?'＋':''}${changes.buzz}`);
 if(changes.skip)parts.push(`${changes.skip}ターン休み`);
 if(changes.noSalary)parts.push('次の行動ターンは給与なし');
 if(changes.promoted)parts.push('昇給・昇格（次の給与＋50万円、重複なし）');
 if(changes.tickets)parts.push(`警察スキップ権＋${changes.tickets}枚（最大2枚）`);
 if(changes.winRate!==undefined)parts.push(`次の行動ターンの勝率${Math.round(changes.winRate*100)}%`);
 if(changes.noPachinko)parts.push('次の行動ターンはパチンコなし');
 if(changes.married)parts.push('既婚になる');
 if(changes.child)parts.push('子ども＋1人・以後の生活費＋30万円/ターン');
 if(changes.joy)parts.push(`思い出＋${changes.joy}（ゴール時に1つにつき＋100万円）`);
 return parts.join('・')||'所持金・状態の変化なし';
}
export const risk=(id,label,chance,success,failure)=>({id,label,chance,success,failure,effect:`${Math.round(chance*100)}%：${consequenceText(success)} / ${Math.round((1-chance)*100)}%：${consequenceText(failure)}`});

export const DECISIONS = {
 'お小遣い':[risk('original','お小遣いでフリマに挑戦する',.6,{cash:200000},{cash:-200000}),risk('books','小さくフリマを試す',.8,{cash:50000},{cash:-50000}),skip('挑戦しない')],
 '窓ガラスが割れる':[original('修理を依頼する','−30万円'),option('repair','自分で修理を手伝う','−10万円・1ターン休み',{cash:-100000,skip:1})],
 '親友とけんか':[original('プレゼントを渡して謝る','−5万円'),option('talk','時間をかけて話し合う','所持金の変化なし')],
 '仲直り':[risk('original','一緒に出店を開く',.65,{cash:100000},{cash:-100000}),skip('メッセージで仲直りする')],
 '文化祭':[risk('original','出店の運営に挑戦する',.6,{cash:300000},{cash:-300000}),option('enjoy','お客さんとして楽しむ','−5万円',{cash:-50000})],
 '体育祭':[risk('original','賞金のある競技に参加する',.65,{cash:200000},{cash:-200000}),skip('応援に回る')],
 '修学旅行':[option('original','修学旅行に参加する','−100万円・思い出＋2',{cash:-1000000,joy:2}),option('local','近場で学習体験をする','−20万円・思い出＋1',{cash:-200000,joy:1}),skip('旅行は見送る')],
 '入学・卒業':[risk('original','記念品の共同企画に参加する',.65,{cash:200000},{cash:-200000}),risk('party','小規模な記念企画に参加する',.8,{cash:100000},{cash:-100000}),skip('企画には参加しない')],
 'バイト':[risk('original','成果報酬のバイトをする',.6,{cash:1000000},{cash:-1000000}),risk('short','小さな成果報酬の仕事をする',.8,{cash:300000},{cash:-300000}),skip('今回は働かない')],
 '闇バイト':[risk('original','引き受ける',.3,{cash:15000000},{cash:-5000000,skip:1}),skip('断る')],
 '教師逮捕':[original('学校で対応を待つ','1ターン休み・50%ずつで＋20万円 / −20万円'),option('study','自宅で学習する','教材費−10万円・1ターン休み',{cash:-100000,skip:1})],
 'ボーナス':[risk('original','成果報酬の仕事に挑む',.7,{cash:2000000},{cash:-2000000}),risk('training','研修に投資して昇給を狙う',.65,{cash:-500000,promoted:true},{cash:-500000,skip:1}),skip('今回は挑戦しない')],
 '鬱':[original('休養に専念する','−50万円・次の行動ターンは給与なし'),option('care','治療を受けながら働き方を変える','−100万円・次の給与あり',{cash:-1000000})],
 '会社倒産':[original('すぐに整理する','資産は半分・負債は1.5倍になる'),option('recover','時間をかけて資産を守る','手続き費−100万円・1ターン休み',{cash:-1000000,skip:1})],
 '昇給':[risk('original','責任のある役割に挑戦する',.65,{promoted:true},{cash:-1000000,noSalary:true}),skip('今の働き方を続ける')],
 '後輩と飲み':[original('飲みに行く','−200万円・追加ロール1回（1〜3、給与なし）'),skip('今日は帰る')],
 '先輩と飲み':[original('飲みに行く','1ターン休み'),skip('今日は帰る')],
 '資格取得':[risk('original','専門資格に挑戦する',.75,{cash:-1000000,promoted:true},{cash:-1000000,skip:1}),risk('learn','会社の補助で資格に挑戦する',.5,{cash:-300000,promoted:true},{cash:-300000,skip:1}),skip('今回は受験しない')],
 '長期休暇':[original('長期休暇を取る','−400万円・次の行動ターンは給与なし'),option('short','近場でリフレッシュする','−50万円・次の給与あり',{cash:-500000})],
 '金を貸す':[risk('original','お金を貸して利息を狙う',.6,{cash:4000000},{cash:-5000000}),skip('貸さない')],
 '恫喝して回収':[risk('original','強引な回収に挑む',.6,{cash:5000000},{cash:-6000000}),risk('peace','話し合いで回収する',.8,{cash:1500000},{cash:-3000000}),skip('今回は動かない')],
 'マネーロンダリング':[risk('original','実行する',.5,{tickets:1},{cash:-2000000,skip:1}),skip('関わらない')],
 '上納金':[original('規定どおり対応する','通常−200万円 / 昇格後＋200万円'),option('negotiate','交渉に時間を使う','交渉費−100万円・1ターン休み',{cash:-1000000,skip:1})],
 '昇格イベント':[risk('original','昇格に挑戦する',2/6,{promoted:true},{cash:-1000000,skip:1}),skip('今の立場を続ける')],
 '抗争':[original('参加する','50%ずつで＋100万円 / −100万円'),option('avoid','距離を置く','−20万円',{cash:-200000})],
 'ボランティア':[risk('original','活動を企画する',.8,{tickets:1},{cash:-1000000}),skip('今回は参加しない')],
 '薬物売買':[original('実行する','50%：＋400万円 / 50%：警察。権利を使わなければ−300万円・2ターン休み'),skip('断る')],
 'オレオレ詐欺':[original('実行する','50%：＋400万円 / 50%：警察。権利を使わなければ−300万円・2ターン休み'),skip('断る')],
 '案件':[risk('original','大きな案件を受ける',.65,{cash:2500000},{cash:-2000000,buzz:-10}),risk('own','自主制作に挑戦する',.8,{cash:500000,buzz:5},{cash:-500000,buzz:-5}),skip('今回は休む')],
 'バズ':[risk('original','話題の企画に賭ける',.6,{cash:4000000,buzz:40},{cash:-2000000,buzz:-15}),risk('steady','小さな企画を試す',.8,{cash:700000,buzz:5},{cash:-700000,buzz:-5}),skip('今の発信を続ける')],
 '炎上':[original('様子を見る','−100万円・バズ度−30'),option('respond','説明と対応に力を入れる','−150万円・バズ度−10',{cash:-1500000,buzz:-10})],
 'コラボ':[risk('original','コラボを企画する',.7,{cash:1000000,buzz:10},{cash:-1500000,buzz:-10}),risk('solo','ひとりで企画する',.8,{cash:300000,buzz:3},{cash:-300000,buzz:-3}),skip('企画を見送る')],
 '機材新調':[original('新品に買い替える','−150万円'),option('rental','機材をレンタルする','−30万円',{cash:-300000}),skip('今の機材を使う')],
 '低迷':[original('今の路線を続ける','−20万円・バズ度−10'),option('change','新しい企画に投資する','−80万円・バズ度＋5',{cash:-800000,buzz:5})],
 '伸び悩み':[original('地道に続ける','バズ度−5'),option('study','発信を学び直す','−50万円・バズ度＋5',{cash:-500000,buzz:5})],
 'ファンからプレゼント':[risk('original','ファン交流イベントを開く',.75,{cash:700000},{cash:-1500000,buzz:-5}),risk('donate','社会貢献イベントを開く',.8,{cash:-200000,buzz:10},{cash:-500000,buzz:-5}),skip('イベントは開かない')],
 'ファンに嫌われる':[original('今の活動を続ける','−70万円'),option('listen','ファンの声を聞いて見直す','−30万円・バズ度−5',{cash:-300000,buzz:-5})],
 'ゴミ箱あさり':[original('探してみる','50%：＋50万円 / 50%：−10万円'),skip('探さない')],
 'リサーチ':[risk('original','自分でリサーチする',.7,{cash:-300000,winRate:4/6},{cash:-300000,winRate:2/6}),risk('pro','有料情報で詳しく調べる',.8,{cash:-1500000,winRate:5/6},{cash:-1500000,winRate:2/6}),skip('調べず基本勝率で打つ')],
 '店がイベント日':[risk('original','イベント日の店を選ぶ',.7,{winRate:4/6},{cash:-500000,winRate:2/6}),option('usual','いつもの店に行く','次の行動ターンの勝率50%',{winRate:0.5})],
 '負け日':[original('次も打つ予定にする','次の行動ターンの勝率2/6'),option('rest','次はお休みにする','次の行動ターンはパチンコなし',{noPachinko:true})],
 '体調を崩す':[original('次は休養する','次の行動ターンはパチンコなし'),option('clinic','早めに病院に行く','−50万円・次の行動ターンもパチンコ可能',{cash:-500000})]
};
export const LIFE_DECISIONS = {
 46:[luxuryChoice('gold','rolexGold','ゴールドのロレックスを買う'),luxuryChoice('collector','rolexCollector','コレクターズモデルを買う'),skip('腕時計は今ので十分')],
 58:[luxuryChoice('executive','luxuryExecutive','フラッグシップ高級車を買う'),luxuryChoice('limited','luxuryLimited','限定スーパーカーを買う'),skip('高級車は見送る')],
 30:[risk('original','大きな結婚式を企画する',.5,{cash:2000000,married:true},{cash:-3000000,married:true}),option('small','小さな式を挙げる','−100万円・既婚になる',{cash:-1000000,married:true}),skip('今は結婚しない')],
 33:[option('original','憧れの場所へ旅行する','−200万円・思い出＋3',{cash:-2000000,joy:3}),option('local','近場で旅行する','−50万円・思い出＋2',{cash:-500000,joy:2}),skip('旅行は見送る')],
 36:[risk('original','新しい家族を迎える',.7,{cash:1000000,child:true},{cash:-2000000,child:true}),skip('今の暮らしを続ける')],
 39:[option('original','写真と食事でお祝いする','−50万円・思い出＋2',{cash:-500000,joy:2}),option('small','身近な人でお祝いする','−10万円・思い出＋1',{cash:-100000,joy:1})],
 42:[option('original','みんなで旅行に行く','−150万円・思い出＋3',{cash:-1500000,joy:3}),option('day','日帰りで出かける','−30万円・思い出＋1',{cash:-300000,joy:1}),skip('家で過ごす')],
 45:[option('original','結婚式に出席する','ご祝儀−30万円・思い出＋1',{cash:-300000,joy:1}),option('gift','お祝いの贈り物をする','−10万円',{cash:-100000})],
 48:[original('マイホームを購入する','−1500万円・持ち家になる・以後の維持費＋20万円/ターン'),option('rent','賃貸に住み替える','−100万円',{cash:-1000000}),skip('今の家に住み続ける')],
 51:[original('新車を購入する','−500万円・車を所有する・以後の維持費＋10万円/ターン'),option('used','中古車を購入する','−200万円・車を所有する・以後の維持費＋10万円/ターン',{cash:-2000000,car:true}),skip('公共交通を使う')],
 54:[option('original','しっかり入学をお祝いする','−100万円・思い出＋2',{cash:-1000000,joy:2}),option('small','必要なものだけ贈る','−30万円・思い出＋1',{cash:-300000,joy:1})],
 57:[original('葬儀に参列して見送る','−100万円'),option('quiet','静かに弔意を伝える','−30万円',{cash:-300000})],
 60:[option('original','記念日を華やかに祝う','−50万円・思い出＋2',{cash:-500000,joy:2}),option('home','手料理でお祝いする','−10万円・思い出＋1',{cash:-100000,joy:1})],
 62:[original('詳しい健康診断を受ける','−20万円'),option('basic','基本の健診を受ける','−5万円',{cash:-50000})],
 64:[risk('original','まとめて宝くじを買う',.25,{cash:3000000},{cash:-1000000}),risk('share','少額で宝くじを買う',.25,{cash:900000},{cash:-300000}),skip('買わない')],
 66:[original('専門業者に修繕を頼む','−200万円'),option('repair','自分で修繕を手伝う','−50万円・1ターン休み',{cash:-500000,skip:1})],
 68:[option('original','卒業を盛大にお祝いする','−50万円・思い出＋2',{cash:-500000,joy:2}),option('small','ささやかな贈り物で祝う','−10万円・思い出＋1',{cash:-100000,joy:1})],
 70:[option('original','同窓会に参加する','−20万円・思い出＋1',{cash:-200000,joy:1}),option('online','オンラインで再会する','所持金の変化なし・思い出＋1',{joy:1})],
 72:[option('original','法事に参加する','−30万円・思い出＋1',{cash:-300000,joy:1}),option('offer','お供えを送る','−10万円',{cash:-100000})],
 74:[risk('original','賞金のある大会に挑戦する',.5,{cash:5000000},{cash:-4000000}),risk('give','小さな大会に挑戦する',.8,{cash:1000000},{cash:-1500000}),skip('参加しない')],
 76:[option('original','お祝いをたっぷり贈る','−100万円・思い出＋2',{cash:-1000000,joy:2}),option('small','気持ちを込めた贈り物をする','−30万円・思い出＋1',{cash:-300000,joy:1})],
 78:[risk('original','大きなお祝いの席を企画する',.6,{cash:2000000,joy:3},{cash:-2500000,joy:1}),risk('party','小さなお祝いの席を企画する',.8,{cash:500000,joy:2},{cash:-800000,joy:1}),option('quiet','身近な人と静かに過ごす','思い出＋1',{joy:1})],
 79:[option('original','趣味をとことん楽しむ','−50万円・思い出＋2',{cash:-500000,joy:2}),option('simple','身近な趣味を楽しむ','−10万円・思い出＋1',{cash:-100000,joy:1}),skip('ゆっくり休む')]
};
