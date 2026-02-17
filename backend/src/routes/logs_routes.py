from fastapi import APIRouter
import sqlite3

router = APIRouter()

def get_db_connection():
    # Since we run from 'backend/', the DB is in the current folder
    conn = sqlite3.connect('ims.db')
    conn.row_factory = sqlite3.Row
    return conn

@router.get("/api/logs")
def get_logs():
    try:
        conn = get_db_connection()
        # Fetch newest logs first
        cursor = conn.execute("SELECT * FROM logs ORDER BY id DESC LIMIT 50")
        logs = cursor.fetchall()
        conn.close()
        return [dict(row) for row in logs]
    except Exception as e:
        print(f"Error fetching logs: {e}")
        return []
