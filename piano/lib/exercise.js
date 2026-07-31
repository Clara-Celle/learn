/* ============================================================
   exercise.js — coquille d'exercice commune à toutes les leçons.

   Toujours le même ordre à l'écran, dans toutes les leçons :
     1. CONSIGNE   — ce qu'on te demande maintenant
     2. CONTRÔLES  — boutons (ceux de la lib piano + ceux de la leçon)
     3. PANNEAU    — zone libre de la leçon (métronome, séquence…) — optionnelle
     4. CLAVIER    — les touches à jouer sont TOUJOURS surlignées
     5. VERDICT    — le résultat de ce que tu viens de jouer
     6. SCORE      — série / progression

   Usage :
     var ex = Exercise.create({ mount:'#ex', hint:'Main droite…' });
     var kb = PianoKeyboard.create({ mount: ex.pianoMount, onNote: … });
     ex.attach(kb);                    // monte les boutons de la lib + le surlignage
     ex.button('▶ Commencer', fn, {primary:true});
     ex.prompt('Ré mineur', 'Joue-le de mémoire.');
     ex.target([62,65,69]);            // les touches à toucher
     ex.hit(62); ex.miss(61);          // retour touche par touche
     ex.verdict('ok', '✓ Bravo', 'détail…');
     ex.score('Série : ●●·');

   Le style vit dans lesson.css (classes .ex-*). Rien à dupliquer dans les leçons.
   ============================================================ */
(function(){
  function el(tag, cls, parent){
    var e=document.createElement(tag);
    if(cls) e.className=cls;
    if(parent) parent.appendChild(e);
    return e;
  }

  function create(opts){
    opts=opts||{};
    var mount=(typeof opts.mount==='string')?document.querySelector(opts.mount):opts.mount;
    if(!mount) throw new Error('Exercise: mount introuvable');
    mount.classList.add('stage','ex');

    var promptEl = el('div','ex-prompt', mount);
    var titleEl  = el('span','ex-title', promptEl);
    var subEl    = el('span','ex-sub', promptEl);
    var ctrlEl   = el('div','ex-controls', mount);
    var panelEl  = el('div','ex-panel', mount);
    var hintEl   = el('div','ex-hint', mount);
    var pianoEl  = el('div','ex-piano', mount);
    var verdictEl= el('div','ex-verdict', mount);
    var scoreEl  = el('div','ex-score', mount);

    if(opts.hint) hintEl.innerHTML=opts.hint; else hintEl.style.display='none';
    panelEl.style.display='none';

    var kb=null, badTimers={};

    var api={
      el:mount, pianoMount:pianoEl, panel:panelEl, controls:ctrlEl,

      attach:function(keyboard){
        kb=keyboard;
        kb.mountControls(ctrlEl);           // 🔊 Son · 🎵 Noms · 🎯 Guide · ✋ Doigtés · 🎶 Pédale · 🎹 MIDI
        return api;
      },

      /* 1. consigne */
      prompt:function(title, sub){
        titleEl.innerHTML=(title==null?'':title);
        subEl.innerHTML=(sub==null?'':sub);
        return api;
      },

      /* 2. boutons de la leçon — toujours après ceux de la lib */
      button:function(label, onClick, o){
        o=o||{};
        var b=el('button', o.primary?'primary':'', ctrlEl);
        b.innerHTML=label;
        if(o.id) b.id=o.id;
        b.onclick=function(){ onClick(b); };
        return b;
      },

      /* 4. les touches à jouer — visibles par défaut, c'est la règle du cours.
         `doigts` (optionnel, même ordre que `notes`) pose une pastille numérotée
         sur chaque touche : quel doigt va où. */
      target:function(notes, doigts){
        if(!kb) return api;
        kb.clearClass('pk-target','pk-ok','pk-bad');
        kb.clearFingers();
        if(notes && notes.length) kb.guide(notes, doigts);   // doigté déduit si non fourni
        return api;
      },
      hit:function(midi){
        if(!kb) return api;
        kb.removeClass(midi,'pk-target'); kb.addClass(midi,'pk-ok');
        return api;
      },
      miss:function(midi){
        if(!kb) return api;
        kb.addClass(midi,'pk-bad');
        clearTimeout(badTimers[midi]);
        badTimers[midi]=setTimeout(function(){ kb.removeClass(midi,'pk-bad'); }, 320);
        return api;
      },
      clearKeys:function(){ if(kb){ kb.clearClass('pk-target','pk-ok','pk-bad'); kb.clearFingers(); } return api; },

      /* 5. verdict — kind: 'ok' | 'meh' | 'no' | '' */
      verdict:function(kind, big, det){
        verdictEl.className='ex-verdict'+(kind?' '+kind:'');
        verdictEl.innerHTML=(big?'<span class="ex-big">'+big+'</span>':'')
                          +(det?'<span class="ex-det">'+det+'</span>':'');
        return api;
      },

      /* 5bis. une mesure chiffrée (ms, demi-tons…) affichée dans le verdict */
      measure:function(kind, value, label){
        verdictEl.className='ex-verdict'+(kind?' '+kind:'');
        verdictEl.innerHTML='<span class="ex-num">'+value+'</span><span class="ex-det">'+label+'</span>';
        return api;
      },

      /* 6. score */
      score:function(html){ scoreEl.innerHTML=(html==null?'':html); return api; },

      /* série de pastilles ●●●·· — le compteur de progression de toutes les leçons */
      streak:function(done, total, label){
        var s='';
        for(var i=0;i<total;i++) s+=(i<done?'●':'·');
        scoreEl.innerHTML=(label||'Série')+' : <span class="ex-streak'+(done>=total?' full':'')+'">'+s+'</span>';
        return api;
      },

      hint:function(html){
        hintEl.innerHTML=html||'';
        hintEl.style.display=html?'':'none';
        return api;
      },
      showPanel:function(on){ panelEl.style.display=(on===false)?'none':''; return api; },

      reset:function(){
        api.clearKeys();
        api.verdict('','','');
        return api;
      }
    };
    return api;
  }

  window.Exercise={ create:create };
})();
