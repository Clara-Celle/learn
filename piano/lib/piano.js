/* ============================================================
   piano.js — clavier de piano réutilisable (affichage + son + AZERTY)
   Script classique (pas un module) → fonctionne en file://.
   Expose window.PianoKeyboard.create(options) -> api

   options : {
     mount        : sélecteur ou élément où monter le piano
     octaves      : nb d'octaves (défaut 2)
     extraC       : ajoute un Do final (défaut true)
     startOctave  : octave de départ (défaut 4 → Do central = Do4 = MIDI 60)
     labels       : afficher les noms solfège (défaut true)
     computerKeys : activer le jeu au clavier AZERTY + badges (défaut true)
     sound        : son activé (défaut true)
     onNote       : fonction(midi, element) appelée à chaque note jouée
   }

   api : el, whites, blacks, midiToEl(m), playNote, playChord,
         setLabels/toggleLabels, setSound/toggleSound/isSound,
         setKeysVisible/toggleKeys, highlight(notes,cls), addClass, removeClass,
         clearClass(...cls), mountControls(target, {sound,labels,keys})
   ============================================================ */
(function(){
  var LET=['C','D','E','F','G','A','B'];
  var SOL=['Do','Ré','Mi','Fa','Sol','La','Si'];
  var SEMI=[0,2,4,5,7,9,11];
  var BLACK_AFTER={C:1,D:1,F:1,G:1,A:1};
  // AZERTY par POSITION PHYSIQUE (event.code) : milieu = blanches, dessus = noires.
  var KEYMAP={KeyA:60,KeyS:62,KeyD:64,KeyF:65,KeyG:67,KeyH:69,KeyJ:71,KeyK:72,KeyL:74,
              KeyW:61,KeyE:63,KeyT:66,KeyY:68,KeyU:70,KeyO:73,KeyP:75};
  var AZLBL={KeyA:'Q',KeyS:'S',KeyD:'D',KeyF:'F',KeyG:'G',KeyH:'H',KeyJ:'J',KeyK:'K',KeyL:'L',
             KeyW:'Z',KeyE:'E',KeyT:'T',KeyY:'Y',KeyU:'U',KeyO:'O',KeyP:'P'};

  // Clavier 2 OCTAVES chromatiques (option keyboard:'2oct') — blanches + noires, deux mains :
  //  · octave grave (Do3=48) = main gauche : rangée du bas (blanches) + rangée du milieu (noires)
  //  · octave médium (Do4=60) = main droite : A Z E R T Y U (blanches) + chiffres (noires)
  var KEYMAP2={
    KeyZ:48,KeyS:49,KeyX:50,KeyD:51,KeyC:52,KeyV:53,KeyG:54,KeyB:55,KeyH:56,KeyN:57,KeyJ:58,KeyM:59,
    KeyQ:60,Digit2:61,KeyW:62,Digit3:63,KeyE:64,KeyR:65,Digit5:66,KeyT:67,Digit6:68,KeyY:69,Digit7:70,KeyU:71,
    KeyI:72,Digit9:73,KeyO:74,Digit0:75,KeyP:76
  };
  var AZLBL2={
    KeyZ:'W',KeyS:'S',KeyX:'X',KeyD:'D',KeyC:'C',KeyV:'V',KeyG:'G',KeyB:'B',KeyH:'H',KeyN:'N',KeyJ:'J',KeyM:',',
    KeyQ:'A',Digit2:'é',KeyW:'Z',Digit3:'"',KeyE:'E',KeyR:'R',Digit5:'(',KeyT:'T',Digit6:'-',KeyY:'Y',Digit7:'è',KeyU:'U',
    KeyI:'I',Digit9:'ç',KeyO:'O',Digit0:'à',KeyP:'P'
  };

  function create(opts){
    opts=opts||{};
    var mount=(typeof opts.mount==='string')?document.querySelector(opts.mount):opts.mount;
    var octaves=opts.octaves||2;
    var extraC=opts.extraC!==false;
    var startOctave=opts.startOctave||4;
    var soundOn=opts.sound!==false;
    var labelsOn=opts.labels!==false;
    var onNote=opts.onNote||function(){};
    var two=(opts.keyboard==='2oct');
    var KM=opts.keymap || (two?KEYMAP2:KEYMAP);             // mapping clavier : défaut 1 octave, '2oct', ou personnalisé
    var LB=opts.keylabels || (two?AZLBL2:AZLBL);

    var scroll=document.createElement('div'); scroll.className='pk-scroll';
    var piano=document.createElement('div'); piano.className='pk-piano';
    scroll.appendChild(piano); mount.appendChild(scroll);

    /* ----- audio (Web Audio, synthèse intégrée) ----- */
    var actx=null;
    function midiToFreq(m){ return 440*Math.pow(2,(m-69)/12); }
    function ensureCtx(){
      actx=actx||new (window.AudioContext||window.webkitAudioContext)();
      if(actx.state==='suspended') actx.resume();
      return actx;
    }
    // `when` (optionnel) = instant de départ sur l'horloge audio (échantillon-précis).
    function playNote(midi, when){
      if(!soundOn) return;
      try{
        ensureCtx();
        var t=(when!=null?when:actx.currentTime), f=midiToFreq(midi);
        var o=actx.createOscillator(), o2=actx.createOscillator(), g=actx.createGain(), og2=actx.createGain();
        o.type='triangle'; o.frequency.value=f; o2.type='sine'; o2.frequency.value=f*2; og2.gain.value=0.18;
        o2.connect(og2).connect(g); o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(0.27,t+0.012);
        g.gain.exponentialRampToValueAtTime(0.0001,t+1.3);
        o.start(t); o2.start(t); o.stop(t+1.35); o2.stop(t+1.35);
      }catch(e){}
    }
    // Toutes les notes partent au MÊME instant. `when` (optionnel) = planif. sur l'horloge audio.
    function playChord(notes, when){
      if(!soundOn) return;
      try{ ensureCtx(); var t0=(when!=null?when:actx.currentTime+0.02); notes.forEach(function(m){ playNote(m,t0); }); }catch(e){}
    }

    /* ----- notes tenues + PÉDALE de sustain ----- */
    var voices={}, pedaled={}, pedalLocked=false, pedalSpace=false, pedalOn=false;
    function stopVoice(midi){                                 // éteint réellement une note
      var v=voices[midi]; if(!v) return;
      delete voices[midi]; delete pedaled[midi];
      try{
        clearTimeout(v.off);
        var t=actx.currentTime, g=v.g.gain;
        if(g.cancelAndHoldAtTime) g.cancelAndHoldAtTime(t);  // fige la valeur sans saut de volume
        else { var cur=g.value; g.cancelScheduledValues(t); g.setValueAtTime(cur,t); }
        g.setTargetAtTime(0.0001, t, 0.16);                  // extinction ~0,6-0,8 s
        v.o.stop(t+1.4); v.o2.stop(t+1.4);
      }catch(e){}
    }
    function noteOn(midi){
      if(!soundOn) return;
      try{
        ensureCtx(); delete pedaled[midi]; stopVoice(midi);  // retrigger propre
        var t=actx.currentTime, f=midiToFreq(midi);
        var o=actx.createOscillator(), o2=actx.createOscillator(), g=actx.createGain(), og2=actx.createGain();
        o.type='triangle'; o.frequency.value=f; o2.type='sine'; o2.frequency.value=f*2; og2.gain.value=0.18;
        o2.connect(og2).connect(g); o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(0.30,t+0.012);   // attaque
        g.gain.exponentialRampToValueAtTime(0.12,t+0.18);    // petite chute
        g.gain.exponentialRampToValueAtTime(0.0008,t+8);     // long déclin TANT QUE tenu
        o.start(t); o2.start(t);
        voices[midi]={o:o,o2:o2,g:g, off:setTimeout(function(){ stopVoice(midi); },9000)};
      }catch(e){}
    }
    function noteOff(midi){                                   // touche relâchée
      if(pedalOn){ pedaled[midi]=true; return; }             // la pédale garde la note qui sonne
      stopVoice(midi);
    }
    function refreshPedal(){
      var on=pedalLocked||pedalSpace;
      if(on===pedalOn) return;
      pedalOn=on;
      if(!on){ Object.keys(pedaled).forEach(function(m){ stopVoice(Number(m)); }); pedaled={}; } // pédale levée → on coupe
    }
    function setPedal(v){ pedalLocked=!!v; refreshPedal(); }
    function releaseAll(){ Object.keys(voices).forEach(function(m){ stopVoice(Number(m)); }); pedaled={}; }
    // Barre Espace = pédale momentanée (maintenue), comme une vraie pédale de piano.
    window.addEventListener('keydown',function(e){ if(e.code==='Space'){ e.preventDefault(); if(!e.repeat){ pedalSpace=true; refreshPedal(); } } });
    window.addEventListener('keyup',function(e){ if(e.code==='Space'){ e.preventDefault(); pedalSpace=false; refreshPedal(); } });

    /* ----- construction des touches ----- */
    var whites=[], blacks=[], midiToEl={};
    function addWhite(letter,solfege,midi){
      var w=document.createElement('div'); w.className='pk-wkey';
      w.dataset.midi=midi; w.dataset.letter=letter; w.dataset.solfege=solfege;
      w.innerHTML='<div class="pk-lbl"><span class="pk-s">'+solfege+'</span></div>';
      piano.appendChild(w); whites.push(w); midiToEl[midi]=w; return w;
    }
    for(var o=0;o<octaves;o++){ var oct=startOctave+o; for(var i=0;i<7;i++) addWhite(LET[i],SOL[i],12*(oct+1)+SEMI[i]); }
    if(extraC) addWhite('C','Do',12*(startOctave+octaves+1)+0);
    whites.forEach(function(w,idx){
      if(idx===whites.length-1) return;
      if(!BLACK_AFTER[w.dataset.letter]) return;
      var b=document.createElement('div'); b.className='pk-bkey'; b._after=w;
      var bm=parseInt(w.dataset.midi)+1; b.dataset.midi=bm;
      piano.appendChild(b); blacks.push(b); midiToEl[bm]=b;
    });
    function layout(){
      var pr=piano.getBoundingClientRect();
      blacks.forEach(function(b){ var r=b._after.getBoundingClientRect(); var bw=r.width*0.62;
        b.style.width=bw+'px'; b.style.left=(r.right-pr.left-bw/2)+'px'; });
    }
    window.addEventListener('resize',layout); window.addEventListener('load',layout);
    requestAnimationFrame(layout);

    function press(el){
      if(!el) return;
      el.classList.add('pk-press');
      var midi=parseInt(el.dataset.midi);
      noteOn(midi); onNote(midi,el);
    }
    function release(el){
      if(!el) return;
      el.classList.remove('pk-press');
      noteOff(parseInt(el.dataset.midi));
    }
    function bindKey(k){
      k.addEventListener('pointerdown',function(e){ e.preventDefault(); press(k); });
      k.addEventListener('pointerup',function(){ release(k); });
      k.addEventListener('pointerleave',function(){ release(k); });
      k.addEventListener('pointercancel',function(){ release(k); });
    }
    whites.forEach(bindKey); blacks.forEach(bindKey);
    window.addEventListener('blur', function(){ releaseAll(); whites.concat(blacks).forEach(function(el){ el.classList.remove('pk-press'); }); });

    /* ----- clavier d'ordinateur AZERTY ----- */
    if(opts.computerKeys!==false){
      Object.keys(KM).forEach(function(code){
        var el=midiToEl[KM[code]]; if(!el) return;
        var k=document.createElement('span'); k.className='pk-kkey'; k.textContent=LB[code]; el.appendChild(k);
      });
      window.addEventListener('keydown',function(e){
        if(e.repeat||e.ctrlKey||e.metaKey||e.altKey) return;
        var midi=KM[e.code]; if(midi===undefined) return;
        e.preventDefault(); press(midiToEl[midi]);
      });
      window.addEventListener('keyup',function(e){
        var midi=KM[e.code]; if(midi===undefined) return;
        release(midiToEl[midi]);
      });
    }

    /* ----- état affichage ----- */
    function setLabels(v){ labelsOn=v; whites.forEach(function(w){ var l=w.querySelector('.pk-lbl'); if(l) l.style.display=v?'block':'none'; }); }
    setLabels(labelsOn);
    function setSound(v){ soundOn=v; }
    function setKeysVisible(v){ piano.classList.toggle('pk-hidekeys',!v); }

    var api={
      el:piano,
      whites:whites, blacks:blacks,
      midiToEl:function(m){ return midiToEl[m]; },
      playNote:playNote, playChord:playChord,
      context:function(){ return ensureCtx(); },             // AudioContext partagé (clics + notes = 1 horloge)
      now:function(){ return ensureCtx().currentTime; },
      noteOn:noteOn, noteOff:noteOff,
      setPedal:setPedal, togglePedal:function(){ setPedal(!pedalLocked); return pedalLocked; }, isPedal:function(){ return pedalLocked; },
      setLabels:setLabels, toggleLabels:function(){ setLabels(!labelsOn); return labelsOn; },
      setSound:setSound, toggleSound:function(){ soundOn=!soundOn; return soundOn; }, isSound:function(){ return soundOn; },
      setKeysVisible:setKeysVisible, toggleKeys:function(){ var hidden=piano.classList.toggle('pk-hidekeys'); return !hidden; },
      highlight:function(notes,cls){ cls=cls||'pk-target'; notes.forEach(function(m){ var el=midiToEl[m]; if(el) el.classList.add(cls); }); },
      addClass:function(m,cls){ var el=midiToEl[m]; if(el) el.classList.add(cls); },
      removeClass:function(m,cls){ var el=midiToEl[m]; if(el) el.classList.remove(cls); },
      clearClass:function(){ var cls=[].slice.call(arguments); whites.concat(blacks).forEach(function(el){ el.classList.remove.apply(el.classList,cls); }); },
      isLabels:function(){ return labelsOn; },
      mountControls:function(target,o){
        o=o||{};
        target=(typeof target==='string')?document.querySelector(target):target;
        function mk(label,onClick,on){ var b=document.createElement('button'); b.className='pk-btn'+(on===false?'':' pk-on'); b.textContent=label;
          b.onclick=function(){ onClick(b); }; target.appendChild(b); return b; }
        if(o.sound!==false) mk('🔊 Son', function(b){ var on=api.toggleSound(); b.classList.toggle('pk-on',on); b.textContent=on?'🔊 Son':'🔇 Son coupé'; if(on) api.playNote(60); });
        if(o.labels!==false) mk('Afficher les noms', function(b){ var on=api.toggleLabels(); b.classList.toggle('pk-on',on); b.textContent=on?'Afficher les noms':'Noms masqués'; });
        if(o.keys!==false) mk('⌨ Touches PC', function(b){ var on=api.toggleKeys(); b.classList.toggle('pk-on',on); });
        if(o.pedal!==false){ var pb=mk('🎶 Pédale', function(b){ var on=api.togglePedal(); b.classList.toggle('pk-on',on); b.textContent=on?'🎶 Pédale ON':'🎶 Pédale'; }, false);
          pb.title='Pédale de sustain — clique pour bloquer, ou maintiens la barre Espace'; }
      }
    };
    return api;
  }

  window.PianoKeyboard={ create:create };
})();
