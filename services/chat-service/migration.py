from sqlalchemy import text
from database import engine

# Migration to mark all AI messages as read
with engine.connect() as conn:
    result = conn.execute(text("UPDATE messages SET is_read = TRUE WHERE is_ai_response = TRUE"))
    conn.commit()
    print(f"Migration completed: {result.rowcount} AI messages marked as read")
