/* =========================================================
   Yonsei Campus Partners — shared script (ko / ja)
   ========================================================= */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile nav ---------- */
  var burger = document.querySelector("[data-burger]");
  var mobileNav = document.querySelector("[data-mobilenav]");

  if (burger && mobileNav) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      mobileNav.classList.toggle("is-open", !open);
    });

    mobileNav.addEventListener("click", function (e) {
      if (e.target.closest("a")) {
        burger.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && burger.getAttribute("aria-expanded") === "true") {
        burger.setAttribute("aria-expanded", "false");
        mobileNav.classList.remove("is-open");
        burger.focus();
      }
    });
  }

  /* ---------- copy e-mail ---------- */
  var copyBtn = document.querySelector("[data-copy]");

  if (copyBtn) {
    var original = copyBtn.textContent;
    var doneText = copyBtn.getAttribute("data-copy-done") || "OK";
    var timer = null;

    copyBtn.addEventListener("click", function () {
      var value = copyBtn.getAttribute("data-copy") || "";

      var flash = function (ok) {
        copyBtn.textContent = ok ? doneText : original;
        copyBtn.classList.toggle("is-done", ok);
        window.clearTimeout(timer);
        timer = window.setTimeout(function () {
          copyBtn.textContent = original;
          copyBtn.classList.remove("is-done");
        }, 2000);
      };

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(value).then(function () {
          flash(true);
        }).catch(function () {
          flash(fallbackCopy(value));
        });
      } else {
        flash(fallbackCopy(value));
      }
    });
  }

  function fallbackCopy(text) {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand("copy"); } catch (err) { ok = false; }
    document.body.removeChild(ta);
    return ok;
  }

  /* ---------- reveal on scroll ---------- */
  var targets = document.querySelectorAll(".reveal");

  if (!targets.length) return;

  if (reduceMotion || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(targets, function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });

  Array.prototype.forEach.call(targets, function (el) { io.observe(el); });
})();
