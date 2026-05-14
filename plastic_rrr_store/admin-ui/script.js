const token = localStorage.getItem("adminToken");
if (!token) {
  window.location.href = "login.html";
}
const logoutBtn = document.getElementById("logOut");
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("adminToken");
  window.location.href = "login.html";
});
const form = document.querySelector(".form");
const table = document.querySelector(".table");
form.addEventListener("submit", (e) => {
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
  const row = `
    <td>${points}</td>
    <td>${stock}</td>
    <td>
    <i class="fa-solid fa-pen-to-square"></i> 
    <i class="fa-solid fa-trash-can delete"></i>
    </td>
    `;
  table.innerHTML += row;
  form.reset();
});
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("delete")) {
    e.target.closest("tr").remove();
  }
});
