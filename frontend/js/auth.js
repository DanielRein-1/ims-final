const API_URL = "http://127.0.0.1:8000/api/auth";

document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const errorMsg = document.getElementById("errorMsg");

    try {
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);

        const response = await fetch(`${API_URL}/token`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData,
        });

        if (response.ok) {
            const data = await response.json();
            
            // 1. Save Credentials
            localStorage.setItem("token", data.access_token);
            localStorage.setItem("role", data.role);
            localStorage.setItem("username", username); // Save name for navbar

            // 2. INTELLIGENT REDIRECT
            if (data.role === "ADMIN") {
                window.location.href = "dashboard.html";
            } else {
                window.location.href = "orders.html";
            }
        } else {
            // SAFE FALLBACK
            if (errorMsg) {
                errorMsg.classList.remove("hidden");
                errorMsg.innerText = "Invalid credentials. Try again.";
            } else {
                alert("Login Failed: Incorrect username or password.");
            }
            document.getElementById("password").value = ""; 

            // --- NEW: LOG THE FAILED ATTEMPT FOR THE DEMO ---
            const currentLogs = JSON.parse(localStorage.getItem("liveLogs") || "[]");
            currentLogs.unshift({
                time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                type: "AUTH", 
                desc: `Failed login attempt for username '${username}'`, 
                status: "BLOCKED", 
                color: "text-red-500"
            });
            localStorage.setItem("liveLogs", JSON.stringify(currentLogs));
            // ------------------------------------------------
        }
    } catch (error) {
        if (errorMsg) {
            errorMsg.classList.remove("hidden");
            errorMsg.innerText = "Server error. Is backend running?";
        } else {
            alert("Server error. Is the backend running?");
        }
    }
});