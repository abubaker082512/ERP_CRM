# Next-Gen AI ERP

## Prerequisites
- Python 3.8+
- Node.js 16+ (Required for Frontend)
- Supabase Account

## Setup

### Backend
1. Navigate to `backend` directory.
2. Create a virtual environment: `python -m venv venv`
3. Activate it: `.\venv\Scripts\activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Copy `.env.example` to `.env` and fill in your Supabase credentials.
6. Run the server: `uvicorn app.main:app --reload`

### Frontend
(Requires Node.js)
1. Navigate to `frontend` directory.
2. Run `npm install`
3. Run `npm run dev`
