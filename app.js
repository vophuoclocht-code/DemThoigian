'use strict';
const VER='1.0',KEY='chamgio.v1',DAY=864e5;
const COLORS=['#E11D48','#F59E0B','#10B981','#0EA5E9','#8B5CF6','#EC4899','#64748B'];
const $=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pad=n=>String(n).padStart(2,'0');
const vib=()=>{try{navigator.vibrate&&navigator.vibrate(40)}catch(e){}};

/* ---------- Dữ liệu ---------- */
const DEF=()=>({places:[{id:uid(),name:'Công ty',emoji:'🏢',color:COLORS[0],goal:0}],sessions:[],set:{},sel:null});
let S=load();
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(!d||!Array.isArray(d.places)||!Array.isArray(d.sessions))d=DEF();
 d.set=Object.assign({theme:'auto',alert:12,lastExport:0,seenSum:''},d.set||{});
 if(!d.set.lastExport)d.set.lastExport=Date.now();return d}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Không lưu được dữ liệu, bộ nhớ có thể đã đầy')}}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ---------- Thời gian ---------- */
const ym=d=>({y:d.getFullYear(),m:d.getMonth()});
const key=o=>o.y+'-'+pad(o.m+1);
const shift=(o,n)=>ym(new Date(o.y,o.m+n,1));
const range=o=>[new Date(o.y,o.m,1).getTime(),new Date(o.y,o.m+1,1).getTime()];
const ov=(s,a,b)=>Math.max(0,Math.min(s.end||Date.now(),b)-Math.max(s.start,a));
const sumMs=(l,a,b)=>l.reduce((t,s)=>t+ov(s,a,b),0);
const fmtDur=ms=>{const m=Math.round(ms/6e4),h=Math.floor(m/60);return h?`${h} giờ ${pad(m%60)} phút`:`${m} phút`};
const fmtClock=ms=>{const s=Math.max(0,Math.floor(ms/1000));return `${pad(Math.floor(s/3600))}:${pad(Math.floor(s%3600/60))}:${pad(s%60)}`};
const fmtT=t=>{const d=new Date(t);return pad(d.getHours())+':'+pad(d.getMinutes())};
const fmtD=t=>{const d=new Date(t);return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`};
const toIn=t=>{const d=new Date(t);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`};
const dayStart=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()};
const place=id=>S.places.find(p=>p.id===id)||{name:'(đã xóa)',emoji:'❔',color:'#999',goal:0};
const active=()=>S.sessions.find(s=>!s.end);

/* ---------- Trạng thái giao diện ---------- */
let tab='home',H=ym(new Date()),M=ym(new Date()),flt='',noteTmp='',defer=null,reg=null,pcCol=COLORS[0],toastT=0;
const TITLES={home:'Chấm giờ',hist:'Lịch sử',sum:'Tổng kết tháng',set:'Cài đặt'};
function go(t){tab=t;document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('on',e.id==='t-'+t));
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 $('#ttl').textContent=TITLES[t];$('main').scrollTop=0;render()}
function render(){({home:rHome,hist:rHist,sum:rSum,set:rSet})[tab]()}
function applyTheme(){const t=S.set.theme;if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.dataset.theme=t}

function toast(msg,undo){const el=$('#toast');clearTimeout(toastT);
 el.innerHTML=`<span>${esc(msg)}</span>${undo?'<button id="undo">Hoàn tác</button>':''}`;el.hidden=false;
 if(undo)$('#undo').onclick=()=>{undo();el.hidden=true;clearTimeout(toastT)};
 toastT=setTimeout(()=>el.hidden=true,undo?10000:2800)}
function openModal(html){const m=$('#modal');m.innerHTML=`<div class="sheet">${html}</div>`;m.hidden=false}
function closeModal(){$('#modal').hidden=true}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});

