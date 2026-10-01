// Fictional in-game prices and resale odds, chosen for a bubble-style economy.
export const LUXURY_ASSETS = {
 rolexGold: {kind:'rolex',name:'ゴールド・ロレックス',price:6000000,upChance:.7,upValue:8000000,downValue:2000000,upkeep:50000},
 rolexCollector: {kind:'rolex',name:'コレクターズ・ロレックス',price:12000000,upChance:.45,upValue:22000000,downValue:6000000,upkeep:100000},
 luxuryExecutive: {kind:'luxuryCar',name:'フラッグシップ高級車',price:20000000,upChance:.7,upValue:32000000,downValue:10000000,upkeep:500000},
 luxuryLimited: {kind:'luxuryCar',name:'限定スーパーカー',price:40000000,upChance:.45,upValue:90000000,downValue:16000000,upkeep:1000000}
};
const yen=n=>`${(n/10000).toLocaleString('ja-JP')}万円`;
export function luxuryChoice(id,assetKey,label){
 const a=LUXURY_ASSETS[assetKey];
 return {id,label,buyAsset:assetKey,effect:`購入−${yen(a.price)}・維持費${yen(a.upkeep)}/ターン。全員ゴール後に売却：${Math.round(a.upChance*100)}%で${yen(a.upValue)} / ${Math.round((1-a.upChance)*100)}%で${yen(a.downValue)}。借金での購入も可能。`};
}
