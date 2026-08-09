/* ============================================================
   piano.js — clavier de piano réutilisable (affichage + son + MIDI)
   Script classique (pas un module) → fonctionne en file://.
   Expose window.PianoKeyboard.create(options) -> api

   options : {
     mount        : sélecteur ou élément où monter le piano
     octaves      : nb d'octaves (défaut 2)
     extraC       : ajoute un Do final (défaut true)
     startOctave  : octave de départ (défaut 4 → Do central = Do4 = MIDI 60)
     labels       : afficher les noms solfège (défaut true)
     guide        : surligner les touches à jouer (défaut true, réglable par bouton)
     fingers      : afficher les ronds de doigté (défaut true, réglable par bouton)
     sound        : son activé (défaut true)
     midi         : écouter un vrai clavier USB-MIDI (défaut true) — exige http://localhost
     onNote       : fonction(midi, element, info) appelée à chaque note jouée
                    info = {velocity: 1-127 ou null, source: 'midi'|'clic'}
     onRelease    : fonction(midi, element) appelée quand la touche est RELÂCHÉE.
                    Sans elle, une leçon ne peut mesurer que des débuts de notes —
                    donc pas le legato, qui est un intervalle relâché→enfoncé.
   }

   api : el, whites, blacks, midiToEl(m), playNote, playChord,
         setLabels/toggleLabels, setSound/toggleSound/isSound,
         setGuide/toggleGuide, setFingersVisible/toggleFingers, setFinger/clearFingers,
         highlight(notes,cls), addClass, removeClass,
         clearClass(...cls), mountControls(target, {sound,labels,guide,fingers,pedal,midi}),
         midiState(), onMidiState(fn), midiMessage(bytes)

   Web MIDI : les notes du vrai piano passent par le MÊME chemin que la souris (press/release)
   → aucune leçon n'a besoin d'être modifiée. La pédale de sustain arrive en CC64.
   Le navigateur n'autorise le MIDI qu'en contexte sécurisé → servir le dossier via ./serve.sh.
   ============================================================ */
