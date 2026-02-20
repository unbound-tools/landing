(function () {
  function getCookie(name) {
    var match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? match[2] : null;
  }

  var form = document.getElementById('survey-form');
  if (!form) return;

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var visitorId = getCookie('visitor_id');
    var variant = getCookie('ab_variant');
    var signupId = sessionStorage.getItem('signup_id');

    var buildingWhat = form.querySelector('[name="building_what"]');
    var buildingWhatVal = buildingWhat ? buildingWhat.value.trim() : null;

    var dataSourceEls = form.querySelectorAll('[name="data_sources"]:checked');
    var dataSources = Array.from(dataSourceEls).map(function (el) {
      return el.value;
    });

    var solutionEl = form.querySelector('[name="current_solution"]:checked');
    var currentSolution = solutionEl ? solutionEl.value : null;

    var submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    try {
      var res = await fetch('/api/survey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          visitor_id: visitorId,
          signup_id: signupId ? parseInt(signupId) : null,
          building_what: buildingWhatVal || null,
          data_sources: dataSources.length > 0 ? dataSources : null,
          current_solution: currentSolution,
          variant: variant,
        }),
      });

      if (res.ok) {
        form.innerHTML =
          '<p class="survey-thanks">Thanks for sharing! We\'ll be in touch soon.</p>';
      } else {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Submit';
      }
    } catch (err) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Submit';
    }
  });
})();
