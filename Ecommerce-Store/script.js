
/* =========================================
   SHOPSPHERE - E-COMMERCE APPLICATION
========================================= */

const API_URL = "https://fakestoreapi.com/products";

// Application state
let allProducts = [];
let cart = JSON.parse(localStorage.getItem("shopsphereCart")) || [];
let activeCategory = "all";
let searchTerm = "";
let sortMode = "default";

// DOM elements
const productGrid = document.getElementById("productGrid");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const emptyState = document.getElementById("emptyState");
const productResult = document.getElementById("productResult");

const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchButton");
const categoryBar = document.getElementById("categoryBar");
const sortSelect = document.getElementById("sortSelect");

const cartButton = document.getElementById("cartButton");
const cartDrawer = document.getElementById("cartDrawer");
const closeCart = document.getElementById("closeCart");
const overlay = document.getElementById("overlay");
const cartItems = document.getElementById("cartItems");

const cartCount = document.getElementById("cartCount");
const drawerCartCount = document.getElementById("drawerCartCount");

const subtotalElement = document.getElementById("subtotal");
const taxElement = document.getElementById("tax");
const shippingElement = document.getElementById("shipping");
const totalElement = document.getElementById("total");

const cartSummary = document.getElementById("cartSummary");
const checkoutButton = document.getElementById("checkoutButton");

const checkoutModal = document.getElementById("checkoutModal");
const checkoutForm = document.getElementById("checkoutForm");
const checkoutTotal = document.getElementById("checkoutTotal");
const checkoutFormContent = document.getElementById("checkoutFormContent");
const successContent = document.getElementById("successContent");

const themeToggle = document.getElementById("themeToggle");

// Currency formatter
const currency = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
});

// =========================================
// INITIALIZATION
// =========================================

document.addEventListener("DOMContentLoaded", () => {
    updateCart();
    loadProducts();
    loadTheme();
});

// =========================================
// FETCH PRODUCTS
// =========================================

async function loadProducts() {
    loading.style.display = "flex";
    errorMessage.style.display = "none";
    productGrid.innerHTML = "";
    emptyState.style.display = "none";

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to connect to the product API.");
        }

        const products = await response.json();

        if (!Array.isArray(products)) {
            throw new Error("Invalid product data received.");
        }

        allProducts = products;

        displayProducts();

    } catch (error) {
        console.error("Product loading error:", error);

        loading.style.display = "none";
        errorMessage.style.display = "block";
    }
}

// =========================================
// DISPLAY PRODUCTS
// =========================================

function displayProducts() {
    loading.style.display = "none";
    productGrid.innerHTML = "";

    let filteredProducts = [...allProducts];

    // Category filtering
    if (activeCategory !== "all") {
        filteredProducts = filteredProducts.filter(product =>
            product.category === activeCategory
        );
    }

    // Search filtering
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Sorting
    if (sortMode === "low-high") {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (sortMode === "high-low") {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (sortMode === "rating") {
        filteredProducts.sort(
            (a, b) => b.rating.rate - a.rating.rate
        );
    }

    productResult.textContent =
        `${filteredProducts.length} products found`;

    if (filteredProducts.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    filteredProducts.forEach((product, index) => {
        const card = document.createElement("article");

        card.className = "product-card";
        card.style.animationDelay = `${Math.min(index * 0.04, 0.4)}s`;

        const badge = getProductBadge(product);

        const image = escapeHTML(product.image);
        const title = escapeHTML(product.title);
        const category = escapeHTML(product.category);
        const description = escapeHTML(product.description);

        card.innerHTML = `
            <div class="product-image-wrap">

                ${badge ? `<span class="product-badge">${badge}</span>` : ""}

                <button
                    class="favorite-btn"
                    type="button"
                    aria-label="Add ${title} to favorites"
                    title="Favorites"
                >♡</button>

                <img
                    class="product-image"
                    src="${image}"
                    alt="${title}"
                    loading="lazy"
                >

            </div>

            <p class="product-category">${category}</p>

            <h3 class="product-title" title="${title}">
                ${title}
            </h3>

            <div class="product-rating">
                ⭐ ${Number(product.rating.rate).toFixed(1)}
                <span>(${product.rating.count} reviews)</span>
            </div>

            <div class="product-bottom">

                <span class="product-price">
                    ${currency.format(product.price)}
                </span>

                <button
                    class="add-cart-btn"
                    data-id="${product.id}"
                    type="button"
                >
                    + Add to Cart
                </button>

            </div>
        `;

        productGrid.appendChild(card);
    });
}

// =========================================
// PRODUCT BADGES
// =========================================

function getProductBadge(product) {
    if (product.rating.rate >= 4.5) {
        return "BEST SELLER";
    }

    if (product.rating.count >= 250) {
        return "POPULAR";
    }

    if (product.price < 20) {
        return "GREAT DEAL";
    }

    return "";
}

// =========================================
// HTML ESCAPING
// =========================================

function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[char];
    });
}

