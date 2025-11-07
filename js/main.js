// ====== Load cart from localStorage ======
let cart = JSON.parse(localStorage.getItem("cart")) || {};

// ====== Update cart display ======
function updateCartDisplay() {
  const cartItems = document.getElementById("cart-items");
  const cartTotal = document.getElementById("cart-total");
  if (!cartItems || !cartTotal) return;

  cartItems.innerHTML = "";
  let total = 0;
  let itemCount = 0;

  for (let item in cart) {
    const { price, quantity } = cart[item];
    total += price * quantity;
    itemCount += quantity;

    const div = document.createElement("div");
    div.className = "cart-item";
    div.innerHTML = `
      <span>${item} x ${quantity}</span>
      <span>₹${price * quantity}</span>
      <button class="remove-item" data-name="${item}">✖</button>
    `;
    cartItems.appendChild(div);
  }

  cartTotal.textContent = `Total: ₹${total}`;

  // Update cart count in navbar
  const cartCount = document.getElementById("cart-count");
  if (cartCount) {
    cartCount.textContent = itemCount;
  }

  // Save to localStorage
  localStorage.setItem("cart", JSON.stringify(cart));

  // Attach remove button listeners
  document.querySelectorAll(".remove-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const name = btn.getAttribute("data-name");
      delete cart[name];
      updateCartDisplay();
    });
  });
}

// ====== Initialize Add Buttons and Counters ======
function initAddButtons() {
  document.querySelectorAll(".menu-card").forEach(card => {
    const name = card.querySelector(".item-name").textContent;
    const price = parseInt(card.querySelector(".price .offer").textContent.replace(/[^0-9]/g, ""));
    const container = card.querySelector(".item-image");
    let btn;

    // Check if item already in cart → show counter
    if (cart[name] && cart[name].quantity > 0) {
      btn = createCounter(name, price, cart[name].quantity);
    } else {
      btn = createAddButton(name, price);
    }

    container.appendChild(btn);
  });
}

// ====== Create Add Button ======
function createAddButton(name, price) {
  const btn = document.createElement("button");
  btn.className = "add-btn";
  btn.innerHTML = 'ADD <span>+</span>';

  btn.addEventListener("click", () => {
    // Add to cart
    cart[name] = { price, quantity: 1 };
    updateCartDisplay();

    // Replace button with counter
    const counter = createCounter(name, price, 1);
    btn.parentElement.replaceChild(counter, btn);
  });

  return btn;
}

// ====== Create Counter ======
function createCounter(name, price, qty) {
  const counter = document.createElement("div");
  counter.className = "counter";
  counter.innerHTML = `
    <button class="decrease">-</button>
    <span class="quantity">${qty}</span>
    <button class="increase">+</button>
  `;

  const quantitySpan = counter.querySelector(".quantity");

  counter.querySelector(".increase").addEventListener("click", () => {
    qty++;
    cart[name].quantity = qty;
    quantitySpan.textContent = qty;
    updateCartDisplay();
  });

  counter.querySelector(".decrease").addEventListener("click", () => {
    qty--;
    if (qty <= 0) {
      delete cart[name];
      updateCartDisplay();
      const addBtn = createAddButton(name, price);
      counter.parentElement.replaceChild(addBtn, counter);
    } else {
      cart[name].quantity = qty;
      quantitySpan.textContent = qty;
      updateCartDisplay();
    }
  });

  return counter;
}

// ====== Veg/Non-Veg Toggle ======
function initVegNonVegToggle() {
  const vegNonVegToggle = document.getElementById("vegNonVegToggle");
  const cards = document.querySelectorAll(".menu-card");
  if (!vegNonVegToggle || !cards.length) return;

  // Store original display style for each card
  const originalDisplay = Array.from(cards).map(card => window.getComputedStyle(card).display || "flex");

  function applyVegNonVegFilter() {
    cards.forEach((card, i) => {
      const type = card.getAttribute("data-type"); // "veg" or "non-veg"
      if (!vegNonVegToggle.checked) {
        card.style.display = type === "veg" ? originalDisplay[i] : "none";
      } else {
        card.style.display = type === "non-veg" ? originalDisplay[i] : "none";
      }
    });
  }

  vegNonVegToggle.addEventListener("change", applyVegNonVegFilter);
  applyVegNonVegFilter(); // run on page load
}

