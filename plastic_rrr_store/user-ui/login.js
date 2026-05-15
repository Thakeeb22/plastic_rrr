const BASE_URL = "https://plastic-rrr-store.onrender.com";
const btn = document.getElementById("login-btn")
btn.addEventListener("click", async () =>{
  const profileCode = document.getElementById("profileCode").value
  const phone = document.getElementById("phoneNumber").value
  if(!profileCode || !phone){
    alert("Please fill all fields")
    return
  }
  btn.textContent = "Logging in..."
  btn.disabled = true
  try{
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method:"POST",
      headers:{
        "Content-Type":"application/json",
      },
      body:JSON.stringify({
        profileCode,
        phone,
      })
    })
    const data = await res.json()
    if(!res.ok){
      alert(data.message || "Login failed")
      return
    }
    localStorage.setItem("userToken", data.token)
    localStorage.setItem("userData", JSON.stringify(data.user))
    alert("Login successful")
    window.location.href = "index.html"
  }catch(err){
    console.log(err)
  }finally{
    btn.textContent = "LOGIN"
    btn.disabled = false
  }
})