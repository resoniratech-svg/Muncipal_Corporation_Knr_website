import {
  BUDGET_PAGE_1,
  BUDGET_PAGE_5_LEADERSHIP,
  BUDGET_HARMONIZED,
  DEPARTMENT_EXPENDITURE_PAGE_2,
  DEPARTMENT_EXPENDITURE_PAGE_5,
  DEPARTMENT_EXPENDITURE_HARMONIZED,
  BudgetSummary,
  DepartmentExpenditure,
} from '../../data/budget';

export const budgetRepository = {
  getOverview(mode: 'deck-exact' | 'harmonized', page?: number): BudgetSummary {
    if (mode === 'harmonized') {
      return BUDGET_HARMONIZED;
    }
    return page === 5 ? BUDGET_PAGE_5_LEADERSHIP : BUDGET_PAGE_1;
  },

  getDepartmentExpenditure(mode: 'deck-exact' | 'harmonized', page?: number): DepartmentExpenditure[] {
    if (mode === 'harmonized') {
      return DEPARTMENT_EXPENDITURE_HARMONIZED;
    }
    return page === 5 ? DEPARTMENT_EXPENDITURE_PAGE_5 : DEPARTMENT_EXPENDITURE_PAGE_2;
  },
};