// ====== DOMContentLoaded ======
window.addEventListener("DOMContentLoaded", () => {
  initAddButtons();
  initVegNonVegToggle();
  updateCartDisplay();

  // ===== Navigate to Burger or Pizza page when clicking food card =====
  document.querySelectorAll('.food-choice').forEach(choice => {
    choice.addEventListener('click', () => {
      const name = choice.getAttribute('data-name').toLowerCase();
      window.location.href = `${name}.html`;
    });
  });

  // ===== Contact Form =====
  const openFormLink = document.getElementById('openFormLink');
  const popupForm = document.getElementById('popupForm');
  const closeFormBtn = document.getElementById('closeForm');
  const thankYouPopup = document.getElementById('thankYouPopup');
  const closeThankYouBtn = document.getElementById('closeThankYou');
  const projectForm = document.getElementById('projectForm');

  function openPopup(popup) {
    popup.classList.add('show');
    popup.style.display = 'flex';
  }

  function closePopup(popup) {
    popup.classList.remove('show');
    setTimeout(() => { popup.style.display = 'none'; }, 500);
  }

  if (openFormLink) {
    openFormLink.addEventListener('click', e => {
      e.preventDefault();
      openPopup(popupForm);
    });
  }

  if (closeFormBtn) closeFormBtn.addEventListener('click', () => closePopup(popupForm));
  if (closeThankYouBtn) closeThankYouBtn.addEventListener('click', () => closePopup(thankYouPopup));

  window.addEventListener('click', e => {
    if (e.target === popupForm) closePopup(popupForm);
    if (e.target === thankYouPopup) closePopup(thankYouPopup);
  });

  if (projectForm) {
    projectForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const formData = new FormData(this);

      fetch(this.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      })
      .then(response => {
        if (response.ok) {
          closePopup(popupForm);
          openPopup(thankYouPopup);
          projectForm.reset();
        } else {
          alert('Oops! Something went wrong. Please try again.');
        }
      })
      .catch(error => {
        alert('Oops! Something went wrong. Please try again.');
        console.error(error);
      });
    });
  }

  // ===== Cart Icon Toggle =====
  const cartPopup = document.getElementById('cart-popup');
  const closeCartBtn = document.querySelector('#cart-popup .close-btn');
  const cartIcon = document.getElementById('cartIcon');

  if (cartIcon) {
    cartIcon.addEventListener('click', () => {
      cartPopup.classList.toggle('show');
    });
  }

  if (closeCartBtn) {
    closeCartBtn.addEventListener('click', () => {
      cartPopup.classList.remove('show');
    });
  }
});


// ===== Checkout Modal =====
const checkoutModal = document.getElementById("checkoutModal");
const closeCheckout = document.getElementById("closeCheckout");
const confirmPayment = document.getElementById("confirmPayment");
const paymentSelect = document.getElementById("paymentSelect");
const paymentDetails = document.getElementById("paymentDetails");

// Open modal when clicking "Proceed to Pay"
document.querySelectorAll(".checkout-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.getElementById("cart-popup").classList.remove("show");
    checkoutModal.style.display = "flex";
  });
});

// Close modal
if (closeCheckout) {
  closeCheckout.addEventListener("click", () => {
    checkoutModal.style.display = "none";
    paymentDetails.innerHTML = "";
    paymentSelect.value = "";
  });
}

// Handle payment method change
if (paymentSelect) {
  paymentSelect.addEventListener("change", () => {
    const method = paymentSelect.value;
    let html = "";

    if (method === "upi") {
      html = `
        <p>Scan this QR with your UPI App:</p>
        <div class="qr-box">
          <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=demo@upi&pn=FoodOrder" alt="UPI QR">
        </div>
      `;
    } else if (method === "card") {
      html = `
        <label for="bankSelect">Choose Your Bank:</label>
        <select id="bankSelect">
          <option>HDFC Bank</option>
          <option>SBI</option>
          <option>ICICI</option>
          <option>Axis Bank</option>
        </select>
      `;
    } else if (method === "cod") {
      html = `<p>You selected <strong>Cash on Delivery</strong>. Pay when you receive your order.</p>`;
    }

    paymentDetails.innerHTML = html;
  });
}

// ===== Payment Success Popup =====
const paymentSuccess = document.getElementById("paymentSuccess");
const closePaymentSuccess = document.getElementById("closePaymentSuccess");

if (closePaymentSuccess) {
  closePaymentSuccess.addEventListener("click", () => {
    paymentSuccess.classList.remove("show");
    setTimeout(() => { paymentSuccess.style.display = "none"; }, 400);
  });
}

if (confirmPayment) {
  confirmPayment.addEventListener("click", () => {
    const method = paymentSelect.value;
    if (!method) {
      alert("Please select a payment method!");
      return;
    }

    checkoutModal.style.display = "none";
    paymentDetails.innerHTML = "";
    paymentSelect.value = "";

    // Show success popup
    paymentSuccess.style.display = "flex";
    paymentSuccess.classList.add("show");

    // Reset cart
    cart = {};
    updateCartDisplay();
  });
}
