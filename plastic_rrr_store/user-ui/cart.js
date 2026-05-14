const cartContainer = document.querySelector(".cart-container");
const cartTotal = document.getElementById("cartTotal");
const checkOutBtn = document.getElementById("checkoutBtn");
let cart = JSON.parse(localStorage.getItem("cart")) || [];
function loadCart() {
  cartContainer.innerHTML = "";
  if (cart.length === 0) {
    cartContainer.innerHTML = `
    <p class="empty-cart">Your cart is empty</p>
    `;
    cartTotal.textContent = "Total: 0 Points";
    return;
  }
  let total = 0;
  cart.forEach((item, index) => {
    total += item.points;
    cartContainer.innerHTML += `
    <div class="cart-item">

    <img src="${item.image}" alt="${item.name}" />
    <div class="pts-name">
    <div>
    <h3>${item.name}</h3>
    <p>${item.points} Points</p>
    </div>
    <button onclick="removeItem(${index})">Remove</button>
    </div>
    </div>
    `;
  });
  cartTotal.textContent = `Total: ${total} Points`;
}
loadCart();
function removeItem(index) {
  cart.splice(index, 1);
  localStorage.setItem("cart", JSON.stringify(cart));
  loadCart();
}
checkOutBtn.addEventListener("click", checkout);
async function checkout() {
  if (cart.length === 0) {
    alert("cart is empty");
    return;
  }
  try {
    const user = JSON.parse(localStorage.getItem("userData"));
    const response = await fetch("https://plastic-rrr.onrender.com/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId: user._id,
        cart,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.message);
      return;
    }
    alert("Order placed successfully!!!");
    localStorage.removeItem("cart");
    // update users point
    user.points -= cart.reduce((total, item) => total + item.points, 0);
    localStorage.setItem("userData", JSON.stringify(user));
    window.location.href = "success.html";
  } catch (error) {
    alert("Checkout failed");
    console.log(error);
  }
}
