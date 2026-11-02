/**
 * Zora Labs — Early Boot Script (boot.js)
 * Restores saved theme preference before first paint to prevent FOUC.
 */
(function () {
  'use strict';

  var root = document.documentElement;
  root.classList.add('js');

  try {
    var savedTheme = localStorage.getItem('zora_theme_pref');
    if (savedTheme === 'light' || savedTheme === 'dark') {
      root.setAttribute('data-theme', savedTheme);
    } else {
      root.setAttribute('data-theme', 'dark');
    }
  } catch (_) {
    root.setAttribute('data-theme', 'dark');
  }
})();
