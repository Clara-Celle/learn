/* ============================================================
   nav.js — sommaire fixe & repliable pour naviguer entre leçons.
   Auto-monté au chargement. Injecte son propre style.
   Inclure simplement : <script src="../lib/nav.js"></script>
   Pour ajouter une leçon : compléter le tableau LESSONS ci-dessous.
   ============================================================ */
(function(){
  // Source unique des leçons du cours : la page d'accueil (../index.html) lit ce tableau
  // via window.LessonNav.lessons. Ajouter une leçon = compléter UNIQUEMENT ce tableau.
  var LESSONS=[
    {n:'01', t:'Géographie du clavier',          f:'0001-la-geographie-du-clavier.html',
     d:"Trouver n'importe quelle note instantanément sur le clavier."},
    {n:'02', t:'Premier accord (majeur)',         f:'0002-ton-premier-accord-la-triade-majeure.html',
     d:"Construire la triade majeure — ton tout premier accord."},
    {n:'03', t:'Accord mineur & The Scientist',   f:'0003-laccord-mineur-et-the-scientist.html',
     d:"L'accord mineur, puis les 4 accords de The Scientist."},
    {n:'04', t:'Le rythme : jouer en mesure',      f:'0004-le-rythme-jouer-en-mesure.html',
     d:"Tenir le tempo et jouer en place avec le métronome."},
    {n:'05', t:'La main gauche : la basse',         f:'0005-la-main-gauche-la-basse.html',
     d:"Ajouter la basse à la main gauche sous tes accords."}
  ];
  var REF={t:'Fiche : carte du clavier', f:'../reference/keyboard-map.html'};
  var HUB={t:'Tous les cours', f:'../index.html'};       // retour au hub
  var HOME={t:'Accueil du cours', f:'index.html'};        // page d'accueil piano

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
    var ref=document.createElement('a'); ref.href=REF.f; ref.className='lnav-ref'; ref.textContent='📄 '+REF.t;
    list.appendChild(ref);
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

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount); else mount();
  // Exposé pour la page d'accueil du cours (source unique de la liste des leçons).
  window.LessonNav={mount:mount, lessons:LESSONS, ref:REF, hub:HUB, home:HOME};
})();
