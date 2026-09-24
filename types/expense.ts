export type ExpenseCategory =
  | 'food'
  | 'transport'
  | 'lodging'
  | 'activities'
  | 'shopping'
  | 'other';

export interface Expense {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  paidByUid: string;
  paidByName: string;
  splitWithMemberUids: string[];
  date: string;
  notes?: string;
  createdAt: string;
}

export interface MemberBalance {
  memberUid: string;
  displayName: string;
  totalPaid: number;
  totalShare: number;
  netBalance: number; // positive: should receive, negative: owes
}

export interface DebtSettlement {
  fromUid: string;
  fromName: string;
  toUid: string;
  toName: string;
  amount: number;
  currency: string;
}
