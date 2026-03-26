const API_URL = "http://127.0.0.1:8000/api/orders/";
const PARTS_URL = "http://127.0.0.1:8000/api/parts/";

let allParts = []; 
let allOrders = []; // NEW: Global store for orders so we can search them live

document.addEventListener("DOMContentLoaded", () => {
    loadOrders();
    setupModalData();
    document.getElementById("orderForm")?.addEventListener("submit", createSale);
    
    // NEW: Listen for every keystroke in the search bar
    document.getElementById("orderSearch")?.addEventListener("input", filterOrders);
});

async function setupModalData() {
    const token = localStorage.getItem("token");
    const makeSelect = document.getElementById("make_id");
    if(!makeSelect) return;

    try {
        const res = await fetch(PARTS_URL, { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            allParts = await res.json();
            const uniqueMakes = [...new Set(allParts.map(p => p.category || 'Universal'))];
            makeSelect.innerHTML = uniqueMakes.map(make => `<option value="${make}">${make}</option>`).join('');
            makeSelect.addEventListener("change", filterPartsByMake);
            filterPartsByMake();
        }
    } catch (err) { console.error("Modal Data Error:", err); }
}

function filterPartsByMake() {
    const selectedMake = document.getElementById("make_id").value;
    const partSelect = document.getElementById("part_id");
    const filteredParts = allParts.filter(p => (p.category || 'Universal') === selectedMake);
    
    if (filteredParts.length === 0) {
        partSelect.innerHTML = `<option disabled>No parts found for ${selectedMake}</option>`;
    } else {
        partSelect.innerHTML = filteredParts.map(p => 
            `<option value="${p.id}">${p.name} (KES ${p.price})</option>`
        ).join('');
    }
}

// 1. FETCH the orders and save them to our global array
async function loadOrders() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            allOrders = await res.json();
            renderOrders(allOrders); // Pass all orders to the drawing function
        }
    } catch (err) { console.error(err); }
}

// 2. NEW: DRAW the orders (This lets the search bar redraw the table easily)
function renderOrders(ordersToRender) {
    const tbody = document.getElementById("ordersTableBody");
    if(!tbody) return;
    
    // Check if the search found nothing
    if (ordersToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="p-8 text-center text-slate-400 font-bold">No matching orders found.</td></tr>`;
        return;
    }

    tbody.innerHTML = ordersToRender.map(o => {
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

// 3. NEW: The Live Search Engine
function filterOrders(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    const filtered = allOrders.filter(o => {
        // Prepare the searchable strings
        const partMake = o.part ? (o.part.category || 'Universal').toLowerCase() : 'n/a';
        const partName = o.part ? o.part.name.toLowerCase() : `part #${o.part_id}`;
        const orderId = `#${o.id}`.toLowerCase();
        
        // If the ID, Make, or Part Name contains what they typed, keep it!
        return orderId.includes(searchTerm) || 
               partMake.includes(searchTerm) || 
               partName.includes(searchTerm);
    });
    
    // Instantly redraw the table with only the matches
    renderOrders(filtered);
}
async function createSale(e) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    
    const partId = document.getElementById("part_id").value;
    const qtyStr = document.getElementById("quantity").value;
    const qty = parseInt(qtyStr);

    if (isNaN(qty) || qty <= 0) {
        showNotification("Invalid Input", "Please enter a valid quantity.", true);
        return;
    }

    const data = {
        part_id: parseInt(partId),
        quantity: qty
    };

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
            body: JSON.stringify(data)
        });

        if (res.ok) { 
            toggleModal(); 
            loadOrders();
            document.getElementById("orderForm").reset();
            
            // --- NEW: Find part locally instead of fetching from backend to avoid 405 error ---
            const updatedPart = allParts.find(p => p.id === parseInt(partId));
            
            if (updatedPart) {
                updatedPart.quantity -= qty; // Update local math for the alert check
                
                if (updatedPart.quantity < 5) {
                    showNotification("⚠️ CRITICAL STOCK ALERT", `"${updatedPart.name}" is almost out! Only ${updatedPart.quantity} unit(s) remain. Initiate PO immediately.`, true);
                } else {
                    showNotification("Sale Successful", `Successfully sold ${qty} unit(s) of ${updatedPart.name}.`);
                }

                // --- LOG IT FOR THE DEMO ---
                const currentLogs = JSON.parse(localStorage.getItem("liveLogs") || "[]");
                currentLogs.unshift({
                    time: new Date().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }), 
                    type: "SALES", 
                    desc: `Live Sale: ${qty}x ${updatedPart.name} processed by ${localStorage.getItem("username") || "Admin"}`, 
                    status: "SUCCESS", 
                    color: "text-blue-600"
                });
                localStorage.setItem("liveLogs", JSON.stringify(currentLogs));
                // --------------------------------
            }
        } else { 
            const errorData = await res.json();
            showNotification("Transaction Failed", errorData.detail || "Check Stock Levels", true);
        }
    } catch (error) {
        console.error("Sale Error:", error);
        showNotification("System Error", "An unexpected error occurred.", true);
    }
}

window.toggleModal = function() { 
    const modal = document.getElementById("orderModal");
    if(modal) modal.classList.toggle("hidden"); 
};

// ==========================================
// NEW: ENTERPRISE TOAST NOTIFICATION SYSTEM
// ==========================================
function showNotification(title, message, isWarning = false) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        // Positions it fixed at the top right
        container.className = 'fixed top-5 right-5 z-50 flex flex-col gap-3';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    // Tailwind animation classes to slide in
    toast.className = `transform transition-all duration-300 translate-x-full max-w-sm w-full bg-white shadow-2xl rounded-lg border-l-4 ${isWarning ? 'border-red-500' : 'border-green-500'} p-4 flex items-start`;

    toast.innerHTML = `
        <div class="flex-1">
            <h4 class="text-sm font-bold ${isWarning ? 'text-red-600' : 'text-green-600'}">${title}</h4>
            <p class="text-xs text-slate-600 mt-1 font-medium">${message}</p>
        </div>
        <button onclick="this.parentElement.remove()" class="text-slate-400 hover:text-slate-600 ml-4 focus:outline-none">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
        </button>
    `;

    container.appendChild(toast);

    // Trigger the slide-in animation slightly after appending
    setTimeout(() => {
        toast.classList.remove('translate-x-full');
    }, 10);

    // Auto-remove after 6 seconds
    setTimeout(() => {
        toast.classList.add('translate-x-full');
        toast.classList.add('opacity-0');
        setTimeout(() => toast.remove(), 300); // Wait for animation to finish before removing DOM element
    }, 6000);
}