/* ---------- Màn hình Chấm giờ ---------- */
function rHome(){
 const a=active(),n=new Date();
 if(!S.places.some(p=>p.id===S.sel))S.sel=(S.places[0]||{}).id;
 const cur=ym(n),pv=shift(cur,-1),pk=key(pv),[pa,pb]=range(pv);let ban='';
 if(a&&S.set.alert>0&&Date.now()-a.start>S.set.alert*36e5)
  ban+=`<div class="ban">⚠️ Phiên này đã chạy ${fmtDur(Date.now()-a.start)}. Bạn quên bấm Ra?<div><button data-a="outNow">Ra bây giờ</button><button data-a="outAt">Chọn giờ ra</button></div></div>`;
 if(S.set.seenSum!==pk&&sumMs(S.sessions,pa,pb)>0)
  ban+=`<div class="ban">📊 Tổng kết tháng ${pv.m+1}/${pv.y} đã sẵn sàng.<div><button data-a="seeSum">Xem tổng kết</button><button data-a="hideSum">Ẩn</button></div></div>`;
 if(S.sessions.length&&Date.now()-S.set.lastExport>30*DAY)
  ban+=`<div class="ban">💾 Đã hơn 30 ngày bạn chưa sao lưu dữ liệu.<div><button data-a="expJ">Sao lưu ngay</button><button data-a="hideBk">Ẩn</button></div></div>`;
 if(defer)ban+=`<div class="ban">📲 Cài Chấm Giờ vào màn hình chính để mở nhanh như một ứng dụng.<div><button data-a="install">Cài đặt</button></div></div>`;
 const pl=S.places.map(p=>`<button class="chip${(a?a.placeId:S.sel)===p.id?' on':''}" data-pl="${p.id}" ${a?'disabled':''} style="--c:${p.color}">${p.emoji} ${esc(p.name)}</button>`).join('');
 $('#t-home').innerHTML=`${ban}<div class="chips">${pl}<button class="chip add" data-a="addPl">＋ Địa điểm</button></div>
 <div class="hero"><div class="ring${a?' run':''}"><button id="big" data-a="big" class="big ${a?'out':'in'}">${a?'Ra':'Vào'}</button></div>
 <div class="clk" id="clk">${a?fmtClock(Date.now()-a.start):'00:00:00'}</div>
 <div class="sub">${a?`${esc(place(a.placeId).name)}, vào lúc ${fmtT(a.start)}`:'Chạm nút Vào khi bạn đến nơi'}</div></div>
 <input id="note" class="inp" placeholder="Ghi chú (không bắt buộc)" maxlength="120" value="${esc(a?a.note||'':noteTmp)}">
 <div class="stats"><div class="card"><b id="sTd"></b><span>Hôm nay</span></div><div class="card"><b id="sMo"></b><span>Tháng này</span></div></div>`;
 stats()}
function stats(){const t=$('#sTd');if(!t||tab!=='home')return;const n=Date.now(),d0=dayStart(n),[a,b]=range(ym(new Date()));
 t.textContent=fmtDur(sumMs(S.sessions,d0,d0+DAY));$('#sMo').textContent=fmtDur(sumMs(S.sessions,a,b));
 const s=active(),c=$('#clk');if(s&&c)c.textContent=fmtClock(n-s.start)}
setInterval(stats,1000);
document.addEventListener('visibilitychange',()=>{if(!document.hidden&&tab==='home')render()});
document.addEventListener('input',e=>{if(e.target.id!=='note')return;const a=active();if(a){a.note=e.target.value;save()}else noteTmp=e.target.value});

/* ---------- Lịch sử ---------- */
function mnav(o,v){return `<div class="mnav"><button data-a="mnav" data-v="${v}" data-d="-1" aria-label="Tháng trước">‹</button><b>Tháng ${o.m+1}/${o.y}</b><button data-a="mnav" data-v="${v}" data-d="1" aria-label="Tháng sau">›</button></div>`}
function rHist(){
 const [a,b]=range(H),l=S.sessions.filter(s=>ov(s,a,b)>0&&(!flt||s.placeId===flt)).sort((x,y)=>y.start-x.start);
 let h=mnav(H,'H')+`<select class="sel" id="fltP"><option value="">Tất cả địa điểm</option>${S.places.map(p=>`<option value="${p.id}"${flt===p.id?' selected':''}>${p.emoji} ${esc(p.name)}</option>`).join('')}</select>
 <button class="btn full pri" data-a="addSess">＋ Thêm phiên thủ công</button>
 <div class="card"><small>Tổng thời gian trong tháng</small><div class="big-num">${fmtDur(sumMs(l,a,b))}</div></div>`;
 if(!l.length)h+=`<div class="empty">Chưa có phiên nào trong tháng này.</div>`;
 let last='';
 l.forEach(s=>{const d=fmtD(s.start);if(d!==last){h+=`<div class="day">${d}</div>`;last=d}
  const p=place(s.placeId),e=s.end?(fmtD(s.end)!==d?fmtD(s.end)+' ':'')+fmtT(s.end):'đang chạy';
  h+=`<div class="srow" data-a="edit" data-v="${s.id}"><i style="background:${p.color}"></i><div><b>${p.emoji} ${esc(p.name)}</b><small>${fmtT(s.start)} đến ${e}${s.note?' · '+esc(s.note):''}</small></div><strong>${fmtDur((s.end||Date.now())-s.start)}</strong></div>`});
 $('#t-hist').innerHTML=h}
