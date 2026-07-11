/* ============================================================================
   ДАННЫЕ И ЛОГИКА
   Данные кейсов дублируют projects.md — при вёрстке лучше вынести в
   content/ JSON, чтобы правки текста не трогали разметку (тех.договорённость).
   ============================================================================ */
(function(){
  var Y0=2019, Y1=2026, span=Y1-Y0;
  function pct(y){ return ((y-Y0)/span)*100; }

  /* — годовая шкала — */
  var axis=document.getElementById('axis'), ticks=document.getElementById('ticks');
  for(var y=Y0; y<=Y1; y++){
    var p=((y-Y0)/span)*100;
    var l=document.createElement('div');
    l.textContent=y;
    var tx = y===Y0?'translateX(0)' : y===Y1?'translateX(-100%)' : 'translateX(-50%)';
    l.style.cssText='position:absolute; left:'+p+'%; transform:'+tx+';';
    axis.appendChild(l);
    var t=document.createElement('div');
    t.style.cssText='position:absolute; top:0; left:'+p+'%; width:1px; height:4px; background:var(--border-strong);';
    ticks.appendChild(t);
  }

  /* — компании (flex ∝ длительности работы) — */
  var companies=[
    {id:'palex',   name:'Palex-Soft', line1:'ЛОКАЛИЗАЦИЯ', line2:'Verifika',          flex:2.9},
    {id:'netwrix', name:'Netwrix',    line1:'ИНФОБЕЗ',     line2:'Auditor · 1Secure', flex:2.5},
    {id:'indeed',  name:'Индид',      line1:'ИНФОБЕЗ',     line2:'PAM',               flex:1.5}
  ];

  /* — кейсы (title/sub ДОСЛОВНО из projects.md; x = дата начала на оси) — */
  var cases={
    palex:[
      {n:'01', tag:'Design Process · Web', title:'Verifika: история перехода в облако',
       sub:'Как я перевела Verifika с настольного приложения в веб-версию и улучшила пользовательский опыт, выявив и устранив 10+ проблем', x:2019.0},
      {n:'02', tag:'TQE · Research', title:'Оценка качества перевода в Verifika',
       sub:'Спроектировала интерфейс для оценки качества перевода (TQE), интегрированной в процесс проверки для роли ведущего лингвиста и менеджера проекта', x:2020.3},
      {n:'03', tag:'CAT · MVP', title:'МИРОН — наш CAT',
       sub:'MVP специализированного ПО для автоматизированного компьютерного перевода к семинару по импортозамещению в атомной отрасли', x:2021.3}
    ],
    netwrix:[
      {n:'01', tag:'Design System · Tokens', title:'Разработка дизайн-системы',
       sub:'Как я заложила основу для оптимизации проектирования 20+ продуктов компании Netwrix', x:2022.0},
      {n:'02', tag:'Complex Research · CJM', title:'Подводные камни при решении проблемы интеграции',
       sub:'Как с помощью CJM я вскрыла глубинные проблемы, решая задачу по упрощению интеграции двух продуктов Netwrix', x:2022.25},
      {n:'03', tag:'UI · Design Spec', title:'1Secure: Лоск для поиска',
       sub:'Как я наладила командную работу между дизайнером и разработчиками, пока редизайнила функционал Investigation', x:2022.45},
      {n:'04', tag:'New Feature · Information Diagram', title:'Оценка рисков для продукта по IT безопасности',
       sub:'Как я определила границы, наполнение и место новой функции в Netwrix 1Secure', x:2022.85},
      {n:'05', tag:'AI · Hackathon', title:'AI и отчёты: Просто спроси систему',
       sub:'Как моя команда заняла первое место на хакатоне Netwrix, посвящённом внедрению AI, с идеей умных отчётов', x:2023.95},
      {n:'06', tag:'Redesign · Windows', title:'Редизайн Netwrix PPE',
       sub:'Редизайн Windows-приложения для настройки сложных паролей: тестирование, дизайн-спецификация, обучение команды работе с макетами', x:2023.4}
    ],
    indeed:[
      {n:'·', tag:'В работе', title:'Проектирование дашборда', sub:'Кейс наполняется', x:2024.7, stub:true},
      {n:'·', tag:'В работе', title:'UX-стратегия и процессы', sub:'Кейс наполняется', x:2025.3, stub:true},
      {n:'·', tag:'В работе', title:'ИИ-пилоты',              sub:'Кейс наполняется', x:2025.8, stub:true}
    ]
  };

  /* — плашки-компании — */
  var row=document.getElementById('track-row');
  companies.forEach(function(c){
    var b=document.createElement('button');
    b.className='co-plate';
    b.setAttribute('data-co', c.id);
    b.style.flexGrow=c.flex;
    b.innerHTML='<div class="co-plate__name">'+c.name+'</div>'+
      '<div class="co-plate__line1">'+c.line1+'</div>'+
      '<div class="co-plate__line2">'+c.line2+'</div>';
    b.addEventListener('click', function(){ render(c.id); });
    row.appendChild(b);
  });

  var markers=document.getElementById('markers');
  var list=document.getElementById('case-list');

  /* — миниатюра-заглушка (заменить реальными обложками) — */
  function thumbSVG(stub){
    var bg = stub ? 'var(--surface-1)' : 'var(--thumb-bg)';
    return '<svg class="case-thumb" viewBox="0 0 46 46" role="img" aria-label="обложка кейса — заглушка">'+
      '<rect width="46" height="46" fill="'+bg+'"/>'+
      '<path d="M0 34 L15 22 L26 31 L34 24 L46 34 L46 46 L0 46 Z" fill="var(--thumb-line)"/>'+
      '<circle cx="32" cy="14" r="5" fill="var(--thumb-line)"/>'+
      '<text x="23" y="43" font-family="ui-monospace,monospace" font-size="6" fill="#a8a69c" text-anchor="middle" letter-spacing="0.5">IMG</text>'+
      '</svg>';
  }

  function render(co){
    /* активная плашка */
    var plates=document.querySelectorAll('.co-plate');
    for(var k=0;k<plates.length;k++){
      plates[k].classList.toggle('is-active', plates[k].getAttribute('data-co')===co);
    }

    /* треугольники-релизы на оси — все одного размера */
    markers.innerHTML='';
    cases[co].forEach(function(c,i){
      var m=document.createElement('button');
      m.className='marker';
      m.setAttribute('aria-label', c.title);
      m.style.left=pct(c.x)+'%';
      var fill = c.stub ? 'none' : 'var(--text-muted)';
      var stroke = c.stub ? 'stroke="var(--text-faint)" stroke-width="1" stroke-dasharray="2 1.5"' : '';
      m.innerHTML='<svg width="11" height="8" viewBox="0 0 14 10"><polygon points="7,1 13,9 1,9" fill="'+fill+'" '+stroke+'/></svg>'+
        '<span class="marker__n">'+c.n+'</span>';
      m.addEventListener('click', function(){
        var el=list.querySelector('[data-idx="'+i+'"]');
        if(el){ el.scrollIntoView({behavior:'smooth', block:'nearest'});
          el.style.background='var(--accent-tint)';
          setTimeout(function(){ el.style.background=''; }, 600); }
      });
      markers.appendChild(m);
    });

    /* список кейсов — все пункты одинаковы */
    list.innerHTML='';
    cases[co].forEach(function(c,i){ list.appendChild(caseRow(co,c,i)); });
  }

  function caseRow(co,c,i){
    var b=document.createElement('button');
    b.className='case-row'+(c.stub?' is-stub':'');
    b.setAttribute('data-idx', i);
    b.innerHTML=
      thumbSVG(c.stub)+
      '<span class="case-n">'+c.n+'</span>'+
      '<span class="case-main">'+
        '<span class="case-title">'+c.title+'</span>'+
        (c.stub ? '' : '<span class="case-sub">'+c.sub+'</span>')+
      '</span>'+
      '<span class="case-tag">'+c.tag+'</span>'+
      '<span class="case-arrow">'+(c.stub?'·':'→')+'</span>';
    if(!c.stub){
      b.addEventListener('click', function(){
        /* TODO: переход на отдельную страницу кейса /case/<slug> */
        console.log('open case:', c.title);
      });
    }
    return b;
  }

  render('indeed'); /* дефолт — Индид (наполнить до публикации) */

  /* — вехи «о себе»: художка → ТГУ → переводчик → дизайнер — */
  var ms=[
    ['художка','с отличием · 2006'],
    ['ТГУ','иностр. языки · 2014'],
    ['переводчик','Palex'],
    ['дизайнер','с 2019']
  ];
  var mc=document.getElementById('milestones');
  ms.forEach(function(m,i){
    var last=i===ms.length-1;
    var d=document.createElement('div');
    d.className='milestone'+(last?' is-last':'');
    d.innerHTML='<div class="milestone__top"><span class="milestone__dot"></span>'+
      '<span class="milestone__name">'+m[0]+'</span></div>'+
      '<div class="milestone__meta">'+m[1]+'</div>';
    mc.appendChild(d);
  });

  /* — навыки — */
  var skills=['User Research','Design Process','Design System','Rapid Prototyping','Teamwork','Problem Solving'];
  var sc=document.getElementById('skills');
  skills.forEach(function(s){
    var t=document.createElement('span'); t.className='skill-tag'; t.textContent=s; sc.appendChild(t);
  });

  /* — образование — */
  var edu=[
    ['Томский государственный университет','Факультет иностранных языков','2014'],
    ['Томская художественная школа №1','Окончена с отличием','2006']
  ];
  var ec=document.getElementById('edu');
  edu.forEach(function(e){
    var d=document.createElement('div'); d.className='edu-item';
    d.innerHTML='<div class="edu-item__org">'+e[0]+'</div>'+
      '<div class="edu-item__det">'+e[1]+'</div>'+
      '<div class="edu-item__year">'+e[2]+'</div>';
    ec.appendChild(d);
  });

  /* — курсы (все 8, свежие сверху) — */
  var courses=[
    ['Nielsen Norman Group','UX Certificate','2024'],
    ['Design Thinking Center','Practitioner in Design Thinking','2024'],
    ['IDF','AI for Designers','2023'],
    ['Coursera (Yale)','Intro to Psychology','2023'],
    ['IDF','Human-Computer Interaction · UI Patterns','2020'],
    ['Springboard','UX Design · User Research · Strategy','2019'],
    ['Rubius Academy','Проектирование интерфейсов','2019'],
    ['Codecademy','Web Dev (HTML & CSS)','2019']
  ];
  var cc=document.getElementById('courses');
  courses.forEach(function(c){
    var d=document.createElement('div'); d.className='course-item';
    d.innerHTML='<div><span class="course-item__org">'+c[0]+'</span> '+
      '<span class="course-item__det">— '+c[1]+'</span></div>'+
      '<span class="course-item__year">'+c[2]+'</span>';
    cc.appendChild(d);
  });

  /* — стики-футер навигации — */
  var navSecs=[['A','sec-a','ИНТРО'],['B','sec-b','ПРОЕКТЫ'],['C','sec-c','О СЕБЕ'],['D','sec-d','НАВЫКИ'],['E','sec-e','КОНТАКТЫ']];
  var fn=document.getElementById('footer-nav');
  navSecs.forEach(function(s){
    var b=document.createElement('button');
    b.className='fn-item';
    b.innerHTML='<span class="fn-item__letter">'+s[0]+'</span><span class="fn-item__name">'+s[2]+'</span>';
    b.addEventListener('click', function(){
      var el=document.getElementById(s[1]);
      if(el) el.scrollIntoView({behavior:'smooth', block:'start'});
    });
    fn.appendChild(b);
  });
})();
