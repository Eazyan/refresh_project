import pandas as pd
from sqlalchemy.orm import Session
from io import BytesIO

def generate_tasks_report(db: Session) -> BytesIO:
    """
    Запрашивает все события из БД, создает Excel-отчет и возвращает его
    в виде байтового потока в памяти.
    """
    query = "SELECT event_type, task_id, task_text, task_user_id, created_at FROM task_events"
    df = pd.read_sql(query, db.bind)

    output = BytesIO()

    with pd.ExcelWriter(output, engine='xlsxwriter') as writer:
        df.to_excel(writer, index=False, sheet_name='Task Events')

        workbook = writer.book
        worksheet = writer.sheets['Task Events']
        worksheet.autofit()

    output.seek(0)
    
    return output