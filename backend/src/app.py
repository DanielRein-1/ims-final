from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.routes import (
    auth_routes, orders_routes, parts_routes, 
    purchase_order_routes, report_routes, stats_routes,
    suppliers_routes, user_routes, logs_routes
)

# PRO TIP: Setting strict_slashes=False prevents 307 Redirect loops globally
app = FastAPI(title="IMS PRO", strict_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Standardized Routing
app.include_router(auth_routes.router)
app.include_router(orders_routes.router)
app.include_router(parts_routes.router)
app.include_router(purchase_order_routes.router)
app.include_router(report_routes.router)
app.include_router(stats_routes.router)
app.include_router(suppliers_routes.router)
app.include_router(user_routes.router)
app.include_router(logs_routes.router)

@app.get("/")
def health_check():
    return {"status": "online", "message": "IMS Backend Connected"}
