export type Transaction = {
  id: number;
  label: string;
  category: string;
  type: "income" | "expense";
  amount: number;
};

export type RecurringExpense = {
  id: number;
  label: string;
  category: string;
  amount: number;
  dueDay: number;
  frequency: "Monthly" | "Quarterly" | "Yearly";
};

export type BudgetGoal = {
  id: number;
  name: string;
  spent: number;
  target: number;
};

export type SavingsGoal = {
  id: number;
  name: string;
  saved: number;
  target: number;
};

export const sampleTransactions: Transaction[] = [
  { id: 1, label: "Monthly paycheck", category: "Salary", type: "income", amount: 3200 },
  { id: 2, label: "Apartment rent", category: "Rent", type: "expense", amount: 1250 },
  { id: 3, label: "Groceries", category: "Food", type: "expense", amount: 86.4 },
  { id: 4, label: "Coffee and lunch", category: "Food", type: "expense", amount: 24.5 },
  { id: 5, label: "Freelance design", category: "Freelance", type: "income", amount: 420 },
  { id: 6, label: "Gym membership", category: "Health", type: "expense", amount: 55 },
  { id: 7, label: "Movie tickets", category: "Entertainment", type: "expense", amount: 32 },
  { id: 8, label: "Gas refill", category: "Transportation", type: "expense", amount: 61 },
];

export const recurringExpenses: RecurringExpense[] = [
  { id: 1, label: "Apartment rent", category: "Rent", amount: 1250, dueDay: 1, frequency: "Monthly" },
  { id: 2, label: "Car insurance", category: "Insurance", amount: 145, dueDay: 12, frequency: "Monthly" },
  { id: 3, label: "Internet bill", category: "Utilities", amount: 68, dueDay: 16, frequency: "Monthly" },
  { id: 4, label: "Spotify", category: "Entertainment", amount: 11.99, dueDay: 22, frequency: "Monthly" },
];

export const budgetGoals: BudgetGoal[] = [
  { id: 1, name: "Food budget", spent: 110.9, target: 350 },
  { id: 2, name: "Transportation budget", spent: 61, target: 180 },
  { id: 3, name: "Entertainment budget", spent: 43.99, target: 140 },
];

export const savingsGoals: SavingsGoal[] = [
  { id: 1, name: "Emergency fund", saved: 1800, target: 5000 },
  { id: 2, name: "Travel goal", saved: 650, target: 1800 },
];
