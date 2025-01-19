# Generative AI-Powered Resume Analyzer

## Overview
The Generative AI-Powered Resume Analyzer automates the process of resume screening and shortlisting using advanced Generative AI techniques. This tool extracts structured data from resumes, scores candidates based on predefined criteria, and provides insights such as inferred career paths and role matches.

## Objectives
1. Parse and extract mandatory fields from resumes.
2. Score resumes based on the extracted data.
3. Handle batch processing of multiple resumes efficiently.
4. Output results in a structured format (e.g., CSV or Excel).

## Features and Innovations

### 1. Generative AI Integration
- **GPT-4 Integration**: Utilizes GPT-4 for extracting structured data, scoring resumes, and deriving insights such as skills, certifications, and project relevance.
- **Few-Shot Learning**: Adapts to varying resume formats using few-shot learning for improved accuracy and context-aware data extraction.
- **Fine-Tuned Role Matching Model**: Implements a fine-tuned model for enhanced job role matching, trained on specific datasets to increase relevance and precision.

### 2. Batch Processing
- Processes resumes in parallel using multithreading.
- Ensures scalable and time-efficient handling of large datasets.

### 3. Inferred Career Potential
- Employs TF-IDF vectorization and cosine similarity to analyze resumes and match them to potential career paths.
- Leverages a pre-trained dataset of roles and sample resumes for precise matching.

### 4. Role Match Score
- Matches resumes with job descriptions by evaluating skills, projects, and internships using OpenAI's finetuned role-matching model.
- Provides a role-match score for quick assessment of candidate suitability.

### 5. GitHub Integration
- Extracts and summarizes GitHub project information for candidates with linked profiles.
- Uses the GitHub API to retrieve README files and incorporates project summaries into the resume analysis.

### 6. Advanced Scoring Mechanism
- Scores candidates based on AI/ML and Generative AI experience:
  - **1**: Exposed.
  - **2**: Hands-on experience.
  - **3**: Advanced work (e.g., Agentic RAG, evaluation frameworks).

### 7. Frontend Integration
- A **React-based frontend** provides an intuitive user interface for uploading resumes, monitoring progress, and downloading results.
- Key features include:
  - Folder selection for batch processing.
  - Job description input for role-matching.
  - GitHub analysis toggle for project insights.
  - Real-time progress updates and status visualization.
  - Results download and reset options.

### 8. Output Quality
- Generates a neatly formatted Excel file containing extracted data and scores.
- Includes additional insights such as inferred careers and role matches.

## Implementation Details

### Architecture
- **Database**: SQLite database to store raw text and processed data.
- **Text Extraction**: PDF text extraction using `PyPDF2`.
- **Resume Matching**:
  - TF-IDF vectorization for dataset preparation.
  - Cosine similarity to compute match scores.
- **Generative AI**:
  - OpenAI API for resume parsing and scoring.
  - Summarization of GitHub projects using GPT-4.
- **Frontend**:
  - React-based interface for seamless user interaction and real-time updates.
- **Pipeline Design**:
  - Enables concurrent processing of multiple resumes using multithreading to improve speed and efficiency.

### Workflow
1. Upload a folder containing resumes in PDF format.
2. Extract text from each resume and preprocess it.
3. Parse text using Generative AI to extract fields and assign scores.
4. Match resumes to job roles and infer career potential.
5. Save results to the database and export them to an Excel file.
6. Use the React-based frontend to visualize progress and download results.

## Installation
To set up the Generative AI-Powered Resume Analyzer, follow these steps:

1. **Clone the Repository**:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. **Install Dependencies**:
   Ensure Python 3.8+ and Node.js are installed. Then, run:
   ```bash
   pip install -r requirements.txt
   cd frontend
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root and add:
   ```env
   OPENAI_API_KEY=<your-openai-api-key>
   GITHUB_TOKEN=<your-github-token>
   ```

4. **Start the Backend**:
   ```bash
   python app.py
   ```

5. **Start the Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

6. **Access the Application**:
   Open your browser and navigate to `http://localhost:5173`.

## Requirements
- **Input**: A folder containing PDF resumes.
- **Output**: Excel/CSV file with the following columns:
  - Name, Contact Details, University, Year of Study, Course, Discipline, CGPA/Percentage, Key Skills, Gen AI Experience Score, AI/ML Experience Score, Supporting Information (e.g., projects, internships).

## Evaluation Criteria
1. **Accuracy**:
   - High precision in extracting fields from varying resume formats.
2. **Efficiency**:
   - Process multiple resumes concurrently with minimal delay.
3. **Scalability**:
   - Handle large batches of resumes without performance degradation.
4. **Creativity**:
   - Innovative use of Generative AI for enhanced insights and user-friendly output.
5. **Frontend Usability**:
   - Intuitive and responsive React-based UI.
