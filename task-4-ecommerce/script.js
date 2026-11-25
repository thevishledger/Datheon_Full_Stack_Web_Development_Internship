"use strict";

/* ============================================================
   ShopKart — demo e-commerce store using the free FakeStoreAPI
   - GET https://fakestoreapi.com/products          (catalog)
   - GET https://fakestoreapi.com/products/categories
   - Category filter + live search
   - Cart drawer with quantities, saved in localStorage
   - Pricing rules: free shipping above ₹8,300 (else ₹829), tax 5%
   - The API returns prices in USD; the page converts and shows
     every price in Indian Rupees (see USD_TO_INR below)
   ============================================================ */

const API_BASE = "https://fakestoreapi.com";
const CART_KEY = "shopkart-cart";

/* Currency: FakeStoreAPI prices are in USD, but this store displays
   everything in Indian Rupees. Each product price is converted ONCE
   when the data loads (rounded to whole rupees), so the line items,
   subtotal, tax and total shown on screen always add up exactly. */
const USD_TO_INR = 83; // 1 USD = ₹83 (fixed display conversion rate)

const FREE_SHIPPING_ABOVE = 8300; // ₹ (equivalent of the old $100 rule)
const SHIPPING_COST = 829;        // ₹ flat fee below that (was $9.99)
const TAX_RATE = 0.05; // 5%

/* ---------- State ---------- */
let allProducts = [];       // everything returned by the API
let activeCategory = "all"; // currently selected category filter
let searchText = "";        // current search box text
let cart = loadCart();      // { productId: quantity }

/* ---------- DOM references ---------- */
const productGrid = document.getElementById("productGrid");
const categoryBar = document.getElementById("categoryBar");
const searchInput = document.getElementById("searchInput");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorBox = document.getElementById("errorBox");
const noResults = document.getElementById("noResults");
const retryBtn = document.getElementById("retryBtn");

const cartBtn = document.getElementById("cartBtn");
const cartCountEl = document.getElementById("cartCount");
const cartDrawer = document.getElementById("cartDrawer");
const cartOverlay = document.getElementById("cartOverlay");
const closeCartBtn = document.getElementById("closeCartBtn");
const cartItemsEl = document.getElementById("cartItems");
const cartEmptyEl = document.getElementById("cartEmpty");
const cartSummaryEl = document.getElementById("cartSummary");
const subtotalEl = document.getElementById("subtotalEl");
const shippingEl = document.getElementById("shippingEl");
const taxEl = document.getElementById("taxEl");
const totalEl = document.getElementById("totalEl");
const checkoutBtn = document.getElementById("checkoutBtn");

const checkoutModal = document.getElementById("checkoutModal");
const orderSummaryText = document.getElementById("orderSummaryText");
const closeModalBtn = document.getElementById("closeModalBtn");

/* ---------- Helpers ---------- */
// Format a whole-rupee amount with Indian digit grouping: ₹1,23,456.
function formatMoney(amount) {
  return `₹${Math.round(amount).toLocaleString("en-IN")}`;
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  // Also escape quotes, because this is used inside HTML attributes (alt="…").
  return div.innerHTML.replace(/"/g, "&quot;");
}

function loadCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY));
    if (!parsed || typeof parsed !== "object") return {};
    // Keep only sane entries: a positive whole-number quantity per id.
    const clean = {};
    for (const [id, qty] of Object.entries(parsed)) {
      const n = Number(qty);
      if (Number.isFinite(n) && n > 0) clean[id] = Math.floor(n);
    }
    return clean;
  } catch {
    return {};
  }
}

function saveCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch {
    // Storage full/blocked — the cart still works for this session.
  }
}

