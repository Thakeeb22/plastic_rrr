const token = localStorage.getItem("token");
if (!token && !window.location.href.includes("login.html")) {
  window.location.href = "login.html";
}
const BASE_URL = "https://plastic-rrr.onrender.com";
const REFRESH_INTERVAL = 5000;
const pendingContainer = document.querySelector(".pending");
async function loadPending() {
  if (!pendingContainer) return;
  pendingContainer.innerHTML = "<p>Loading...</p>";
  try {
    const res = await fetch(`${BASE_URL}/admin/pending`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    renderPending(data);
  } catch (err) {
    pendingContainer.innerHTML = "<p>Error loading data</p>";
  }
}
function renderPending(data) {
  if (data.length === 0) {
    pendingContainer.innerHTML = "<p>No pending submissions</p>";
    return;
  }
  pendingContainer.innerHTML = "";
  data.forEach((item) => {
    const card = document.createElement("div");
    card.classList.add("pending-card");
    card.innerHTML = `
        <h2>Profile Code: ${item.profileCode}</h2>
        <h3>Phone Number: ${item.phone}</h3>
        <small>Submitted Weight: ${item.userWeight}kg</small>
        <small>Date/Time: ${new Date(item.createdAt).toLocaleString()}</small>
        <div class="btns">
        <button class="approve" data-id="${item._id}">Approve</button>
        <button class="reject" data-id="${item._id}">Reject</button>  
        </div>
        `;
    pendingContainer.appendChild(card);
  });
}
// loadPending();
document.addEventListener("click", async (e) => {
  if (e.target.classList.contains("approve")) {
    const id = e.target.dataset.id;
    if (confirm("Approve this submission?")) {
      await handleAction(id, "approve");
    }
  }
  if (e.target.classList.contains("reject")) {
    const id = e.target.dataset.id;
    if (confirm("Reject this submission?")) {
      await handleAction(id, "reject");
    }
  }
});
async function handleAction(id, action) {
  try {
    const res = await fetch(`${BASE_URL}/admin/${action}/${id}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.success) {
      loadPending();
    }
  } catch (err) {
    console.error(err);
  }
}
const table = document.querySelector("table");
async function loadHistory() {
  if(!table) return
  table.innerHTML = `<tr><td colspan="5">Loading...</td></tr>`;
  try {
    const res = await fetch(`${BASE_URL}/admin/history`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    renderHistory(data);
  } catch (err) {
    table.innerHTML = `<tr><td colspan="5">Error loading data</td></tr>`;
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
  if (data.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `<td colspan="5">No history available</td>`;
    table.appendChild(row);
    return;
  }
  data.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${item.profileCode}</td>
        <td>${item.phone}</td>
        <td>${item.userWeight}</td>
        <td>${new Date(item.createdAt).toLocaleString()}</td>
        <td><span class="status ${item.status.toLowerCase()}">${item.status}</span></td>
        `;
    table.appendChild(row);
  });
}
if (pendingContainer) {
  loadPending();
  setInterval(loadPending, REFRESH_INTERVAL);
}
if (table) {
  loadHistory();
  setInterval(loadHistory, REFRESH_INTERVAL);
}
document.getElementById("logout")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  window.location.href = "login.html";
});
