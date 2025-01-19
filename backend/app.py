from flask import Flask, request, jsonify, send_file
from werkzeug.utils import secure_filename
import os
import sqlite3
from concurrent.futures import ThreadPoolExecutor
import threading
import pandas as pd
from flask_cors import CORS
import uuid
import csv
import io
from flask import make_response
from functions import extract_text_from_pdf, extract_and_score_resume, calculate_expected_graduation, extract_cgpa_or_percent, role_match, inferred_career

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = 'uploads'
DB_FILE = 'db/resumes.db'

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

progress = {"status": "idle", "completed": 0, "total": 0, "uploadingCompleted": False, "processingCompleted": False}

progress_lock = threading.Lock()

executor = ThreadPoolExecutor(max_workers=5)
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route('/upload-folder', methods=['POST'])
def upload_folder():
    global progress
    """API to upload a folder of resumes."""
    job_description = request.form.get('jobDescription', None)
    use_github = request.form.get('useGitHub', None)
    uploaded_files = request.files.getlist('files')
    print(use_github)
    if not uploaded_files:
        return jsonify({'error': 'No files uploaded'}), 400

    session_id = str(uuid.uuid4())  

    for file in uploaded_files:
        try:
            filename = secure_filename(file.filename)
            file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(file_path)
        except Exception as e:
            return jsonify({'error': f'Error saving file {file.filename}: {str(e)}'}), 500

    
    executor.submit(process_resumes_in_folder, job_description, use_github, UPLOAD_FOLDER, session_id)
    with progress_lock:
        progress["uploadingCompleted"] = True
    return jsonify({'message': 'Files uploaded and processing started', 'session_id': session_id}), 200


@app.route('/progress', methods=['GET'])
def get_progress():
    """API to fetch the current processing progress."""
    with progress_lock:
        print(progress)
        return jsonify(progress)

@app.route('/export', methods=['GET'])
def export_csv():
    session_id = request.args.get('session_id', '')
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    c = conn.cursor()
    c.execute("SELECT file_name, name, contact_details, university, expected_year_of_completion, course, discipline, cgpa, key_skills, projects, internships, certifications, ai_ml_score, gen_ai_score, role_match, career FROM processed_resumes WHERE session_id=?", (session_id,))
    rows = c.fetchall() 

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Filename", "Name", "Contact", "University", "Expected year of Completion", "Course", "Discipline", "CGPA", "Key Skills", "Projects", "Internships", "Certifications", "AI MI Score", "Gen AI Score", "Role Match", "Inferred Career"]) 
    for row in rows:
        writer.writerow(row)
    conn.close()

    response = make_response(output.getvalue())
    response.headers["Content-Disposition"] = "attachment; filename=export.csv"
    response.headers["Content-Type"] = "text/csv"
    return response

@app.route('/results', methods=['GET'])
def get_results():
    session_id = request.args.get('session_id', '')
    print(session_id)
    try:
        conn = sqlite3.connect(DB_FILE, check_same_thread=False)
        c = conn.cursor()
        c.execute("""
            SELECT
                session_id,
                file_name,
                name,
                contact_details,
                university,
                expected_year_of_completion,
                course,
                discipline,
                cgpa,
                key_skills,
                ai_ml_score,
                gen_ai_score,
                projects,
                internships,
                certifications,
                role_match,
                career
            FROM processed_resumes
            WHERE session_id=?
        """, (session_id,))
        rows = c.fetchall()
        results = []
        for row in rows:
            results.append({
                "session_id": row[0],
                "file_name": row[1],
                "name": row[2],
                "contact_details": row[3],
                "university": row[4],
                "expected_year_of_completion": row[5],
                "course": row[6],
                "discipline": row[7],
                "cgpa": row[8],
                "key_skills": row[9],
                "ai_ml_score": row[10],
                "gen_ai_score": row[11],
                "projects": row[12],
                "internships": row[13],
                "certifications": row[14],
                "role_match": row[15],
                "career": row[16]
            })
        return jsonify(results)
    finally:
        conn.close()

