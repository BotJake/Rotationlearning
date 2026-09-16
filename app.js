const catalog = {
 Melee:['Attack','Punish','Dismember','Slice','Havoc','Backhand','Barge','Greater Barge','Fury','Greater Fury','Flurry','Greater Flurry','Sever','Smash','Cleave','Decimate','Hurricane','Quake','Forceful Backhand','Slaughter','Assault','Destroy','Blood Tendrils','Massacre','Meteor Strike','Frenzy','Berserk','Balanced Strike','Chaos Roar','Overpower','Igneous Overpower','Rend','Adaptive Strike'],
 Ranged:['Ranged','Piercing Shot','Snipe','Greater Snipe','Fragmentation Shot','Dazing Shot','Greater Dazing Shot','Needle Strike','Binding Shot','Demoralise','Ricochet','Greater Ricochet','Corruption Shot','Snap Shot','Rapid Fire','Bombardment','Tight Bindings','Shadow Tendrils','Deadshot','Incendiary Shot','Death’s Swiftness','Unload'],
 Magic:['Magic','Wrack','Wrack and Ruin','Sonic Wave','Greater Sonic Wave','Concentrated Blast','Greater Concentrated Blast','Dragon Breath','Combust','Impact','Chain','Greater Chain','Corruption Blast','Asphyxiate','Wild Magic','Horror','Smoke Tendrils','Detonate','Omnipower','Igneous Omnipower','Metamorphosis','Sunshine','Greater Sunshine','Tsunami'],
 Necromancy:['Necromancy','Conjure Skeleton Warrior','Conjure Putrid Zombie','Conjure Vengeful Ghost','Conjure Phantom Guardian','Command Skeleton Warrior','Command Putrid Zombie','Command Vengeful Ghost','Command Phantom Guardian','Touch of Death','Soul Sap','Volley of Souls','Finger of Death','Death Skulls','Living Death','Bloat','Soul Strike','Spectral Scythe','Blood Siphon','Threads of Fate','Split Soul','Invoke Death'],
 Defence:['Anticipation','Freedom','Resonance','Divert','Preparation','Reflect','Debilitate','Revenge','Bash','Provoke','Barricade','Immortality','Rejuvenate','Natural Instinct','Cease','Devotion'],
 Constitution:['Eat Food','Demon Slayer','Dragon Slayer','Undead Slayer','Tuska’s Wrath','Sacrifice','Transfigure','Guthix’s Blessing','Ice Asylum','Onslaught','Weapon Special Attack','Regenerate','Incite'],
 Utility:['Surge','Double Surge','Escape','Double Escape','Dive','Bladed Dive','Ingenuity of the Humans','Limitless','Aggression'],
 Specials:['EZK Special','Leng Special','Dragon Claws','Dragon Dagger','Dragon Longsword','Dragon Mace','Dragon 2h Sword','Statius’s Warhammer','Zaros Godsword','Armadyl Godsword','Saradomin Godsword','Guthix Godsword','Dark Bow','Seren Godbow','Bow of the Last Guardian','Eldritch Crossbow','Fractured Staff of Armadyl','Omni Guard','Devourer’s Guard']
};
const $=id=>document.getElementById(id);
const slug=s=>s.toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'');
const iconUrl=name=>`https://runescape.wiki/images/${encodeURIComponent(name.replaceAll(' ','_'))}.png`;
let items=[]; Object.entries(catalog).forEach(([cat,names])=>names.forEach(name=>items.push({id:slug(name),name,cat,icon:iconUrl(name)})));
const A=Object.fromEntries(items.map(x=>[x.id,x]));

const defaultPresets = {
  "EZK opener": {active:true, items:[slug('Meteor Strike'),slug('Adaptive Strike'),slug('Berserk'),{type:'pause',ticks:8},slug('Greater Barge'),slug('Igneous Overpower'),slug('EZK Special'),slug('Greater Flurry'),slug('Rend'),slug('Hurricane'),slug('Assault')]},
  "Defensives": {active:false, items:[slug('Anticipation'),slug('Freedom'),slug('Devotion'),slug('Resonance'),slug('Reflect'),slug('Debilitate')]}
};
let state = {presets: defaultPresets, selected:"EZK opener", icon:42, names:false, overlay:false};
let dragIndex=null;

