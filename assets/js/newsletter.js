// Newsletter: the same EmailOctopus list and form as velarion.games.
//
// EmailOctopus's embed script wires up only the first copy of its form on a page,
// and it brings its own look. So every visible .signup form here is our own markup,
// and one hidden copy of the EmailOctopus form does the sending: on submit we hand
// it the address, let it run its spam check (Google reCAPTCHA) and post, then show
// its success or error message next to the form the visitor used.
// The embed loads only once someone starts using a form, so visitors who never
// subscribe make no requests to EmailOctopus or Google.
(function () {
  var FORM_ID = "dd664804-c17a-11f0-a78e-09db77d996a6";
  var FORM_SRC = "https://eocampaign1.com/form/" + FORM_ID + ".js";
  var MSG = {
    sending: "Sending…",
    ok: "Thanks for subscribing! The next monthly update will reach you by email.",
    fail: "Sorry, that didn't go through. Please try again in a moment.",
    noScript: "The sign-up service didn't load. If you block scripts or trackers, allow eocampaign1.com and Google reCAPTCHA, or try again later."
  };
  var READY_TIMEOUT = 15000;   // embed + reCAPTCHA loaded
  var REPLY_TIMEOUT = 120000;  // EmailOctopus answered; long, as reCAPTCHA may ask a person to pick pictures

  var bridge = null;   // the hidden EmailOctopus wrapper
  var loading = false;
  var waiting = [];    // callbacks for when the embed is ready
  var busy = null;     // the form currently sending

  function eoForm() { return bridge && bridge.querySelector("form"); }
  function isReady() { var f = eoForm(); return !!(f && f.dataset.recaptchaWidgetId !== undefined && window.grecaptcha); }

  function load() {
    if (loading) return;
    loading = true;
    bridge = document.createElement("div");
    bridge.className = "eo-bridge";
    bridge.setAttribute("aria-hidden", "true");
    bridge.inert = true;
    var script = document.createElement("script");
    script.async = true;
    script.src = FORM_SRC;
    script.setAttribute("data-form", FORM_ID);
    bridge.appendChild(script);
    document.body.appendChild(bridge);
    var started = Date.now();
    (function poll() {
      if (isReady()) { watch(); flush(true); return; }
      if (Date.now() - started > READY_TIMEOUT) { loading = false; bridge.remove(); bridge = null; flush(false); return; }
      setTimeout(poll, 150);
    })();
  }

  function flush(ok) {
    var list = waiting; waiting = [];
    list.forEach(function (cb) { cb(ok); });
  }

  function whenReady(cb) {
    if (isReady()) { cb(true); return; }
    waiting.push(cb);
    load();
  }

  // EmailOctopus writes its result into these two paragraphs
  function watch() {
    var box = bridge.querySelector(".emailoctopus-form-wrapper") || bridge;
    new MutationObserver(function () {
      if (!busy) return;
      var ok = box.querySelector(".emailoctopus-success-message");
      var err = box.querySelector(".emailoctopus-error-message");
      if (ok && ok.textContent.trim()) finish(true, MSG.ok);
      else if (err && err.textContent.trim()) finish(false, err.textContent.trim());
    }).observe(box, { childList: true, subtree: true, characterData: true });
  }

  function say(form, text, kind) {
    var msg = document.getElementById(form.getAttribute("aria-describedby").split(" ")[0]);
    msg.textContent = text;
    msg.className = "signup-msg" + (kind ? " " + kind : "");
  }

  function finish(ok, text) {
    var form = busy; busy = null;
    clearTimeout(form._timer);
    form.querySelector("button").disabled = false;
    if (ok) {
      say(form, text, "ok");
      form.classList.add("done");
      // EmailOctopus hides its form after a success; show it again for the next address
      var f = eoForm();
      if (f) {
        f.style.display = "";
        var token = f.querySelector("[name=recaptcha-response]");
        if (token) token.remove();
        if (window.grecaptcha && f.dataset.recaptchaWidgetId !== undefined) window.grecaptcha.reset(f.dataset.recaptchaWidgetId);
        bridge.querySelector(".emailoctopus-success-message").textContent = "";
      }
    } else {
      say(form, text, "err");
      form.querySelector("input[type=email]").focus();
    }
  }

  function send(form) {
    if (busy) return;
    var email = form.querySelector("input[type=email]").value.trim();
    busy = form;
    form.querySelector("button").disabled = true;
    say(form, MSG.sending);
    whenReady(function (ok) {
      if (!ok) { finish(false, MSG.noScript); return; }
      var f = eoForm();
      bridge.querySelector(".emailoctopus-error-message").textContent = "";
      f.querySelector("input[type=email]").value = email;
      // after an error EmailOctopus drops reCAPTCHA's response field but keeps its own
      // token, which leaves the next submit stuck; reset both so a retry gets a fresh check
      var stale = f.querySelector("[name=recaptcha-response]");
      if (stale) stale.remove();
      if (!f.querySelector("[name=g-recaptcha-response]")) {
        var field = document.createElement("textarea");
        field.name = "g-recaptcha-response";
        field.hidden = true;
        f.appendChild(field);
      }
      form._timer = setTimeout(function () { if (busy === form) finish(false, MSG.fail); }, REPLY_TIMEOUT);
      if (f.requestSubmit) f.requestSubmit();
      else f.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
  }

  // EmailOctopus's request has no catch: a network failure surfaces only as an unhandled rejection
  window.addEventListener("unhandledrejection", function () {
    if (busy && isReady()) finish(false, MSG.fail);
  });

  function init() {
    document.querySelectorAll("form.signup").forEach(function (form) {
      form.addEventListener("focusin", load, { once: true });
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        send(form);
      });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
