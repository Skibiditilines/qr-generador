from sqlalchemy import create_engine, inspect
from app.core.config import settings

def inspect_table():
    print(f"Connecting to DB...")
    engine = create_engine(settings.DATABASE_URL)
    inspector = inspect(engine)
    
    table_name = "Account"
    if table_name in inspector.get_table_names():
        print(f"Columns in table '{table_name}':")
        for column in inspector.get_columns(table_name):
            print(f" - {column['name']} ({column['type']})")
    else:
        print(f"Table '{table_name}' not found in database.")
        print("Available tables:", inspector.get_table_names())

if __name__ == "__main__":
    inspect_table()
