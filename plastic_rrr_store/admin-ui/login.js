const loginBtn = document.getElementById("login-btn");

loginBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  if (!profileCode || !phone) {
    alert("Please fill all fields");
    return;
  }

  try {
    const response = await fetch(
      "https://plastic-rrr-store.onrender.com/api/auth/login",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      alert(data.message);
      return;
    }

    localStorage.setItem("userToken", data.token);
    localStorage.setItem("userData", JSON.stringify(data.user));

    alert("Login Successful");

    window.location.href = "index.html";

  } catch (error) {
    console.log(error);

    alert("Server Error");
  }
});