document.addEventListener('change',e=>{const i=e.target.id;
 if(i==='fltP'){flt=e.target.value;rHist()}
 if(i==='sTheme'){S.set.theme=e.target.value;save();applyTheme()}
 if(i==='sAlert'){S.set.alert=Math.max(0,+e.target.value||0);save()}
 if(i==='imp')doImport(e.target.files[0])});

function sessModal(s){
 const nw=!s;s=s||{placeId:S.sel||(S.places[0]||{}).id,start:Date.now()-36e5,end:Date.now(),note:''};const act=!nw&&!s.end;
 openModal(`<h2>${nw?'Thêm phiên thủ công':'Sửa phiên'}</h2>
 <label>Địa điểm<select id="fP">${S.places.map(p=>`<option value="${p.id}"${p.id===s.placeId?' selected':''}>${p.emoji} ${esc(p.name)}</option>`).join('')}</select></label>
 <label>Giờ vào<input id="fS" type="datetime-local" value="${toIn(s.start)}"></label>
 ${act?'<p class="mut">Phiên đang chạy nên chưa có giờ ra.</p>':`<label>Giờ ra<input id="fE" type="datetime-local" value="${toIn(s.end)}"></label>`}
 <label>Ghi chú<input id="fN" maxlength="120" value="${esc(s.note||'')}"></label>
 <div class="row"><button class="btn pri" id="fSave">Lưu</button>${nw?'':'<button class="btn bad" id="fDel">Xóa</button>'}<button class="btn" data-a="close">Hủy</button></div>`);
 $('#fSave').onclick=()=>{const st=new Date($('#fS').value).getTime(),en=act?null:new Date($('#fE').value).getTime();
  if(!st||(!act&&!en))return toast('Hãy nhập đủ giờ vào và giờ ra');
  if(!act&&en<=st)return toast('Giờ ra phải sau giờ vào');
  if(st>Date.now()||en>Date.now())return toast('Không thể chọn thời điểm trong tương lai');
  const v={placeId:$('#fP').value,start:st,end:en,note:$('#fN').value.trim()};
  if(nw)S.sessions.push(Object.assign({id:uid()},v));else Object.assign(s,v);
  save();closeModal();render();toast('Đã lưu phiên')};
 if(!nw)$('#fDel').onclick=()=>{if(confirm('Xóa phiên này?')){S.sessions=S.sessions.filter(x=>x!==s);save();closeModal();render();toast('Đã xóa phiên')}}}

