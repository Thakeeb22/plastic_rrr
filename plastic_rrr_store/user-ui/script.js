const token = localStorage.getItem("userToken");
if (!token) {
  window.location.href = "login.html";
}
const user = JSON.parse(localStorage.getItem("userData"));
document.getElementById("welcomeUser").textContent =
  `Welcome back, ${user.name}`;
document.getElementById("userPoints").textContent = `${user.points} pts`;
const productContainer = document.getElementById("productContainer");
const cartCount = document.getElementById("cartCount");

function updateCartCount() {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  cartCount.textContent = cart.length;
}

updateCartCount();
// load products

async function loadProducts() {
  try{
    const response = await fetch("https://plastic-rrr-store.onrender.com/api/products")
    const products = await response.json()
    productContainer.innerHTML = ""
    products.forEach((product) =>{
      productContainer.innerHTML +=`
      <div class="products-card">
      <img src="${product.image}" alt="${product.name}" />
      <h3>${product.name}</h3>
      <p>${product.points} Points</p>
      <button onclick="addToCart('$product._id')">Add to Cart</button></div>
      `
    })
    window.allProducts = products
  }catch(error){
    console.log(error)
  }
}
loadProducts();
function addToCart(id){
  const product = window.allProducts.find((p) => p._id === id)
  let cart = JSON.parse(localStorage.getItem("cart")) || []
  cart.push(product)
  localStorage.setItem("cart", JSON.stringify(cart))
  alert(`${product.name} added to cart`)
}
document.querySelector(".logout-btn").addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});
document.querySelector(".cart-btn").addEventListener("click", () => {
  window.location.href = "cart.html";
});
