"use strict";

/* ============================================================
   Portfolio logic
   1. Theme toggle (persisted in localStorage)
   2. Mobile hamburger menu
   3. Skills + Projects rendered from data arrays
   4. Project details modal
   5. Contact form validation
   ============================================================ */

/* ---------- 1. Theme toggle ---------- */
const themeToggle = document.getElementById("themeToggle");

// localStorage can throw in some private/blocked contexts — never let
// theme storage break the page.
function getSavedTheme() {
  try {
    return localStorage.getItem("portfolio-theme");
  } catch {
    return null;
  }
}
function saveTheme(theme) {
  try {
    localStorage.setItem("portfolio-theme", theme);
  } catch {
    // Theme just won't persist — the toggle itself still works.
  }
}

// On load: use the saved theme if there is one, otherwise dark.
applyTheme(getSavedTheme() || "dark");

function applyTheme(theme) {
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

themeToggle.addEventListener("click", () => {
  const current = document.documentElement.getAttribute("data-theme");
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  saveTheme(next); // persist the choice
});

/* ---------- 2. Hamburger menu ---------- */
const hamburger = document.getElementById("hamburger");
const navMenu = document.getElementById("navMenu");

hamburger.addEventListener("click", () => {
  const isOpen = navMenu.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", String(isOpen));
  hamburger.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
});

// Close the mobile menu after a link is clicked, and move the
// "active" highlight to the link that was clicked.
navMenu.querySelectorAll(".nav-link").forEach((link) => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    hamburger.setAttribute("aria-label", "Open menu");
    navMenu.querySelectorAll(".nav-link").forEach((l) => l.classList.remove("active"));
    link.classList.add("active");
  });
});

/* ---------- 3a. Skills data + render ---------- */
const skills = [
  { icon: "⚛️", name: "React.js", level: "Component-based UIs, hooks, Context API" },
  { icon: "▲", name: "Next.js", level: "SSR, routing, API routes" },
  { icon: "🟦", name: "TypeScript", level: "Typed, safer JavaScript" },
  { icon: "🟨", name: "JavaScript ES6+", level: "Core language, 60+ LeetCode problems" },
  { icon: "🟢", name: "Node.js", level: "Backend runtime, REST APIs" },
  { icon: "🚂", name: "Express.js", level: "Servers, middleware, routing" },
  { icon: "🍃", name: "MongoDB", level: "NoSQL database, Mongoose" },
  { icon: "🎨", name: "HTML5 / CSS3", level: "Flexbox, Grid, responsive design, Tailwind CSS" },
];

const skillsGrid = document.getElementById("skillsGrid");
skillsGrid.innerHTML = skills
  .map(
    (s) => `
    <article class="skill-card">
      <div class="skill-icon">${s.icon}</div>
      <h3>${s.name}</h3>
      <p>${s.level}</p>
    </article>`
  )
  .join("");

/* ---------- 3b. Projects data + render ---------- */
const projects = [
  {
    id: "url-shortener",
    emoji: "🔗",
    title: "MERN URL Shortener with QR",
    short: "Shorten long URLs, generate QR codes, and track clicks — built with the full MERN stack.",
    tags: ["MongoDB", "Express", "React", "Node.js"],
    features: [
      "Create short links from long URLs with unique short codes",
      "Auto-generated QR code for every short link",
      "Click tracking and a simple analytics view",
      "REST API built with Express + MongoDB (Mongoose)",
    ],
    live: "https://frontend-d1xd.onrender.com",
    github: "https://github.com/thevishledger",
  },
  {
    id: "gemini-qa",
    emoji: "🤖",
    title: "Gemini AI Q&A App",
    short: "An AI chat app powered by Google's Gemini API — ask questions and get instant answers.",
    tags: ["React", "Gemini API", "JavaScript", "REST API"],
    features: [
      "Chat-style interface connected to the Gemini AI API",
      "Loading states and graceful error handling",
      "Clean, responsive UI built with React components",
      "Deployed on Vercel",
    ],
    live: "https://ai-chat-bot-eta-six.vercel.app",
    github: "https://github.com/thevishledger",
  },
  {
    id: "movie-app",
    emoji: "🎬",
    title: "React Movie App",
    short: "Browse and search movies using a public movie API, with detail pages and a watchlist feel.",
    tags: ["React", "API Integration", "CSS", "JavaScript"],
    features: [
      "Search movies by title with live results",
      "Movie cards with poster, rating and overview",
      "Detail view for each movie",
      "Responsive grid layout for mobile and desktop",
    ],
    live: "https://my-movie-app-qcrs.vercel.app",
    github: "https://github.com/thevishledger",
  },
];

