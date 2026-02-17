const API_URL = "http://127.0.0.1:8000/api/suppliers";

document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    
    // LOGIC for the new Button ID
    const addBtn = document.getElementById("btnForceAdd");
    
    if (role && role.toUpperCase() !== "ADMIN") {
        if(addBtn) addBtn.style.display = "none"; // Hide if Staff
    } else {
        if(addBtn) addBtn.style.display = "flex"; // Show if Admin
    }

    loadSuppliers();
    document.getElementById("supplierForm")?.addEventListener("submit", createSupplier);
    document.getElementById("editSupplierForm")?.addEventListener("submit", updateSupplier);
});

async function loadSuppliers() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    try {
        const res = await fetch(API_URL + "/", { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            const suppliers = await res.json();
            const tbody = document.getElementById("suppliersTableBody");
            
            tbody.innerHTML = suppliers.map(s => {
                let actions = '<span class="text-xs text-slate-400">View Only</span>';
                
                if (role && role.toUpperCase() === "ADMIN") {
                    const sData = JSON.stringify(s).replace(/"/g, '&quot;');
                    actions = `
                        <div class="flex gap-2">
                            <button onclick="openEditModal(${sData})" class="p-2 hover:bg-blue-50 rounded transition" title="Edit">
                                <img src="../assets/icons/pencil.svg" class="w-4 h-4">
                            </button>
                            <button onclick="deleteSupplier(${s.id})" class="p-2 hover:bg-red-50 rounded transition" title="Delete">
                                <img src="../assets/icons/trash.svg" class="w-4 h-4">
                            </button>
                        </div>
                    `;
                }

                // Direct Gmail Link
                const emailLink = `<a href="https://mail.google.com/mail/?view=cm&fs=1&to=${s.email}" target="_blank" class="text-blue-600 hover:underline font-bold">${s.email}</a>`;

                return `
                <tr class="border-b hover:bg-slate-50 transition">
                    <td class="p-4 font-bold text-slate-700">${s.name}</td>
                    <td class="p-4 text-slate-600">${s.contact_person || '-'}</td>
                    <td class="p-4">${emailLink}</td>
                    <td class="p-4 text-slate-600 font-mono text-xs">${s.phone}</td>
                    <td class="p-4">${actions}</td>
                </tr>`;
            }).join('');
        }
    } catch (err) { console.error(err); }
}

async function createSupplier(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const data = {
        name: document.getElementById("name").value,
        contact_person: document.getElementById("contact_person").value,
        email: document.getElementById("email").value,
        phone: document.getElementById("phone").value
    };
    
    try {
        const res = await fetch(API_URL + "/", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify(data)
        });
        
        if (res.ok) { 
            toggleModal(); 
            loadSuppliers(); 
            e.target.reset(); 
        } else {
            alert("Error: Check fields (Email must be unique).");
        }
    } catch (err) { console.error(err); }
}

function openEditModal(s) {
    document.getElementById("edit_id").value = s.id;
    document.getElementById("edit_name").value = s.name;
    document.getElementById("edit_contact_person").value = s.contact_person;
    document.getElementById("edit_email").value = s.email;
    document.getElementById("edit_phone").value = s.phone;
    document.getElementById("editSupplierModal").classList.remove("hidden");
}

function closeEditModal() {
    document.getElementById("editSupplierModal").classList.add("hidden");
}

async function updateSupplier(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const id = document.getElementById("edit_id").value;
    const data = {
        name: document.getElementById("edit_name").value,
        contact_person: document.getElementById("edit_contact_person").value,
        email: document.getElementById("edit_email").value,
        phone: document.getElementById("edit_phone").value
    };

    const res = await fetch(`${API_URL}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    });

    if (res.ok) { closeEditModal(); loadSuppliers(); }
    else { alert("Update failed"); }
}

async function deleteSupplier(id) {
    if(!confirm("Are you sure?")) return;
    const token = localStorage.getItem("token");
    await fetch(`${API_URL}/${id}`, { method: "DELETE", headers: { "Authorization": "Bearer " + token }});
    loadSuppliers();
}

window.toggleModal = function() { 
    document.getElementById("supplierModal").classList.toggle("hidden"); 
};
