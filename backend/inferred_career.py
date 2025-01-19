import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from PyPDF2 import PdfReader

class ResumeMatcher:
    def __init__(self, dataset_path):
        """
        Initialize the ResumeMatcher class with the dataset and TF-IDF vectorizer.
        """
        self.dataset = pd.read_csv(dataset_path).dropna(subset=['Category', 'Resume'])
        self.vectorizer = TfidfVectorizer(stop_words='english')
        self.tfidf_matrix = self.vectorizer.fit_transform(self.dataset['Resume'])

    def compute_role_match(self, uploaded_resume):
        """
        Compute the most relevant career roles for an uploaded resume based on similarity scores.
        """
        
        uploaded_vector = self.vectorizer.transform([uploaded_resume])

        
        similarity_scores = cosine_similarity(uploaded_vector, self.tfidf_matrix).flatten()

        
        self.dataset['Match Score'] = similarity_scores

        
        matched_roles = self.dataset[['Category', 'Match Score']].sort_values(by='Match Score', ascending=False)
        return matched_roles.head(5).to_dict(orient="records")
    
def extract_text_from_pdf(pdf_path):
    """Extract text from a single PDF."""
    try:
        print("extracted")
        reader = PdfReader(pdf_path)
        text = "".join(page.extract_text() for page in reader.pages)
        text = text.replace("\n", " ").strip()  
        text = ' '.join(text.split())  
        return text
    except Exception as e:
        print(f"Error extracting text from {pdf_path}: {e}")
        return ""

def inferred_career(resume_text):
    matcher = ResumeMatcher('UpdatedResumeDataSet.csv')
    result = matcher.compute_role_match(resume_text)
    cat = set()
    for item in result:
        cat.add(item['Category'])
    ret = ', '.join(list(cat))
    return ret
