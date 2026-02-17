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
            tbody.innerHTML = users.map(u => `
                <tr class="border-b">
                    <td class="p-4 text-slate-400 font-mono text-xs">#${u.id}</td>
                    <td class="p-4 font-bold text-slate-700">${u.username}</td>
                    <td class="p-4 text-blue-600 font-bold uppercase">${u.role}</td>
                    <td class="p-4 flex gap-4">
                        <button onclick="resetPassword(${u.id})" class="text-xs font-bold text-orange-500 hover:underline">RESET PASS</button>
                        <button onclick="deleteUser(${u.id})" class="text-xs font-bold text-red-500 hover:underline">DELETE</button>
                    </td>
                </tr>`).join('');
        }
    } catch (err) { console.error(err); }
}

async function resetPassword(id) {
    if(!confirm("Reset this user's password to '123456'?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${id}/reset`, {
        method: "POST",
        headers: { "Authorization": "Bearer " + token }
    });
    if (res.ok) alert("Password reset to: 123456");
}

async function deleteUser(id) {
    if(!confirm("Delete this user?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });
    if(res.ok) loadUsers();
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

    if (res.ok) { location.reload(); } 
    else { alert("Error creating user"); }
}

function toggleModal() { document.getElementById("userModal")?.classList.toggle("hidden"); }
