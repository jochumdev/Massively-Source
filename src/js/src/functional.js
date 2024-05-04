import lightbox from "../lib/lightbox";
import reframe from "reframe.js";
import { jarallax } from "jarallax";

function init() {
  /*
   * Play initial animations on page load.
   */
  window.setTimeout(function () {
    document.getElementsByTagName("body")[0].classList.remove("is-preload");
  }, 100);

  /*
   * Clear intro on click
   */
  var intro = document.querySelector("#intro");
  if (intro) {
    var btn = intro.querySelector(".clear");
    if (btn) {
      btn.addEventListener("click", function () {
        intro.classList.add("hidden");
        intro.remove();
      });
    }
  }

  /*
   * Navpanel toggle.
   */
  var nav = document.getElementById("navPanel");
  var btnClose = document.querySelector("#navPanel>.close");
  var btnToggle = document.getElementById("navPanelToggle");

  function toggle() {
    if (nav.getAttribute("data-hidden") == "true") {
      btnToggle.classList.add("hidden");

      nav.classList.remove("hidden");
      nav.setAttribute("data-hidden", "false");
    } else {
      btnToggle.classList.remove("hidden");
      nav.classList.add("hidden");
      nav.setAttribute("data-hidden", "true");
    }
  }

  btnToggle.addEventListener("click", function () {
    toggle();
  });
  btnClose.addEventListener("click", function () {
    toggle();
  });

  // Initial hide.
  toggle();

  /*
   * Jarallax for the background image
   */
  jarallax(document.getElementsByTagName("body"), {
    speed: 0.0,
  });

  /* Add lightbox to gallery images */
  lightbox(".kg-image-card img, .kg-gallery-card img");

  /* Responsive video in post content */
  const sources = [
    '.gh-content iframe[src*="youtube.com"]',
    '.gh-content iframe[src*="youtube-nocookie.com"]',
    '.gh-content iframe[src*="player.vimeo.com"]',
    '.gh-content iframe[src*="kickstarter.com"][src*="video.html"]',
    ".gh-content object",
    ".gh-content embed",
  ];
  reframe(document.querySelectorAll(sources.join(",")));

  /* Turn the main nav into dropdown menu when there are more than 5 menu items */
  // (function () {
  //     dropdown();
  // })();

  // /* Infinite scroll pagination */
  // (function () {
  //     if (!document.body.classList.contains('home-template') && !document.body.classList.contains('post-template')) {
  //         pagination();
  //     }
  // })();

  /* Responsive HTML table */
  const tables = document.querySelectorAll(
    ".gh-content > table:not(.gist table)",
  );

  tables.forEach(function (table) {
    const wrapper = document.createElement("div");
    wrapper.className = "gh-table";
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });

  // Hihglight.js
  hljs.highlightAll();
}

export default { init };
