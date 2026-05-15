const { response } = require("express");

const API_URL = "https://plastic-rrr-store.onrender.com";
const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "login.html";
}
const logOutBtn = document.getElementById("logOut");
const form = document.querySelector(".form");
const table = document.querySelector(".table");
logOutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
});
async function loadProducts() {
  try {
    const response = await fetch(`${API_URL}/api/products`);
    const products = await response.json();
    table.innerHTML = `
    <tr>
    <th>Product</th>
    <th>Points</th>
    <th>Stock</th>
    <th>Actions</th>
    </tr>
    `;
    products.forEach((product) => {
      table.innerHTML += `
      <tr>
      <td>
        <span>
          <img src="${product.image}" alt="${product.name}" />
          <p>${product.name}</p>
        </span>
      </td>
      <td>${product.points}</td>
      <td>${product.stock}</td>
      <i class="fa-solid fa-trash delete" onClick="deleteProduct('${product._id}')"></i>
    </tr>
      `;
    });
  } catch (error) {
    console.log(error);
    alert("Failed to load products");
  }
}
loadProducts();
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  const inputs = form.querySelectorAll("input");
  const name = inputs[0].value;
  const points = inputs[1].value;
  const stock = inputs[2].value;
  const image = inputs[3].value;
  if (!name || !points || !stock || !image) {
    alert("Please fill all fields");
    return;
  }
  try {
    const response = fetch(`${API_URL}/api/products`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        points,
        stock,
        image,
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      alert("data.message");
      return;
    }
    alert("Product added successfully");
    form.reset();
    loadProducts();
  } catch (error) {
    console.log(error);
    alert("Failed to add product");
  }
});
async function deleteProduct(id) {
  try {
    const response = await fetch(`${API_URL}/api/products/${id}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!response.ok) {
      alert(data.message);
      return;
    }
    alert("Product deleted successfully");
    loadProducts();
  } catch (error) {
    console.log(error);
    alert("Delete failed");
  }
}
