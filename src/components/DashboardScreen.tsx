import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Session } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";
import { colors } from "../theme/colors";

type DashboardScreenProps = {
  session: Session;
};

type Transaction = {
  id: number;
  label: string;
  category: string;
  type: "income" | "expense";
  amount: number;
};

type RecurringExpense = {
  id: number;
  label: string;
  category: string;
  amount: number;
  dueDay: number;
  frequency: "Monthly" | "Quarterly" | "Yearly";
};

const sampleTransactions = [
  { id: 1, label: "Monthly paycheck", category: "Salary", type: "income", amount: 3200 },
  { id: 2, label: "Apartment rent", category: "Rent", type: "expense", amount: 1250 },
  { id: 3, label: "Groceries", category: "Food", type: "expense", amount: 86.4 },
  { id: 4, label: "Coffee and lunch", category: "Food", type: "expense", amount: 24.5 },
  { id: 5, label: "Freelance design", category: "Freelance", type: "income", amount: 420 },
] satisfies Transaction[];

const recurringExpenses = [
  { id: 1, label: "Apartment rent", category: "Rent", amount: 1250, dueDay: 1, frequency: "Monthly" },
  { id: 2, label: "Car insurance", category: "Insurance", amount: 145, dueDay: 12, frequency: "Monthly" },
  { id: 3, label: "Internet bill", category: "Utilities", amount: 68, dueDay: 16, frequency: "Monthly" },
  { id: 4, label: "Spotify", category: "Entertainment", amount: 11.99, dueDay: 22, frequency: "Monthly" },
] satisfies RecurringExpense[];

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function DashboardScreen({ session }: DashboardScreenProps) {
  const totals = useMemo(() => {
    return sampleTransactions.reduce(
      (accumulator, item) => {
        if (item.type === "income") {
          accumulator.income += item.amount;
        } else {
          accumulator.expenses += item.amount;
        }

        accumulator.balance = accumulator.income - accumulator.expenses;
        return accumulator;
      },
      { income: 0, expenses: 0, balance: 0 }
    );
  }, []);

  const topCategory = useMemo(() => {
    const totalsByCategory = sampleTransactions.reduce<Record<string, number>>((accumulator, item) => {
      if (item.type === "expense") {
        accumulator[item.category] = (accumulator[item.category] || 0) + item.amount;
      }
      return accumulator;
    }, {});

    return Object.entries(totalsByCategory).sort((left, right) => right[1] - left[1])[0];
  }, []);

  const recurringTotal = useMemo(() => {
    return recurringExpenses.reduce((sum, item) => sum + item.amount, 0);
  }, []);

  const nextRecurringExpense = useMemo(() => {
    return [...recurringExpenses].sort((left, right) => left.dueDay - right.dueDay)[0];
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.heroCard}>
        <Text style={styles.eyebrow}>Signed in</Text>
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>{session.user.email}</Text>
        <Text style={styles.balanceLabel}>Current balance</Text>
        <Text style={styles.balanceValue}>{formatter.format(totals.balance)}</Text>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Income</Text>
          <Text style={[styles.metricValue, styles.income]}>{formatter.format(totals.income)}</Text>
        </View>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Expenses</Text>
          <Text style={[styles.metricValue, styles.expense]}>{formatter.format(totals.expenses)}</Text>
        </View>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Smart insight</Text>
        <Text style={styles.panelBody}>
          Your highest spending category is {topCategory?.[0] ?? "N/A"} at{" "}
          {topCategory ? formatter.format(topCategory[1]) : formatter.format(0)} this month.
        </Text>
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Recurring expenses</Text>
        <Text style={styles.panelBody}>
          Your fixed recurring costs add up to {formatter.format(recurringTotal)} per cycle.
          {nextRecurringExpense
            ? ` Next up is ${nextRecurringExpense.label} on day ${nextRecurringExpense.dueDay}.`
            : ""}
        </Text>
        {recurringExpenses.map((item) => (
          <View key={item.id} style={styles.recurringRow}>
            <View>
              <Text style={styles.transactionLabel}>{item.label}</Text>
              <Text style={styles.transactionMeta}>
                {item.category} | {item.frequency} | Due day {item.dueDay}
              </Text>
            </View>
            <Text style={styles.expense}>{formatter.format(item.amount)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.panel}>
        <Text style={styles.panelTitle}>Recent transactions</Text>
        {sampleTransactions.map((item) => (
          <View key={item.id} style={styles.transactionRow}>
            <View>
              <Text style={styles.transactionLabel}>{item.label}</Text>
              <Text style={styles.transactionMeta}>{item.category}</Text>
            </View>
            <Text style={item.type === "income" ? styles.income : styles.expense}>
              {item.type === "income" ? "+" : "-"}
              {formatter.format(item.amount)}
            </Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.signOutButton} onPress={() => supabase.auth.signOut()}>
        <Text style={styles.signOutLabel}>Sign out</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    gap: 16,
    backgroundColor: colors.sand50,
  },
  heroCard: {
    padding: 24,
    borderRadius: 28,
    backgroundColor: colors.teal700,
  },
  eyebrow: {
    color: "#d5fffa",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.3,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  title: {
    color: colors.white,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    color: "#ccfbf1",
    marginTop: 6,
    marginBottom: 20,
  },
  balanceLabel: {
    color: "#ccfbf1",
    fontSize: 14,
  },
  balanceValue: {
    color: colors.white,
    fontSize: 40,
    fontWeight: "700",
    marginTop: 6,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricLabel: {
    color: colors.slate600,
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
  },
  income: {
    color: colors.green700,
  },
  expense: {
    color: colors.red600,
  },
  panel: {
    padding: 20,
    borderRadius: 24,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 14,
  },
  panelTitle: {
    color: colors.slate900,
    fontSize: 20,
    fontWeight: "700",
  },
  panelBody: {
    color: colors.slate600,
    fontSize: 15,
    lineHeight: 24,
  },
  transactionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  recurringRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  transactionLabel: {
    color: colors.slate900,
    fontSize: 15,
    fontWeight: "600",
  },
  transactionMeta: {
    color: colors.slate600,
    marginTop: 3,
  },
  signOutButton: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.slate900,
    marginBottom: 18,
  },
  signOutLabel: {
    color: colors.white,
    fontSize: 16,
    fontWeight: "700",
  },
});
