const saved = localStorage.getItem('theme')
if (saved === 'light' || saved === 'dark') {
  document.body.classList.add(saved);
} else {
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  document.body.classList.add(prefersDark ? 'dark' : 'light');
  localStorage.setItem('theme', prefersDark ? 'dark' : 'light');
}