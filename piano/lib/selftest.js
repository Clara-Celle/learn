/* ============================================================
   selftest.js — contrôle rapide, en ligne de commande :  node lib/selftest.js

   Pourquoi il existe : vérifier la SYNTAXE (new Function) ne suffit pas.
   Une variable supprimée par erreur ne casse qu'à l'EXÉCUTION — et comme
   mountControls() est appelé au début de chaque leçon, une seule erreur y
   tue tout le script de la page : le clavier s'affiche, les exercices non.
   C'est exactement le bug arrivé en supprimant le clavier d'ordinateur
   (le bloc Web MIDI est parti avec). Ce test l'attrape en 200 ms.

   Il n'ouvre pas de navigateur : un faux DOM minimal suffit à exécuter
   piano.js et exercise.js pour de vrai.
   ============================================================ */
'use strict';
const fs = require('fs');
const path = require('path');
const LIB = __dirname;

/* ---------- faux DOM, strictement ce dont les libs ont besoin ---------- */
function El(tag){
  this.tagName=(tag||'div').toUpperCase(); this.children=[]; this.dataset={}; this.style={};
  this._cls=new Set(); this.innerHTML=''; this._text='';
  this.classList={ add:(...c)=>c.forEach(x=>this._cls.add(x)),
                   remove:(...c)=>c.forEach(x=>this._cls.delete(x)),
                   toggle:(c,f)=>{ const has=this._cls.has(c); const on=(f===undefined)?!has:!!f;
                                   on?this._cls.add(c):this._cls.delete(c); return on; },
                   contains:c=>this._cls.has(c) };
}
El.prototype.appendChild=function(c){ this.children.push(c); c.parentNode=this; return c; };
El.prototype.removeChild=function(c){ this.children=this.children.filter(x=>x!==c); return c; };
El.prototype.addEventListener=function(){};
El.prototype.querySelector=function(sel){
  const cls=String(sel).replace(/^\./,'');
  return this.children.find(c=>c._cls.has(cls))||null;
};
El.prototype.querySelectorAll=function(sel){   // récursif : held() cherche .pk-press dans tout le clavier
  const cls=String(sel||'').replace(/^\./,''), out=[];
  (function walk(n){ n.children.forEach(c=>{ if(c._cls.has(cls)) out.push(c); walk(c); }); })(this);
  return out;
};
El.prototype.getBoundingClientRect=function(){ return {left:0,right:40,width:40,top:0,bottom:240,height:240}; };
Object.defineProperty(El.prototype,'className',{ get(){return [...this._cls].join(' ');},
  set(v){ this._cls=new Set(String(v).split(/\s+/).filter(Boolean)); } });
// le vrai DOM convertit toujours textContent en chaîne — le stub doit faire pareil,
// sinon un test compare un nombre à une chaîne et échoue pour rien
Object.defineProperty(El.prototype,'textContent',{ get(){return this._text;},
  set(v){ this._text = (v==null?'':String(v)); } });

global.document={ createElement:t=>new El(t), querySelector:()=>new El('div'),
  querySelectorAll:()=>[], getElementById:()=>new El('div'),
  addEventListener:()=>{}, readyState:'complete', head:new El('head'), body:new El('body'), title:'' };
global.window={ addEventListener:()=>{}, isSecureContext:true, innerWidth:1200,
  location:{pathname:'/lessons/x.html', protocol:'http:'},
  localStorage:{getItem:()=>null,setItem:()=>{}},
  AudioContext:function(){ this.state='running'; this.currentTime=0; this.destination={};
    this.createOscillator=()=>({frequency:{},connect(){return this;},start(){},stop(){}});
    this.createGain=()=>({gain:{setValueAtTime(){},exponentialRampToValueAtTime(){},
      cancelAndHoldAtTime(){},setTargetAtTime(){},cancelScheduledValues(){},value:0},
      connect(){return this;}}); this.resume=()=>{}; } };
// node ≥ 21 expose déjà un `navigator` en lecture seule : on le redéfinit
Object.defineProperty(global,'navigator',{value:{},writable:true,configurable:true});
global.requestAnimationFrame=fn=>fn();
global.location=window.location;
global.localStorage=window.localStorage;
window.LNAV_NOMOUNT=true;          // nav.js : on veut les DONNÉES, pas le sommaire flottant

/* ---------- exécution réelle des libs ---------- */
eval(fs.readFileSync(path.join(LIB,'piano.js'),'utf8'));
eval(fs.readFileSync(path.join(LIB,'exercise.js'),'utf8'));
eval(fs.readFileSync(path.join(LIB,'nav.js'),'utf8'));

let fails=0;
function check(name, cond){
  if(!cond) fails++;
  console.log((cond?'  ✓ ':'  ✗ ')+name);
}

console.log('\npiano.js');
const kb = window.PianoKeyboard.create({mount:new El('div'), octaves:3, startOctave:3, midi:false});
check('create() construit les touches', kb.whites.length+kb.blacks.length === 37);
kb.mountControls(new El('div'));
check('mountControls() ne lève rien (le piège : ça tue toute la leçon)', true);

