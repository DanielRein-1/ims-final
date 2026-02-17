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

    loadDashboardStats();
    updateIntelligence();
});

async function loadDashboardStats() {
    const token = localStorage.getItem("token");
    try {
        // Fetch from your existing solid backend
        const response = await fetch("http://127.0.0.1:8000/api/stats", {
            headers: { "Authorization": "Bearer " + token }
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Backend Data Received:", data); // Debugging line

            // 1. Map the Financials (Matching your Python variable names)
            if(document.getElementById("totalValue")) 
                document.getElementById("totalValue").innerText = `Ksh ${(data.total_value || 0).toLocaleString()}`;
            
            if(document.getElementById("totalRevenue")) 
                document.getElementById("totalRevenue").innerText = `Ksh ${(data.total_revenue || 0).toLocaleString()}`;
            
            if(document.getElementById("lowStock")) 
                document.getElementById("lowStock").innerText = data.low_stock_count || 0;
            
            if(document.getElementById("totalOrders")) 
                document.getElementById("totalOrders").innerText = data.total_orders || 0;

            // 2. Map the Graph (Matching data.chart_data)
            processAndRenderChart(data.chart_data);
        } else {
            console.error("Backend returned error:", response.status);
        }
    } catch (err) { console.error("Stats Fetch Error:", err); }
}

function processAndRenderChart(chartData) {
    // Map your "January", "February" strings to the chart's fixed 12-month axis
    let salesArray = new Array(12).fill(0);
    const monthMap = {
        "January": 0, "February": 1, "March": 2, "April": 3, "May": 4, "June": 5,
        "July": 6, "August": 7, "September": 8, "October": 9, "November": 10, "December": 11
    };

    if (chartData && chartData.months && chartData.sales) {
        chartData.months.forEach((monthName, index) => {
            // Trim whitespace just in case (e.g. "January   ")
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
    // Your existing intelligence logic
    const token = localStorage.getItem("token");
    const insightCard = document.getElementById("insightCard");
    const insightText = document.getElementById("insightText");
    
    if(!insightCard) return;

    try {
        const res = await fetch("http://127.0.0.1:8000/api/parts", { headers: { "Authorization": "Bearer " + token }});
        if (res.ok) {
            const parts = await res.json();
            const lowItems = parts.filter(p => p.quantity < 5).map(p => p.name);
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
// --- NEW REPORT FUNCTION ---
async function downloadReport() {
    const token = localStorage.getItem("token");
    try {
        const res = await fetch("http://127.0.0.1:8000/api/reports/sales", {
            headers: { "Authorization": "Bearer " + token }
        });
        
        if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "IMS_Sales_Report.pdf";
            document.body.appendChild(a);
            a.click();
            a.remove();
        } else {
            alert("Failed to generate report. Ensure you are Admin.");
        }
    } catch (err) { console.error("Report Error:", err); }
}
window.downloadReport = downloadReport;
