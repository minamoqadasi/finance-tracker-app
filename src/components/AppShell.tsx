import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import type { Session } from "@supabase/supabase-js";
import type { ReactNode } from "react";

import { supabase } from "../lib/supabase";
import {
  budgetGoals,
  recurringExpenses,
  sampleTransactions,
  savingsGoals,
} from "../data/financeData";
import { BackgroundPreset, getTheme, ThemeMode } from "../theme/colors";
import { PieChart } from "./PieChart";

type AppShellProps = {
  session: Session;
};

type TabKey = "main" | "categories" | "budgets" | "home";

const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: "main", label: "Main", icon: "wallet-outline" },
  { key: "categories", label: "Categories", icon: "pie-chart-outline" },
  { key: "budgets", label: "Budgets", icon: "flag-outline" },
  { key: "home", label: "Home", icon: "person-circle-outline" },
];

export function AppShell({ session }: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("main");
  const [themeMode, setThemeMode] = useState<ThemeMode>("light");
  const [backgroundPreset, setBackgroundPreset] = useState<BackgroundPreset>("lavender");

  const theme = getTheme(themeMode, backgroundPreset);

  const totals = useMemo(() => {
    return sampleTransactions.reduce(
      (accumulator, item) => {
        if (item.type === "income") {
          accumulator.income += item.amount;
        } else {
          accumulator.expenses += item.amount;
        }
        accumulator.saved = Math.max(accumulator.income - accumulator.expenses, 0);
        accumulator.balance = accumulator.income - accumulator.expenses;
        return accumulator;
      },
      { income: 0, expenses: 0, balance: 0, saved: 0 }
    );
  }, []);

  const recurringTotal = useMemo(
    () => recurringExpenses.reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const topCategory = useMemo(() => {
    const totalsByCategory = sampleTransactions.reduce<Record<string, number>>((accumulator, item) => {
      if (item.type === "expense") {
        accumulator[item.category] = (accumulator[item.category] || 0) + item.amount;
      }
      return accumulator;
    }, {});

    return Object.entries(totalsByCategory).sort((left, right) => right[1] - left[1]);
  }, []);

  const savingsRate = totals.income === 0 ? 0 : (totals.saved / totals.income) * 100;
  const nextRecurringExpense = [...recurringExpenses].sort((left, right) => left.dueDay - right.dueDay)[0];

  const screen = (() => {
    if (activeTab === "categories") {
      return (
        <ScrollView contentContainerStyle={styles.screenContent}>
          <ScreenHeader
            title="Categories"
            subtitle="See exactly where your money is going this month."
            theme={theme}
          />
          <Card theme={theme}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Spending breakdown</Text>
            <View style={styles.categorySection}>
              <PieChart
                data={topCategory.map(([label, value], index) => ({
                  label,
                  value,
                  color: theme.chart[index % theme.chart.length],
                }))}
                centerLabel="Expenses"
                centerValue={formatter.format(totals.expenses)}
                textColor={theme.text}
                mutedTextColor={theme.textMuted}
              />
              <View style={styles.legendList}>
                {topCategory.map(([label, value], index) => {
                  const share = totals.expenses === 0 ? 0 : (value / totals.expenses) * 100;
                  return (
                    <View key={label} style={styles.legendRow}>
                      <View
                        style={[
                          styles.legendDot,
                          { backgroundColor: theme.chart[index % theme.chart.length] },
                        ]}
                      />
                      <View style={styles.legendCopy}>
                        <Text style={[styles.transactionLabel, { color: theme.text }]}>{label}</Text>
                        <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>
                          {formatter.format(value)} | {share.toFixed(0)}%
                        </Text>
                      </View>
                    </View>
                  );
                })}
              </View>
            </View>
          </Card>
        </ScrollView>
      );
    }

    if (activeTab === "budgets") {
      return (
        <ScrollView contentContainerStyle={styles.screenContent}>
          <ScreenHeader
            title="Budgets & Goals"
            subtitle="Track budget targets and long-term savings goals."
            theme={theme}
          />
          <Card theme={theme}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Monthly budgets</Text>
            {budgetGoals.map((budget) => {
              const progress = Math.min((budget.spent / budget.target) * 100, 100);
              return (
                <View key={budget.id} style={styles.progressBlock}>
                  <View style={styles.progressHeader}>
                    <Text style={[styles.transactionLabel, { color: theme.text }]}>{budget.name}</Text>
                    <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>
                      {formatter.format(budget.spent)} of {formatter.format(budget.target)}
                    </Text>
                  </View>
                  <View style={[styles.progressTrack, { backgroundColor: theme.primarySoft }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: theme.primaryStrong },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </Card>

          <Card theme={theme}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Savings goals</Text>
            {savingsGoals.map((goal) => {
              const progress = Math.min((goal.saved / goal.target) * 100, 100);
              return (
                <View key={goal.id} style={styles.goalCard}>
                  <Text style={[styles.transactionLabel, { color: theme.text }]}>{goal.name}</Text>
                  <Text style={[styles.goalAmount, { color: theme.primaryStrong }]}>
                    {formatter.format(goal.saved)}
                  </Text>
                  <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>
                    Goal: {formatter.format(goal.target)}
                  </Text>
                  <View style={[styles.progressTrack, { backgroundColor: theme.primarySoft }]}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${progress}%`, backgroundColor: theme.primaryStrong },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </Card>
        </ScrollView>
      );
    }

    if (activeTab === "home") {
      return (
        <ScrollView contentContainerStyle={styles.screenContent}>
          <ScreenHeader
            title="Home & Settings"
            subtitle="Profile details, appearance controls, and quick account settings."
            theme={theme}
          />
          <Card theme={theme}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Profile</Text>
            <Text style={[styles.profileEmail, { color: theme.text }]}>{session.user.email}</Text>
            <Text style={[styles.panelBody, { color: theme.textMuted }]}>
              Signed in to MyPocket. Your preferences live here.
            </Text>
          </Card>

          <Card theme={theme}>
            <Text style={[styles.cardTitle, { color: theme.text }]}>Appearance</Text>
            <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>Mode</Text>
            <View style={styles.optionRow}>
              {(["light", "dark"] as ThemeMode[]).map((mode) => (
                <ChipButton
                  key={mode}
                  label={mode === "light" ? "Light" : "Dark"}
                  active={themeMode === mode}
                  onPress={() => setThemeMode(mode)}
                  theme={theme}
                />
              ))}
            </View>
            <Text style={[styles.transactionMeta, { color: theme.textMuted, marginTop: 16 }]}>
              Background color
            </Text>
            <View style={styles.optionRow}>
              {(["lavender", "midnight", "sunset"] as BackgroundPreset[]).map((preset) => (
                <ChipButton
                  key={preset}
                  label={preset[0].toUpperCase() + preset.slice(1)}
                  active={backgroundPreset === preset}
                  onPress={() => setBackgroundPreset(preset)}
                  theme={theme}
                />
              ))}
            </View>
          </Card>

          <Pressable
            style={[styles.signOutButton, { backgroundColor: theme.primaryStrong }]}
            onPress={() => supabase.auth.signOut()}
          >
            <Text style={styles.signOutLabel}>Sign out</Text>
          </Pressable>
        </ScrollView>
      );
    }

    return (
      <ScrollView contentContainerStyle={styles.screenContent}>
        <ScreenHeader
          title="Main"
          subtitle="Your main pocket summary with savings, recurring bills, and recent activity."
          theme={theme}
        />
        <View style={styles.heroGrid}>
          <View style={[styles.heroCard, { backgroundColor: theme.primaryStrong }]}>
            <Text style={styles.heroKicker}>Available balance</Text>
            <Text style={styles.heroValue}>{formatter.format(totals.balance)}</Text>
            <Text style={styles.heroSubtext}>Income minus spending this month</Text>
          </View>
          <View style={[styles.sideCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[styles.metricLabel, { color: theme.textMuted }]}>Saved this month</Text>
            <Text style={[styles.metricValue, { color: theme.success }]}>{formatter.format(totals.saved)}</Text>
            <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>
              {savingsRate.toFixed(0)}% savings rate
            </Text>
          </View>
        </View>

        <View style={styles.metricRow}>
          <MiniMetric label="Income" value={formatter.format(totals.income)} theme={theme} />
          <MiniMetric label="Expenses" value={formatter.format(totals.expenses)} theme={theme} />
        </View>

        <Card theme={theme}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Smart insight</Text>
          <Text style={[styles.panelBody, { color: theme.textMuted }]}>
            You saved {formatter.format(totals.saved)} this month after spending, and your top category is{" "}
            {topCategory[0]?.[0] ?? "N/A"} at {formatter.format(topCategory[0]?.[1] ?? 0)}.
          </Text>
        </Card>

        <Card theme={theme}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Recurring expenses</Text>
          <Text style={[styles.panelBody, { color: theme.textMuted }]}>
            Fixed bills total {formatter.format(recurringTotal)} per cycle. Next up is{" "}
            {nextRecurringExpense?.label ?? "N/A"} on day {nextRecurringExpense?.dueDay ?? "-"}.
          </Text>
          {recurringExpenses.map((item) => (
            <View key={item.id} style={[styles.row, { borderTopColor: theme.border }]}>
              <View>
                <Text style={[styles.transactionLabel, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>
                  {item.category} | {item.frequency} | Due day {item.dueDay}
                </Text>
              </View>
              <Text style={[styles.amountExpense, { color: theme.danger }]}>{formatter.format(item.amount)}</Text>
            </View>
          ))}
        </Card>

        <Card theme={theme}>
          <Text style={[styles.cardTitle, { color: theme.text }]}>Recent transactions</Text>
          {sampleTransactions.map((item) => (
            <View key={item.id} style={[styles.row, { borderTopColor: theme.border }]}>
              <View>
                <Text style={[styles.transactionLabel, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.transactionMeta, { color: theme.textMuted }]}>{item.category}</Text>
              </View>
              <Text
                style={[
                  item.type === "income" ? styles.amountIncome : styles.amountExpense,
                  { color: item.type === "income" ? theme.success : theme.danger },
                ]}
              >
                {item.type === "income" ? "+" : "-"}
                {formatter.format(item.amount)}
              </Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    );
  })();

  return (
    <View style={[styles.app, { backgroundColor: theme.background }]}>
      <View style={styles.content}>{screen}</View>
      <View
        style={[
          styles.tabBar,
          { backgroundColor: theme.surface, borderColor: theme.border, shadowColor: theme.shadow },
        ]}
      >
        {tabs.map((tab) => {
          const active = activeTab === tab.key;
          return (
            <Pressable key={tab.key} style={styles.tabButton} onPress={() => setActiveTab(tab.key)}>
              <Ionicons
                name={tab.icon}
                size={22}
                color={active ? theme.primaryStrong : theme.textMuted}
              />
              <Text
                style={[
                  styles.tabLabel,
                  { color: active ? theme.primaryStrong : theme.textMuted },
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ScreenHeader({
  title,
  subtitle,
  theme,
}: {
  title: string;
  subtitle: string;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={styles.header}>
      <Text style={[styles.headerTitle, { color: theme.text }]}>{title}</Text>
      <Text style={[styles.headerSubtitle, { color: theme.textMuted }]}>{subtitle}</Text>
    </View>
  );
}

function Card({
  children,
  theme,
}: {
  children: ReactNode;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.surface,
          borderColor: theme.border,
          shadowColor: theme.shadow,
        },
      ]}
    >
      {children}
    </View>
  );
}

function MiniMetric({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <View style={[styles.metricCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[styles.metricLabel, { color: theme.textMuted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: theme.text }]}>{value}</Text>
    </View>
  );
}

function ChipButton({
  label,
  active,
  onPress,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
}) {
  return (
    <Pressable
      style={[
        styles.chip,
        {
          backgroundColor: active ? theme.primarySoft : theme.surfaceMuted,
          borderColor: active ? theme.primaryStrong : theme.border,
        },
      ]}
      onPress={onPress}
    >
      <Text style={{ color: active ? theme.primaryStrong : theme.textMuted, fontWeight: "700" }}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  app: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  screenContent: {
    padding: 20,
    paddingBottom: 120,
    gap: 16,
  },
  header: {
    marginBottom: 4,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
  },
  headerSubtitle: {
    marginTop: 8,
    fontSize: 15,
    lineHeight: 23,
  },
  heroGrid: {
    gap: 12,
  },
  heroCard: {
    padding: 24,
    borderRadius: 28,
  },
  heroKicker: {
    color: "#eadcff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroValue: {
    color: "#fffdfc",
    fontSize: 38,
    fontWeight: "800",
    marginTop: 10,
  },
  heroSubtext: {
    color: "#efe4ff",
    marginTop: 6,
    fontSize: 14,
  },
  sideCard: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
  },
  metricRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    padding: 18,
    borderRadius: 22,
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 14,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 6,
  },
  card: {
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
    gap: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
  },
  panelBody: {
    fontSize: 15,
    lineHeight: 24,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
  },
  transactionLabel: {
    fontSize: 15,
    fontWeight: "700",
  },
  transactionMeta: {
    marginTop: 4,
    fontSize: 13,
  },
  amountIncome: {
    fontWeight: "700",
    fontSize: 15,
  },
  amountExpense: {
    fontWeight: "700",
    fontSize: 15,
  },
  categorySection: {
    gap: 18,
  },
  legendList: {
    gap: 12,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 999,
  },
  legendCopy: {
    flex: 1,
  },
  progressBlock: {
    gap: 8,
    marginTop: 6,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  goalCard: {
    gap: 8,
    marginTop: 6,
  },
  goalAmount: {
    fontSize: 24,
    fontWeight: "800",
  },
  profileEmail: {
    fontSize: 20,
    fontWeight: "700",
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 1,
  },
  signOutButton: {
    minHeight: 54,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  signOutLabel: {
    color: "#fffdfc",
    fontSize: 16,
    fontWeight: "700",
  },
  tabBar: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 22,
    borderWidth: 1,
    shadowOpacity: 1,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "700",
  },
});