kb.guide([60,64,67]);
check('guide() surligne les touches', kb.midiToEl(64)._cls.has('pk-target'));
check('doigté déduit : triade serrée → 1-3-5',
  kb.midiToEl(60).querySelector('.pk-fing').textContent==='1' &&
  kb.midiToEl(64).querySelector('.pk-fing').textContent==='3' &&
  kb.midiToEl(67).querySelector('.pk-fing').textContent==='5');
kb.guide([60,65,69]);
check('doigté déduit : accord large (renversement) → 1-2-5',
  kb.midiToEl(65).querySelector('.pk-fing').textContent==='2');

kb.setGuide(false);   check('bouton Guide → classe pk-noguide', kb.el._cls.has('pk-noguide'));
kb.setGuide(true);
kb.setFingersVisible(false); check('bouton Doigtés → classe pk-nofing', kb.el._cls.has('pk-nofing'));
kb.setFingersVisible(true);

let got=null, rel=null;
const kb2 = window.PianoKeyboard.create({mount:new El('div'), octaves:3, startOctave:3, midi:false,
  onNote:(m,el,info)=>{ got={m,info}; }, onRelease:m=>{ rel=m; }});
kb2.midiMessage([0x90,67,42]);
check('Web MIDI : note ON décodée, vélocité transmise',
  got && got.m===67 && got.info.velocity===42 && got.info.source==='midi');
kb2.midiMessage([0x80,67,0]);
// sans onRelease, aucune leçon ne peut mesurer un legato (intervalle relâché→enfoncé)
check('note OFF remonte à la leçon via onRelease', rel===67);
kb2.midiMessage([0x90,127,100]);
check('note hors plage → message d\'aide, pas de plantage',
  kb2.midiState().text.indexOf('hors de la plage')>=0);
check('plus aucune API de clavier d\'ordinateur',
  kb2.toggleKeys===undefined && kb2.setKeysVisible===undefined);

// held() : une touche tenue ne renvoie plus jamais de onNote. Les leçons d'accords doivent pouvoir
// demander « quelles touches sont enfoncées MAINTENANT », sinon un accord commencé avant que la
// cible change ne peut plus jamais se compléter (bug leçons accord-mineur + renversements).
kb2.midiMessage([0x90,62,90]); kb2.midiMessage([0x90,65,90]);
check('held() liste les touches tenues, pas les note-on passés',
  kb2.held().sort((a,b)=>a-b).join()==='62,65');
kb2.midiMessage([0x80,62,0]);
check('held() oublie la touche relâchée', kb2.held().join()==='65');
kb2.midiMessage([0x80,65,0]);

console.log('\nexercise.js');
const mount=new El('div');
const ex=window.Exercise.create({mount, hint:'test'});
check('les zones sont montées dans l\'ordre',
  mount.children.map(c=>c.className.split(' ')[0]).join(',')
  === 'ex-prompt,ex-controls,ex-panel,ex-hint,ex-piano,ex-verdict,ex-score');
const kb3=window.PianoKeyboard.create({mount:ex.pianoMount, octaves:3, startOctave:3, midi:false});
ex.attach(kb3);
ex.target([60,64,67]);
check('target() surligne + pose les doigtés', kb3.midiToEl(60)._cls.has('pk-target'));
ex.hit(60);
check('hit() passe la touche en « trouvée »', kb3.midiToEl(60)._cls.has('pk-ok'));
ex.clearKeys();
check('clearKeys() retire surlignage et ronds',
  !kb3.midiToEl(60)._cls.has('pk-target') && !kb3.midiToEl(60).querySelector('.pk-fing'));

console.log('\nnav.js — ordre des leçons');
const L=window.LessonNav.lessons;
check('numéros calculés depuis l\'ordre (aucun écrit à la main)',
  L.filter(x=>!x.bonus).every((x,i)=>x.n===String(i+1).padStart(2,'0')));
check('aucun fichier en double', new Set(L.map(x=>x.f)).size===L.length);
check('le bonus est en dernier et hors numérotation', L[L.length-1].bonus===true && L[L.length-1].n==='★');
check('chaque leçon a fichier + titre + rubrique', L.every(x=>x.f&&x.t&&x.k));
check('chaque fichier de leçon existe sur le disque',
  L.every(x=>fs.existsSync(path.join(LIB,'..','lessons',x.f))));

// Les fiches sont listées une seule fois (nav.js) et affichées à deux endroits :
// le sommaire des leçons et la page d'accueil. Une fiche listée mais absente = lien mort partout.
const R=window.LessonNav.refs;
check('les fiches de référence sont listées', Array.isArray(R) && R.length>0 && R.every(x=>x.f&&x.t));
check('chaque fiche de référence existe sur le disque',
  R.every(x=>fs.existsSync(path.join(LIB,'..','lessons',x.f))));

console.log(fails ? `\n⛔ ${fails} test(s) en échec\n` : '\n✅ tout passe\n');
process.exit(fails?1:0);