@app.route('/history', methods=['GET'])
def get_history():
    
    conn = sqlite3.connect(DB_FILE, check_same_thread=False)
    cursor = conn.cursor()

    
    cursor.execute("SELECT DISTINCT session_id FROM processed_resumes ORDER BY session_id")
    
    
    session_ids = cursor.fetchall()

    session_list = []

    for session in session_ids:
        
        session_id = session[0]
        cursor.execute("SELECT created_at FROM processed_resumes WHERE session_id = ? ORDER BY created_at LIMIT 1", (session_id,))
        created_at = cursor.fetchone()[0]

        session_list.append({"session_id": session_id, "created_at": created_at})

    conn.close()

    return jsonify(session_list)

def process_resumes_in_folder(job_description, use_github, folder_path, session_id):
    """Process all resumes in the uploaded folder with a session ID."""
    global progress
    resumes = [f for f in os.listdir(folder_path) if f.endswith(".pdf")]
    with progress_lock:
        progress = {"status": "processing", "completed": 0, "total": len(resumes), "uploadingCompleted": True, "processingCompleted": False}

    for resume_file in resumes:
        file_path = os.path.join(folder_path, resume_file)
        executor.submit(pipeline, job_description=job_description, use_github=use_github, file_name=resume_file, pdf_path=file_path, session_id=session_id)

    while progress["completed"] < len(resumes):
        pass  

    with progress_lock:
        progress["processingCompleted"] = True
        progress["status"] = "completed"

    cleanup_uploaded_files(folder_path)


def pipeline(job_description, use_github, file_name, pdf_path, session_id):   
    text = extract_text_from_pdf(pdf_path)
    if not text:
        return

    parsed_data = extract_and_score_resume(use_github, text)
    data = parsed_data.model_dump(by_alias=True)
    
    insert_data_into_db(job_description, file_name, data, session_id)


def insert_data_into_db(job_description, file_name, data, session_id):
    try:
        conn = sqlite3.connect(DB_FILE, check_same_thread=False)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO processed_resumes (session_id, file_name, name, contact_details, university, expected_year_of_completion, course, discipline, cgpa, key_skills, ai_ml_score, gen_ai_score, projects, internships, certifications, role_match, career)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            file_name,
            data.get("Name"),
            str(data.get("Contact Details")),
            data.get("University"),
            calculate_expected_graduation(data.get("Expected Year of Current Course Completion")),
            data.get("Course"),
            data.get("Discipline"),
            extract_cgpa_or_percent(data.get("CGPA/Percentage")),
            data.get("Key Skills"),
            data.get("AI/ML Experience Score"),
            data.get("Gen AI Experience Score"),
            data.get("Projects"),
            data.get("Internships"),
            data.get("Certifications"),
            role_match(job_description, data.get("Key Skills"), data.get("Projects"), data.get("Internships"), data.get("Certifications")) if job_description else 0,
            inferred_career(data.get("Key Skills"), data.get("Projects"), data.get("Internships"), data.get("Certifications"))
        ))
        conn.commit()
        conn.close()

        with progress_lock:
            progress["completed"] += 1
    except Exception as e:
        print(f"Error inserting {file_name} into DB: {e}")


def cleanup_uploaded_files(folder_path):
    """Clean up the uploaded files after processing."""
    for file in os.listdir(folder_path):
        file_path = os.path.join(folder_path, file)
        try:
            os.remove(file_path)
        except Exception as e:
            print(f"Error deleting file {file}: {e}")

def init_db():
    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS processed_resumes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        file_name TEXT,
        name TEXT,
        contact_details TEXT,
        university TEXT,
        expected_year_of_completion INTEGER,
        course TEXT,
        discipline TEXT,
        cgpa REAL,
        key_skills TEXT,
        ai_ml_score REAL,
        gen_ai_score REAL,
        projects TEXT,
        internships TEXT,
        certifications TEXT,
        role_match INT,
        career TEXT
    )
    """)
    conn.commit()
    conn.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)