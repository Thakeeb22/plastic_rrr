const cartContainer = document.querySelector(".cart-container");
const cartTotal = document.getElementById("cartTotal");
const checkOutBtn = document.getElementById("checkoutBtn");
const API_URL = "https://plastic-rrr-store.onrender.com";
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
async function checkout(){
  try{
    if(cart.length === 0){
      alert("Cart is empty")
      return
    }
    const user = JSON.parse(localStorage.getItem("userdata"))
    if(!user){
      alert("Please login first!!!!")
      window.location.href = "login.html"
      return
    }
    checkOutBtn.disabled = true
    checkOutBtn.textContent = "Processing...."
    const response = await fetch(`${API_URL}/api/orders`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        userId: user._id,
        cart,
      })
    })
    const data = await response.json()
    if(!response.ok){
      alert(data.message)
      checkOutBtn.disabled = false
      checkOutBtn.textContent = "Checkout"
      return
    }
    // update local user points
    const totalCartPoints = cart.reduce(
      (total, item)=>total + item.points, 0
    )
    user.points -= totalCartPoints
    localStorage.setItem("userData", JSON.stringify(user))
    // clear cart
    localStorage.removeItem("cart")
    alert("Order placed successfully")
    window.location.href = "success.html"
  }catch (error){
    console.log(error)
    alert("Checkout failed!!!")
    checkOutBtn.disabled=false
    checkOutBtn.textContent = "Checkout"
  }
}
