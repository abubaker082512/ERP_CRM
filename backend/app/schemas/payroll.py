from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import date, datetime

# Salary Structure
class SalaryStructureBase(BaseModel):
    name: str
    base_salary: float = 0.0
    allowances: float = 0.0
    deductions: float = 0.0
    currency: str = "USD"

class SalaryStructureCreate(SalaryStructureBase):
    pass

class SalaryStructure(SalaryStructureBase):
    id: UUID

    class Config:
        from_attributes = True

# Payslip
class PayslipBase(BaseModel):
    employee_id: UUID
    period_start: Optional[date] = None
    period_end: Optional[date] = None
    gross_amount: float = 0.0
    net_amount: float = 0.0
    salary_structure_id: Optional[UUID] = None

class PayslipCreate(PayslipBase):
    pass

class Payslip(PayslipBase):
    id: UUID
    generated_at: datetime

    class Config:
        from_attributes = True

# Payroll Run
class PayrollRunBase(BaseModel):
    name: str
    run_date: Optional[datetime] = None
    state: str = "draft"

class PayrollRunCreate(PayrollRunBase):
    pass

class PayrollRun(PayrollRunBase):
    id: UUID

    class Config:
        from_attributes = True
