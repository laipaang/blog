(() => {
  const button = document.querySelector('#theme');
  const applyTheme = dark => {
    document.body.classList.toggle('dark', dark);
    button.setAttribute('aria-pressed', String(dark));
    document.querySelector('meta[name="theme-color"]').content = dark ? '#19171f' : '#f7f5f0';
  };
  try { applyTheme(localStorage.getItem('chronicle-theme') === 'dark'); } catch {}
  button.addEventListener('click', () => {
    const dark = !document.body.classList.contains('dark');
    applyTheme(dark);
    try { localStorage.setItem('chronicle-theme', dark ? 'dark' : 'light'); } catch {}
  });
  if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
      });
    }, {threshold: 0.08});
    document.querySelectorAll('.reveal').forEach(el => { el.classList.add('will-reveal'); observer.observe(el); });
  }
})();
