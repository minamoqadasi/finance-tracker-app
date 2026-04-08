import Svg, { Circle } from "react-native-svg";
import { StyleSheet, Text, View } from "react-native";

type PieChartProps = {
  data: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerValue: string;
  textColor: string;
  mutedTextColor: string;
};

export function PieChart({
  data,
  centerLabel,
  centerValue,
  textColor,
  mutedTextColor,
}: PieChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  const radius = 74;
  const strokeWidth = 24;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <View style={styles.wrapper}>
      <View style={styles.chartWrap}>
        <Svg width={190} height={190} viewBox="0 0 190 190">
          <Circle
            cx="95"
            cy="95"
            r={radius}
            stroke="rgba(255,255,255,0.18)"
            strokeWidth={strokeWidth}
            fill="none"
          />
          {data.map((item) => {
            const fraction = total === 0 ? 0 : item.value / total;
            const dash = circumference * fraction;
            const gap = circumference - dash;
            const circle = (
              <Circle
                key={item.label}
                cx="95"
                cy="95"
                r={radius}
                stroke={item.color}
                strokeWidth={strokeWidth}
                fill="none"
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={-cumulative}
                strokeLinecap="butt"
                rotation="-90"
                origin="95,95"
              />
            );
            cumulative += dash;
            return circle;
          })}
        </Svg>
        <View style={styles.centerLabel}>
          <Text style={[styles.centerTitle, { color: mutedTextColor }]}>{centerLabel}</Text>
          <Text style={[styles.centerValue, { color: textColor }]}>{centerValue}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  chartWrap: {
    width: 190,
    height: 190,
    alignItems: "center",
    justifyContent: "center",
  },
  centerLabel: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
  },
  centerTitle: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  centerValue: {
    fontSize: 20,
    fontWeight: "700",
  },
});
