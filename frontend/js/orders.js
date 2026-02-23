const API_URL = "http://127.0.0.1:8000/api/orders/";
const PARTS_URL = "http://127.0.0.1:8000/api/parts/";

let allParts = []; // Global store for parts so we can filter them

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
    setupModalData();
    document.getElementById("orderForm")?.addEventListener("submit", createSale);
});

async function setupModalData() {
    const token = localStorage.getItem("token");
    const makeSelect = document.getElementById("make_id");
    if(!makeSelect) return;

    try {
        const res = await fetch(PARTS_URL, { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            allParts = await res.json();
            
            // Extract unique car makes from the parts list
            const uniqueMakes = [...new Set(allParts.map(p => p.category || 'Universal'))];
            
            // Populate Make Dropdown
            makeSelect.innerHTML = uniqueMakes.map(make => `<option value="${make}">${make}</option>`).join('');
            
            // Listen for changes on Make Dropdown to filter Parts Dropdown
            makeSelect.addEventListener("change", filterPartsByMake);
            
            // Trigger the filter immediately to populate the parts for the first Make
            filterPartsByMake();
        }
    } catch (err) { console.error("Modal Data Error:", err); }
}

function filterPartsByMake() {
    const selectedMake = document.getElementById("make_id").value;
    const partSelect = document.getElementById("part_id");
    
    // Filter the global parts array based on the selected make
    const filteredParts = allParts.filter(p => (p.category || 'Universal') === selectedMake);
    
    if (filteredParts.length === 0) {
        partSelect.innerHTML = `<option disabled>No parts found for ${selectedMake}</option>`;
    } else {
        // Populate the Part dropdown (Removed the [Make] tag since they already picked it!)
        partSelect.innerHTML = filteredParts.map(p => 
            `<option value="${p.id}">${p.name} (KES ${p.price})</option>`
        ).join('');
    }
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
                
                const partMake = o.part ? (o.part.category || 'Universal') : 'N/A';
                const partName = o.part ? o.part.name : `Part #${o.part_id}`;

                return `
                <tr class="border-b hover:bg-slate-50 transition text-sm">
                    <td class="p-4 font-mono text-slate-500">#${o.id}</td>
                    <td class="p-4 text-xs font-bold uppercase text-blue-600">${partMake}</td>
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

window.toggleModal = function() { 
    const modal = document.getElementById("orderModal");
    if(modal) modal.classList.toggle("hidden"); 
};