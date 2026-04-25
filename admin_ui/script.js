const BASE_URL = "https://plastic-rrr.onrender.com";

const pendingContainer = document.querySelector(".pending");
async function loadPending() {
    pendingContainer.innerHTML = "<p>Loading...</p>"
  try {
    const res = await fetch("https://plastic-rrr.onrender.com/admin/pending");
    const data = await res.json();
    renderPending(data);
  } catch (err) {
    pendingContainer.innerHTML = "<p>Error loading data</p>"
  }
}
function renderPending(data) {
    if(data.length === 0){
        pendingContainer.innerHTML = "<p>No pending submissions</p>"
    }
  pendingContainer.innerHTML = "";
  data.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("pending-card");
    card.innerHTML = `
        <h2>Profile Code: ${item.profileCode}</h2>
        <h3>Phone Number: ${item.phone}</h3>
        <small>Submitted Weight: ${item.weight}kg</small>
        <small>Date/Time: ${new Date(item.createdAt).toLocaleString()}</small>
        <div class="btns">
        <button class="approve" data-id="${item.id}">Approve</button>
        <button class="reject" data-id="${item.id}">Reject</button>
        </div>
        `;
    pendingContainer.appendChild(card);
  });
}
// loadPending();
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("approve")) {
    const id = e.target.dataset.id;
    await handleAction(id, "approve");
  }
  if (e.target.classList.contains("reject")) {
    const id = e.target.dataset.id;
    await handleAction(id, "reject");
  }
});
async function handleAction(id, action) {
  try {
    const res = await fetch(`${BASE_URL}/admin/${action}/${id}`, {
      method: "POST",
    });
    const data = await res.json();
    if (data.success) {
      loadPending();
    }
  } catch (err) {
    console.error(`${action} error:`, err);
  }
}
const table = document.querySelector("table");
async function loadHistory() {
  try {
    const res = await fetch("https://plastic-rrr.onrender.com/admin/history");
    const data = await res.json();
    renderHistory(data);
  } catch (err) {
    console.error("Error loading history:", err);
  }
}
function renderHistory(data) {
  table.innerHTML = `
    <tr>
    <th>Profile Code</th>
    <th>Contact</th>
    <th>Weight(KG)</th>
    <th>Time Stamp</th>
    <th>Status</th>
    </tr>
    `;
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.profileCode}</td>
        <td>${item.phone}</td>
        <td>${item.weight}</td>
        <td>${new Date(item.createdAt).toLocaleString()}</td>
        <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
        `;
    table.appendChild(row);
  });
}
if (pendingContainer) {
  loadPending();
}
if (table) {
  loadHistory();
}
if(e.target.classList.contains("approve")){
    const id = e.target.dataset.id
    if(confirm("Approve this submission?")){
        await handleAction(id, "approve")
    }
}