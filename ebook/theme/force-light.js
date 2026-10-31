/* Auto / first visit → light (OS dark + Navy was hard to read for class). */
(function () {
  try {
    var t = localStorage.getItem("mdbook-theme");
    /* Clear stale Auto→navy preference from preferred-dark-theme=navy era */
    if (t === null || t === undefined || t === "default_theme") {
      localStorage.setItem("mdbook-theme", "light");
    }
  } catch (e) {
    /* ignore */
  }
})();
