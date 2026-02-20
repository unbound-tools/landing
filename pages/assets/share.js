(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  var visitorId = getCookie('visitor_id');
  var variant = getCookie('ab_variant');

  function trackShare(value) {
    if (!visitorId || !variant) return;
    navigator.sendBeacon('/api/event', JSON.stringify({
      visitor_id: visitorId,
      event_type: 'share_click',
      variant: variant,
      page: window.location.pathname,
      value: value,
    }));
  }

  var copyBtn = document.getElementById('share-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var url = 'https://unbound.tools' + (visitorId ? '?ref=' + visitorId : '');
      navigator.clipboard.writeText(url).then(function () {
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('copied');
        setTimeout(function () {
          copyBtn.textContent = 'Copy link';
          copyBtn.classList.remove('copied');
        }, 2000);
      });
      trackShare('copy_link');
    });
  }

  var xBtn = document.getElementById('share-x');
  if (xBtn) {
    xBtn.addEventListener('click', function () {
      var text = encodeURIComponent('Just signed up for early access to @unboundtools \u2014 a unified API for personal data across messaging, email, and calendar.');
      var shareUrl = encodeURIComponent('https://unbound.tools' + (visitorId ? '?ref=' + visitorId : ''));
      window.open('https://x.com/intent/tweet?text=' + text + '&url=' + shareUrl, '_blank', 'width=550,height=420');
      trackShare('x_share');
    });
  }
})();
