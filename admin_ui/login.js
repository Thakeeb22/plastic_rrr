btn.addEventListener("click", async () => {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  btn.textContent = "Logging in...";
  btn.disabled = true;
  error.textContent = ""; // clear previous errors

  try {
    const res = await fetch(`${BASE_URL}/admin/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (data.success) {
      localStorage.setItem("token", data.token);
      window.location.href = "index.html";
    } else {
      error.textContent = "Invalid credentials";
    }
  } catch (err) {
    error.textContent = "Server error";
  } finally {
    // ALWAYS runs
    btn.textContent = "Login";
    btn.disabled = false;
  }
});