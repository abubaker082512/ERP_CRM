# Local Deployment Guide

Deploying the Next-Gen AI ERP & CRM platform locally requires spinning up both the backend API server (Python/FastAPI) and the frontend orchestrator (Next.js/React).

## 1. Starting the Backend Server

The backend requires Python 3.8+ and runs using `uvicorn`. Since the database connection via Supabase may be experiencing strict DNS issues or the tables do not exist yet, we have added mock fallbacks to the frontend, but the backend server still needs to be online to serve those requests or manage login handshakes.

### Commands:
```bash
# 1. Navigate to the backend directory
cd backend

# 2. Create a virtual environment natively
python3 -m venv venv

# 3. Activate the virtual environment
# On macOS / Linux:
source venv/bin/activate
# On Windows:
# .\venv\Scripts\activate

# 4. Install all python dependencies
pip install -r requirements.txt

# 5. Boot the server
uvicorn app.main:app --reload --host localhost --port 8000
```
*The API will now be running on `http://localhost:8000`. You can test this by visiting `http://localhost:8000/docs` in your browser to see the auto-generated Swagger UI.*

---

## 2. Starting the Frontend Next.js Interface

The frontend requires Node.js (18+ recommended). 

### Fix Red Errors (TypeScript Lintting)
If you recently opened the project in VSCode and see "red lines" everywhere, it is because your `node_modules` are not properly cached, or you haven't recently run an install on the new dependencies.

### Commands:
```bash
# 1. Navigate to the frontend directory
cd frontend

# 2. Update and install cleanly (This fixes 99% of red lint errors)
npm install

# 3. (Optional) Strict check for any remaining TypeScript errors
npm run lint

# 4. Turn on the local development server
npm run dev
```
*The frontend interface will now be mapped to `http://localhost:3000`. Open this in your browser.*

---

## 3. Dealing with Supabase Database Link Errors

If you see 500 errors in your terminal, it is because your Supabase credentials in `backend/.env` are not correct or the tables haven't been applied to your database yet.

1. Head into your Supabase Dashboard -> SQL Editor.
2. Copy all the contents found inside your local file `backend/full_schema.sql` and run it in the Supabase terminal. 
3. This creates all 26+ tables for your ERP instantly.
4. Next, open `backend/.env` and ensure `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_KEY` match your dashboard.
