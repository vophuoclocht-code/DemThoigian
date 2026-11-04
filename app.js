'use strict';
const VER='2.0',KEY='chamgio.v1',DAY=864e5;
const COLORS=['#4F6F8F','#B0654B','#5E8C73','#8575A3','#A88B4E','#A5667A','#6F7C89'];
const $=(s,e=document)=>e.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,6);
const pad=n=>String(n).padStart(2,'0');
const vib=()=>{try{navigator.vibrate&&navigator.vibrate(30)}catch(e){}};

/* ---------- Biểu tượng nét đơn sắc ---------- */
const P={
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 list:'<path d="M9 6h11M9 12h11M9 18h11M4.5 6h.01M4.5 12h.01M4.5 18h.01"/>',
 chart:'<path d="M5 20V11M12 20V4M19 20v-6M3 20h18"/>',
 set:'<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',left:'<path d="M15 6l-6 6 6 6"/>',right:'<path d="M9 6l6 6-6 6"/>',
 edit:'<path d="M4 20h4L19 9l-4-4L4 16v4z"/>',
 down:'<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',up:'<path d="M12 16V5M7 9l5-5 5 5M5 20h14"/>',
 book:'<path d="M5 4h11a3 3 0 013 3v13H8a3 3 0 01-3-3V4zM5 17a3 3 0 013-3h11"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5v.01"/>',
 phone:'<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 18.5h2"/>',
 refresh:'<path d="M20 11a8 8 0 10-2.3 5.7M20 4v7h-7"/>',
 trash:'<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'
};
const ic=(n,s=22)=>`<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[n]}</svg>`;

/* ---------- Dữ liệu ---------- */
const DEF=()=>({places:[{id:uid(),name:'Công ty',color:COLORS[0],goal:0}],sessions:[],set:{},sel:null});
let S=load();
function load(){let d=null;try{d=JSON.parse(localStorage.getItem(KEY))}catch(e){}
 if(!d||!Array.isArray(d.places)||!Array.isArray(d.sessions))d=DEF();
 d.set=Object.assign({theme:'auto',alert:12,lastExport:0,seenSum:''},d.set||{});
 if(!d.set.lastExport)d.set.lastExport=Date.now();return d}
function save(){try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){toast('Không lưu được dữ liệu, bộ nhớ có thể đã đầy')}}
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}