// =========================================
// SEARCH PRODUCTS
// =========================================

searchInput.addEventListener("input", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    displayProducts();
});

searchButton.addEventListener("click", () => {
    searchTerm = searchInput.value.trim().toLowerCase();
    displayProducts();

    document.getElementById("products").scrollIntoView({
        behavior: "smooth"
    });
});

// =========================================
// CATEGORY FILTER
// =========================================

categoryBar.addEventListener("click", event => {
    const button = event.target.closest(".category-btn");

    if (!button) return;

    activeCategory = button.dataset.category;

    document.querySelectorAll(".category-btn").forEach(btn => {
        btn.classList.remove("active");
    });

    button.classList.add("active");

    displayProducts();
});

// =========================================
// SORT PRODUCTS
// =========================================

sortSelect.addEventListener("change", () => {
    sortMode = sortSelect.value;
    displayProducts();
});

// =========================================
// CLEAR FILTERS
// =========================================

document.getElementById("clearFiltersButton").addEventListener(
    "click",
    () => {
        activeCategory = "all";
        searchTerm = "";
        sortMode = "default";

        searchInput.value = "";
        sortSelect.value = "default";

        document.querySelectorAll(".category-btn").forEach(btn => {
            btn.classList.toggle(
                "active",
                btn.dataset.category === "all"
            );
        });

        displayProducts();
    }
);

// =========================================
// RETRY API
// =========================================

document.getElementById("retryButton").addEventListener(
    "click",
    loadProducts
);

// =========================================
// ADD TO CART
// =========================================

productGrid.addEventListener("click", event => {
    const button = event.target.closest(".add-cart-btn");

    if (button) {
        const productId = Number(button.dataset.id);

        addToCart(productId);

        const originalText = button.textContent;

        button.textContent = "✓ Added!";
        button.disabled = true;

        setTimeout(() => {
            button.textContent = originalText;
            button.disabled = false;
        }, 800);
    }

    const favoriteButton = event.target.closest(".favorite-btn");

    if (favoriteButton) {
        const isFavorite = favoriteButton.dataset.favorite === "true";

        favoriteButton.dataset.favorite = String(!isFavorite);
        favoriteButton.textContent = isFavorite ? "♡" : "♥";

        favoriteButton.style.color = isFavorite
            ? "inherit"
            : "#ff668b";
    }
});

function addToCart(productId) {
    const product = allProducts.find(item => item.id === productId);

    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            title: product.title,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    saveCart();
    updateCart();
}

// =========================================
// REMOVE FROM CART
// =========================================

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);

    saveCart();
    updateCart();
}

// =========================================
// UPDATE QUANTITY
// =========================================

function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(productId);
        return;
    }

    saveCart();
    updateCart();
}

// =========================================
// SAVE CART
// =========================================

function saveCart() {
    localStorage.setItem("shopsphereCart", JSON.stringify(cart));
}

// =========================================
// CART COUNTER
// =========================================

function updateCartCounter() {
    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCount.textContent = totalItems;
    drawerCartCount.textContent = `(${totalItems})`;
}

// =========================================
// CALCULATE TOTAL
// =========================================

function calculateTotal() {
    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
    );

    const tax = subtotal * 0.08;

    // Free shipping above $100, otherwise $5
    const shipping = subtotal === 0
        ? 0
        : subtotal >= 100 ? 0 : 5;

    const total = subtotal + tax + shipping;

    return {
        subtotal,
        tax,
        shipping,
        total
    };
}

// =========================================
// DISPLAY CART
// =========================================

