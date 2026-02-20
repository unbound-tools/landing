(function () {
  var pre = document.querySelector('.code-block pre');
  if (!pre) return;

  // Extract character sequence with syntax classes from rendered HTML
  var sequence = [];
  function extract(node, cls) {
    if (node.nodeType === 3) {
      for (var i = 0; i < node.textContent.length; i++) {
        sequence.push({ ch: node.textContent[i], cls: cls });
      }
    } else if (node.nodeType === 1) {
      var childCls = node.tagName === 'SPAN' && node.className ? node.className : cls;
      for (var j = 0; j < node.childNodes.length; j++) {
        extract(node.childNodes[j], childCls);
      }
    }
  }
  extract(pre, '');

  // Clear and add cursor
  pre.textContent = '';
  var cursor = document.createElement('span');
  cursor.className = 'type-cursor';
  cursor.textContent = '\u258C';
  pre.appendChild(cursor);

  var idx = 0;
  var currentSpan = null;
  var currentCls = '';

  function typeNext() {
    if (idx >= sequence.length) {
      cursor.classList.add('done');
      return;
    }

    var item = sequence[idx];

    // Create a new span when the class changes
    if (item.cls !== currentCls) {
      if (item.cls) {
        currentSpan = document.createElement('span');
        currentSpan.className = item.cls;
        pre.insertBefore(currentSpan, cursor);
      } else {
        currentSpan = null;
      }
      currentCls = item.cls;
    }

    var textNode = document.createTextNode(item.ch);
    if (currentSpan && item.cls) {
      currentSpan.appendChild(textNode);
    } else {
      pre.insertBefore(textNode, cursor);
    }

    idx++;

    // Variable speed: pauses on newlines, faster for whitespace
    var ch = item.ch;
    var delay = ch === '\n' ? 60 : ch === ' ' ? 10 : 16;
    setTimeout(typeNext, delay);
  }

  // Start typing when code block scrolls into view
  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      observer.disconnect();
      setTimeout(typeNext, 300);
    }
  }, { threshold: 0.2 });

  var target = pre.closest('.code-block') || pre;
  observer.observe(target);
})();