/* ---------- Thời gian (chỉ lưu mốc bắt đầu/kết thúc, không đếm) ---------- */
const ym=d=>({y:d.getFullYear(),m:d.getMonth()});
const key=o=>o.y+'-'+pad(o.m+1);
const shift=(o,n)=>ym(new Date(o.y,o.m+n,1));
const range=o=>[new Date(o.y,o.m,1).getTime(),new Date(o.y,o.m+1,1).getTime()];
const ov=(s,a,b)=>Math.max(0,Math.min(s.end||Date.now(),b)-Math.max(s.start,a));
const sumMs=(l,a,b)=>l.reduce((t,s)=>t+ov(s,a,b),0);
const fmtDur=ms=>{const m=Math.round(ms/6e4),h=Math.floor(m/60);if(m<1)return 'dưới 1 phút';return h?`${h} giờ ${pad(m%60)} phút`:`${m} phút`};
const fmtT=t=>{const d=new Date(t);return pad(d.getHours())+':'+pad(d.getMinutes())};
const fmtD=t=>{const d=new Date(t);return `${pad(d.getDate())}/${pad(d.getMonth()+1)}/${d.getFullYear()}`};
const toIn=t=>{const d=new Date(t);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`};
const dayStart=t=>{const d=new Date(t);return new Date(d.getFullYear(),d.getMonth(),d.getDate()).getTime()};
const WD=['Chủ nhật','Thứ 2','Thứ 3','Thứ 4','Thứ 5','Thứ 6','Thứ 7'];
const place=id=>S.places.find(p=>p.id===id)||{name:'(đã xóa)',color:'#6F7C89',goal:0};
const active=()=>S.sessions.find(s=>!s.end);

/* ---------- Giao diện chung ---------- */
let curDays=[],tab='home',H=ym(new Date()),M=ym(new Date()),flt='',noteTmp='',defer=null,reg=null,pcCol=COLORS[0],toastT=0;
const TABS=[['home','clock','Chấm giờ'],['hist','list','Lịch sử'],['sum','chart','Tổng kết'],['set','set','Cài đặt']];
$('#nav').innerHTML=TABS.map(t=>`<button data-t="${t[0]}"${t[0]==='home'?' class="on"':''}>${ic(t[1],24)}${t[2]}</button>`).join('');
const TITLES={home:'Chấm giờ',hist:'Lịch sử',sum:'Tổng kết tháng',set:'Cài đặt'};
function go(t){tab=t;document.querySelectorAll('.tab').forEach(e=>e.classList.toggle('on',e.id==='t-'+t));
 document.querySelectorAll('nav button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
 $('#ttl').textContent=TITLES[t];$('main').scrollTop=0;render()}
function render(){const n=new Date();$('#dt').textContent=`${WD[n.getDay()]}, ${pad(n.getDate())}/${pad(n.getMonth()+1)}`;({home:rHome,hist:rHist,sum:rSum,set:rSet})[tab]()}
function applyTheme(){const t=S.set.theme;if(t==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.dataset.theme=t}
function toast(msg,undo){const el=$('#toast');clearTimeout(toastT);
 el.innerHTML=`<span>${esc(msg)}</span>${undo?'<button id="undo">Hoàn tác</button>':''}`;el.hidden=false;
 if(undo)$('#undo').onclick=()=>{undo();el.hidden=true;clearTimeout(toastT)};
 toastT=setTimeout(()=>el.hidden=true,undo?10000:2800)}
function openModal(html){const m=$('#modal');m.innerHTML=`<div class="sheet">${html}</div>`;m.hidden=false}
function closeModal(){$('#modal').hidden=true}
$('#modal').addEventListener('click',e=>{if(e.target.id==='modal')closeModal()});
const banner=(txt,btns)=>`<div class="ban">${ic('info',20)}<div><div>${txt}</div><div class="bb">${btns}</div></div></div>`;

/* ---------- Chấm giờ ---------- */
function rHome(){
 const a=active();
 if(!S.places.some(p=>p.id===S.sel))S.sel=(S.places[0]||{}).id;
 const cur=ym(new Date()),pv=shift(cur,-1),pk=key(pv),[pa,pb]=range(pv);let ban='';
 if(a&&S.set.alert>0&&Date.now()-a.start>S.set.alert*36e5)
  ban+=banner(`Phiên này đã chạy ${fmtDur(Date.now()-a.start)}. Bạn quên bấm Kết thúc?`,'<button data-a="outNow">Kết thúc bây giờ</button><button data-a="outAt">Chọn giờ kết thúc</button>');
 if(S.set.seenSum!==pk&&sumMs(S.sessions,pa,pb)>0)
  ban+=banner(`Tổng kết tháng ${pv.m+1}/${pv.y} đã sẵn sàng.`,'<button data-a="seeSum">Xem tổng kết</button><button data-a="hideSum">Ẩn</button>');
 if(S.sessions.length&&Date.now()-S.set.lastExport>30*DAY)
  ban+=banner('Đã hơn 30 ngày bạn chưa sao lưu dữ liệu.','<button data-a="expJ">Sao lưu ngay</button><button data-a="hideBk">Ẩn</button>');
 if(defer)ban+=banner('Cài Chấm Giờ vào màn hình chính để mở nhanh như một ứng dụng.','<button data-a="install">Cài đặt</button>');
 const pl=S.places.map(p=>`<button class="chip${(a?a.placeId:S.sel)===p.id?' on':''}" data-pl="${p.id}" ${a?'disabled':''} style="--c:${p.color}"><i></i>${esc(p.name)}</button>`).join('');
 const n=Date.now(),d0=dayStart(n),[ma,mb]=range(ym(new Date()));
 $('#t-home').innerHTML=`${ban}<div class="chips">${pl}<button class="chip add" data-a="addPl">${ic('plus',18)}Địa điểm</button></div>
 <div class="hero"><div class="ring"><button class="big ${a?'out':''}" data-a="big">${a?'Kết thúc':'Bắt đầu'}</button></div>
 <div class="st">${a?'Từ '+fmtT(a.start):'Chưa ghi giờ'}</div>
 <div class="sub">${a?`${esc(place(a.placeId).name)}, đã qua ${fmtDur(n-a.start)} <button data-a="refresh">Cập nhật</button>`:'Chạm nút khi bạn đến nơi'}</div></div>
 <input id="note" class="inp" placeholder="Ghi chú (không bắt buộc)" maxlength="120" value="${esc(a?a.note||'':noteTmp)}">
 <div class="stats"><div class="card"><b>${fmtDur(sumMs(S.sessions,d0,d0+DAY))}</b><span>Hôm nay</span></div><div class="card"><b>${fmtDur(sumMs(S.sessions,ma,mb))}</b><span>Tháng này</span></div></div>`}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render()});
document.addEventListener('input',e=>{if(e.target.id!=='note')return;const a=active();if(a){a.note=e.target.value;save()}else noteTmp=e.target.value});

/* ---------- Lịch sử ---------- */
function mnav(o,v){return `<div class="mnav"><button data-a="mnav" data-v="${v}" data-d="-1" aria-label="Tháng trước">${ic('left')}</button><b>Tháng ${o.m+1}/${o.y}</b><button data-a="mnav" data-v="${v}" data-d="1" aria-label="Tháng sau">${ic('right')}</button></div>`}
function rHist(){
 const [a,b]=range(H),l=S.sessions.filter(s=>ov(s,a,b)>0&&(!flt||s.placeId===flt)).sort((x,y)=>y.start-x.start);
 let h=mnav(H,'H')+`<select class="sel" id="fltP" aria-label="Lọc địa điểm"><option value="">Tất cả địa điểm</option>${S.places.map(p=>`<option value="${p.id}"${flt===p.id?' selected':''}>${esc(p.name)}</option>`).join('')}</select>
 <div class="card"><small>Tổng thời gian trong tháng</small><div class="big-num">${fmtDur(sumMs(l,a,b))}</div></div>
 <button class="btn full" data-a="addSess">${ic('plus',18)}Thêm phiên thủ công</button>`;
 if(!l.length)h+=`<div class="empty">Chưa có phiên nào trong tháng này.</div>`;
 let last='';
 l.forEach(s=>{const d=fmtD(s.start);if(d!==last){h+=`<div class="day">${WD[new Date(s.start).getDay()]}, ${d}</div>`;last=d}
  const p=place(s.placeId),e=s.end?(fmtD(s.end)!==d?fmtD(s.end)+' ':'')+fmtT(s.end):'đang chạy';
  h+=`<div class="srow" data-a="edit" data-v="${s.id}" style="--c:${p.color}"><i></i><div><b>${esc(p.name)}</b><small>${fmtT(s.start)} đến ${e}${s.note?', '+esc(s.note):''}</small></div><strong>${fmtDur((s.end||Date.now())-s.start)}</strong></div>`});
 $('#t-hist').innerHTML=h}
document.addEventListener('change',e=>{const i=e.target.id;
 if(i==='fltP'){flt=e.target.value;rHist()}
 if(i==='sTheme'){S.set.theme=e.target.value;save();applyTheme()}
 if(i==='sAlert'){S.set.alert=Math.max(0,+e.target.value||0);save()}
 if(i==='imp')doImport(e.target.files[0])});

function sessModal(s){
 const nw=!s;s=s||{placeId:S.sel||(S.places[0]||{}).id,start:Date.now()-36e5,end:Date.now(),note:''};const act=!nw&&!s.end;
 openModal(`<h2>${nw?'Thêm phiên thủ công':'Sửa phiên'}</h2>
 <label>Địa điểm<select id="fP">${S.places.map(p=>`<option value="${p.id}"${p.id===s.placeId?' selected':''}>${esc(p.name)}</option>`).join('')}</select></label>
 <label>Giờ bắt đầu<input id="fS" type="datetime-local" value="${toIn(s.start)}"></label>
 ${act?'<p class="mut">Phiên đang chạy nên chưa có giờ kết thúc.</p>':`<label>Giờ kết thúc<input id="fE" type="datetime-local" value="${toIn(s.end)}"></label>`}
 <label>Ghi chú<input id="fN" maxlength="120" value="${esc(s.note||'')}"></label>
 <div class="row"><button class="btn pri" id="fSave">Lưu</button>${nw?'':'<button class="btn bad" id="fDel">Xóa</button>'}<button class="btn" data-a="close">Hủy</button></div>`);
 $('#fSave').onclick=()=>{const st=new Date($('#fS').value).getTime(),en=act?null:new Date($('#fE').value).getTime();
  if(!st||(!act&&!en))return toast('Hãy nhập đủ giờ bắt đầu và kết thúc');
  if(!act&&en<=st)return toast('Giờ kết thúc phải sau giờ bắt đầu');
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
 if(!tot){$('#t-sum').innerHTML=h+`<div class="empty">Chưa có dữ liệu tháng này.<br>Hãy bắt đầu chấm giờ ở tab Chấm giờ.</div>`;return}
 const days=[];for(let i=0;i<nd;i++)days.push(sumMs(S.sessions,new Date(M.y,M.m,i+1).getTime(),new Date(M.y,M.m,i+2).getTime()));
 const mx=Math.max(...days),mi=days.indexOf(mx),pres=days.filter(v=>v>0).length;
 const pl=S.places.map(p=>{const l=S.sessions.filter(s=>s.placeId===p.id&&ov(s,a,b)>0);return{p,ms:sumMs(l,a,b),n:l.length}}).filter(x=>x.ms>0||x.p.goal>0).sort((x,y)=>y.ms-x.ms);
 const pmx=Math.max(...pl.map(x=>x.ms),1);
 const cmp=ptot>0?(()=>{const r=Math.round((tot-ptot)/ptot*100);return `<span class="${r>=0?'up':'dn'}">${r>=0?'Tăng':'Giảm'} ${Math.abs(r)}%</span> so với tháng trước`})():'Chưa có dữ liệu tháng trước để so sánh';
 const topMs=Math.ceil(Math.max(mx,4*36e5)/36e5)*36e5;curDays=days;
 const chart=`<small>Tối đa ${topMs/36e5} giờ mỗi ngày</small><div class="bars">${days.map((v,i)=>`<button class="bar" data-a="bar" data-v="${i}" aria-label="Ngày ${i+1}"><i${i===mi?' class="hi"':''} style="height:${v/topMs*100}%"></i></button>`).join('')}</div>
 <div class="xl">${days.map((v,i)=>`<span>${[1,5,10,15,20,25,nd].includes(i+1)?`<b>${i+1}</b>`:''}</span>`).join('')}</div>
 <div id="binfo">Chạm vào một cột để xem chi tiết ngày đó</div>`;
 h+=`<div class="card"><small>Tổng thời gian</small><div class="big-num">${fmtDur(tot)}</div><div>${cmp}</div></div>
 <div class="card"><div class="kv"><span>Số ngày có mặt</span><b>${pres}/${nd} ngày</b></div>
 <div class="kv"><span>Ngày ở lâu nhất</span><b>${pad(mi+1)}/${pad(M.m+1)}, ${fmtDur(mx)}</b></div>
 <div class="kv"><span>Trung bình mỗi ngày có mặt</span><b>${fmtDur(tot/pres)}</b></div></div>
 <h3>Theo ngày</h3><div class="card">${chart}</div><h3>Theo địa điểm</h3>`;
 pl.forEach(x=>{const g=x.p.goal*36e5;
  h+=`<div class="card"><div class="kv"><b>${esc(x.p.name)}</b><b>${fmtDur(x.ms)}</b></div>
  <div class="pb"><em style="width:${x.ms/pmx*100}%;background:${x.p.color}"></em></div>
  <small>${x.n} lần đến${x.n?`, trung bình ${fmtDur(x.ms/x.n)} mỗi lần`:''}</small>
  ${g?`<div class="pb"><em style="width:${Math.min(100,x.ms/g*100)}%;background:var(--ok)"></em></div><small>Mục tiêu ${x.p.goal} giờ, đã đạt ${Math.round(x.ms/g*100)}%</small>`:''}</div>`});
 $('#t-sum').innerHTML=h}

/* ---------- Cài đặt ---------- */
const lrow=(a,i,t,sub,cls='',v='')=>`<button class="lrow ${cls}" data-a="${a}"${v?` data-v="${v}"`:''}><span class="li">${ic(i)}</span><span class="lt"><b>${t}</b>${sub?`<small>${sub}</small>`:''}</span></button>`;
function rSet(){
 const st=window.matchMedia('(display-mode: standalone)').matches;
 $('#t-set').innerHTML=`${lrow('guide','book','Hướng dẫn sử dụng','Cách dùng, sao lưu và cài vào màn hình chính')}<h3>Địa điểm</h3>${S.places.map(p=>`<button class="lrow" data-a="editPl" data-v="${p.id}" style="--c:${p.color}"><span class="chip" style="min-height:0;padding:0;border:0;background:none"><i></i></span><span class="lt"><b>${esc(p.name)}</b><small>${p.goal?'Mục tiêu '+p.goal+' giờ mỗi tháng':'Chưa đặt mục tiêu'}</small></span><span class="li">${ic('edit',20)}</span></button>`).join('')}
 ${lrow('addPl','plus','Thêm địa điểm','')}
 <h3>Tùy chọn</h3><div class="card">
 <label class="kv"><span>Giao diện</span><select id="sTheme" class="sel" style="width:auto;margin:0"><option value="auto"${S.set.theme==='auto'?' selected':''}>Theo máy</option><option value="light"${S.set.theme==='light'?' selected':''}>Sáng</option><option value="dark"${S.set.theme==='dark'?' selected':''}>Tối</option></select></label>
 <label class="kv"><span>Nhắc quên Kết thúc sau (giờ, 0 = tắt)</span><input id="sAlert" type="number" min="0" inputmode="numeric" value="${S.set.alert}" style="width:80px;min-height:44px;border-radius:12px;border:1.5px solid var(--line);background:var(--card);color:var(--tx);padding:0 10px;font-size:16px"></label></div>
 <h3>Dữ liệu</h3>
 ${lrow('expJ','down','Xuất file JSON','Dùng để sao lưu và khôi phục')}
 ${lrow('expC','down','Xuất file CSV','Mở bằng Excel hoặc Google Sheets')}
 ${lrow('impJ','up','Nhập từ file JSON','Khôi phục dữ liệu đã sao lưu')}
 <h3>Ứng dụng</h3>
 <button class="lrow" data-a="install"${st?' disabled':''}><span class="li">${ic('phone')}</span><span class="lt"><b>${st?'Đã cài vào màn hình chính':'Cài vào màn hình chính'}</b></span></button>
 ${lrow('upd','refresh','Kiểm tra cập nhật','Phiên bản '+VER)}
 ${lrow('wipe','trash','Xóa toàn bộ dữ liệu','Không thể hoàn tác','bad')}
 <p class="mut" style="text-align:center;font-size:13px">Dữ liệu chỉ lưu trên máy này.</p>`}

function placeModal(p){
 const nw=!p;p=p||{name:'',color:COLORS[S.places.length%COLORS.length],goal:0};pcCol=p.color;
 openModal(`<h2>${nw?'Thêm địa điểm':'Sửa địa điểm'}</h2>
 <label>Tên<input id="pN" maxlength="30" value="${esc(p.name)}"></label>
 <div class="sw">${COLORS.map(c=>`<button class="swb${c===p.color?' on':''}" data-a="sw" data-v="${c}" style="background:${c}" aria-label="Chọn màu"></button>`).join('')}</div>
 <label>Mục tiêu (giờ mỗi tháng, 0 = không đặt)<input id="pG" type="number" min="0" inputmode="numeric" value="${p.goal||0}"></label>
 <div class="row"><button class="btn pri" id="pSave">Lưu</button>${nw?'':'<button class="btn bad" id="pDel">Xóa</button>'}<button class="btn" data-a="close">Hủy</button></div>`);
 $('#pSave').onclick=()=>{const n=$('#pN').value.trim();if(!n)return toast('Hãy nhập tên địa điểm');
  const v={name:n,color:pcCol,goal:Math.max(0,+$('#pG').value||0)};
  if(nw){const x=Object.assign({id:uid()},v);S.places.push(x);if(!S.sel)S.sel=x.id}else Object.assign(p,v);
  save();closeModal();render()};
 if(!nw)$('#pDel').onclick=()=>{
  if(S.places.length<2)return toast('Cần giữ lại ít nhất một địa điểm');
  if(active()&&active().placeId===p.id)return toast('Hãy bấm Kết thúc trước khi xóa địa điểm này');
  const c=S.sessions.filter(s=>s.placeId===p.id).length;
  if(confirm(c?`Xóa địa điểm này và ${c} phiên đã ghi?`:'Xóa địa điểm này?')){S.places=S.places.filter(x=>x!==p);S.sessions=S.sessions.filter(s=>s.placeId!==p.id);save();closeModal();render()}}}

/* ---------- Hướng dẫn (đọc từ HUONG-DAN.md) ---------- */
function md(t){let h='',ul=0,ol=0;const cl=()=>{if(ul){h+='</ul>';ul=0}if(ol){h+='</ol>';ol=0}};
 const inl=s=>esc(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>').replace(/`(.+?)`/g,'<code>$1</code>');
 t.split(/\r?\n/).forEach(l=>{let m;
  if(m=l.match(/^(#{1,3})\s+(.*)/)){cl();const k=m[1].length+1;h+=`<h${k}>${inl(m[2])}</h${k}>`}
  else if(m=l.match(/^\s*[-*]\s+(.*)/)){if(!ul){cl();h+='<ul>';ul=1}h+=`<li>${inl(m[1])}</li>`}
  else if(m=l.match(/^\s*\d+\.\s+(.*)/)){if(!ol){cl();h+='<ol>';ol=1}h+=`<li>${inl(m[1])}</li>`}
  else if(!l.trim())cl();else{cl();h+=`<p>${inl(l)}</p>`}});cl();return h}
function guide(){openModal('<div class="doc"><p class="mut">Đang tải hướng dẫn...</p></div>');
 fetch('./HUONG-DAN.md').then(r=>{if(!r.ok)throw 0;return r.text()}).then(t=>{
  $('#modal .sheet').innerHTML=`<div class="doc">${md(t)}</div><button class="btn pri full" data-a="close" style="margin-top:16px">Đóng</button>`})
 .catch(()=>{$('#modal .sheet').innerHTML='<div class="doc"><p>Không tải được hướng dẫn. Hãy mở app một lần khi có mạng.</p></div><button class="btn full" data-a="close">Đóng</button>'})}

/* ---------- Xuất / nhập ---------- */
function dl(name,type,txt){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type}));a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),2000)}
function doImport(f){if(!f)return;const r=new FileReader();r.onload=()=>{try{
 const d=JSON.parse(r.result);if(!Array.isArray(d.places)||!Array.isArray(d.sessions))throw 0;
 if(!confirm(`Thay toàn bộ dữ liệu hiện tại bằng file này (${d.sessions.length} phiên)?`))return;
 S.places=d.places.filter(p=>p&&p.id&&p.name).map(p=>({id:String(p.id),name:String(p.name),color:String(p.color||COLORS[0]),goal:+p.goal||0}));
 if(!S.places.length)S.places=DEF().places;
 S.sessions=d.sessions.filter(s=>s&&+s.start>0).map(s=>({id:String(s.id||uid()),placeId:String(s.placeId),start:+s.start,end:+s.end>0?+s.end:null,note:String(s.note||'')}));
 save();render();toast('Đã nhập dữ liệu')}catch(e){toast('File không hợp lệ')}};r.readAsText(f);$('#imp').value=''}

/* ---------- Hành động ---------- */
const ACT={
 close:closeModal,refresh:()=>render(),guide,
 bar(t){const i=+t.dataset.v;document.querySelectorAll('.bar').forEach(b=>b.classList.toggle('sel',b===t));$('#binfo').textContent=`Ngày ${i+1}/${M.m+1}: ${curDays[i]?fmtDur(curDays[i]):'không có dữ liệu'}`},
 big(){const a=active();
  if(!a){if(!S.sel)return toast('Hãy thêm một địa điểm trước');
   const s={id:uid(),placeId:S.sel,start:Date.now(),end:null,note:noteTmp.trim()};S.sessions.push(s);noteTmp='';save();vib();render();
   toast('Đã bắt đầu tại '+place(s.placeId).name,()=>{S.sessions=S.sessions.filter(x=>x!==s);save();render()})}
  else{a.end=Date.now();a.note=(($('#note')||{}).value||a.note||'').trim();save();vib();render();
   toast('Đã kết thúc, tổng '+fmtDur(a.end-a.start),()=>{a.end=null;save();render()})}},
 outNow(){const a=active();if(a){a.end=Date.now();save();render();toast('Đã kết thúc, tổng '+fmtDur(a.end-a.start))}},
 outAt(){const a=active();if(!a)return;
  openModal(`<h2>Bạn đã kết thúc lúc nào?</h2><label>Giờ kết thúc<input id="oT" type="datetime-local" value="${toIn(Date.now())}"></label><div class="row"><button class="btn pri" id="oS">Lưu</button><button class="btn" data-a="close">Hủy</button></div>`);
  $('#oS').onclick=()=>{const t=new Date($('#oT').value).getTime();if(!t||t<=a.start||t>Date.now())return toast('Giờ kết thúc phải sau giờ bắt đầu và không ở tương lai');a.end=t;save();closeModal();render();toast('Đã kết thúc, tổng '+fmtDur(a.end-a.start))}},
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
  const rows=[['Địa điểm','Giờ bắt đầu','Giờ kết thúc','Số phút','Ghi chú']].concat(S.sessions.slice().sort((x,y)=>x.start-y.start).map(s=>[place(s.placeId).name,toIn(s.start).replace('T',' '),s.end?toIn(s.end).replace('T',' '):'',s.end?Math.round((s.end-s.start)/6e4):'',s.note||'']));
  dl('chamgio.csv','text/csv;charset=utf-8','\ufeff'+rows.map(r=>r.map(q).join(',')).join('\r\n'));toast('Đã xuất file CSV')},
 impJ(){$('#imp').click()},
 async install(){if(defer){defer.prompt();try{await defer.userChoice}catch(e){}defer=null;render()}
  else openModal(`<h2>Cài đặt thủ công</h2><p>Mở menu ⋮ của trình duyệt, chọn <b>Thêm vào màn hình chính</b> (hoặc <b>Cài đặt ứng dụng</b>), rồi bấm Cài đặt.</p><button class="btn pri full" data-a="close">Đã hiểu</button>`)},
 upd(){if(!reg)return toast('Hãy mở app khi có mạng để bật chế độ ngoại tuyến');reg.update().then(()=>toast('Đã kiểm tra, bạn đang dùng bản mới nhất')).catch(()=>toast('Cần có mạng để kiểm tra cập nhật'))},
 wipe(){if(confirm('Xóa TOÀN BỘ địa điểm và lịch sử?')&&confirm('Thao tác này không thể hoàn tác. Bạn chắc chắn chứ?')){const s=S.set;S=DEF();S.set=s;S.set.lastExport=Date.now();save();render();toast('Đã xóa toàn bộ dữ liệu')}}
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
