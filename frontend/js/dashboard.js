if (localStorage.getItem("role") !== "ADMIN") window.location.href = "orders.html";

document.addEventListener("DOMContentLoaded", () => {
    // 1. Role Check
    const role = (localStorage.getItem("role") || "STAFF").toUpperCase();
    if (role !== "ADMIN") {
        document.querySelector('.management-console')?.remove();
        document.querySelectorAll('#totalValue, #totalRevenue').forEach(el => el.closest('.bg-white')?.remove());
        const grid = document.querySelector('.grid');
        if (grid) { grid.classList.remove('lg:grid-cols-4'); grid.classList.add('lg:grid-cols-2'); }
    }

    // 2. Initial Load
    loadDashboardStats();
    updateIntelligence();
    loadTopMovers();

    // 3. Dropdown Event Listeners// 3. Dropdown Event Listeners
    document.getElementById("chartYearFilter")?.addEventListener("change", (e) => {
        loadDashboardStats(); // Update the top cards and graph
        
        // MASTER SYNC: Check if the bottom dropdown has the same option, and if so, sync it!
        const topMoversDropdown = document.getElementById("topMoversFilter");
        if (topMoversDropdown) {
            const selectedValue = e.target.value;
            // Only sync if the bottom dropdown actually has "week", "month", or "all"
            if (["week", "month", "all"].includes(selectedValue)) {
                topMoversDropdown.value = selectedValue;
                loadTopMovers(); // Update the table
            }
        }
    });

    // The bottom dropdown still works independently!
    document.getElementById("topMoversFilter")?.addEventListener("change", loadTopMovers);
    document.getElementById("topMoversLimit")?.addEventListener("change", loadTopMovers);
});

async function loadDashboardStats() {
    const token = localStorage.getItem("token");
    // Grab the value from the dropdown
    const timeFilter = document.getElementById("chartYearFilter")?.value || "2026";
    
    try {
        // Updated query parameter to match our new backend logic
        const response = await fetch(`http://127.0.0.1:8000/api/stats?time_filter=${timeFilter}`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (response.ok) {
            const data = await response.json();
            // ... the rest of the function remains exactly the same!
            if(document.getElementById("totalValue")) 
                document.getElementById("totalValue").innerText = `Ksh ${(data.total_value || 0).toLocaleString()}`;
            
            if(document.getElementById("totalRevenue")) 
                document.getElementById("totalRevenue").innerText = `Ksh ${(data.total_revenue || 0).toLocaleString()}`;
            
            // --- NEW PROFIT INJECTION ---
            if(document.getElementById("grossProfit")) 
                document.getElementById("grossProfit").innerText = `Ksh ${(data.gross_profit || 0).toLocaleString()}`;
            if(document.getElementById("lowStock")) 
                document.getElementById("lowStock").innerText = data.low_stock_count || 0;
            
            if(document.getElementById("totalOrders")) 
                document.getElementById("totalOrders").innerText = data.total_orders || 0;

            processAndRenderChart(data.chart_data);
        }
    } catch (err) { console.error("Stats Fetch Error:", err); }
}

function processAndRenderChart(chartData) {
    let salesArray = new Array(12).fill(0);
    const monthMap = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    if (chartData && chartData.months && chartData.sales) {
        chartData.months.forEach((monthName, index) => {
            const cleanName = monthName.trim(); 
            const monthIndex = monthMap[cleanName];
            if (monthIndex !== undefined) {
                salesArray[monthIndex] = chartData.sales[index];
            }
        });
    }

    renderChart(salesArray);
}

function renderChart(salesData) {
    const ctx = document.getElementById('salesChart');
    if (!ctx) return;
    if (window.myChart) window.myChart.destroy();

    const maxSale = Math.max(...salesData);
    const suggestedMax = maxSale > 0 ? maxSale * 1.2 : 50000;

    window.myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [{
                label: 'Revenue (Ksh)',
                data: salesData,
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                borderWidth: 3,
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: true, suggestedMax: suggestedMax } }
        }
    });
}

async function updateIntelligence() {
    const token = localStorage.getItem("token");
    const insightCard = document.getElementById("insightCard");
    const insightText = document.getElementById("insightText");
    
    if(!insightCard) return;

    try {
        const res = await fetch("http://127.0.0.1:8000/api/parts", { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            const parts = await res.json();
            const lowItems = parts.filter(p => p.quantity < 5).map(p => `[${p.category || 'Universal'}] ${p.name}`);
            if (lowItems.length > 0) {
                insightCard.className = "bg-red-900 p-8 rounded-xl shadow-lg text-white border-l-4 border-red-500 animate-pulse";
                insightText.innerHTML = `CRITICAL ALERT: Low stock for <strong>${lowItems.join(", ")}</strong>. Restock now!`;
            } else {
                insightCard.className = "bg-[#1e293b] p-8 rounded-xl shadow-lg text-white border-l-4 border-blue-500";
                insightText.innerText = "System Intelligence: Inventory levels optimized.";
            }
        }
    } catch (e) { console.error(e); }
}

async function loadTopMovers() {
    const token = localStorage.getItem("token");
    const filter = document.getElementById("topMoversFilter")?.value || "all";
    const limit = document.getElementById("topMoversLimit")?.value || "5";

    // --- NEW: Dynamically update the section title based on the limit! ---
    const titleEl = document.getElementById("topMoversTitle");
    if (titleEl) {
        if (limit === "all") {
            titleEl.innerText = "ALL BEST-SELLING PRODUCTS";
        } else {
            titleEl.innerText = `TOP ${limit} BEST-SELLING PRODUCTS`;
        }
    }
    // ----------------------------------------------------------------------
    
    try {
        // We now pass BOTH time_filter and limit to the backend
        const res = await fetch(`http://127.0.0.1:8000/api/stats/top-movers?time_filter=${filter}&limit=${limit}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        
        
        if (res.ok) {
            const movers = await res.json();
            const tbody = document.getElementById("topMoversBody");
            
            if (movers.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="p-4 text-center text-slate-400">No sales data available for this period.</td></tr>';
                return;
            }

            tbody.innerHTML = movers.map((m, index) => `
                <tr class="border-b hover:bg-slate-50 transition">
                    <td class="p-4 text-sm font-bold text-slate-400">#${index + 1}</td>
                    <td class="p-4 text-xs font-bold uppercase text-blue-600">${m.make}</td>
                    <td class="p-4 font-bold text-slate-800">${m.name}</td>
                    <td class="p-4 text-green-600 font-bold">${m.total_sold} Units</td>
                    <td class="p-4 text-slate-600 font-mono">KES ${m.total_revenue.toLocaleString()}</td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error("Error loading top movers:", err); }
}

async function downloadReport() {
    const token = localStorage.getItem("token");
    // Grab the value from our new dropdown
    const timeframe = document.getElementById("reportFilter")?.value || "all";
    
    try {
        // Send the timeframe parameter to the backend
        const res = await fetch(`http://127.0.0.1:8000/api/reports/sales?timeframe=${timeframe}`, {
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            // Name the file based on the timeframe!
            a.download = `IMS_Sales_Report_${timeframe}.pdf`; 
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert("Failed to generate report. Ensure you are Admin.");
        }
    } catch (err) { console.error("Report Error:", err); }
}

window.downloadReport = downloadReport;