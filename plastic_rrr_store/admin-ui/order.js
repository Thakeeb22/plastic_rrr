const API_URL = "https://plastic-rrr-store.onrender.com"
const token = localStorage.getItem("adminToken")
if(!token){
    window.location.href = "login.html"
}
const ordersTableBody =document.getElementById("ordersTableBody")
async function loadOrders(){
    try{
        const response = await fetch(`${API_URL}/api/orders`)
        const orders = await response.json()
        ordersTableBody.innerHTML=""
        orders.forEach((order) =>{
            const products = order.products.map((item) => item.product?.name || "Deleted Product").join(", ")
            ordersTableBody.innerHTML +=`
            <tr>
            <td>
            <div class="user-info">
            <h4>${order.user?.name || "Unknown"}</h4>
            <p>${order.user?.phone || "No Phone"}</p>
            </div>
            </td>
            <td>${order.user?.profileCode || "N/A"}</td>
            <td>${products}</td>
            <td>${order.totalPoints}</td>
            <td>
            ${new Date(order.createdAt).toLocaleDateString()}</td>
            <td>
            <span class="status pending">${order.status}</span>
            </td>
            <td>
            <button class="deliver-btn" onclick="markDelivered('${order._id}')">Deliver</button>
            </td>
            </tr>
            `
        })
    }catch(error){
        console.log(error)
        alert("Failed to load orders")
    }
}
loadOrders()
async function markDelivered(id){
    try{
        const response = await fetch(
            `${API_URL}/api/orders/${id}`,
            {
                method:"PATCH",
                headers:{
                    "Content-Type":"application/json"
                }
            }
        )
        const data = await response.json()
        if(!response.ok){
            alert(data.message || "Failed to update order")
            return
        }
        alert("order marked as delivered")
        loadOrders()
    }catch(error){
        console.log(error)
        alert("Error updating order")
    }
}
document.getElementById("logOut").addEventListener("click",()=>{
    localStorage.removeItem("adminToken")
    window.location.href ="login.html"
})