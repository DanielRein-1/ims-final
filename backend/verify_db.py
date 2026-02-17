
import sys

import os

from sqlalchemy import create_engine, text

from sqlalchemy.orm import sessionmaker



# Setup path

sys.path.append(os.getcwd())

from src.config.settings import settings



# Connect to the PostgreSQL database defined in your settings

print(f"Connecting to: {settings.DATABASE_URL}")

engine = create_engine(settings.DATABASE_URL)

SessionLocal = sessionmaker(bind=engine)

session = SessionLocal()



def check_data():

    try:

        # 1. Check Inventory

        print("\n CHECKING INVENTORY:")

        result = session.execute(text("SELECT name, quantity, price FROM parts;"))

        parts = result.fetchall()

        if parts:

            for p in parts:

                print(f"   - {p[0]}: {p[1]} units (Ksh {p[2]})")

        else:

            print("   [EMPTY] No parts found.")



        # 2. Check Sales

        print("\n CHECKING SALES REVENUE:")

        result = session.execute(text("SELECT SUM(total_price) FROM orders;"))

        revenue = result.scalar()

        print(f"   Total Revenue: Ksh {revenue if revenue else 0}")



        # 3. Check Users

        print("\n CHECKING ACCOUNTS:")

        result = session.execute(text("SELECT username, role FROM users;"))

        users = result.fetchall()

        for u in users:

            print(f"   - {u[0]} ({u[1]})")



    except Exception as e:

        print(f"\n CONNECTION ERROR: {e}")

    finally:

        session.close()



if __name__ == "__main__":

    check_data()

