const API_URL = "http://127.0.0.1:8000/api/users/";

document.addEventListener("DOMContentLoaded", () => {
    loadUsers();
    document.getElementById("userForm")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        await createUser();
    });
});

async function loadUsers() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            const users = await res.json();
            const tbody = document.getElementById("usersTableBody");
            if(!tbody) return;
            
            // Notice we are using u.id and u.username here!
            tbody.innerHTML = users.map(u => `
                <tr class="border-b">
                    <td class="p-4 text-slate-400 font-mono text-xs">#${u.id}</td>
                    <td class="p-4 font-bold text-slate-700">${u.username}</td>
                    <td class="p-4 text-blue-600 font-bold uppercase">${u.role}</td>
                    <td class="p-4 flex gap-4">
                        <button onclick="resetPassword(${u.id}, '${u.username}')" class="text-xs font-bold text-orange-500 hover:underline">RESET PASS</button>
                        <button onclick="deleteUser(${u.id}, '${u.username}')" class="text-xs font-bold text-red-500 hover:underline">DELETE</button>
                    </td>
                </tr>`).join('');
        }
    } catch (err) { console.error(err); }
}

async function resetPassword(userId, username) {
    const displayName = (username && username !== 'undefined') ? username : "this user";
    // 1. Prompt the Admin to type a unique temporary password
    const newPassword = prompt(`Enter a new temporary password for ${displayName}:`);

    // 2. If the Admin clicks "Cancel" or leaves it blank, stop the process safely
    if (!newPassword || newPassword.trim() === "") {
        return; 
    }

    // 3. Enforce basic security
    if (newPassword.length < 6) {
        alert("Password must be at least 6 characters for security.");
        return;
    }

    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`http://127.0.0.1:8000/api/users/${userId}/reset-password`, {
            method: "PUT", 
            headers: { 
                "Content-Type": "application/json",
                "Authorization": "Bearer " + token 
            },
            body: JSON.stringify({ new_password: newPassword }) 
        });

        if (res.ok) {
            // Updated to use displayName so the success message is perfect too
            alert(` Success! Password for ${displayName} has been securely changed to: ${newPassword}`);
        } else {
            const errorData = await res.json();
            alert(`Failed: ${errorData.detail || "Could not reset password."}`);
        }
    } catch (err) {
        console.error("Reset Error:", err);
        alert("A system error occurred.");
    }
}

async function deleteUser(id, username) {
    const displayName = username || `ID #${id}`; // Safety fallback
    
    // Now the confirmation popup also shows the name!
    if(!confirm(`Are you sure you want to permanently delete user '${displayName}'?`)) return;
    
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(`${API_URL}${id}`, {
            method: "DELETE",
            headers: { "Authorization": "Bearer " + token }
        });
        
        if(res.ok) {
            // --- LOG THE DELETION WITH THE NAME ---
            const currentLogs = JSON.parse(localStorage.getItem("liveLogs") || "[]");
            currentLogs.unshift({
                time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                type: "SECURITY", 
                desc: `Admin revoked and deleted user account for '${displayName}'`, 
                status: "SUCCESS", 
                color: "text-red-600" 
            });
            localStorage.setItem("liveLogs", JSON.stringify(currentLogs));
            // ------------------------------
            
            loadUsers();
        } else {
            const errorData = await res.json();
            alert(` Action Blocked: ${errorData.detail || "Database constraint prevents deleting this user. They likely have sales records attached."}`);
        }
    } catch (err) {
        console.error("Delete Error:", err);
        alert("System Error: Could not reach the server.");
    }
}
async function createUser() {
    const token = localStorage.getItem("token");
    const userData = {
        username: document.getElementById("username").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value
    };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(userData)
    });

    if (res.ok) { 
        // --- NEW: LOG THE CREATION ---
        const currentLogs = JSON.parse(localStorage.getItem("liveLogs") || "[]");
        currentLogs.unshift({
            time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
            type: "SECURITY", 
            desc: `Admin provisioned a new ${userData.role} account for '${userData.username}'`, 
            status: "SUCCESS", 
            color: "text-green-600"
        });
        localStorage.setItem("liveLogs", JSON.stringify(currentLogs));
        // ------------------------------
        
        location.reload(); 
    } 
    else { 
        alert("Error creating user"); 
    }
}

function toggleModal() { document.getElementById("userModal")?.classList.toggle("hidden"); }