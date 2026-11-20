"use strict";

const menus = [
  {name:"야채김밥", image:"gimbap", price:3000, seconds:3, order:"야채김밥 한 줄 주세요!"},
  {name:"떡볶이", image:"tteok", price:4000, seconds:4, order:"떡볶이 하나 주세요!"},
  {name:"라면", image:"ramen", price:3500, seconds:4, order:"따끈한 라면 주세요!"}
];
const guests = ["단골 학생", "퇴근길 손님", "동네 책방 주인"];
const dailyOrders = 8;
const sequence = [0,1,2,0,2,1,1,0,2,1,0];
const storageKey = "byeolbam.bunsik.v1";
const $ = id => document.getElementById(id);
const money = v => v.toLocaleString("ko-KR");
const icons = {
  muted:"M2 8h3l4-4v12l-4-4H2z M13 7l5 6m0-6-5 6",
  sound:"M2 8h3l4-4v12l-4-4H2z M12 7q4 3 0 6m2-9q7 6 0 12",
  gear:"M8 2h4v2l2 1 2-1 2 3-2 2v2l2 2-2 3-2-1-2 1v2H8v-2l-2-1-2 1-2-3 2-2V9L2 7l2-3 2 1 2-1z M13 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  moon:"M13 2H8v2H5v2H3v7h2v3h3v2h7v-2h3v-3h-6v-2H9V6h2V4h2z",
  clock:"M6 3h8l3 3v8l-3 3H6l-3-3V6z M10 6v5h4",
  coin:"M7 2h6v2h3v3h2v6h-2v3h-3v2H7v-2H4v-3H2V7h2V4h3z M8 6h4v8H8z",
  pin:"M6 2h8v2h2v7l-6 7-6-7V4h2z M8 5h4v4H8z",
  ticket:"M4 2h12v16l-3-2-3 2-3-2-3 2z M7 6h6M7 10h5",
  pan:"M2 7h11v4l-3 3H6l-4-3z M13 9l5-5 M4 4h6",
  play:"M5 3h2v2h3v2h3v2h3v2h-3v2h-3v2H7v2H5z",
  store:"M4 3h12l2 5v2h-3l-2-2-2 2H9L7 8l-2 2H2V8z M4 12v5h12v-5 M9 17v-5",
  upgrade:"M4 16V9h3v7z M9 16V6h3v10z M14 16V3h3v13z",
  book:"M3 3h13v14H3z M6 3v14M9 7h4M9 10h4",
  close:"M4 4l12 12M16 4L4 16",
  check:"M3 10l4 4L17 4"
};
function drawIcons(root=document){
  root.querySelectorAll("i[data-icon]").forEach(el=>{
    const name=el.dataset.icon;
    const solid=["moon","play","coin","pin","upgrade"].includes(name);
    el.innerHTML='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="'+icons[name]+'" fill="'+(solid?"currentColor":"none")+'" fill-rule="evenodd" stroke="'+(solid?"none":"currentColor")+'" stroke-width="1.8"/></svg>';
  });
}
function fresh(){return {day:1,served:0,balance:10000,sales:0,total:0,branches:1,speed:0,quality:0,selected:0,phase:"idle",start:0,end:0,history:[],sound:false};}
function load(){
  try {
    const saved=JSON.parse(localStorage.getItem(storageKey));
    if(saved && Number.isInteger(saved.day) && saved.day>0 && Array.isArray(saved.history) && ["idle","cooking","ready","closed"].includes(saved.phase) && menus[saved.selected])return {...fresh(),...saved};
  } catch {}
  return fresh();
}
let game=load(), page="play", lastNotice, audio;
function save(){
  try{localStorage.setItem(storageKey,JSON.stringify(game));}
  catch{notify("이 브라우저에서는 진행 상황을 저장할 수 없어요.");}
}
function notify(message){
  $("notice").textContent=message;$("notice").classList.add("visible");
  clearTimeout(lastNotice);lastNotice=setTimeout(()=>$("notice").classList.remove("visible"),2300);
}
function tone(hz=500){
  if(!game.sound)return;
  try{
    audio ||= new (window.AudioContext||window.webkitAudioContext)();
    audio.resume().catch(()=>{});
    const osc=audio.createOscillator(),gain=audio.createGain(),t=audio.currentTime;
    osc.type="square";osc.frequency.setValueAtTime(hz,t);gain.gain.setValueAtTime(.028,t);gain.gain.exponentialRampToValueAtTime(.001,t+.085);
    osc.connect(gain);gain.connect(audio.destination);osc.start();osc.stop(t+.09);
  }catch{}
}
const orderIndex=()=>sequence[game.total%sequence.length];
const price=m=>m.price+game.quality*500;
const duration=m=>Math.max(1,m.seconds-game.speed);
const branchBonus=()=>5000*(game.branches-1);
function renderPlay(){
  const closed=game.phase==="closed", index=closed?Math.max(0,game.total-1):game.total;
  const meal=menus[sequence[index%sequence.length]], guest=index%guests.length;
  $("serial").textContent="ORDER #"+String(index+1).padStart(3,"0");
  $("guest").src="assets/guest"+guest+".png";$("guest-name").textContent=closed?"오늘의 영업":guests[guest];
  $("order-line").textContent=closed?"손님이 모두 다녀갔어요.":meal.order;
  $("order-price").textContent=money(closed?game.sales:price(meal))+"원";
  document.querySelector(".price small").textContent=closed?"오늘 매출":"판매가";
  $("open-sign").innerHTML="<span></span>"+(closed?"영업 마감":"영업 중");
  $("branch-name").textContent="별밤 "+game.branches+"호점";
  $("foods").querySelectorAll("button").forEach((btn,i)=>{
    btn.setAttribute("aria-pressed",String(i===game.selected));btn.disabled=game.phase!=="idle";
  });
  const btn=$("cook");
  btn.className="main-action"+(game.phase==="cooking"?" working":game.phase==="ready"?" ready":"");
  btn.disabled=game.phase==="cooking";
  const icon=btn.querySelector("i");
  icon.dataset.icon=game.phase==="ready"?"check":game.phase==="cooking"?"pan":"play";
  btn.querySelector("span").textContent={idle:"조리 시작",ready:"손님에게 건네기",closed:"오늘의 정산",cooking:"조리 중"}[game.phase];
  $("kitchen-hint").textContent={idle:"메뉴를 선택하세요",ready:"음식이 완성됐어요",closed:"오늘 장사를 마쳤어요",cooking:"맛있게 만들고 있어요"}[game.phase];
  drawIcons(btn);
}
const upgrades=[
  {key:"speed",name:"조리 도구",description:"조리 시간 1초 단축",max:2,base:12000},
  {key:"quality",name:"메뉴 연구",description:"모든 메뉴 판매가 500원 상승",max:4,base:15000},
  {key:"branches",name:"분점 열기",description:"분점마다 하루 정산금 5,000원 추가",max:5,base:60000}
];
function cost(u){return u.base*(u.key==="branches"?game.branches:game[u.key]+1);}
function renderManage(){
  $("manage").innerHTML='<h2>가게 관리</h2><div class="summary"><div>운영 중인 매장<b>'+game.branches+'곳</b></div><div>보유 자금<b>'+money(game.balance)+'원</b></div></div><h3>가게 키우기</h3>'+upgrades.map(u=>{
    const level=game[u.key],max=level>=u.max,amount=cost(u),busy=game.phase==="cooking"||game.phase==="ready";
    return '<div class="item"><div><b>'+u.name+' · '+(u.key==="branches"?level+"호점":"Lv."+level)+'</b><small>'+u.description+'</small></div><button class="buy" data-buy="'+u.key+'" '+(max||busy||game.balance<amount?"disabled":"")+'>'+ (max?"완료":money(amount)+"원")+'</button></div>';
  }).join("")+'<p>'+(game.phase==="cooking"||game.phase==="ready"?"음식을 손님에게 건넨 뒤 개선할 수 있어요.":"영업으로 모은 자금을 가게에 투자하세요.")+'</p>';
}
function renderJournal(){
  const row=(key,value)=>'<div><span>'+key+'</span><b>'+value+'</b></div>';
  $("journal").innerHTML='<h2>영업 일지</h2><h3>'+game.day+'일차 · 오늘의 장부</h3><div class="summary">'+row("받은 주문",game.served+" / "+dailyOrders+"건")+row("오늘 매출",money(game.sales)+"원")+row("누적 판매",game.total+"건")+'</div><h3>지난 영업</h3>'+
  (game.history.length?game.history.slice().reverse().map(day=>'<div class="item"><div><b>'+day.day+'일차</b><small>주문 '+dailyOrders+'건 · 분점 수익 '+money(day.bonus)+'원</small></div><strong>'+money(day.sales+day.bonus)+'원</strong></div>').join(""):'<p>첫 영업을 정산하면 기록이 남아요.</p>');
}
function render(){
  $("day").textContent=game.day+"일차";$("time").textContent=(18+Math.floor(game.served/2))+":"+(game.served%2?"30":"00");
  $("balance").textContent=money(game.balance);
  const label=game.sound?"효과음 끄기":"효과음 켜기";$("sound").setAttribute("aria-label",label);$("sound").title=label;
  $("sound").querySelector("i").dataset.icon=game.sound?"sound":"muted";drawIcons($("sound"));
  renderPlay();if(page==="manage")renderManage();if(page==="journal")renderJournal();
}
function changePage(next){
  page=next;["play","manage","journal"].forEach(key=>$(key).hidden=key!==page);
  document.querySelectorAll("nav button").forEach(b=>{if(b.dataset.page===next)b.setAttribute("aria-current","page");else b.removeAttribute("aria-current");});
  render();
}
function dialog(title,body){
  $("dialog-title").textContent=title;$("dialog-body").innerHTML=body;
  $("modal").setAttribute("aria-labelledby","dialog-title");if(!$("modal").open)$("modal").showModal();
}
function settlement(){
  dialog(game.day+"일차 영업 마감",'<div class="summary"><div>판매한 메뉴<b>'+dailyOrders+'개</b></div><div>오늘 매출<b>'+money(game.sales)+'원</b></div><div>분점 수익<b>'+money(branchBonus())+'원</b></div></div><button class="main-action" id="next-day">다음 날 영업 시작</button>');
  $("next-day").onclick=()=>{
    if(game.phase!=="closed"){ $("modal").close();return; }
    const bonus=branchBonus();game.history.push({day:game.day,sales:game.sales,bonus});game.balance+=bonus;
    game.day++;game.served=0;game.sales=0;game.phase="idle";game.selected=0;
    save();$("modal").close();render();notify(game.day+"일차 영업을 시작해요!");
  };
}
function tick(){
  if(game.phase!=="cooking")return;
  const now=Date.now();
  if(now>=game.end){game.phase="ready";save();render();tone(780);return;}
  const pct=Math.min(100,Math.max(0,(now-game.start)*100/(game.end-game.start)));
  $("cook").style.setProperty("--progress",pct+"%");$("cook").querySelector("span").textContent="조리 중 · "+Math.ceil((game.end-now)/1000)+"초";
}
function action(){
  if(game.phase==="closed"){settlement();return;}
  if(game.phase==="idle"){
    if(game.selected!==orderIndex()){notify("주문한 메뉴는 "+menus[orderIndex()].name+"예요.");tone(180);return;}
    game.start=Date.now();game.end=game.start+duration(menus[game.selected])*1000;game.phase="cooking";tone(370);save();render();tick();return;
  }
  if(game.phase==="ready"){
    const amount=price(menus[game.selected]);game.balance+=amount;game.sales+=amount;game.total++;game.served++;
    game.phase=game.served>=dailyOrders?"closed":"idle";save();render();tone(880);notify("판매 완료!  +"+money(amount)+"원");
    if(game.phase==="closed")settlement();
  }
}
function toggleSound(){game.sound=!game.sound;save();render();tone(650);}
function settings(){
  dialog("설정",'<div class="setting-row"><span>효과음</span><button id="toggle-audio" class="buy">'+(game.sound?"켜짐":"꺼짐")+'</button></div><p style="margin-top:14px">하루에 주문 8건을 받아요. 주문과 같은 메뉴를 골라 조리하고, 완성된 음식을 손님에게 건네세요.</p><button id="reset" class="secondary">처음부터 시작</button>');
  $("toggle-audio").onclick=()=>{toggleSound();settings();};
  $("reset").onclick=()=>{
    dialog("처음부터 시작할까요?",'<p>가게 자금과 영업 기록을 지우고 1일차부터 시작합니다.</p><button id="cancel-reset" class="main-action">계속 플레이</button><button id="confirm-reset" class="secondary">기록 지우고 새로 시작</button>');
    $("cancel-reset").onclick=()=>$("modal").close();$("confirm-reset").onclick=()=>{game=fresh();save();$("modal").close();changePage("play");notify("새 가게를 열었어요.");};
  };
}
$("foods").innerHTML=menus.map((m,i)=>'<button class="food" data-menu="'+i+'" aria-pressed="false"><img src="assets/'+m.image+'.png" alt=""><span>'+m.name+'</span></button>').join("");
$("foods").addEventListener("click",e=>{const btn=e.target.closest("[data-menu]");if(!btn||game.phase!=="idle")return;game.selected=Number(btn.dataset.menu);save();render();tone(430);});
$("manage").addEventListener("click",e=>{
  const btn=e.target.closest("[data-buy]");if(!btn)return;
  const u=upgrades.find(v=>v.key===btn.dataset.buy),amount=cost(u);
  if(game[u.key]>=u.max||game.balance<amount||["cooking","ready"].includes(game.phase))return;
  game.balance-=amount;game[u.key]++;save();render();tone(720);notify(u.key==="branches"?game.branches+"호점을 열었어요!":u.name+" 개선 완료!");
});
document.querySelectorAll("nav button").forEach(b=>b.onclick=()=>changePage(b.dataset.page));
$("cook").onclick=action;$("sound").onclick=toggleSound;$("settings").onclick=settings;
$("dismiss").onclick=()=>$("modal").close();$("modal").onclick=e=>{if(e.target===$("modal"))$("modal").close();};
window.addEventListener("storage",e=>{if(e.key===storageKey){game=load();if($("modal").open)$("modal").close();render();tick();}});
document.addEventListener("visibilitychange",()=>{if(!document.hidden)tick();});
drawIcons();render();tick();setInterval(tick,150);
