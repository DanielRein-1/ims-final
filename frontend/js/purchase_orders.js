if (localStorage.getItem("role") !== "ADMIN") window.location.href = "orders.html";
const API_URL = "http://127.0.0.1:8000/api/purchase-orders/";
const SUPPLIERS_URL = "http://127.0.0.1:8000/api/suppliers/";
const PARTS_URL = "http://127.0.0.1:8000/api/parts/";

let allParts = []; // Global store for filtering

document.addEventListener("DOMContentLoaded", () => {
    loadPO();
    setupModalData();
    document.getElementById("poForm")?.addEventListener("submit", createPO);
});

async function setupModalData() {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
        // Load Suppliers
        const supRes = await fetch(SUPPLIERS_URL, { headers: { "Authorization": "Bearer " + token }});
        if (supRes.ok) {
            const suppliers = await supRes.json();
            document.getElementById("supplierSelect").innerHTML = suppliers.map(s => 
                `<option value="${s.id}">${s.name}</option>`
            ).join('');
        }

        // Load Parts and Setup Make Filter
        const partRes = await fetch(PARTS_URL, { headers: { "Authorization": "Bearer " + token }});
        if (partRes.ok) {
            allParts = await partRes.json();
            
            const uniqueMakes = [...new Set(allParts.map(p => p.category || 'Universal'))];
            const makeSelect = document.getElementById("makeSelect");
            
            makeSelect.innerHTML = uniqueMakes.map(m => `<option value="${m}">${m}</option>`).join('');
            makeSelect.addEventListener("change", filterPartsByMake);
            
            filterPartsByMake(); // Initial load
        }
    } catch (err) { console.error("Dropdown Error:", err); }
}

function filterPartsByMake() {
    const selectedMake = document.getElementById("makeSelect").value;
    const partSelect = document.getElementById("partSelect");
    
    const filteredParts = allParts.filter(p => (p.category || 'Universal') === selectedMake);
    
    if (filteredParts.length === 0) {
        partSelect.innerHTML = `<option disabled>No parts found for ${selectedMake}</option>`;
    } else {
        partSelect.innerHTML = filteredParts.map(p => 
            `<option value="${p.id}">${p.name} (Current Stock: ${p.quantity})</option>`
        ).join('');
    }
}

async function loadPO() {
    const token = localStorage.getItem("token");
    if (!token) { window.location.href = "login.html"; return; }

    try {
        const response = await fetch(API_URL, { headers: { "Authorization": "Bearer " + token }});
        if (response.ok) {
            const pos = await response.json();
            const tbody = document.getElementById("poTableBody");
            
            if (pos.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="p-4 text-center text-gray-400">No active orders found.</td></tr>';
                return;
            }

            tbody.innerHTML = pos.map(po => {
                const statusColor = po.status === 'Received' ? 'text-green-600 bg-green-50' : 'text-orange-600 bg-orange-50';
                
                const partMake = po.part ? (po.part.category || 'Universal') : 'N/A';
                const partName = po.part ? po.part.name : 'Unknown Part';
                
                const supplierName = po.supplier ? po.supplier.name : 'Unknown Supplier';
                const recDate = po.received_at ? new Date(po.received_at).toLocaleDateString() : '-';
                
                let qtyDisplay = `${po.quantity} / ${po.received_quantity || 0}`;
                let qtyColor = "text-slate-600"; 

                if (po.status === 'Received') {
                    const req = po.quantity;
                    const rec = po.received_quantity || 0;
                    if (rec < req) qtyColor = "text-red-600 font-bold"; 
                    else if (rec > req) qtyColor = "text-green-600 font-bold"; 
                    else qtyColor = "text-slate-800 font-bold"; 
                }

                const action = po.status === 'Pending' 
                    ? `<button onclick="openReceiveModal(${po.id}, ${po.quantity})" class="text-blue-600 hover:underline font-bold text-xs">Receive</button>` 
                    : '<span class="text-gray-400">-</span>';

                return `
                    <tr class="border-b hover:bg-slate-50 transition text-sm">
                        <td class="p-4 font-mono text-slate-500">#${po.id}</td>
                        <td class="p-4 font-bold text-slate-700">${supplierName}</td>
                        <td class="p-4 text-xs font-bold uppercase text-blue-600">${partMake}</td>
                        <td class="p-4">${partName}</td>
                        <td class="p-4">${new Date(po.created_at).toLocaleDateString()}</td>
                        <td class="p-4">${recDate}</td>
                        <td class="p-4 ${qtyColor}">${qtyDisplay}</td> 
                        <td class="p-4"><span class="px-2 py-1 rounded ${statusColor} font-bold text-xs uppercase">${po.status}</span></td>
                        <td class="p-4">${action}</td>
                    </tr>`;
            }).join('');
        }
    } catch (err) { console.error(err); }
}

async function createPO(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = {
        supplier_id: parseInt(document.getElementById("supplierSelect").value),
        part_id: parseInt(document.getElementById("partSelect").value),
        quantity: parseInt(document.getElementById("quantity").value)
    };

    const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify(data)
    });

    if (res.ok) { toggleModal(); loadPO(); }
    else { alert("Failed to create order."); }
}

function openReceiveModal(id, expected) {
    document.getElementById("receivePoId").value = id;
    document.getElementById("expectedQty").value = expected;
    document.getElementById("actualQty").value = expected;
    document.getElementById("receiveModal").classList.remove("hidden");
}

function toggleReceiveModal() {
    document.getElementById("receiveModal").classList.add("hidden");
}

async function confirmReceive() {
    const token = localStorage.getItem("token");
    const id = document.getElementById("receivePoId").value;
    const actual_qty = parseInt(document.getElementById("actualQty").value);

    const res = await fetch(`${API_URL}${id}/receive`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
        body: JSON.stringify({ actual_qty })
    });

    if (res.ok) { toggleReceiveModal(); loadPO(); }
    else { alert("Error receiving stock."); }
}

function toggleModal() { document.getElementById("poModal").classList.toggle("hidden"); }