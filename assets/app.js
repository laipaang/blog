(() => {
  const body = document.body;
  const theme = document.querySelector('#theme');
  try { if (localStorage.getItem('chronicle-theme') === 'dark') body.classList.add('dark'); } catch {}
  theme.addEventListener('click', () => {
    body.classList.toggle('dark');
    try { localStorage.setItem('chronicle-theme', body.classList.contains('dark') ? 'dark' : 'light'); } catch {}
  });
  const paragraphs = [...document.querySelectorAll('.chapter > p')];
  const chars = paragraphs.map(p => p.textContent).join('').length;
  document.querySelector('#reading-time').textContent = `约 ${Math.ceil(chars / 350)} 分钟阅读`;
  const progress = document.querySelector('.progress');
  const updateProgress = () => {
    const height = document.documentElement.scrollHeight - innerHeight;
    progress.style.width = `${height > 0 ? Math.min(100,scrollY / height * 100) : 100}%`;
  };
  addEventListener('scroll', updateProgress, {passive:true});
  addEventListener('resize', updateProgress);
  updateProgress();
  const events = [...document.querySelectorAll('.timeline article')];
  const buttons = [...document.querySelectorAll('[data-filter]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    buttons.forEach(b => b.setAttribute('aria-pressed', String(b === button)));
    events.forEach(e => { e.hidden = filter !== '全部' && e.dataset.category !== filter; });
    document.querySelector('#count').textContent = `显示 ${events.filter(e => !e.hidden).length} 个节点 · ${filter}`;
    updateProgress();
  }));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        document.querySelectorAll('.toc a').forEach(a => {
          const current = a.getAttribute('href') === '#' + entry.target.id;
          a.classList.toggle('active', current);
          if (current) a.setAttribute('aria-current','location'); else a.removeAttribute('aria-current');
        });
      });
    }, {rootMargin:'-10% 0px -65% 0px',threshold:0});
    document.querySelectorAll('.chapter,.timeline-section').forEach(s => observer.observe(s));
  }
})();
