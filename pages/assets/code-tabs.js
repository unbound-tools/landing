(function () {
  var tabs = document.querySelectorAll('.code-tab');
  var panels = document.querySelectorAll('.code-panel');

  if (!tabs.length) return;

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      var lang = tab.getAttribute('data-lang');

      tabs.forEach(function (t) { t.classList.remove('active'); });
      panels.forEach(function (p) { p.classList.remove('active'); });

      tab.classList.add('active');
      var panel = document.querySelector('.code-panel[data-lang="' + lang + '"]');
      if (panel) panel.classList.add('active');
    });
  });
})();