function updateCart() {
    updateCartCounter();

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="cart-empty">
                <span>🛒</span>
                <h3>Your cart is empty!</h3>
                <p>Let's find something amazing for you.</p>

                <button id="continueShopping" type="button">
                    Start Shopping
                </button>
            </div>
        `;

        cartSummary.style.display = "none";

    } else {
        cartSummary.style.display = "block";

        cartItems.innerHTML = "";

        cart.forEach(item => {
            const cartItem = document.createElement("div");

            cartItem.className = "cart-item";

            cartItem.innerHTML = `
                <img
                    src="${escapeHTML(item.image)}"
                    alt="${escapeHTML(item.title)}"
                >

                <div class="cart-item-info">

                    <h4>${escapeHTML(item.title)}</h4>

                    <p>${currency.format(item.price)}</p>

                    <div class="quantity-control">

                        <button
                            type="button"
                            data-action="decrease"
                            data-id="${item.id}"
                            aria-label="Decrease quantity"
                        >−</button>

                        <span>${item.quantity}</span>

                        <button
                            type="button"
                            data-action="increase"
                            data-id="${item.id}"
                            aria-label="Increase quantity"
                        >+</button>

                    </div>

                </div>

                <button
                    class="remove-item"
                    type="button"
                    data-action="remove"
                    data-id="${item.id}"
                    aria-label="Remove item"
                    title="Remove"
                >✕</button>
            `;

            cartItems.appendChild(cartItem);
        });
    }

    updateCartTotals();
}

// =========================================
// UPDATE CART TOTALS
// =========================================

function updateCartTotals() {
    const totals = calculateTotal();

    subtotalElement.textContent =
        currency.format(totals.subtotal);

    taxElement.textContent =
        currency.format(totals.tax);

    shippingElement.textContent =
        totals.shipping === 0 && totals.subtotal > 0
            ? "FREE"
            : currency.format(totals.shipping);

    totalElement.textContent =
        currency.format(totals.total);

    checkoutTotal.textContent =
        currency.format(totals.total);

    checkoutButton.disabled = cart.length === 0;
}

// =========================================
// CART BUTTON ACTIONS
// =========================================

cartItems.addEventListener("click", event => {
    const button = event.target.closest("[data-action]");

    if (!button) return;

    const id = Number(button.dataset.id);
    const action = button.dataset.action;

    if (action === "increase") {
        updateQuantity(id, 1);
    }

    if (action === "decrease") {
        updateQuantity(id, -1);
    }

    if (action === "remove") {
        removeFromCart(id);
    }
});

// =========================================
// OPEN AND CLOSE CART
// =========================================

function openCart() {
    cartDrawer.classList.add("active");
    overlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCartDrawer() {
    cartDrawer.classList.remove("active");
    overlay.classList.remove("active");
    document.body.style.overflow = "";
}

cartButton.addEventListener("click", openCart);
closeCart.addEventListener("click", closeCartDrawer);
overlay.addEventListener("click", closeCartDrawer);

cartItems.addEventListener("click", event => {
    if (event.target.closest("#continueShopping")) {
        closeCartDrawer();
    }
});

// =========================================
// CHECKOUT MODAL
// =========================================

function openCheckout() {
    if (cart.length === 0) return;

    closeCartDrawer();

    checkoutFormContent.style.display = "block";
    successContent.style.display = "none";

    checkoutForm.reset();

    checkoutTotal.textContent =
        currency.format(calculateTotal().total);

    checkoutModal.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeCheckoutModal() {
    checkoutModal.classList.remove("active");
    document.body.style.overflow = "";
}

checkoutButton.addEventListener("click", openCheckout);

document.getElementById("closeCheckout").addEventListener(
    "click",
    closeCheckoutModal
);

// =========================================
// PLACE ORDER
// =========================================

checkoutForm.addEventListener("submit", event => {
    event.preventDefault();

    if (cart.length === 0) return;

    const customerName =
        document.getElementById("customerName").value.trim();

    const customerEmail =
        document.getElementById("customerEmail").value.trim();

    const customerAddress =
        document.getElementById("customerAddress").value.trim();

    if (!customerName || !customerEmail || !customerAddress) {
        alert("Please complete all checkout fields.");
        return;
    }

    const orderId =
        "SS" + Date.now().toString().slice(-8);

    // Save simulated order
    const order = {
        orderId,
        customerName,
        customerEmail,
        customerAddress,
        items: [...cart],
        totals: calculateTotal(),
        date: new Date().toISOString()
    };

    const previousOrders = JSON.parse(
        localStorage.getItem("shopsphereOrders") || "[]"
    );

    previousOrders.push(order);

    localStorage.setItem(
        "shopsphereOrders",
        JSON.stringify(previousOrders)
    );

    document.getElementById("orderId").textContent = orderId;

    checkoutFormContent.style.display = "none";
    successContent.style.display = "block";

    cart = [];

    saveCart();
    updateCart();
});

// =========================================
// FINISH ORDER
// =========================================

document.getElementById("finishOrder").addEventListener(
    "click",
    () => {
        closeCheckoutModal();

        document.getElementById("products").scrollIntoView({
            behavior: "smooth"
        });
    }
);

// =========================================
// DARK / LIGHT THEME
// =========================================

function loadTheme() {
    const savedTheme = localStorage.getItem("shopsphereTheme");

    if (savedTheme === "dark") {
        document.body.classList.add("dark-theme");
        themeToggle.textContent = "☀";
    } else {
        document.body.classList.remove("dark-theme");
        themeToggle.textContent = "☾";
    }
}

themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-theme");

    const isDark =
        document.body.classList.contains("dark-theme");

    localStorage.setItem(
        "shopsphereTheme",
        isDark ? "dark" : "light"
    );

    themeToggle.textContent = isDark ? "☀" : "☾";
});

// =========================================
// KEYBOARD ACCESSIBILITY
// =========================================

document.addEventListener("keydown", event => {
    if (event.key === "Escape") {
        closeCartDrawer();
        closeCheckoutModal();
    }
});
