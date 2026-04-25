const BASE_URL = "https://plastic-rrr.onrender.com";
const btn = document.getElementById("loginBtn")
const error = document.getElementById("error")
btn.addEventListener("click", async ()=>{
    const username = document.getElementById("username").value
    const password = document.getElementById("password").value
    try{
        const res = await fetch(`${BASE_URL}/admin/login`, {
            method ="POST",
            headers:{
                "Content-Type":"application/json",
            },
            body: JSON.stringify({username, password}),
        })
        const data = await res.json()
        if(data.success){
            localStorage.setItem("token", data.token)
            window.location.herf = "index.html"
        }else{
            error.textContent = "Invalid credentials"
        }
    }catch(err){
        error.textContent = "Server error"
    }
})