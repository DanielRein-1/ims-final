const API_URL = "http://127.0.0.1:8000/api/orders/";
const PARTS_URL = "http://127.0.0.1:8000/api/parts/";

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
    setupModalData();
    // Use the correct form ID
    document.getElementById("orderForm")?.addEventListener("submit", createSale);
});

async function setupModalData() {
    const token = localStorage.getItem("token");
    const partSelect = document.getElementById("part_id");
    if(!partSelect) return;

    try {
        const res = await fetch(PARTS_URL, { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            const parts = await res.json();
            partSelect.innerHTML = parts.map(p => `<option value="${p.id}">${p.name} (KES ${p.price})</option>`).join('');
        }
    } catch (err) { console.error("Modal Data Error:", err); }
}

async function loadOrders() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            const orders = await res.json();
            const tbody = document.getElementById("ordersTableBody");
            if(!tbody) return;
            
            tbody.innerHTML = orders.map(o => {
                const dateObj = new Date(o.created_at);
                const dateStr = dateObj.toLocaleDateString();
                const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                const partName = o.part ? o.part.name : `Part #${o.part_id}`;

                return `
                <tr class="border-b hover:bg-slate-50 transition text-sm">
                    <td class="p-4 font-mono text-slate-500">#${o.id}</td>
                    <td class="p-4 font-bold text-slate-700">${partName}</td>
                    <td class="p-4 font-bold">${o.quantity}</td>
                    <td class="p-4 text-green-600 font-bold">KES ${o.total_price.toLocaleString()}</td>
                    <td class="p-4 text-slate-600">${dateStr}</td>
                    <td class="p-4 text-slate-400 text-xs">${timeStr}</td>
                </tr>`;
            }).join('');
        }
    } catch (err) { console.error(err); }
}

async function createSale(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const partId = document.getElementById("part_id").value;
    const qty = document.getElementById("quantity").value;

    const data = {
        part_id: parseInt(partId),
        quantity: parseInt(qty)
    };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    });

    if (res.ok) { 
        toggleModal(); 
        loadOrders(); 
    } else { 
        alert("Transaction Failed: Check Stock Levels"); 
    }
}

// FIXED: Global scope and correct ID 'orderModal'
window.toggleModal = function() { 
    const modal = document.getElementById("orderModal");
    if(modal) modal.classList.toggle("hidden"); 
};