const projectsGrid = document.getElementById("projectsGrid");
projectsGrid.innerHTML = projects
  .map(
    (p) => `
    <article class="project-card" data-project-id="${p.id}" tabindex="0" role="button" aria-label="View details of ${p.title}">
      <div class="project-emoji">${p.emoji}</div>
      <h3>${p.title}</h3>
      <p>${p.short}</p>
      <div class="tag-row">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
      <p class="click-hint">Click for details →</p>
    </article>`
  )
  .join("");

/* ---------- 4. Project modal ---------- */
const modalOverlay = document.getElementById("projectModal");
const modalContent = document.getElementById("modalContent");
const modalClose = document.getElementById("modalClose");

function openProjectModal(projectId) {
  const p = projects.find((item) => item.id === projectId);
  if (!p) return;

  modalContent.innerHTML = `
    <div class="modal-emoji">${p.emoji}</div>
    <h3 id="modalTitle">${p.title}</h3>
    <div class="tag-row">${p.tags.map((t) => `<span class="tag">${t}</span>`).join("")}</div>
    <p>${p.short}</p>
    <strong>Key features:</strong>
    <ul>${p.features.map((f) => `<li>${f}</li>`).join("")}</ul>
    <div class="modal-links">
      <a class="btn btn-primary" href="${p.live}" target="_blank" rel="noopener">Live Demo</a>
      <a class="btn btn-outline" href="${p.github}" target="_blank" rel="noopener">GitHub</a>
    </div>`;

  modalOverlay.hidden = false;
  document.body.style.overflow = "hidden"; // stop background scrolling
  modalClose.focus(); // move keyboard focus into the dialog
}

function closeProjectModal() {
  modalOverlay.hidden = true;
  document.body.style.overflow = "";
}

// Cards open the modal on click or on Enter/Space (keyboard friendly).
projectsGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".project-card");
  if (card) openProjectModal(card.dataset.projectId);
});
projectsGrid.addEventListener("keydown", (e) => {
  if ((e.key === "Enter" || e.key === " ") && e.target.classList.contains("project-card")) {
    e.preventDefault();
    openProjectModal(e.target.dataset.projectId);
  }
});

modalClose.addEventListener("click", closeProjectModal);
// Clicking the dark area outside the modal also closes it.
modalOverlay.addEventListener("click", (e) => {
  if (e.target === modalOverlay) closeProjectModal();
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !modalOverlay.hidden) closeProjectModal();
});

/* ---------- 5. Contact form validation (no backend) ---------- */
const form = document.getElementById("contactForm");
const nameInput = document.getElementById("cfName");
const emailInput = document.getElementById("cfEmail");
const messageInput = document.getElementById("cfMessage");
const successMsg = document.getElementById("formSuccess");

function setError(input, errorEl, message) {
  errorEl.textContent = message;
  input.classList.toggle("invalid", Boolean(message));
  return !message; // true when valid
}

function validateName() {
  return setError(nameInput, document.getElementById("errName"),
    nameInput.value.trim().length >= 2 ? "" : "Please enter your name (at least 2 characters).");
}

function validateEmail() {
  const value = emailInput.value.trim();
  // Simple, readable email check: something@something.something
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return setError(emailInput, document.getElementById("errEmail"),
    emailPattern.test(value) ? "" : "Please enter a valid email address.");
}

function validateMessage() {
  return setError(messageInput, document.getElementById("errMessage"),
    messageInput.value.trim().length >= 10 ? "" : "Please write at least 10 characters.");
}

// Validate each field as the user leaves it, for quick feedback.
nameInput.addEventListener("blur", validateName);
emailInput.addEventListener("blur", validateEmail);
messageInput.addEventListener("blur", validateMessage);

form.addEventListener("submit", (e) => {
  e.preventDefault(); // no backend — everything happens in the browser

  // Run all three validators (array first, so none are skipped by short-circuit).
  const results = [validateName(), validateEmail(), validateMessage()];
  if (results.every(Boolean)) {
    successMsg.hidden = false;
    form.reset();
  } else {
    successMsg.hidden = true;
  }
});
