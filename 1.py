import os
import psycopg2
from pydub import AudioSegment
from io import BytesIO

BASE_DIR = "sounds"
os.makedirs(BASE_DIR, exist_ok=True)

conn = psycopg2.connect(
    host="localhost",
    port=5432,
    user="quiz_admin",
    password="quiz_secure_password",
    dbname="quiz_app"
)

cur = conn.cursor()

cur.execute("""
    SELECT 
        aa.id AS answer_id,
        u.name AS student_name,
        aa.audio
    FROM attempt_answers aa
    JOIN quiz_attempts qa ON aa.attempt_id = qa.id
    JOIN users u ON qa.student_id = u.id
    WHERE aa.audio IS NOT NULL
""")

rows = cur.fetchall()

for answer_id, student_name, audio_bytes in rows:
    safe_name = student_name.replace(" ", "_").lower()
    student_dir = os.path.join(BASE_DIR, safe_name)
    os.makedirs(student_dir, exist_ok=True)

    audio = AudioSegment.from_file(BytesIO(audio_bytes))
    audio = audio.set_frame_rate(16000).set_channels(1)

    output_path = os.path.join(student_dir, f"{answer_id}.wav")
    audio.export(output_path, format="wav")

cur.close()
conn.close()
