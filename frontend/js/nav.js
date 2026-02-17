document.addEventListener("DOMContentLoaded", () => {
    const role = localStorage.getItem("role");
    const username = localStorage.getItem("username") || "User";

    const menuItems = [
        { name: "Dashboard", link: "dashboard.html", icon: "layout-dashboard.svg", roles: ["ADMIN"] },
        { name: "Inventory", link: "inventory.html", icon: "boxes.svg", roles: ["ADMIN", "STAFF"] },
        { name: "Suppliers", link: "suppliers.html", icon: "truck.svg", roles: ["ADMIN", "STAFF"] },
        { name: "Sales Orders", link: "orders.html", icon: "shopping-cart.svg", roles: ["ADMIN", "STAFF"] },
        { name: "Restock (PO)", link: "purchase_orders.html", icon: "activity.svg", roles: ["ADMIN"] },
        { name: "System Logs", link: "logs.html", icon: "triangle-alert.svg", roles: ["ADMIN"] }
    ];

    let navHtml = `
    <nav class="w-64 bg-[#0f172a] h-screen fixed left-0 top-0 flex flex-col shadow-2xl z-50">
        <div class="p-8 border-b border-slate-800">
            <h1 class="text-2xl font-black text-blue-500 tracking-tighter">IMS<span class="text-white">PRO</span></h1>
            <p class="text-xs text-slate-500 mt-2 uppercase tracking-widest">${role} PORTAL</p>
        </div>

        <div class="flex-1 py-6 space-y-2 overflow-y-auto">
    `;

    // Get current filename (e.g., "orders.html")
    const currentFile = window.location.pathname.split("/").pop();

    menuItems.forEach(item => {
        if (item.roles.includes(role)) {
            // FIXED: Exact match check prevents "orders.html" matching "purchase_orders.html"
            const isActive = currentFile === item.link;
            
            const bgClass = isActive ? "bg-blue-600 text-white shadow-lg translate-x-2" : "text-slate-400 hover:bg-slate-800 hover:text-white";
            
            navHtml += `
            <a href="${item.link}" class="flex items-center px-6 py-4 transition-all duration-300 ${bgClass} rounded-l-xl mx-2">
                <img src="../assets/icons/${item.icon}" class="w-5 h-5 mr-4 filter ${isActive ? 'brightness-200' : 'invert opacity-50'}">
                <span class="font-bold text-sm tracking-wide">${item.name}</span>
            </a>`;
        }
    });

    navHtml += `
        </div>
        <div class="p-6 border-t border-slate-800 bg-[#0f172a]">
            <div class="flex items-center gap-4 mb-4">
                <div class="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center font-bold text-white shadow-lg">
                    ${username.charAt(0).toUpperCase()}
                </div>
                <div>
                    <p class="text-white font-bold text-sm">${username}</p>
                    <p class="text-[10px] text-blue-400 font-bold uppercase">${role}</p>
                </div>
            </div>
            <button onclick="logout()" class="w-full flex items-center justify-center py-3 rounded-xl border border-slate-700 text-slate-400 hover:bg-red-600 hover:text-white hover:border-red-600 transition-all duration-300 text-xs font-bold uppercase tracking-wider">
                <img src="../assets/icons/log-out.svg" class="w-4 h-4 mr-2 filter invert"> Sign Out
            </button>
        </div>
    </nav>
    `;

    if (!window.location.pathname.includes("login.html")) {
        const navContainer = document.createElement("div");
        navContainer.innerHTML = navHtml;
        document.body.prepend(navContainer);
    }
});

function logout() {
    localStorage.clear();
    window.location.href = "login.html";
}
