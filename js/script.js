/* ============================================================================
   ДАННЫЕ И ЛОГИКА
   Данные кейсов дублируют projects.md — при вёрстке лучше вынести в
   content/ JSON, чтобы правки текста не трогали разметку (тех.договорённость).
   ============================================================================ */
(function(){
  var Y0=2019, Y1=2026, span=Y1-Y0;
  function pct(y){ return ((y-Y0)/span)*100; }

  /* ============================================================================
     ДВИЖЕНИЕ И АНИМАЦИИ (см. CONTEXT.md → «Движение и анимации»)
     Общие правила: каждый эффект — один раз при въезде в вид; полностью
     отключается при prefers-reduced-motion; без новых цветов.
     ============================================================================ */
  function prefersReducedMotion(){
    return !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  }

  /* — приём 1: декодирование текста — ТОЛЬКО моно-подписи (не Ubuntu-заголовки) — */
  var DECODE_GLYPHS = '#%&*+=~^<>/\\|01';
  var LETTER_RE = /[0-9A-Za-zА-Яа-яЁё]/;
  function decodeReveal(el, duration){
    var final = el.textContent;
    var chars = final.split('');
    var start = null;
    function frame(ts){
      if(!start){ start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var revealCount = Math.floor(progress * chars.length);
      var out = '';
      for(var i=0; i<chars.length; i++){
        var ch = chars[i];
        out += (i < revealCount || !LETTER_RE.test(ch)) ? ch : DECODE_GLYPHS[Math.floor(Math.random()*DECODE_GLYPHS.length)];
      }
      el.textContent = out;
      if(progress < 1){ requestAnimationFrame(frame); }
      else { el.textContent = final; }
    }
    requestAnimationFrame(frame);
  }
  function decodeGroup(group){
    var els = document.querySelectorAll('[data-decode-group="'+group+'"]');
    for(var i=0; i<els.length; i++){ decodeReveal(els[i], 500); }
  }
  function initDecodeEffect(){
    if(prefersReducedMotion()) return; /* текст остаётся читаемым сразу, без анимации */

    decodeGroup('chrome'); /* строка состояния и стики-футер видны сразу при загрузке */

    var seen = {};
    var sectionObserver = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        var group = entry.target.getAttribute('data-decode-section');
        if(seen[group]) return;
        seen[group] = true;
        decodeGroup(group);
        sectionObserver.unobserve(entry.target);
      });
    }, {threshold:0.35});

    ['a','b','c','d','e'].forEach(function(s){
      var sectionEl = document.getElementById('sec-'+s);
      if(!sectionEl) return;
      sectionEl.setAttribute('data-decode-section', s);
      sectionObserver.observe(sectionEl);
    });
  }

  /* — приём 2: ASCII-портрет в дисплее SEC C (над «ВЕХИ») — ждёт настоящее фото — */
  function toAsciiLines(cells, cols, rows){
    var lines = [];
    for(var r=0; r<rows; r++){ lines.push(cells.slice(r*cols, (r+1)*cols).join('')); }
    return lines.join('\n');
  }
  function shuffle(arr){
    for(var i=arr.length-1; i>0; i--){
      var j = Math.floor(Math.random()*(i+1));
      var t = arr[i]; arr[i] = arr[j]; arr[j] = t;
    }
    return arr;
  }
  function renderAsciiPortrait(img, screen, pre){
    var cols = 30, rows = 20;
    var canvas = document.createElement('canvas');
    canvas.width = cols; canvas.height = rows;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0, cols, rows);
    var data = ctx.getImageData(0, 0, cols, rows).data;
    var ramp = ' .:-=+*#%@'; /* от светлого к тёмному, плотность символа = плотность тона */
    var cells = [];
    for(var i=0; i<cols*rows; i++){
      var r=data[i*4], g=data[i*4+1], b=data[i*4+2];
      var lum = (r*0.299 + g*0.587 + b*0.114) / 255;
      cells.push(ramp[Math.round((1-lum) * (ramp.length-1))]);
    }
    screen.classList.add('has-photo');

    if(prefersReducedMotion()){
      pre.textContent = toAsciiLines(cells, cols, rows);
      return;
    }

    /* проявление из редких точек в узнаваемое изображение */
    var order = shuffle(cells.map(function(_, i){ return i; }));
    var revealed = new Array(cells.length).fill(false);
    var duration = 1400, start = null;
    function frame(ts){
      if(!start){ start = ts; }
      var progress = Math.min((ts - start) / duration, 1);
      var count = Math.floor(progress * order.length);
      for(var i=0; i<count; i++){ revealed[order[i]] = true; }
      var out = cells.map(function(ch, i){ return revealed[i] ? ch : ' '; });
      pre.textContent = toAsciiLines(out, cols, rows);
      if(progress < 1){ requestAnimationFrame(frame); }
    }
    requestAnimationFrame(frame);
  }
  function initAsciiPortrait(){
    var screen = document.getElementById('portrait-screen');
    var pre = document.getElementById('ascii-portrait');
    var sectionEl = document.getElementById('sec-c');
    if(!screen || !pre || !sectionEl) return;

    function load(){
      var img = new Image();
      img.onload = function(){ renderAsciiPortrait(img, screen, pre); };
      img.onerror = function(){ /* оригинала портрета ещё нет — оставляем текстовую заглушку */ };
      img.src = 'assets/images/portrait.jpg'; /* TODO: заменить на оригинал портрета */
    }

    /* портрет живёт в SEC C — рендерим один раз, когда секция въезжает в вид */
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        load();
        observer.unobserve(entry.target);
      });
    }, {threshold:0.3});
    observer.observe(sectionEl);
  }

  /* — приём (новый): схема сигнала в дисплее SEC A — запрос → анализ → решение — */
  function initSignalDiagram(){
    var root = document.getElementById('signal-diagram');
    var pulse = document.getElementById('signal-pulse');
    var sectionEl = document.getElementById('sec-a');
    if(!root || !pulse || !sectionEl) return;
    var nodes = root.querySelectorAll('.signal-node');

    function lightAll(){
      for(var i=0; i<nodes.length; i++){ nodes[i].classList.add('is-lit'); }
    }

    if(prefersReducedMotion()){ lightAll(); return; } /* сразу финальное состояние, без «пробегающей» точки */

    function play(){
      pulse.classList.add('is-active');
      var delays = [0, 460, 900]; /* совпадает с моментом, когда точка проходит каждый узел */
      for(var i=0; i<nodes.length; i++){
        (function(node, delay){ setTimeout(function(){ node.classList.add('is-lit'); }, delay); })(nodes[i], delays[i]);
      }
    }

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(!entry.isIntersecting) return;
        play();
        observer.unobserve(entry.target);
      });
    }, {threshold:0.4});
    observer.observe(sectionEl);
  }

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

    var items = cases[co];
    var reduced = prefersReducedMotion();
    var STEP = 90; /* мс между маркерами — «машина проигрывает таймлайн» */

    /* приём 3: каскад — маркеры и список выезжают в хронологическом порядке (по x) */
    var chronoOrder = items.map(function(_,i){ return i; }).sort(function(a,b){ return items[a].x - items[b].x; });
    var cascadeDelay = {};
    chronoOrder.forEach(function(origIdx, orderPos){ cascadeDelay[origIdx] = orderPos*STEP; });

    /* треугольники-релизы на оси — все одного размера */
    markers.innerHTML='';
    items.forEach(function(c,i){
      var m=document.createElement('button');
      m.className='marker'+(reduced?'':' marker--cascade');
      m.setAttribute('aria-label', c.title);
      m.style.left=pct(c.x)+'%';
      if(!reduced){ m.style.animationDelay = cascadeDelay[i]+'ms'; }
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

    /* список кейсов проступает следом за каскадом маркеров */
    var listStart = reduced ? 0 : (chronoOrder.length*STEP + 120);
    list.innerHTML='';
    items.forEach(function(c,i){
      var row = caseRow(co,c,i);
      if(!reduced){
        row.classList.add('case-row--cascade');
        row.style.animationDelay = (listStart + i*60)+'ms';
      }
      list.appendChild(row);
    });
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

  initDecodeEffect();
  initAsciiPortrait();
  initSignalDiagram();
})();
