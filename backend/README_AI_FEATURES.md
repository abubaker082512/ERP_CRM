# AI Features Implementation

## 1. Lead Scoring
**Location**: `backend/app/services/lead_scoring.py`

### Current Logic (Rule-Based)
The current implementation uses a weighted scoring system to calculate the probability of a lead converting.
- **Base Score**: 10 points
- **Email Provided**: +10 points
- **Phone Provided**: +10 points
- **Company Name Provided**: +5 points
- **Source**:
    - Referral: +20 points
    - LinkedIn: +15 points
    - Website: +5 points

### Future ML Implementation
To upgrade this to a Machine Learning model:
1.  Collect historical lead data (features + conversion status).
2.  Train a classification model (e.g., Random Forest, XGBoost).
3.  Replace the `calculate_score` method to load the trained model and run inference.

## 2. Sentiment Analysis (Planned)
**Location**: `backend/app/services/ai_service.py` (Placeholder)

### Goal
Analyze the content of emails and notes to determine customer sentiment.

### Implementation Plan
1.  Use a pre-trained NLP model (e.g., Hugging Face `transformers` or OpenAI API).
2.  Create an endpoint to accept text and return a sentiment score (-1.0 to 1.0).
3.  Trigger this analysis whenever a new note or email is logged against a lead.