/* ---------- Data loading ---------- */
async function loadStore() {
  loadingSpinner.hidden = false;
  errorBox.hidden = true;
  productGrid.innerHTML = "";

  try {
    // Fetch products and categories together — both must succeed.
    const [productsRes, categoriesRes] = await Promise.all([
      fetch(`${API_BASE}/products`),
      fetch(`${API_BASE}/products/categories`),
    ]);
    if (!productsRes.ok || !categoriesRes.ok) throw new Error("API request failed");

    // Convert each USD price to whole rupees once, here, so every
    // price shown later (cards, cart lines, totals) is consistent.
    allProducts = (await productsRes.json()).map((p) => ({
      ...p,
      priceInr: Math.round(p.price * USD_TO_INR),
    }));
    const categories = await categoriesRes.json();

    renderCategories(categories);
    renderProducts();
    renderCart(); // re-render now that saved-cart ids can be matched to products
  } catch (err) {
    // Network/API failure: hide the spinner and show the error box with Retry.
    errorBox.hidden = false;
    console.error("Failed to load products:", err);
  } finally {
    loadingSpinner.hidden = true;
  }
}

retryBtn.addEventListener("click", loadStore);

/* ---------- Categories + product grid ---------- */
function renderCategories(categories) {
  const all = ["all", ...categories];
  categoryBar.innerHTML = all
    .map(
      (cat) =>
        `<button type="button" class="cat-btn ${cat === activeCategory ? "active" : ""}" data-category="${escapeHtml(cat)}">
           ${cat === "all" ? "All" : escapeHtml(cat)}
         </button>`
    )
    .join("");
}

categoryBar.addEventListener("click", (e) => {
  const btn = e.target.closest(".cat-btn");
  if (!btn) return;
  activeCategory = btn.dataset.category;
  categoryBar.querySelectorAll(".cat-btn").forEach((b) =>
    b.classList.toggle("active", b === btn)
  );
  renderProducts();
});

searchInput.addEventListener("input", () => {
  searchText = searchInput.value.trim().toLowerCase();
  renderProducts();
});

function getVisibleProducts() {
  return allProducts.filter((p) => {
    const matchesCategory = activeCategory === "all" || p.category === activeCategory;
    const matchesSearch = p.title.toLowerCase().includes(searchText);
    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const visible = getVisibleProducts();
  noResults.hidden = visible.length !== 0;

  productGrid.innerHTML = visible
    .map(
      (p) => `
      <article class="product-card">
        <img src="${p.image}" alt="${escapeHtml(p.title)}" loading="lazy" />
        <span class="category-badge">${escapeHtml(p.category)}</span>
        <h3 class="product-title">${escapeHtml(p.title)}</h3>
        <p class="product-rating">⭐ ${p.rating?.rate ?? "—"} (${p.rating?.count ?? 0} reviews)</p>
        <p class="product-price">${formatMoney(p.priceInr)}</p>
        <button type="button" class="btn add-cart-btn" data-add-id="${p.id}">Add to Cart</button>
      </article>`
    )
    .join("");
}

// "Add to Cart" buttons (delegated, since cards are re-rendered often).
productGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add-id]");
  if (!btn) return;
  addToCart(Number(btn.dataset.addId));

  // Small confirmation feedback on the button itself.
  const original = btn.textContent;
  btn.textContent = "Added ✓";
  btn.classList.add("added");
  setTimeout(() => {
    btn.textContent = original;
    btn.classList.remove("added");
  }, 900);
});

/* ---------- Cart logic ---------- */
function addToCart(productId) {
  cart[productId] = (cart[productId] || 0) + 1;
  saveCart();
  renderCart();
}

function setQuantity(productId, qty) {
  if (qty <= 0) {
    delete cart[productId]; // quantity 0 removes the item
  } else {
    cart[productId] = qty;
  }
  saveCart();
  renderCart();
}

function cartEntries() {
  // Turn { id: qty } into [{ product, qty }] using the loaded catalog.
  return Object.entries(cart)
    .map(([id, qty]) => ({
      product: allProducts.find((p) => p.id === Number(id)),
      qty,
    }))
    .filter((entry) => entry.product); // skip ids that no longer exist
}