function load(){
  try{
    const s=JSON.parse(localStorage.getItem('rs3rot-multipreset-v1'));
    if(s && s.presets){ state=s; }
  }catch(e){}
  if(!state.selected || !state.presets[state.selected]) state.selected=Object.keys(state.presets)[0];
  $('iconSize').value=state.icon||42; $('showNames').checked=!!state.names;
  document.body.classList.toggle('overlayMode',!!state.overlay);
  $('toggleMode').textContent=state.overlay?'Edit':'Overlay view';
}
function save(){ state.icon=+$('iconSize').value; state.names=$('showNames').checked; localStorage.setItem('rs3rot-multipreset-v1',JSON.stringify(state)); }
function pauseLabel(t){return `${t}t · ${(t*0.6).toFixed(1)}s`}
function abilityEl(raw, editable=false, idx=-1){
  if(typeof raw==='object' && raw.type==='pause'){
    const d=document.createElement('div'); d.className='pause'; d.innerHTML=`<div class="pauseIcon">Ⅱ</div><div class="pauseText">${pauseLabel(+raw.ticks||1)}</div>`;
    if(editable){d.ondblclick=()=>{let v=prompt('Pause ticks:',raw.ticks||1);if(v!==null&&+v>0){state.presets[state.selected].items[idx]={type:'pause',ticks:+v};renderAll()}}}
    return d;
  }
  const a=A[raw]||{name:String(raw),icon:''};
  const d=document.createElement('div'); d.className='ability'; d.title=a.name;
  const img=document.createElement('img'); img.src=a.icon; img.alt=a.name;
  const fb=document.createElement('div'); fb.className='fallback'; fb.textContent=a.name.split(' ').map(x=>x[0]).join('').slice(0,4);
  img.onerror=()=>{img.style.display='none';fb.style.display='flex'};
  d.append(img,fb);
  if(state.names){const n=document.createElement('div');n.className='abilityName';n.textContent=a.name;d.appendChild(n)}
  return d;
}
function wireEditDrag(el,i){
  el.draggable=true;
  el.ondragstart=e=>{dragIndex=i;el.classList.add('dragging');if(e.dataTransfer)e.dataTransfer.setData('text/plain',String(i))};
  el.ondragend=()=>{dragIndex=null;document.querySelectorAll('.dragging,.dragover').forEach(x=>x.classList.remove('dragging','dragover'))};
  el.ondragover=e=>{e.preventDefault();if(dragIndex!==null&&dragIndex!==i)el.classList.add('dragover')};
  el.ondragleave=()=>el.classList.remove('dragover');
  el.ondrop=e=>{e.preventDefault();const arr=state.presets[state.selected].items;if(dragIndex===null||dragIndex===i)return;const [m]=arr.splice(dragIndex,1);arr.splice(i,0,m);dragIndex=null;renderAll()};
  el.oncontextmenu=e=>{e.preventDefault();state.presets[state.selected].items.splice(i,1);renderAll()};
}
function renderLive(){
  document.documentElement.style.setProperty('--icon',(state.icon||42)+'px');
  const host=$('liveBoard'); host.innerHTML='';
  Object.entries(state.presets).filter(([,p])=>p.active).forEach(([name,p])=>{
    const box=document.createElement('div');box.className='livePreset';
    const title=document.createElement('div');title.className='liveTitle';title.textContent=name;
    const strip=document.createElement('div');strip.className='strip';
    p.items.forEach(x=>strip.appendChild(abilityEl(x,false)));
    box.append(title,strip);host.appendChild(box);
  });
  if(!host.children.length){host.innerHTML='<div class="hint">No active presets. Tick “Show” on a preset.</div>'}
}
function renderPresets(){
  const host=$('presetList');host.innerHTML='';
  Object.entries(state.presets).forEach(([name,p])=>{
    const row=document.createElement('div');row.className='presetRow'+(name===state.selected?' selected':'');
    const chk=document.createElement('input');chk.type='checkbox';chk.checked=!!p.active;chk.title='Show';
    chk.onchange=()=>{p.active=chk.checked;renderAll()};
    const nm=document.createElement('div');nm.className='presetName';nm.textContent=name;nm.onclick=()=>{state.selected=name;renderAll()};
    const rename=document.createElement('button');rename.className='smallBtn';rename.textContent='Rename';rename.onclick=()=>{let n=prompt('Preset name:',name);if(!n||n===name)return;if(state.presets[n])return alert('Preset already exists');state.presets[n]=p;delete state.presets[name];if(state.selected===name)state.selected=n;renderAll()};
    const del=document.createElement('button');del.className='smallBtn';del.textContent='Delete';del.onclick=()=>{if(Object.keys(state.presets).length<=1)return alert('Keep at least one preset');delete state.presets[name];if(state.selected===name)state.selected=Object.keys(state.presets)[0];renderAll()};
    row.append(chk,nm,rename,del);host.appendChild(row);
  });
}
function renderEdit(){
  $('editingName').textContent=state.selected||'';
  const host=$('editStrip');host.innerHTML='';
  const p=state.presets[state.selected]; if(!p)return;
  p.items.forEach((x,i)=>{const el=abilityEl(x,true,i);wireEditDrag(el,i);host.appendChild(el)});
}
function fillPicker(){
  const q=$('search').value.toLowerCase(),cat=$('category').value,host=$('picker');host.innerHTML='';
  items.filter(a=>(cat==='All'||a.cat===cat)&&a.name.toLowerCase().includes(q)).forEach(a=>{
    const b=document.createElement('button');b.className='pick';b.title=a.name;
    b.innerHTML=`<img src="${a.icon}" onerror="this.style.visibility='hidden'"><span>${a.name}</span>`;
    b.onclick=()=>{state.presets[state.selected].items.push(a.id);renderAll()};
    host.appendChild(b);
  });
}
function renderAll(){save();renderLive();renderPresets();renderEdit();}

['All',...Object.keys(catalog)].forEach(c=>{let o=document.createElement('option');o.value=o.textContent=c;$('category').appendChild(o)});
$('category').onchange=fillPicker;$('search').oninput=fillPicker;
$('iconSize').oninput=()=>{state.icon=+$('iconSize').value;renderAll()};
$('showNames').onchange=()=>{state.names=$('showNames').checked;renderAll()};
$('toggleMode').onclick=()=>{state.overlay=!state.overlay;document.body.classList.toggle('overlayMode',state.overlay);$('toggleMode').textContent=state.overlay?'Edit':'Overlay view';save()};
$('newPreset').onclick=()=>{let n=$('newPresetName').value.trim();if(!n)return;if(state.presets[n])return alert('Preset already exists');state.presets[n]={active:true,items:[]};state.selected=n;$('newPresetName').value='';renderAll()};
$('addPause').onclick=()=>{let t=Math.max(1,+$('pauseTicks').value||1);state.presets[state.selected].items.push({type:'pause',ticks:t});renderAll()};
$('clearPreset').onclick=()=>{if(confirm('Clear this preset?')){state.presets[state.selected].items=[];renderAll()}};

load(); fillPicker(); renderAll();
