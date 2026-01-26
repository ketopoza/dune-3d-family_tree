document.addEventListener('DOMContentLoaded', () => {
  const storageKey = 'dune_family_tree_seen_welcome_v1';
  const overlay = document.getElementById('welcome-overlay');
  const card = overlay ? overlay.querySelector('.overlay-card') : null;
  const closeBtn = overlay ? overlay.querySelector('.overlay-close') : null;

  if (!overlay || !card || !closeBtn) return;

  function show() {
    overlay.classList.remove('hidden');
    // move focus into the dialog for accessibility
    overlay.setAttribute('tabindex', '-1');
    overlay.focus();
    try { document.body.style.overflow = 'hidden'; } catch (e) {}
  }

  function hide() {
    overlay.classList.add('hidden');
    try { localStorage.setItem(storageKey, '1'); } catch (e) {
      try { sessionStorage.setItem(storageKey, '1'); } catch (e) {}
    }
    try { document.body.style.overflow = ''; } catch (e) {}
  }

  // Show only if not seen before
  let seen = false;
  try { seen = !!localStorage.getItem(storageKey); } catch (e) {
    try { seen = !!sessionStorage.getItem(storageKey); } catch (e) { seen = false; }
  }

  if (!seen) show();

  // Close when clicking outside the card
  overlay.addEventListener('click', (e) => {
    if (!card.contains(e.target)) hide();
  });

  // Close via button
  closeBtn.addEventListener('click', hide);

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !overlay.classList.contains('hidden')) {
      hide();
    }
  });
});
