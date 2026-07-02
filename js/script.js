const navLinks = document.querySelectorAll('nav a');
  const indicator = document.getElementById('section-indicator');
  const sheetLabel = document.getElementById('sheet-label');
  const names = {top:'HERO', about:'О СЕБЕ', work:'ПРОЕКТЫ', skills:'ИНСТРУМЕНТЫ', contact:'КОНТАКТ'};
  const order = ['top','about','work','skills','contact'];

  const obs = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const id = e.target.id;
        const idx = order.indexOf(id);
        indicator.innerHTML = 'SEC&nbsp;<b>' + String(idx+1).padStart(2,'0') + ' / ' + names[id] + '</b>';
        sheetLabel.textContent = 'SHEET ' + String(idx+1).padStart(2,'0') + ' OF ' + String(order.length).padStart(2,'0') + ' — ' + names[id];
        navLinks.forEach(a=>a.classList.toggle('active', a.getAttribute('href') === '#'+id));
      }
    });
  }, {threshold:0.4});

  document.querySelectorAll('section[id]').forEach(s=> obs.observe(s));
