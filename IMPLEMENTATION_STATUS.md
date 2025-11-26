# Implementation Status

## ✅ Completed Modules
- **Sales & CRM**: Leads, Opportunities, Quotations, Sales Orders.
- **Inventory**: Warehouses, Locations, Stock Moves, Quants.
- **Purchase**: RFQs, Purchase Orders.
- **Accounting**: Accounts, Journals, Invoices/Bills (Moves).
- **HRMS**: Departments, Employees.
- **Manufacturing**: BOMs, Production Orders (Backend & Frontend).
- **Project**: Projects, Tasks, Timesheets.
- **Helpdesk**: Tickets, Messages.
- **Payroll**: Salary Structures, Payslips, Runs (Backend & Frontend).
- **Documents**: File/Folder management (Backend & Frontend).
- **Discuss**: Channels, Messages (Backend & Frontend).
- **Settings**: General Settings UI.
- **AI Features**: Mocked Global Search & "Ask Data" API.

## 🚧 Pending / Future Work
- **Website Builder**: Drag-and-drop editor (Complex, requires dedicated library).
- **E-commerce Frontend**: Product catalog & Cart UI.
- **Real-time Chat**: WebSocket integration for Discuss (currently polling/API based).
- **Advanced AI**: Integration with real LLM (OpenAI/Gemini) instead of mock.
- **Role-Based Access Control (RBAC)**: Enforce policies in RLS (currently open).

## System Architecture
- **Backend**: FastAPI + Supabase (PostgreSQL).
- **Frontend**: Next.js 15 + Tailwind CSS.
- **Authentication**: JWT (Mocked/Simple).

## How to Run
1. **Backend**:
   ```bash
   cd backend
   uvicorn app.main:app --reload
   ```
2. **Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```