/* ---------- Tổng kết ---------- */
function rSum(){
 const [a,b]=range(M),[pa,pb]=range(shift(M,-1)),nd=new Date(M.y,M.m+1,0).getDate();
 const tot=sumMs(S.sessions,a,b),ptot=sumMs(S.sessions,pa,pb);
 let h=mnav(M,'M');
 if(!tot){$('#t-sum').innerHTML=h+`<div class="empty">Chưa có dữ liệu tháng này.<br>Hãy chấm giờ ở tab Chấm giờ.</div>`;return}
 const days=[];for(let i=0;i<nd;i++)days.push(sumMs(S.sessions,new Date(M.y,M.m,i+1).getTime(),new Date(M.y,M.m,i+2).getTime()));
 const mx=Math.max(...days),mi=days.indexOf(mx),pres=days.filter(v=>v>0).length;
 const pl=S.places.map(p=>{const l=S.sessions.filter(s=>s.placeId===p.id&&ov(s,a,b)>0);return{p,ms:sumMs(l,a,b),n:l.length}}).filter(x=>x.ms>0||x.p.goal>0).sort((x,y)=>y.ms-x.ms);
 const pmx=Math.max(...pl.map(x=>x.ms),1);
 const cmp=ptot>0?(()=>{const r=Math.round((tot-ptot)/ptot*100);return `<span class="${r>=0?'up':'dn'}">${r>=0?'▲':'▼'} ${Math.abs(r)}%</span> so với tháng trước`})():'Chưa có dữ liệu tháng trước để so sánh';
 const bw=310/nd;let svg=`<svg viewBox="0 0 310 122" width="100%" role="img" aria-label="Thời gian theo ngày">`;
 days.forEach((v,i)=>{const hh=v/mx*90;svg+=`<rect x="${i*bw+1}" y="${100-hh}" width="${bw-2}" height="${Math.max(hh,v>0?2:0)}" rx="2" fill="${i===mi?'#F59E0B':'#E11D48'}"/>`;
  if([1,5,10,15,20,25,nd].includes(i+1))svg+=`<text x="${i*bw+bw/2}" y="116" font-size="9" text-anchor="middle" fill="currentColor" opacity=".6">${i+1}</text>`});
 svg+='</svg>';
 h+=`<div class="card"><small>Tổng thời gian</small><div class="big-num">${fmtDur(tot)}</div><div>${cmp}</div></div>
 <div class="card"><div class="kv"><span>Số ngày có mặt</span><b>${pres}/${nd} ngày</b></div>
 <div class="kv"><span>Ngày ở lâu nhất</span><b>${pad(mi+1)}/${pad(M.m+1)}, ${fmtDur(mx)}</b></div>
 <div class="kv"><span>Trung bình mỗi ngày có mặt</span><b>${fmtDur(tot/pres)}</b></div></div>
 <h3>Theo ngày</h3><div class="card">${svg}</div><h3>Theo địa điểm</h3>`;
 pl.forEach(x=>{const g=x.p.goal*36e5;
  h+=`<div class="card"><div class="kv"><b>${x.p.emoji} ${esc(x.p.name)}</b><b>${fmtDur(x.ms)}</b></div>
  <div class="pb"><em style="width:${x.ms/pmx*100}%;background:${x.p.color}"></em></div>
  <small>${x.n} lần đến${x.n?`, trung bình ${fmtDur(x.ms/x.n)}/lần`:''}</small>
  ${g?`<div class="pb"><em style="width:${Math.min(100,x.ms/g*100)}%;background:#10B981"></em></div><small>Mục tiêu ${x.p.goal} giờ: đạt ${Math.round(x.ms/g*100)}%</small>`:''}</div>`});
 $('#t-sum').innerHTML=h}

/* ---------- Cài đặt ---------- */
function rSet(){
 const st=window.matchMedia('(display-mode: standalone)').matches;
 $('#t-set').innerHTML=`<h3>Địa điểm</h3>${S.places.map(p=>`<div class="srow" data-a="editPl" data-v="${p.id}"><i style="background:${p.color}"></i><div><b>${p.emoji} ${esc(p.name)}</b><small>${p.goal?'Mục tiêu '+p.goal+' giờ/tháng':'Chưa đặt mục tiêu'}</small></div><span>✏️</span></div>`).join('')}
 <button class="btn full" data-a="addPl">＋ Thêm địa điểm</button>
 <h3>Tùy chọn</h3><div class="card">
 <label class="kv"><span>Giao diện</span><select id="sTheme" class="sel" style="width:auto;margin:0"><option value="auto"${S.set.theme==='auto'?' selected':''}>Theo máy</option><option value="light"${S.set.theme==='light'?' selected':''}>Sáng</option><option value="dark"${S.set.theme==='dark'?' selected':''}>Tối</option></select></label>
 <label class="kv"><span>Nhắc quên Ra sau (giờ, 0 = tắt)</span><input id="sAlert" type="number" min="0" inputmode="numeric" value="${S.set.alert}" style="width:80px;min-height:44px;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--tx);padding:0 10px;font-size:16px"></label></div>
 <h3>Sao lưu dữ liệu</h3>
 <button class="btn full" data-a="expJ">Xuất file JSON (để khôi phục)</button>
 <button class="btn full" data-a="expC">Xuất file CSV (mở bằng Excel)</button>
 <button class="btn full" data-a="impJ">Nhập dữ liệu từ file JSON</button>
 <h3>Ứng dụng</h3>
 <button class="btn full" data-a="install"${st?' disabled':''}>${st?'Đã cài đặt':'Cài vào màn hình chính'}</button>
 <button class="btn full" data-a="upd">Kiểm tra cập nhật</button>
 <button class="btn full bad" data-a="wipe">Xóa toàn bộ dữ liệu</button>
 <p class="mut" style="text-align:center">Chấm Giờ phiên bản ${VER}<br>Dữ liệu chỉ lưu trên máy này.</p>`}

