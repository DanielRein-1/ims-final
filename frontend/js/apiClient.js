const BASE_URL = "http://127.0.0.1:8000/api";

const apiClient = {
    async request(endpoint, options = {}) {
        const token = localStorage.getItem("token");
        
        // Ensure endpoint starts with / and ends with / to prevent 307 Redirects
        const cleanEndpoint = endpoint.startsWith('/') ? endpoint : '/' + endpoint;
        const finalEndpoint = cleanEndpoint.endsWith('/') ? cleanEndpoint : cleanEndpoint + '/';
        const url = `${BASE_URL}${finalEndpoint}`;

        const headers = {
            "Content-Type": "application/json",
            ...options.headers,
        };

        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        try {
            const response = await fetch(url, { ...options, headers });
            
            if (response.status === 401) {
                console.error("Session expired or invalid token.");
                localStorage.clear();
                window.location.href = "login.html";
                return null;
            }
            
            return response;
        } catch (error) {
            console.error("Bridge Connection Error:", error);
            throw error;
        }
    }
};

window.apiClient = apiClient;
