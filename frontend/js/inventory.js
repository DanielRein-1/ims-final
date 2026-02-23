const API_URL = "http://127.0.0.1:8000/api/parts"; 

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    if (role !== "ADMIN") {
        const addBtn = document.getElementById("addPartBtn");
        if (addBtn) addBtn.style.display = "none";
    }

    loadInventory();
    
    document.getElementById("inventorySearch")?.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase();
        document.querySelectorAll("#inventoryTableBody tr").forEach(row => {
            row.style.display = row.innerText.toLowerCase().includes(term) ? "" : "none";
        });
    });

    document.getElementById("editPartForm")?.addEventListener("submit", updatePart);
    document.getElementById("partForm")?.addEventListener("submit", createPart);
});

async function loadInventory() {
    const token = localStorage.getItem("token");
    if (!token) window.location.href = "login.html";

    try {
        const res = await fetch(API_URL + "/", { 
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {
            const parts = await res.json();
            const tbody = document.getElementById("inventoryTableBody");
            const role = localStorage.getItem("role");
            
            tbody.innerHTML = parts.map(p => {
                let actions = '<span class="text-xs text-gray-400">View Only</span>';
                if (role === "ADMIN") {
                    const partSafe = JSON.stringify(p).replace(/"/g, '&quot;');
                    actions = `
                        <div class="flex gap-2">
                            <button onclick="openEditModal(${partSafe})" class="p-2 hover:bg-gray-100 rounded transition">
                                <img src="../assets/icons/pencil.svg" class="w-4 h-4">
                            </button>
                            <button onclick="deletePart(${p.id})" class="p-2 hover:bg-red-50 rounded transition">
                                <img src="../assets/icons/trash.svg" class="w-4 h-4">
                            </button>
                        </div>
                    `;
                }

                return `
                <tr class="border-b hover:bg-slate-50 transition group">
                    <td class="p-4 text-xs font-mono text-slate-400">#${p.id}</td>
                    <td class="p-4 font-bold text-blue-600 uppercase text-xs tracking-wider">${p.category || 'Universal'}</td>
                    <td class="p-4 font-bold text-slate-700">${p.name}</td>
                    <td class="p-4 text-xs font-mono">${p.sku}</td>
                    <td class="p-4 font-bold text-slate-700">KES ${p.price.toLocaleString()}</td>
                    <td class="p-4">
                        <span class="${p.quantity < 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'} px-2 py-1 rounded text-xs font-bold">
                            ${p.quantity} Units
                        </span>
                    </td>
                    <td class="p-4">${actions}</td>
                </tr>`;
            }).join('');
        }
    } catch (err) { console.error(err); }
}

async function createPart(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = {
        name: document.getElementById("name").value,
        category: document.getElementById("category").value, // NEW CATEGORY BINDING
        sku: document.getElementById("sku").value,
        price: parseFloat(document.getElementById("price").value),
        quantity: parseInt(document.getElementById("quantity").value)
    };

    const res = await fetch(API_URL + "/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    });
    if(res.ok) { toggleModal(); loadInventory(); }
}

async function updatePart(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const id = document.getElementById("edit_id").value;
    const data = {
        name: document.getElementById("edit_name").value,
        category: document.getElementById("edit_category").value, // NEW CATEGORY BINDING
        sku: document.getElementById("edit_sku").value,
        price: parseFloat(document.getElementById("edit_price").value),
        quantity: parseInt(document.getElementById("edit_quantity").value)
    };

    const res = await fetch(`${API_URL}/${id}`, { 
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    });

    if (res.ok) { closeEditModal(); loadInventory(); }
    else { alert("Update failed. Ensure you are Admin."); }
}

async function deletePart(id) {
    if(!confirm("Are you sure?")) return;
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: { "Authorization": "Bearer " + token }
    });
    if(res.ok) loadInventory();
}

function toggleModal() { document.getElementById("partModal").classList.toggle("hidden"); }
function closeEditModal() { document.getElementById("editModal").classList.add("hidden"); }

window.openEditModal = function(part) {
    document.getElementById("edit_id").value = part.id;
    document.getElementById("edit_name").value = part.name;
    document.getElementById("edit_category").value = part.category || "Universal"; // NEW CATEGORY BINDING
    document.getElementById("edit_sku").value = part.sku;
    document.getElementById("edit_price").value = part.price;
    document.getElementById("edit_quantity").value = part.quantity;
    document.getElementById("editModal").classList.remove("hidden");
}