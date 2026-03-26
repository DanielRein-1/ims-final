from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import List
import os
from fpdf import FPDF

from src.models.db import get_db
from src.services.purchase_order_service import POService
from src.schemas.purchase_order_schema import POCreate, POResponse
from src.auth.role_guard import get_current_user_role
from pydantic import BaseModel
from src.models.purchase_order_model import PurchaseOrder # Import Model for sorting

router = APIRouter(prefix="/api/purchase-orders", tags=["Purchase Orders"])

class ReceiveInput(BaseModel):
    actual_qty: int

@router.post("/", response_model=POResponse)
def create_po(po: POCreate, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return POService.create_po(db, po)

@router.post("/{po_id}/receive", response_model=POResponse)
def receive_po(po_id: int, data: ReceiveInput, db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    return POService.receive_po(db, po_id, data.actual_qty)

@router.get("/", response_model=List[POResponse])
def list_pos(db: Session = Depends(get_db), role: str = Depends(get_current_user_role)):
    # FIXED: Sort by Newest First (created_at DESC)
    return db.query(PurchaseOrder).order_by(PurchaseOrder.created_at.desc()).all()


# --- NEW PDF INVOICE ROUTE ---
@router.get("/{po_id}/invoice")
def generate_invoice(po_id: int, db: Session = Depends(get_db)):
    # Fetch PO with automatic joins for Supplier and Part
    po = db.query(PurchaseOrder).filter(PurchaseOrder.id == po_id).first()
    if not po:
        raise HTTPException(status_code=404, detail="Purchase Order not found")
        
    pdf = FPDF()
    pdf.add_page()
    
    # --- PROFESSIONAL HEADER SECTION ---
    pdf.set_font("Arial", 'B', 22)
    pdf.set_text_color(30, 58, 138) # Dark Blue Brand Color
    pdf.cell(200, 10, "IM AUTO SPARES LTD", ln=True, align='L')
    
    pdf.set_font("Arial", '', 10)
    pdf.set_text_color(100, 100, 100) # Gray Address text
    pdf.cell(200, 5, "Westlands, Nairobi, Kenya", ln=True, align='L')
    pdf.cell(200, 5, "Phone: +254 700 000 000 | Email: admin@danielrein.com", ln=True, align='L')
    
    # Line break and Reset color to Black for the rest of the document
    pdf.ln(5)
    pdf.set_draw_color(200, 200, 200)
    pdf.line(10, pdf.get_y(), 200, pdf.get_y()) # Draws a separator line
    pdf.ln(8)
    pdf.set_text_color(0, 0, 0) 
    
    # Document Title
    pdf.set_font("Arial", 'B', 14)
    pdf.cell(200, 10, "SUPPLIER RESTOCK INVOICE", ln=True, align='C')
    pdf.ln(5)
    # ------------------------------------
    
    # Supplier & PO Metadata
    pdf.set_font("Arial", 'B', 12)
    pdf.cell(200, 10, f"Supplier: {po.supplier.name}", ln=True) # Automated Name
    pdf.set_font("Arial", size=10)
    pdf.cell(200, 7, f"Invoice Number: PO-{po.id}", ln=True)
    
    # Combined Date and Time for the audit trail
    formatted_timestamp = po.created_at.strftime('%Y-%m-%d %H:%M:%S')
    pdf.cell(200, 7, f"Generated On: {formatted_timestamp}", ln=True)
    pdf.ln(10)
    
    # Table Headers (Separated ID and Item)
    pdf.set_font("Arial", 'B', 10)
    pdf.cell(20, 10, "Part ID", 1, 0, 'C')
    pdf.cell(70, 10, "Item Description", 1, 0, 'L')
    pdf.cell(25, 10, "Qty", 1, 0, 'C')
    pdf.cell(35, 10, "Unit Cost", 1, 0, 'C')
    pdf.cell(40, 10, "Total (KES)", 1, 1, 'C')
    
    # Table Data (Automated via SQLAlchemy relationships)
    pdf.set_font("Arial", size=10)
    pdf.cell(20, 10, str(po.part_id), 1, 0, 'C')
    pdf.cell(70, 10, po.part.name, 1, 0, 'L') # Automated Part Name
    pdf.cell(25, 10, str(po.quantity), 1, 0, 'C')
    
    # Formatting numbers with commas and 2 decimal places
    pdf.cell(35, 10, f"{po.unit_cost:,.2f}", 1, 0, 'C')
    pdf.cell(40, 10, f"{po.total_cost:,.2f}", 1, 1, 'C')
    pdf.ln(10)
    
    # Financial Summary Section
    pdf.set_font("Arial", 'B', 11)
    balance_due = po.total_cost - po.amount_paid
    
    pdf.cell(150, 8, "Amount Paid:", 0, 0, 'R')
    pdf.cell(40, 8, f"KES {po.amount_paid:,.2f}", 0, 1, 'R')
    
    # Use red text for the balance to make it stand out
    pdf.set_text_color(200, 0, 0) 
    pdf.cell(150, 8, "Balance Due:", 0, 0, 'R')
    pdf.cell(40, 8, f"KES {balance_due:,.2f}", 0, 1, 'R')
    
    # Reset text color for footer
    pdf.set_text_color(0, 0, 0)
    pdf.ln(20)
    pdf.set_font("Arial", 'I', 8)
    pdf.cell(200, 10, "Thank you for your business. This is a computer-generated document.", ln=True, align='C')
    
    filename = f"Invoice_PO_{po.id}.pdf"
    pdf.output(filename)
    return FileResponse(filename, filename=filename, media_type="application/pdf")