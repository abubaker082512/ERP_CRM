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
    date_from: date
    date_to: date
    number: Optional[str] = None
    state: str = "draft"
    basic_wage: float = 0.0
    net_wage: float = 0.0

class PayslipCreate(PayslipBase):
    pass

class Payslip(PayslipBase):
    id: UUID
    created_at: Optional[datetime] = None

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