function cartTotals() {
  const entries = cartEntries();
  // All amounts are whole rupees (priceInr is already rounded), so the
  // line items sum exactly to the subtotal; tax is rounded to ₹1.
  const subtotal = entries.reduce((sum, e) => sum + e.product.priceInr * e.qty, 0);
  const shipping = entries.length === 0 || subtotal > FREE_SHIPPING_ABOVE ? 0 : SHIPPING_COST;
  const tax = Math.round(subtotal * TAX_RATE);
  return { entries, subtotal, shipping, tax, total: subtotal + shipping + tax };
}

function renderCart() {
  const { entries, subtotal, shipping, tax, total } = cartTotals();

  const itemCount = entries.reduce((sum, e) => sum + e.qty, 0);
  cartCountEl.textContent = String(itemCount);

  cartEmptyEl.style.display = entries.length === 0 ? "block" : "none";
  cartSummaryEl.style.display = entries.length === 0 ? "none" : "block";

  cartItemsEl.innerHTML = entries
    .map(
      ({ product, qty }) => `
      <div class="cart-item">
        <img src="${product.image}" alt="${escapeHtml(product.title)}" />
        <div class="cart-item-info">
          <p class="cart-item-title">${escapeHtml(product.title)}</p>
          <p class="cart-item-price">${formatMoney(product.priceInr)} each</p>
          <div class="qty-controls">
            <button type="button" class="qty-btn" data-qty-id="${product.id}" data-delta="-1" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${qty}</span>
            <button type="button" class="qty-btn" data-qty-id="${product.id}" data-delta="1" aria-label="Increase quantity">+</button>
            <button type="button" class="remove-btn" data-remove-id="${product.id}" title="Remove item" aria-label="Remove item">🗑️</button>
          </div>
        </div>
        <span class="cart-item-total">${formatMoney(product.priceInr * qty)}</span>
      </div>`
    )
    .join("");

  subtotalEl.textContent = formatMoney(subtotal);
  shippingEl.textContent = shipping === 0 && entries.length > 0 ? "FREE" : formatMoney(shipping);
  taxEl.textContent = formatMoney(tax);
  totalEl.textContent = formatMoney(total);
}

// Quantity +/- and remove buttons inside the drawer (delegated).
cartItemsEl.addEventListener("click", (e) => {
  const qtyBtn = e.target.closest("[data-qty-id]");
  if (qtyBtn) {
    const id = Number(qtyBtn.dataset.qtyId);
    setQuantity(id, (cart[id] || 0) + Number(qtyBtn.dataset.delta));
    return;
  }
  const removeBtn = e.target.closest("[data-remove-id]");
  if (removeBtn) setQuantity(Number(removeBtn.dataset.removeId), 0);
});

/* ---------- Cart drawer open / close ---------- */
function openCart() {
  cartDrawer.classList.add("open");
  cartOverlay.hidden = false;
}
function closeCart() {
  cartDrawer.classList.remove("open");
  cartOverlay.hidden = true;
}
cartBtn.addEventListener("click", openCart);
closeCartBtn.addEventListener("click", closeCart);
cartOverlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    checkoutModal.hidden = true;
  }
});

/* ---------- Simulated checkout ---------- */
checkoutBtn.addEventListener("click", () => {
  const { entries, total } = cartTotals();
  if (entries.length === 0) return;

  const itemCount = entries.reduce((sum, e) => sum + e.qty, 0);
  orderSummaryText.textContent =
    `Your order of ${itemCount} item${itemCount === 1 ? "" : "s"} worth ${formatMoney(total)} has been placed. ` +
    `Order ID: SK-${Date.now().toString().slice(-6)}`;

  cart = {}; // clear the cart after a successful (simulated) order
  saveCart();
  renderCart();
  closeCart();
  checkoutModal.hidden = false;
});

closeModalBtn.addEventListener("click", () => {
  checkoutModal.hidden = true;
});
checkoutModal.addEventListener("click", (e) => {
  if (e.target === checkoutModal) checkoutModal.hidden = true;
});

/* ---------- Start ---------- */
renderCart();  // show any cart saved from a previous visit
loadStore();   // fetch the catalog
