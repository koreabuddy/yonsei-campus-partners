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


  /* ---------- e-mail buttons: copy the address (assembled at runtime, kept out
     of the HTML) and show a toast — never open a mail app ---------- */
  (function () {
    var addr = "rhyt" + "1429" + "@" + "gmail" + ".com";
    var links = document.querySelectorAll("[data-mailto]");
    if (!links.length) return;

    var toast = null;
    var toastTimer = null;

    function showToast() {
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "toast";
        toast.setAttribute("role", "status");
        toast.setAttribute("aria-live", "polite");
        toast.textContent = document.documentElement.lang === "ja"
          ? "メールアドレスがコピーされました"
          : "메일 주소가 복사되었습니다";
        document.body.appendChild(toast);
      }
      void toast.offsetWidth;
      toast.classList.add("is-show");
      window.clearTimeout(toastTimer);
      toastTimer = window.setTimeout(function () {
        toast.classList.remove("is-show");
      }, 2400);
    }

    function copyAddr() {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(addr).then(showToast).catch(function () {
          if (fallbackCopy(addr)) showToast();
        });
      } else if (fallbackCopy(addr)) {
        showToast();
      }
    }

    Array.prototype.forEach.call(links, function (a) {
      a.setAttribute("href", "#");
      a.setAttribute("role", "button");
      a.addEventListener("click", function (e) {
        e.preventDefault();
        copyAddr();
      });
    });
  })();

  /* ---------- Japanese phrase-aware line breaking ----------
     Japanese has no spaces, so browsers may break a line anywhere.
     We mark phrase boundaries with <wbr> and let CSS (word-break: keep-all)
     restrict breaks to those points only. Korean already breaks on spaces. */
  if (document.documentElement.lang === "ja") insertJaBreaks();

  function insertJaBreaks() {
    var SKIP = { SCRIPT: 1, STYLE: 1, CODE: 1, PRE: 1, TEXTAREA: 1, SVG: 1 };
    var HIRA  = /[ぁ-ゟ]/;
    var KANJI = /[一-鿿々]/;
    var KATA  = /[ァ-ヺー]/;
    var LATIN = /[A-Za-z0-9]/;
    var SMALL = /[ぁぃぅぇぉっゃゅょゎァィゥェォッャュョヮヵヶー々ゝゞヽヾ]/;
    var AFTER = /[、。，．！？：；）」』】〉》・]/;   // break opportunity after these
    var BEFORE = /[（「『【〈《]/;                    // break opportunity before these
    var NO_SPLIT_AFTER = /[おごをのにはがへとでやもかしてただりるれなくいうきつすむぶぬぐずづぷぺ]$/;

    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        if (!n.nodeValue || !/[぀-ヿ一-鿿]/.test(n.nodeValue)) return NodeFilter.FILTER_REJECT;
        var p = n.parentNode;
        while (p && p !== document.body) {
          if (SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    var nodes = [], n;
    while ((n = walker.nextNode())) nodes.push(n);

    nodes.forEach(function (node) {
      var s = node.nodeValue;
      var parts = [];
      var buf = "";
      for (var i = 0; i < s.length; i++) {
        var cur = s[i], prev = i ? s[i - 1] : "";
        var brk = false;
        if (i > 0) {
          var next = s[i + 1] || "";
          if (AFTER.test(prev) && !AFTER.test(cur)) brk = true;
          else if (BEFORE.test(cur)) brk = true;
          else if (/[おご]/.test(cur) && (KANJI.test(next) || KATA.test(next)) && HIRA.test(prev)) {
            brk = true;                     /* 御-prefix starts a phrase: こんな|お悩み */
          }
          else if (/[をへ]/.test(prev)) {
            brk = true;                     /* case particles: always a phrase boundary */
          }
          else if (HIRA.test(prev) && (KANJI.test(cur) || KATA.test(cur) || LATIN.test(cur))) {
            /* start of a new content word — unless the kana binds to what follows */
            if (!NO_SPLIT_AFTER.test(prev) || /[をのにはがへとでやも]/.test(prev)) brk = true;
            if (/[おご]/.test(prev)) brk = false;   /* 御-prefix: お知らせ / ご提供 */
          }
        }
        if (brk && buf && !SMALL.test(cur)) { parts.push(buf); buf = ""; }
        buf += cur;
      }
      if (buf) parts.push(buf);
      if (parts.length < 2) return;

      var frag = document.createDocumentFragment();
      parts.forEach(function (p, idx) {
        if (idx) frag.appendChild(document.createElement("wbr"));
        frag.appendChild(document.createTextNode(p));
      });
      node.parentNode.replaceChild(frag, node);
    });
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
