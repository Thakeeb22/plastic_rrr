const loginBtn = document.getElementById("login-btn");
loginBtn.addEventListener("click", (e) => {
  e.preventDefault();
  const profileCode = document.querySelector(`input[type="text"]`).value;
  const phone = document.querySelector(`input[type="tel"]`).value;
  if (!profileCode || !phone) {
    alert("Please fill all fields");
    return;
  }
  localStorage.setItem("userData", JSON.stringify(user));
  localStorage.setItem("userToken", "sample_token");
  window.location.href = "index.html";
});
