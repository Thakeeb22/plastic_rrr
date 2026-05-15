const API_URL = "https://plastic-rrr-store.onrender.com";
const cartContainer = document.querySelector(".cart-container");
const cartTotal = document.getElementById("cartTotal");
const checkOutBtn = document.getElementById("checkoutBtn");

const token = localStorage.getItem("userToken");
const user = JSON.parse(localStorage.getItem("userData"));
if (!token || !user) {
  window.location.href = "login.html";
}

let cart = JSON.parse(localStorage.getItem("cart")) || [];
function loadCart() {
  cartContainer.innerHTML = "";
  if (cart.length === 0) {
    cartContainer.innerHTML = `<p class="empty-cart">Your cart is empty</p>`;
    cartTotal.textContent = "Total: 0 Points";
  }
  let total = 0;
  cart.forEach((item, index) => {
    total += Number(item.points || 0);
    cartContainer.innerHTML += `
    <div>
    <img src="${item.image}" alt="${item.name}" />
    <div>
    <h3>${item.name}</h3>
    <p>${item.points} Points</p>
    </div>
    <button onclick="removeItem(${index})">Remove</button>
    </div>
    `;
  });
  cartTotal.textContent = `Tota: ${total} Points`;
}
loadCart();
function removeItem() {
  cart.splic(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}
checkOutBtn.addEventListener("click", checkout);
async function checkout() {
  try {
    if (cart.length === 0) {
      alert("Cart is empty");
      return;
    }
    const storedUser = JSON.parse(localStorage.getItem("userData"));
    if (!storedUser || !token) {
      alert("Please login first");
      window.location.href = "login.html";
      return;
    }
    checkOutBtn.disabled = true;
    checkOutBtn.textContent = "Processing...";
    const response = await fetch(`${API_URL}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: storedUser._id,
        cart,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.message || "Checkout failed");
      checkOutBtn.disabled = false;
      checkOutBtn.textContent = "Checkout";
      return;
    }
    const totalCartPoints = cart.reduce(
      (total, item) => total + Number(item.points || 0),
      0,
    );
    storedUser.points = (storedUser.points || 0) - totalCartPoints;
    localStorage.setItem("userData", JSON.stringify(storedUser));
    localStorage.removeItem("cart");
    alert("Order placed successfully");
    window.location.href = "success.html";
  } catch (error) {
    console.log(error);
    alert("Checkout failed");
    checkOutBtn.disabled = false;
    checkOutBtn.textContent = "Checkout";
  }
}
window.removeItem = removeItem;
