(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  var visitorId = getCookie('visitor_id');
  var variant = getCookie('ab_variant');
  if (!visitorId || !variant) return;

  var params = new URLSearchParams(window.location.search);
  var utmSource = params.get('utm_source');
  var utmCampaign = params.get('utm_campaign');

  function sendEvent(eventType, value) {
    var payload = JSON.stringify({
      visitor_id: visitorId,
      event_type: eventType,
      variant: variant,
      page: window.location.pathname,
      value: value || null,
      utm_source: utmSource,
      utm_campaign: utmCampaign,
    });
    navigator.sendBeacon('/api/event', payload);
  }

  // Page view
  sendEvent('page_view');

  // Scroll depth tracking via Intersection Observer
  var tracked = {};
  [25, 50, 75, 100].forEach(function (pct) {
    var sentinel = document.getElementById('scroll-' + pct);
    if (!sentinel) return;

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting && !tracked[pct]) {
          tracked[pct] = true;
          sendEvent('scroll_depth', String(pct));
          observer.disconnect();
        }
      });
    });
    observer.observe(sentinel);
  });

  // Time on page (fires when user leaves/hides tab)
  var startTime = Date.now();
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'hidden') {
      var seconds = Math.round((Date.now() - startTime) / 1000);
      sendEvent('time_on_page', String(seconds));
    }
  });

  // CTA click tracking
  document.addEventListener('click', function (e) {
    var cta = e.target.closest('[data-cta]');
    if (cta) {
      sendEvent('cta_click', cta.getAttribute('data-cta'));
    }
  });
})();
