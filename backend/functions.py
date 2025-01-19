import os
import pandas as pd
import sqlite3
from PyPDF2 import PdfReader
from openai import OpenAI
from dotenv import load_dotenv
from pydantic import BaseModel, Field
from typing import Optional, Dict
from concurrent.futures import ThreadPoolExecutor, as_completed
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import re

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


class ResumeData(BaseModel):
    name: Optional[str] = Field(None, alias="Name")
    contact_details: Optional[Dict[str, str]] = Field(None, alias="Contact Details")
    university: Optional[str] = Field(None, alias="University")
    expected_year_of_completion: Optional[str] = Field(None, alias="Expected Year of Current Course Completion")
    course: Optional[str] = Field(None, alias="Course")
    discipline: Optional[str] = Field(None, alias="Discipline")
    cgpa: Optional[str] = Field(None, alias="CGPA/Percentage")
    key_skills: Optional[str] = Field(None, alias="Key Skills")
    ai_ml_score: Optional[int] = Field(None, alias="AI/ML Experience Score")
    gen_ai_score: Optional[int] = Field(None, alias="Gen AI Experience Score")
    projects: Optional[str] = Field(None, alias="Projects")
    internships: Optional[str] = Field(None, alias="Internships")
    certifications: Optional[str] = Field(None, alias="Certifications")

def initialize_database(db_file):
    """Initialize SQLite database to store extracted text."""
    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT,
            text_content TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS processed_resumes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            file_name TEXT,
            name TEXT,
            contact_details TEXT,
            university TEXT,
            expected_year_of_completion TEXT,
            course TEXT,
            discipline TEXT,
            cgpa TEXT,
            key_skills TEXT,
            ai_ml_score INTEGER,
            gen_ai_score INTEGER,
            projects TEXT,
            internships TEXT,
            certifications TEXT
        )
    """)
    conn.commit()
    conn.close()

def calculate_expected_graduation(year_of_study):
    match = re.search(r'(19|20)\d{2}', str(year_of_study))
    return match.group(0) if match else "Unknown"

def extract_cgpa_or_percent(text):
    match = re.search(r'(\d+(?:\.\d+))%', str(text))
    if match:
        return match.group(1) + "%"
    match = re.search(r'(\d+(?:\.\d+))(?:/\d+(?:\.\d+))?', str(text))
    if match:
        return match.group(1)
    return "Unknown"

def extract_text_from_pdf(pdf_path):
    """Extract text from a single PDF."""
    try:
        print("extracted")
        reader = PdfReader(pdf_path)
        text = "".join(page.extract_text() for page in reader.pages)
        text = text.replace("\n", " ").strip()  # Normalize line breaks
        text = ' '.join(text.split())  # Remove extra whitespace
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""


def extract_and_score_resume(text):
    """Call OpenAI API to extract data and score the resume."""
    try:
        client = OpenAI(api_key=OPENAI_API_KEY)
        response = client.beta.chat.completions.parse(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": """You are an assistant designed to extract data and score resumes. Fields: Name, Contact Details, University, Expected Year of Current Course Completion, Course, Discipline, CGPA, Key Skills, Projects, Internships, Certifications.
                    Scores: Assign scores for AI/ML Experience (1-3) and Generative AI Experience (1-3). Score can have values 1-3, where 1 – Exposed, 2 – Handson and 3- worked on advanced areas such as Agentic RAG, Evals etc. Similarly for AI/ML experience score as well.
                 Also get skills from completed projects, internships, and certifications. """},
                {
                    "role": "user",
                    "content": f"""Extract the following fields and score the resume:
                    
                    Resume Content:\n{text}"""
                },
            ],
            temperature=0,
            response_format=ResumeData
        )
        data = response.choices[0].message.parsed
        print("scored")
        return data
    except Exception as e:
        print(f"Error processing resume: {e}")
        return ResumeData()


def process_resume(file_name, pdf_path, db_file):
    """Extract text, call OpenAI API, and save results."""
    text = extract_text_from_pdf(pdf_path)
    if not text:
        return

    parsed_data = extract_and_score_resume(text)
    data = parsed_data.model_dump(by_alias=True)

    conn = sqlite3.connect(db_file)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO processed_resumes (file_name, name, contact_details, university, expected_year_of_completion, course, discipline, cgpa, key_skills, ai_ml_score, gen_ai_score, projects, internships, certifications)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
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
    ))
    conn.commit()
    conn.close()


def process_resumes_parallel(input_dir, db_file, max_workers=5):
    """Process all resumes in parallel."""
    all_files = [file for file in os.listdir(input_dir) if file.endswith(".pdf")]
    tasks = []

    with ThreadPoolExecutor(max_workers=max_workers) as executor:
        for file_name in all_files:
            pdf_path = os.path.join(input_dir, file_name)
            tasks.append(executor.submit(process_resume, file_name, pdf_path, db_file))

        for future in as_completed(tasks):
            try:
                future.result()  
            except Exception as e:
                print(f"Error processing a task: {e}")

    print(f"Processed {len(all_files)} resumes in parallel and updated the database.")


def export_processed_data_to_csv(db_file, output_file):
    """Export processed data to a CSV file."""
    conn = sqlite3.connect(db_file)
    df = pd.read_sql_query("SELECT * FROM processed_resumes", conn)
    df.to_csv(output_file, index=False)
    conn.close()
    print(f"Processed data exported to {output_file}")


def role_match(job_description, skills, projects, internships, courses):
    client = OpenAI(api_key=OPENAI_API_KEY)

    model = 'ft:gpt-4o-mini-2024-07-18:personal:role-match:ArBD43Jl'

    resume = ""
    if skills:
        resume += f"Skills: {skills}. "
    if projects:
        resume += f"\nProjects: {projects}. "
    if internships:
        resume += f"\nInternships: {internships}. "
    if courses:
        resume += f"\nCourses: {courses}"

    prompt = f"Job Description: {job_description}\nResume: {resume}"

    completion = client.chat.completions.create(
        model=model,
        messages=[  
            {"role": "system", "content": "You are an assistant that evaluates job description and resume matches."},
            {"role": "user", "content": f"{prompt}"}
        ],
        max_tokens=50,  
        temperature=0.4  
    )


    return int(completion.choices[0].message.content.split()[-1])

class ResumeMatcher:
    def __init__(self, dataset_path):
        self.dataset = pd.read_csv(dataset_path).dropna(subset=['Category', 'Resume'])
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.dataset['Resume'])

    def compute_role_match(self, uploaded_resume):
        uploaded_vector = self.vectorizer.transform([uploaded_resume])      
        similarity_scores = cosine_similarity(uploaded_vector, self.tfidf_matrix).flatten()        
        self.dataset['Match Score'] = similarity_scores        
        matched_roles = self.dataset[['Category', 'Match Score']].sort_values(by='Match Score', ascending=False)
        return matched_roles.head(5).to_dict(orient="records")

def inferred_career(skills, projects, internships, courses):
    resume = ""
    if skills:
        resume += f"Skills: {skills}. "
    if projects:
        resume += f"\nProjects: {projects}. "
    if internships:
        resume += f"\nInternships: {internships}. "
    if courses:
        resume += f"\nCourses: {courses}"
    matcher = ResumeMatcher('UpdatedResumeDataSet.csv')
    result = matcher.compute_role_match(resume)
    cat = set()
    for item in result:
        cat.add(item['Category'])
    ret = ', '.join(list(cat))
    return ret
