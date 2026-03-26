const API_URL = "http://127.0.0.1:8000/api/logs";

// 1. BOUNCER: Kick out non-admins immediately
if (localStorage.getItem("role") !== "ADMIN") {
    window.location.href = "orders.html";
}

let allLogsData = []; // Global store for the search engine

document.addEventListener("DOMContentLoaded", () => {
    const tbody = document.getElementById("logsTableBody");
    if (!tbody) return;

    // 1. Grab any LIVE actions you just did from the browser's memory
    const liveSessionLogs = JSON.parse(localStorage.getItem("liveLogs") || "[]");

    // 2. The fake historical data
    const historicalLogs = [
        { time: "Mar 9, 2026, 10:15:00 AM", type: "SALES", desc: "Transaction #145 processed successfully by 'staff'", status: "INFO", color: "text-slate-600" },
        { time: "Mar 9, 2026, 08:30:22 AM", type: "SYSTEM", desc: "Weekly automated database backup completed to Cloud Storage", status: "SUCCESS", color: "text-green-600" },
        { time: "Mar 8, 2026, 11:45:10 PM", type: "AUTH", desc: "Failed login attempt detected from IP 192.168.1.45", status: "BLOCKED", color: "text-red-500" },
        { time: "Mar 8, 2026, 09:00:05 AM", type: "INVENTORY", desc: "Admin added new SKU: Engine Oil (500ml)", status: "SUCCESS", color: "text-green-600" }
    ];

    // 3. Combine them into our global array!
    allLogsData = [...liveSessionLogs, ...historicalLogs];

    // 4. Paint the initial table
    renderLogs(allLogsData);

    // 5. NEW: Listen to the search bar
    document.getElementById("logSearch")?.addEventListener("input", filterLogs);
});

// DRAW THE LOGS
function renderLogs(logsToRender) {
    const tbody = document.getElementById("logsTableBody");
    if (!tbody) return;

    if (logsToRender.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="p-8 text-center text-slate-400 font-bold">No matching audit logs found.</td></tr>`;
        return;
    }

    tbody.innerHTML = logsToRender.map(log => `
        <tr class="border-b hover:bg-slate-50 transition text-sm">
            <td class="p-4 text-xs font-bold text-slate-400">${log.time}</td>
            <td class="p-4 font-bold ${log.color}">${log.type}</td>
            <td class="p-4 text-slate-700">${log.desc}</td>
            <td class="p-4 font-mono text-xs text-slate-500">${log.status}</td>
        </tr>
    `).join('');
}

// LIVE SEARCH ENGINE
function filterLogs(e) {
    const searchTerm = e.target.value.toLowerCase();
    
    const filtered = allLogsData.filter(log => {
        // Search across the Type (e.g., SECURITY), Description, and Status
        return log.type.toLowerCase().includes(searchTerm) || 
               log.desc.toLowerCase().includes(searchTerm) || 
               log.status.toLowerCase().includes(searchTerm);
    });
    
    // Instantly redraw the table with matches
    renderLogs(filtered);
}