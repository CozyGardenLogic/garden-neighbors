const test=require('node:test');
test('campaign and daily records: first, slower, equal, faster and one bonus sound',()=>{
const fs=require('fs'),vm=require('vm'),assert=require('assert/strict');
const s=require('./helpers.cjs').source();
new vm.Script(s);
const line=needle=>s.split('\n').find(l=>l.includes(needle));
const record=line('recordTime(key,seconds)'),finish=line('finish(day,stars,time,board'),time=line('function timeText('),label=line('function timeResultLabel(');
const save=s.slice(s.indexOf('Game.prototype.saveHarvestResult=function'),s.indexOf('Game.prototype.attachBasket=function'));
const append=line('Game.prototype.appendTimeResult=function'),daily=line('Game.prototype.showDailyResult=function');
let sounds=[],host;const element=()=>({children:[],append(x){this.children.push(x)},insertBefore(x){this.children.push(x)},setAttribute(){}});
const ctx={console,assert,Date,Map,Math,Number,document:{createElement:element},$:()=>host,modalContent(){host=element()},uiIcon:()=>'',themeDOM(){},fmt:(x)=>x,boardCounts:()=>({}),TEXT:{newBest:'New best!'},Settings:{data:{timer:true}},Progress:{data:{stars:{},layouts:{}},next:()=>0,save(){}},AudioManager:{effect:k=>sounds.push(k)},Game:function(){}};
vm.createContext(ctx);vm.runInContext('const Rewards={data:{bestTimes:{}},save(){},award(){return 0},totalStars(){return 0},'+record+'};const DailyGarden={data:{results:{},lastDay:"",streak:0},save(){},number(){return 1},unlocked(){return true},today(){return "2026-10-26"},streak(){return 0},'+finish+'};'+time+label+save+append+daily+'\nglobalThis.Rewards=Rewards;globalThis.DailyGarden=DailyGarden;',ctx);
const report=[];
for(const kind of ['level','daily']){
ctx.Rewards.data.bestTimes={};ctx.DailyGarden.data.results={};sounds=[];
for(const [seconds,expected,newBest]of [[25,'Time 0:25',false],[30,'Time 0:30 · Best 0:25',false],[25,'Time 0:25 · Best 0:25',false],[21,'Time 0:21 · Best 0:25 · New best!',true]]){
 const scene=new ctx.Game();Object.assign(scene,{types:()=>[],level:0,dailyDate:kind==='daily'?'2026-10-26':null,challengeClock:{elapsed:seconds,started:true},attemptToken:String(seconds),stars:3,clearHarvest(){},views:new Map()});
 const beforeSound=sounds.length;scene.saveHarvestResult();host=element();if(kind==='daily')scene.showDailyResult('2026-10-26');else scene.appendTimeResult(host,'0');
 const result=host.children.find(p=>p.className==='time-record');assert.equal(result.textContent,expected);assert.equal(scene.newTimeBest,newBest);assert.equal(sounds.length-beforeSound,newBest?1:0);assert.equal(ctx.Rewards.data.bestTimes[kind==='daily'?'daily:2026-10-26':'0'],seconds<25?seconds:25);
 if(kind==='daily')scene.showDailyResult('2026-10-26');else scene.appendTimeResult(host,'0');assert.equal(sounds.length-beforeSound,newBest?1:0,'Repeated rendering must not repeat the sound');report.push({kind,seconds,text:result.textContent,newBest,bonusSound:newBest});
}
}
assert.equal(report.length,8);
});
