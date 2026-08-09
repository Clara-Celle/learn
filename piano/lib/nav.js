/* ============================================================
   nav.js — sommaire fixe & repliable pour naviguer entre leçons.
   Auto-monté au chargement. Injecte son propre style.
   Inclure simplement : <script src="../lib/nav.js"></script>
   Pour ajouter une leçon : compléter le tableau LESSONS ci-dessous.
   ============================================================ */
(function(){
  /* ============================================================
     L'ORDRE DU COURS VIT ICI, ET NULLE PART AILLEURS.
     Réordonner une leçon = déplacer sa ligne. Les numéros sont CALCULÉS
     depuis la position (champ `n` ajouté plus bas) : aucun numéro n'est
     écrit en dur, ni dans les fichiers, ni dans leur nom.
     Chaque leçon appelle LessonNav.applyToLesson() (via nav.js) qui remplit
     son titre, son numéro et ses liens précédent/suivant.
     ============================================================ */
  var LESSONS=[
    {t:'Géographie du clavier',              f:'geographie-du-clavier.html', k:'Repères',
     d:"Trouver n'importe quelle note instantanément sur le clavier."},
    {t:'Cinq doigts & ton premier accord',   f:'cinq-doigts-et-premier-accord.html', k:'Fondamentaux',
     d:"Un doigt par touche, une mélodie — puis 1-3-5 ensemble : ton premier accord."},
    {t:'Le passage du pouce',                f:'passage-du-pouce.html', k:'Technique',
     d:"Sortir du camp de base sans trou dans le son — la porte des gammes."},
    {t:'Majeur ou mineur : compte les demi-tons', f:'majeur-ou-mineur-compter-les-demi-tons.html', k:'Harmonie',
     d:"Pourquoi Ré·Fa·La n'est pas le majeur de Ré : 4+3 contre 3+4."},
    {t:'Accord mineur & The Scientist',      f:'accord-mineur-et-the-scientist.html', k:'Harmonie',
     d:"L'accord mineur, puis les 4 accords de The Scientist."},
    {t:'Un accord d\'un seul bloc',           f:'accord-dun-seul-bloc.html', k:'Technique',
     d:"Le doigté 1-3-5, mesuré par ton vrai clavier : les 3 notes tombent-elles ensemble ?"},
    {t:'Les renversements',                  f:'renversements.html', k:'Harmonie',
     d:"Changer d'accord sans lever la main : les notes communes ne bougent pas."},
    {t:'Le rythme : jouer en mesure',         f:'rythme-jouer-en-mesure.html', k:'Rythme',
     d:"Tenir le tempo et jouer en place avec le métronome."},
    {t:'La main gauche : la basse',           f:'main-gauche-la-basse.html', k:'Mains ensemble',
     d:"Ajouter la basse à la main gauche sous tes accords."},
    {t:'Le balancier : main droite en croches', f:'balancier-croches.html', k:'Rythme',
     d:"Faire « respirer » l'accord en croches — le vrai mouvement de la chanson."},
    {t:'The Scientist : tout assembler',      f:'the-scientist-assemblage.html', k:'Assemblage',
     d:"Mains ensemble + pédale : jouer The Scientist en entier."},
    {t:'Bonus : Canon de Pachelbel',          f:'bonus-canon-pachelbel.html', k:'Bonus', bonus:true,
     d:"Jouer la célèbre progression du Canon en Ré — révision en tonalité de Ré."}
  ];
  // numérotation dérivée de l'ordre ci-dessus — jamais écrite à la main
  (function(){ var i=0; LESSONS.forEach(function(L){ L.n = L.bonus ? '★' : ('0'+(++i)).slice(-2); }); })();
  var REF={t:'Fiche : carte du clavier', f:'../reference/keyboard-map.html'};
  var REF2={t:'Fiche : position des doigts', f:'../reference/position-des-doigts.html'};
  // chemins relatifs à lessons/ (c'est de là que nav.js est chargé)
  var HUB={t:'Tous les cours', f:'../../index.html'};     // hub de tous les cours
  var HOME={t:'Accueil du cours', f:'../index.html'};     // page d'accueil piano

  var CSS=''
   +'.lnav{position:fixed;top:16px;left:16px;z-index:1000;width:236px;background:#241f1c;'
   +'border:1px solid #3a322d;border-radius:12px;color:#f4ece4;'
   +"font-family:'Avenir Next','Segoe UI',system-ui,sans-serif;box-shadow:0 8px 28px rgba(0,0,0,.45);overflow:hidden}"
   +'.lnav-head{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:11px 12px}'
   +'.lnav-title{font-weight:700;font-size:13px;letter-spacing:.04em;white-space:nowrap}'
   +'.lnav-toggle{cursor:pointer;background:#15110f;border:1px solid #3a322d;color:#e8a04e;font-size:14px;'
   +'line-height:1;padding:6px 10px;border-radius:7px}'
   +'.lnav-toggle:hover{border-color:#e8a04e}'
   +'.lnav-list{display:flex;flex-direction:column;gap:4px;padding:0 8px 10px}'
   +'.lnav-list a{display:block;padding:8px 10px;border-radius:8px;color:#b3a596;text-decoration:none;font-size:12.5px;line-height:1.35}'
   +'.lnav-list a b{color:#e8a04e}'
   +'.lnav-list a:hover{background:#15110f}'
   +'.lnav-list a.current{background:#e8a04e;color:#1a1614}'
   +'.lnav-list a.current b{color:#1a1614}'
   +'.lnav-home{color:#e8a04e!important;font-weight:700}'
   +'.lnav-ref{margin-top:6px;border-top:1px solid #3a322d;padding-top:10px!important;color:#5fb0a8!important}'
   +'.lnav-ref2{margin-top:0;border-top:none;padding-top:2px!important}'
   +'.lnav-hub{margin-top:2px;color:#7c6f5f!important;font-size:12px!important}'
   +'.lnav.collapsed{width:auto}'
   +'.lnav.collapsed .lnav-title,.lnav.collapsed .lnav-list{display:none}'
   +'.lnav.collapsed .lnav-head{padding:8px}'
   +'@media print{.lnav{display:none}}';

  function injectCSS(){
    if(document.getElementById('lnav-style')) return;
    var s=document.createElement('style'); s.id='lnav-style'; s.textContent=CSS; document.head.appendChild(s);
  }
  function currentFile(){ return decodeURIComponent((location.pathname.split('/').pop())||''); }

  function mount(){
    // La page d'accueil du cours charge nav.js pour LES DONNÉES (LessonNav.lessons)
    // mais pose window.LNAV_NOMOUNT=true : ses chemins sont relatifs à lessons/, pas à la racine du cours.
    if(window.LNAV_NOMOUNT) return;
    if(document.querySelector('.lnav')) return;
    injectCSS();
    var cur=currentFile();
    var collapsed = (localStorage.getItem('lnavCollapsed')==='1') || window.innerWidth<900;

    var nav=document.createElement('div'); nav.className='lnav';
    var head=document.createElement('div'); head.className='lnav-head';
    head.innerHTML='<span class="lnav-title">🎹 Leçons</span>'
      +'<button class="lnav-toggle" aria-label="Replier / déplier le sommaire">⟨</button>';
    nav.appendChild(head);

    var list=document.createElement('div'); list.className='lnav-list';
    var home=document.createElement('a'); home.href=HOME.f; home.className='lnav-home';
    if(HOME.f===cur) home.className+=' current';
    home.textContent='🏠 '+HOME.t; list.appendChild(home);
    LESSONS.forEach(function(L){
      var a=document.createElement('a'); a.href=L.f; if(L.f===cur) a.className='current';
      a.innerHTML='<b>'+L.n+'</b> · '+L.t; list.appendChild(a);
    });
    [REF,REF2].forEach(function(R,i){
      var ref=document.createElement('a'); ref.href=R.f;
      ref.className='lnav-ref'+(i?' lnav-ref2':''); ref.textContent='📄 '+R.t;
      list.appendChild(ref);
    });
    var hub=document.createElement('a'); hub.href=HUB.f; hub.className='lnav-hub'; hub.textContent='← '+HUB.t;
    list.appendChild(hub);
    nav.appendChild(list);
    document.body.appendChild(nav);

    var toggle=head.querySelector('.lnav-toggle');
    function setCollapsed(c){
      nav.classList.toggle('collapsed',c);
      localStorage.setItem('lnavCollapsed',c?'1':'0');
      toggle.textContent=c?'☰':'⟨';
      toggle.title=c?'Déplier le sommaire':'Replier (pour dégager le piano)';
    }
    setCollapsed(collapsed);
    toggle.onclick=function(){ setCollapsed(!nav.classList.contains('collapsed')); };
  }

  /* ----- en-tête & pied de page dérivés de l'ordre -----
     Une leçon ne connaît plus son propre numéro. Elle expose des points d'ancrage :
       <p class="kicker" data-lnum></p>        → « Leçon 04 · Harmonie »
       <h1 data-ltitle>…</h1>                  → titre depuis LESSONS (si l'élément est vide)
       <nav data-lprevnext></nav>              → liens ← précédente / suivante →
     Réordonner LESSONS suffit : tout suit. */
  function applyToLesson(){
    var cur=currentFile(), i=-1;
    LESSONS.forEach(function(L,k){ if(L.f===cur) i=k; });
    if(i<0) return;
    var L=LESSONS[i];

    document.title='Leçon '+L.n+' — '+L.t;

    // data-lnum      → « Leçon 04 · Harmonie »
    // data-lnum="n"  → « Leçon 04 » (pour les pieds de page)
    var label=(L.bonus?'Bonus':'Leçon '+L.n);
    [].forEach.call(document.querySelectorAll('[data-lnum]'), function(e){
      e.textContent = (e.getAttribute('data-lnum')==='n') ? label : label+(L.k?' · '+L.k:'');
    });

    var ttl=document.querySelector('[data-ltitle]');
    if(ttl && !ttl.textContent.trim()) ttl.textContent=L.t;

    var pn=document.querySelector('[data-lprevnext]');
    if(pn){
      pn.className='lnav-prevnext';
      var out=[];
      if(i>0) out.push('<a href="'+LESSONS[i-1].f+'">← Leçon '+LESSONS[i-1].n+' · '+LESSONS[i-1].t+'</a>');
      if(i<LESSONS.length-1) out.push('<a href="'+LESSONS[i+1].f+'">Leçon '+LESSONS[i+1].n+' · '+LESSONS[i+1].t+' →</a>');
      pn.innerHTML=out.join('');
    }
  }

  function boot(){ mount(); if(!window.LNAV_NOMOUNT) applyToLesson(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
  // Exposé pour la page d'accueil du cours (source unique de la liste des leçons).
  window.LessonNav={mount:mount, applyToLesson:applyToLesson, lessons:LESSONS, ref:REF, ref2:REF2, hub:HUB, home:HOME};
})();
