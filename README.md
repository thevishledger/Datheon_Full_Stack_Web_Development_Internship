# Datheon Full Stack Web Development Internship — Vishesh Srivastava

**Student:** Vishesh Srivastava — B.Tech CSE 2026 Graduate, Vision Institute of Technology (AKTU), Kanpur
**Programme:** Datheon Full Stack Web Development Internship (Application ID: DT-2026-K3ZRJ)
**Portfolio:** https://my-portfolio-vishesh.netlify.app • **GitHub:** https://github.com/thevishledger • **LinkedIn:** https://www.linkedin.com/in/vishesh-srivastava-ab6673254

This folder contains my internship deliverables. Every project is built with **vanilla HTML, CSS and JavaScript** — no frameworks and no build step — so each one runs by simply opening its `index.html` file.

---

## Task 1 — Personal Portfolio Website (`task-1-portfolio/`)

A single-page developer portfolio with my real details, education, internship experience and live projects.

**Features**
- Sticky header with navigation and a **hamburger menu** on mobile
- Hero, About, Skills, Projects and Contact sections with **smooth-scroll** navigation
- **Dark / light theme toggle** — the choice is saved in `localStorage` and restored on the next visit
- **Project cards open a details modal** (features, tech tags, live demo + GitHub links); closes via ✕, backdrop click or `Esc`
- Contact form with **client-side validation** (name, email format, message length) and inline error/success feedback — no backend
- Skills and projects are rendered from JavaScript data arrays, so updating content means editing data, not markup
- Fully responsive, mobile-first layout using **Flexbox and CSS Grid**

**How to run:** open `task-1-portfolio/index.html` in a browser, or serve the folder (see below).

---

## Task 2 — Task Manager App (`task-2-task-manager/`)

A complete to-do / task manager that runs entirely in the browser.

**Features**
- **Full CRUD:** add, edit (the form switches to edit mode), delete and mark tasks complete
- **Categories:** Work / Personal / Study, with colour-coded badges and accents
- **Due dates** with a friendly display format, plus **overdue highlighting** for past-due incomplete tasks
- **Filters:** status (All / Active / Completed) combined with a category filter
- **localStorage persistence** — tasks survive page refreshes and browser restarts
- Empty-state messages (different text for "no tasks yet" vs. "nothing matches the filters"), a live task counter, CSS transitions and entry animations
- Zero server dependencies

**How to run:** open `task-2-task-manager/index.html` in a browser.

---

## Task 4 — E-commerce Catalog with Cart (`task-4-ecommerce/`)

A demo store ("ShopKart") powered by the free [FakeStoreAPI](https://fakestoreapi.com).

**Features**
- Product catalog fetched live from `https://fakestoreapi.com/products` — cards show image, title, price, rating and a category badge
- **Category filtering** using the API's own categories (electronics, jewelery, men's clothing, women's clothing) plus an "All" view
- **Live search** across product titles, combined with the category filter
- **Slide-out cart drawer:** add/remove items, quantity +/− controls, per-item totals
- **Price summary:** subtotal, shipping (**free above ₹8,300**, otherwise ₹829), **5% tax** and grand total. The API returns prices in USD, so the app converts them to Indian Rupees at a fixed rate of ₹83 = $1 (rounded to whole rupees) and displays everything in ₹
- **Cart persists in `localStorage`** across visits
- **Simulated checkout:** a success modal with an order summary and order ID, after which the cart is cleared (no real payment)
- **Loading spinner** while fetching and a friendly **error message with Retry** if the API call fails

**How to run:** open `task-4-ecommerce/index.html` in a browser (an internet connection is required for the API and product images).

---

## Tech Used

- HTML5 (semantic structure, forms, accessibility attributes)
- CSS3 (Flexbox, Grid, CSS variables, transitions/animations, media queries, mobile-first responsive design)
- JavaScript ES6+ (DOM rendering from data, event delegation, `localStorage`, Fetch API with `async/await`, form validation)

## Running with a static server (optional)

Opening the files directly works for all three projects. If you prefer a local server:

```bash
cd Datheon_Full_Stack_Web_Development_Internship
python3 -m http.server 8000
# then visit http://localhost:8000/task-1-portfolio/  (etc.)
```

## Folder Structure

```
Datheon_Full_Stack_Web_Development_Internship/
├── README.md
├── task-1-portfolio/
│   ├── index.html
│   ├── styles.css
│   └── script.js
├── task-2-task-manager/
│   ├── index.html
│   ├── styles.css
│   └── script.js
└── task-4-ecommerce/
    ├── index.html
    ├── styles.css
    └── script.js
```