(function(){
  var LET=['C','D','E','F','G','A','B'];
  var SOL=['Do','Ré','Mi','Fa','Sol','La','Si'];
  var SEMI=[0,2,4,5,7,9,11];
  var BLACK_AFTER={C:1,D:1,F:1,G:1,A:1};
  function create(opts){
    opts=opts||{};
    var mount=(typeof opts.mount==='string')?document.querySelector(opts.mount):opts.mount;
    var octaves=opts.octaves||2;
    var extraC=opts.extraC!==false;
    var startOctave=opts.startOctave||4;
    var soundOn=opts.sound!==false;
    var guideOn=opts.guide!==false, fingersOn=opts.fingers!==false;
    var labelsOn=opts.labels!==false;
    var onNote=opts.onNote||function(){};
    var onRelease=opts.onRelease||function(){};

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
    var voices={}, pedaled={}, pedalLocked=false, pedalSpace=false, pedalMidi=false, pedalOn=false;
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
    function noteOn(midi,vel){                               // vel 1-127 (MIDI) ; absente = volume nominal
      if(!soundOn) return;
      try{
        ensureCtx(); delete pedaled[midi]; stopVoice(midi);  // retrigger propre
        var t=actx.currentTime, f=midiToFreq(midi);
        var amp=0.30*(vel?(0.30+0.70*vel/127):1);            // clavier sensible au toucher → nuances audibles
        var o=actx.createOscillator(), o2=actx.createOscillator(), g=actx.createGain(), og2=actx.createGain();
        o.type='triangle'; o.frequency.value=f; o2.type='sine'; o2.frequency.value=f*2; og2.gain.value=0.18;
        o2.connect(og2).connect(g); o.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.0001,t);
        g.gain.exponentialRampToValueAtTime(amp,t+0.012);    // attaque
        g.gain.exponentialRampToValueAtTime(amp*0.4,t+0.18); // petite chute
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
      var on=pedalLocked||pedalSpace||pedalMidi;            // bouton, barre Espace, ou vraie pédale MIDI (CC64)
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

    function press(el,vel,src){
      if(!el) return;
      el.classList.add('pk-press');
      var midi=parseInt(el.dataset.midi);
      noteOn(midi,vel); onNote(midi,el,{velocity:vel||null, source:src||'clic'});
    }
    function release(el){
      if(!el) return;
      el.classList.remove('pk-press');
      var midi=parseInt(el.dataset.midi);
      noteOff(midi); onRelease(midi,el);
    }
    function bindKey(k){
      k.addEventListener('pointerdown',function(e){ e.preventDefault(); press(k); });
      k.addEventListener('pointerup',function(){ release(k); });
      k.addEventListener('pointerleave',function(){ release(k); });
      k.addEventListener('pointercancel',function(){ release(k); });
    }
    whites.forEach(bindKey); blacks.forEach(bindKey);
    window.addEventListener('blur', function(){ releaseAll(); whites.concat(blacks).forEach(function(el){ el.classList.remove('pk-press'); }); });

    /* ----- vrai clavier USB-MIDI (Web MIDI API) -----
       Passe par press()/release() → l'affichage, le son ET le onNote des exercices
       fonctionnent à l'identique, que la note vienne de la souris ou du piano.
       ⚠ Exige un contexte sécurisé : https ou http://localhost — jamais file://. */
    var midiState={ok:false, text:'🎹 MIDI : non connecté', device:''};
    var midiListeners=[], flashTimer=null;
    function setMidiState(ok,text){ midiState.ok=ok; midiState.text=text;
      midiListeners.forEach(function(f){ try{ f(midiState); }catch(e){} }); }
    function flash(text){                                    // message passager, puis retour au nom du clavier
      clearTimeout(flashTimer); setMidiState(midiState.ok,text);
      flashTimer=setTimeout(function(){ setMidiState(midiState.ok, midiState.device||midiState.text); },2000);
    }
    function noteName(m){
      var sc=m%12, i=SEMI.indexOf(sc);
      var n=(i>=0)?SOL[i]:SOL[SEMI.indexOf(sc-1)]+'♯';
      return n+(Math.floor(m/12)-1);
    }
    function handleMidi(e){
      var d=e.data, cmd=d[0]&0xf0;
      if(cmd===0xb0 && d[1]===64){ pedalMidi=d[2]>=64; refreshPedal(); return; }   // CC64 = pédale forte
      if(cmd!==0x90 && cmd!==0x80) return;
      var on=(cmd===0x90 && d[2]>0), el=midiToEl[d[1]];
      if(!el){ if(on) flash('🎹 '+noteName(d[1])+' — hors de la plage affichée (bouton Octave)'); return; }
      // le son ne démarre qu'après un geste utilisateur (règle des navigateurs) : le MIDI n'en est pas un
      if(on && actx && actx.state==='suspended') flash('🎹 Clique une fois sur la page pour activer le son');
      on?press(el,d[2],'midi'):release(el);
    }
    if(opts.midi!==false && navigator.requestMIDIAccess){
      navigator.requestMIDIAccess().then(function(access){
        function bind(){
          var names=[];
          access.inputs.forEach(function(inp){ inp.onmidimessage=handleMidi; names.push(inp.name); });
          midiState.device=names.length?('🎹 '+names[0]):'';
          setMidiState(!!names.length, names.length?midiState.device:'🎹 Aucun clavier détecté');
        }
        access.onstatechange=bind; bind();                   // branchement/débranchement à chaud
      }).catch(function(){ setMidiState(false,'🎹 MIDI refusé — autorise-le dans le navigateur'); });
    } else if(opts.midi!==false){
      setMidiState(false, window.isSecureContext?'🎹 MIDI non supporté (utilise Chrome ou Edge)'
                                               :'🎹 Ouvre la page en http://localhost pour le MIDI');
    }

    /* ----- pastilles de doigté : un rond numéroté sur la touche -----
       Dit QUEL doigt va OÙ. Utilisé par exercise.js via ex.target(notes, doigts). */
    function setFinger(midi, n){
      var el=midiToEl[midi]; if(!el) return;
      var f=el.querySelector('.pk-fing');
      if(n==null){ if(f) el.removeChild(f); return; }
      if(!f){ f=document.createElement('span'); f.className='pk-fing'; el.appendChild(f); }
      f.textContent=n;
    }
    function clearFingers(){
      whites.concat(blacks).forEach(function(el){
        var f=el.querySelector('.pk-fing'); if(f) el.removeChild(f);
      });
    }

    /* ----- état affichage ----- */
    function setLabels(v){ labelsOn=v; whites.forEach(function(w){ var l=w.querySelector('.pk-lbl'); if(l) l.style.display=v?'block':'none'; }); }
    setLabels(labelsOn);
    function setSound(v){ soundOn=v; }
    // Deux réglages d'affichage, valables pour TOUTES les leçons :
    //  · le guide  = le surlignage des prochaines touches à jouer
    //  · les doigtés = les ronds numérotés posés dessus
    // Purement CSS : les leçons appellent target() sans se soucier de l'état.
    function setGuide(v){ guideOn=!!v; piano.classList.toggle('pk-noguide',!guideOn); }
    function setFingersVisible(v){ fingersOn=!!v; piano.classList.toggle('pk-nofing',!fingersOn); }

    var api={
      el:piano,
      whites:whites, blacks:blacks,
      midiToEl:function(m){ return midiToEl[m]; },
      playNote:playNote, playChord:playChord,
      context:function(){ return ensureCtx(); },             // AudioContext partagé (clics + notes = 1 horloge)
      now:function(){ return ensureCtx().currentTime; },
      noteOn:noteOn, noteOff:noteOff,
      setPedal:setPedal, togglePedal:function(){ setPedal(!pedalLocked); return pedalLocked; }, isPedal:function(){ return pedalLocked; },
      midiState:function(){ return midiState; },
      onMidiState:function(f){ midiListeners.push(f); f(midiState); },
      midiMessage:function(bytes){ handleMidi({data:bytes}); },   // injection manuelle (diagnostic / tests)
      setLabels:setLabels, toggleLabels:function(){ setLabels(!labelsOn); return labelsOn; },
      setSound:setSound, toggleSound:function(){ soundOn=!soundOn; return soundOn; }, isSound:function(){ return soundOn; },
      setGuide:setGuide, toggleGuide:function(){ setGuide(!guideOn); return guideOn; }, isGuide:function(){ return guideOn; },
      setFingersVisible:setFingersVisible, isFingers:function(){ return fingersOn; },
      toggleFingers:function(){ setFingersVisible(!fingersOn); return fingersOn; },
      highlight:function(notes,cls){ cls=cls||'pk-target'; notes.forEach(function(m){ var el=midiToEl[m]; if(el) el.classList.add(cls); }); },
      setFinger:setFinger, clearFingers:clearFingers,
      // guide(notes, doigts) = surligne les prochaines touches ET pose les ronds de doigté.
      // `doigts` omis → déduit de l'écart : une triade serrée (≤ une quinte) se joue 1-3-5,
      // plus large (un renversement) 1-2-5. ponytail: heuristique volontaire, couvre les
      // triades du cours ; passer `doigts` explicitement pour tout autre cas.
      guide:function(notes,doigts){
        if(!notes||!notes.length) return;
        clearFingers();
        notes.forEach(function(m){ var el=midiToEl[m]; if(el) el.classList.add('pk-target'); });
        if(!doigts && notes.length===3){
          var srt=notes.slice().sort(function(a,b){return a-b;});
          doigts=(srt[2]-srt[0]<=7)?[1,3,5]:[1,2,5];
          notes=srt;
        }
        if(doigts) notes.forEach(function(m,i){ if(doigts[i]!=null) setFinger(m,doigts[i]); });
      },
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
        if(o.labels!==false) mk('🎵 Noms des notes', function(b){ var on=api.toggleLabels(); b.classList.toggle('pk-on',on); b.textContent=on?'🎵 Noms des notes':'🎵 Noms masqués'; });
        if(o.guide!==false){ var gb=mk('🎯 Guide', function(b){ var on=api.toggleGuide(); b.classList.toggle('pk-on',on); b.textContent=on?'🎯 Guide':'🎯 Guide masqué'; });
          gb.title='Surligner les prochaines touches à jouer'; }
        if(o.fingers!==false){ var fb=mk('✋ Doigtés', function(b){ var on=api.toggleFingers(); b.classList.toggle('pk-on',on); b.textContent=on?'✋ Doigtés':'✋ Doigtés masqués'; });
          fb.title='Afficher le numéro du doigt sur chaque touche à jouer'; }
        if(o.pedal!==false){ var pb=mk('🎶 Pédale', function(b){ var on=api.togglePedal(); b.classList.toggle('pk-on',on); b.textContent=on?'🎶 Pédale ON':'🎶 Pédale'; }, false);
          pb.title='Pédale de sustain — clique pour bloquer, maintiens la barre Espace, ou utilise la vraie pédale'; }
        if(o.midi!==false){                                  // témoin : le vrai clavier est-il relié ?
          var mb=mk('', function(){}, false);
          mb.style.cursor='default';
          mb.title='État de la connexion avec ton clavier USB-MIDI';
          api.onMidiState(function(s){ mb.textContent=s.text; mb.classList.toggle('pk-on',s.ok); });
        }
      }
    };
    return api;
  }

  window.PianoKeyboard={ create:create };
})();