function placeModal(p){
 const nw=!p;p=p||{name:'',emoji:'📍',color:COLORS[S.places.length%COLORS.length],goal:0};pcCol=p.color;
 openModal(`<h2>${nw?'Thêm địa điểm':'Sửa địa điểm'}</h2>
 <label>Tên<input id="pN" maxlength="30" value="${esc(p.name)}"></label>
 <label>Biểu tượng (emoji)<input id="pE" maxlength="4" value="${esc(p.emoji)}"></label>
 <div class="sw">${COLORS.map(c=>`<button class="swb${c===p.color?' on':''}" data-a="sw" data-v="${c}" style="background:${c}" aria-label="Màu ${c}"></button>`).join('')}</div>
 <label>Mục tiêu (giờ mỗi tháng, 0 = không đặt)<input id="pG" type="number" min="0" inputmode="numeric" value="${p.goal||0}"></label>
 <div class="row"><button class="btn pri" id="pSave">Lưu</button>${nw?'':'<button class="btn bad" id="pDel">Xóa</button>'}<button class="btn" data-a="close">Hủy</button></div>`);
 $('#pSave').onclick=()=>{const n=$('#pN').value.trim();if(!n)return toast('Hãy nhập tên địa điểm');
  const v={name:n,emoji:$('#pE').value.trim()||'📍',color:pcCol,goal:Math.max(0,+$('#pG').value||0)};
  if(nw){const x=Object.assign({id:uid()},v);S.places.push(x);if(!S.sel)S.sel=x.id}else Object.assign(p,v);
  save();closeModal();render()};
 if(!nw)$('#pDel').onclick=()=>{
  if(S.places.length<2)return toast('Cần giữ lại ít nhất một địa điểm');
  const c=S.sessions.filter(s=>s.placeId===p.id).length;
  if(active()&&active().placeId===p.id)return toast('Hãy bấm Ra trước khi xóa địa điểm này');
  if(confirm(c?`Xóa địa điểm này và ${c} phiên đã ghi?`:'Xóa địa điểm này?')){S.places=S.places.filter(x=>x!==p);S.sessions=S.sessions.filter(s=>s.placeId!==p.id);save();closeModal();render()}}}

/* ---------- Xuất / nhập ---------- */
function dl(name,type,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function doImport(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{
 const d=JSON.parse(r.result);if(!Array.isArray(d.places)||!Array.isArray(d.sessions))throw 0;
 if(!confirm(`Thay toàn bộ dữ liệu hiện tại bằng file này (${d.sessions.length} phiên)?`))return;
 S.places=d.places.filter(p=>p&&p.id&&p.name).map(p=>({id:String(p.id),name:String(p.name),emoji:String(p.emoji||'📍'),color:String(p.color||COLORS[0]),goal:+p.goal||0}));
 if(!S.places.length)S.places=DEF().places;
 S.sessions=d.sessions.filter(s=>s&&+s.start>0).map(s=>({id:String(s.id||uid()),placeId:String(s.placeId),start:+s.start,end:+s.end>0?+s.end:null,note:String(s.note||'')}));
 save();render();toast('Đã nhập dữ liệu')}catch(e){toast('File không hợp lệ')}};r.readAsText(f);$('#imp').value=''}

