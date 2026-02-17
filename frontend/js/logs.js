const API_URL = "http://127.0.0.1:8000/api/logs";

// 1. BOUNCER: Kick out non-admins immediately
if (localStorage.getItem("role") !== "ADMIN") {
    window.location.href = "orders.html";
}

document.addEventListener("DOMContentLoaded", () => {
    loadLogs();
});

async function loadLogs() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch(API_URL, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (res.ok) {
            const logs = await res.json();
            const tbody = document.getElementById("logsTableBody");
            
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="4" class="p-4 text-center text-gray-400">No system activity recorded yet.</td></tr>';
                return;
            }

            tbody.innerHTML = logs.map(log => {
                let statusColor = "text-gray-600";
                if(log.status === "SUCCESS") statusColor = "text-green-600 font-bold";
                if(log.status === "WARNING") statusColor = "text-orange-500 font-bold";
                if(log.status === "ERROR") statusColor = "text-red-600 font-bold";

                return `
                <tr class="border-b hover:bg-slate-50 transition">
                    <td class="p-4 text-xs font-mono text-slate-500">${log.timestamp || new Date().toLocaleString()}</td>
                    <td class="p-4 font-bold text-xs uppercase tracking-wide">${log.type || "INFO"}</td>
                    <td class="p-4 text-sm text-slate-700">${log.description}</td>
                    <td class="p-4 text-xs ${statusColor}">${log.status || "OK"}</td>
                </tr>`;
            }).join('');
        }
    } catch (err) {
        console.error("Log Fetch Error:", err);
        document.getElementById("logsTableBody").innerHTML = '<tr><td colspan="4" class="p-4 text-center text-red-400">Failed to load logs. Server might be offline.</td></tr>';
    }
}
