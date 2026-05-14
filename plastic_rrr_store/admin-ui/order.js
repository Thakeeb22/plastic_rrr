const token = localStorage.getItem("adminToken")
if(!token){
    window.location.href = "login.html"
}
document.querySelectorAll(".deliver-btn").forEach((btn) =>{
    btn.addEventListener("click", () =>{
        const status = btn.closest("tr").querySelector(".status")
        status.textContent = "Delivered"
        status.classList.remove("pending")
        status.classList.add("delivered")
    })
})
document.querySelectorAll(".delete-btn").forEach((btn) =>{
    btn.addEventListener("click", ()=>{
        btn.closest("tr").remove()
    })
})
document.getElementById("logOut").addEventListener("click", () =>{
    localStorage.removeItem("adminToken")
    window.location.href = "login.html"
})