/* ---------- Hành động ---------- */
const ACT={
 close:closeModal,
 big(){const a=active();
  if(!a){if(!S.sel)return toast('Hãy thêm một địa điểm trước');
   const s={id:uid(),placeId:S.sel,start:Date.now(),end:null,note:noteTmp.trim()};S.sessions.push(s);noteTmp='';save();vib();render();
   toast('Đã vào '+place(s.placeId).name,()=>{S.sessions=S.sessions.filter(x=>x!==s);save();render()})}
  else{a.end=Date.now();a.note=(($('#note')||{}).value||a.note||'').trim();save();vib();render();
   toast('Đã ra, ở '+fmtDur(a.end-a.start),()=>{a.end=null;save();render()})}},
 outNow(){const a=active();if(a){a.end=Date.now();save();render();toast('Đã ra, ở '+fmtDur(a.end-a.start))}},
 outAt(){const a=active();if(!a)return;
  openModal(`<h2>Bạn đã ra lúc nào?</h2><label>Giờ ra<input id="oT" type="datetime-local" value="${toIn(Date.now())}"></label><div class="row"><button class="btn pri" id="oS">Lưu giờ ra</button><button class="btn" data-a="close">Hủy</button></div>`);
  $('#oS').onclick=()=>{const t=new Date($('#oT').value).getTime();if(!t||t<=a.start||t>Date.now())return toast('Giờ ra phải sau giờ vào và không ở tương lai');a.end=t;save();closeModal();render();toast('Đã ra, ở '+fmtDur(a.end-a.start))}},
 seeSum(){const pv=shift(ym(new Date()),-1);S.set.seenSum=key(pv);save();M=pv;go('sum')},
 hideSum(){S.set.seenSum=key(shift(ym(new Date()),-1));save();render()},
 hideBk(){S.set.lastExport=Date.now();save();render()},
 mnav(t){const d=+t.dataset.d;if(t.dataset.v==='H')H=shift(H,d);else M=shift(M,d);render()},
 edit(t){sessModal(S.sessions.find(s=>s.id===t.dataset.v))},
 addSess(){if(!S.places.length)return toast('Hãy thêm địa điểm trước');sessModal()},
 addPl(){placeModal()},
 editPl(t){placeModal(S.places.find(p=>p.id===t.dataset.v))},
 sw(t){pcCol=t.dataset.v;document.querySelectorAll('.swb').forEach(b=>b.classList.toggle('on',b===t))},
 expJ(){dl(`chamgio-${key(ym(new Date()))}.json`,'application/json',JSON.stringify(S,null,1));S.set.lastExport=Date.now();save();toast('Đã xuất file JSON');if(tab==='home')render()},
 expC(){const q=v=>'"'+String(v).replace(/"/g,'""')+'"';
  const rows=[['Địa điểm','Giờ vào','Giờ ra','Số phút','Ghi chú']].concat(S.sessions.slice().sort((x,y)=>x.start-y.start).map(s=>[place(s.placeId).name,toIn(s.start).replace('T',' '),s.end?toIn(s.end).replace('T',' '):'',s.end?Math.round((s.end-s.start)/6e4):'',s.note||'']));
  dl('chamgio.csv','text/csv;charset=utf-8','\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n'));toast('Đã xuất file CSV')},
 impJ(){$('#imp').click()},
 async install(){if(defer){defer.prompt();try{await defer.userChoice}catch(e){}defer=null;render()}
  else openModal(`<h2>Cài đặt thủ công</h2><p>Mở menu ⋮ của trình duyệt, chọn <b>Thêm vào màn hình chính</b> (hoặc <b>Cài đặt ứng dụng</b>), rồi bấm Cài đặt.</p><button class="btn pri full" data-a="close">Đã hiểu</button>`)},
 upd(){if(!reg)return toast('Chưa bật được chế độ ngoại tuyến, hãy mở lại ứng dụng khi có mạng');reg.update().then(()=>toast('Đã kiểm tra, bạn đang dùng bản mới nhất')).catch(()=>toast('Cần có mạng để kiểm tra cập nhật'))},
 wipe(){if(confirm('Xóa TOÀN BỘ địa điểm và lịch sử?')&&confirm('Thao tác này không thể hoàn tác. Bạn chắc chắn chứ?')){S=DEF();S.set=load().set;S.set.lastExport=Date.now();save();render();toast('Đã xóa toàn bộ dữ liệu')}}
};
document.addEventListener('click',e=>{const t=e.target.closest('[data-t],[data-a],[data-pl]');if(!t)return;
 if(t.dataset.t)return go(t.dataset.t);
 if(t.dataset.pl){S.sel=t.dataset.pl;save();return render()}
 const f=ACT[t.dataset.a];if(f)f(t)});

/* ---------- PWA ---------- */
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();defer=e;if(tab==='home')render()});
window.addEventListener('appinstalled',()=>{defer=null;if(tab==='home')render()});
if('serviceWorker'in navigator){const had=navigator.serviceWorker.controller;
 navigator.serviceWorker.register('./service-worker.js').then(r=>reg=r).catch(()=>{});
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)location.reload()})}

applyTheme();save();render();
