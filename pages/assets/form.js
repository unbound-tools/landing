(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  var form = document.getElementById('signup-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var email = form.querySelector('[name="email"]').value.trim();
    var roleEl = form.querySelector('[name="role"]:checked');
    var role = roleEl ? roleEl.value : null;
    var visitorId = getCookie('visitor_id');
    var variant = getCookie('ab_variant');
    var params = new URLSearchParams(window.location.search);

    if (!email || !role) {
      showError('Please fill in all fields.');
      return;
    }

    var submitBtn = form.querySelector('button[type="submit"]');
    var originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      var res = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          role: role,
          visitor_id: visitorId,
          variant: variant,
          utm_source: params.get('utm_source'),
          utm_campaign: params.get('utm_campaign'),
        }),
      });

      var data = await res.json();

      if (data.success) {
        sessionStorage.setItem('signup_id', data.signup_id);
        window.location.href = '/thanks';
      } else {
        showError(data.error || 'Something went wrong. Please try again.');
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } catch (err) {
      showError('Network error. Please try again.');
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });

  function showError(msg) {
    var el = form.querySelector('.form-error');
    if (!el) {
      el = document.createElement('p');
      el.className = 'form-error';
      form.appendChild(el);
    }
    el.textContent = msg;
  }
})();
