export type ConsistencyResult = {
  score: number;
  label: "High Confidence" | "Medium Confidence" | "Low Confidence";
  color: "green" | "amber" | "red";
  description: string;
};

export function calculateConsistency(salaries: number[], verifiedCount = 0): ConsistencyResult {
  if (salaries.length === 0) {
    return {
      score: 0,
      label: "Low Confidence",
      color: "red",
      description: "No data available to assess confidence.",
    };
  }

  const sorted = [...salaries].sort((a, b) => a - b);
  const mid    = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];

  const lower  = median * 0.7;
  const upper  = median * 1.3;
  const within = salaries.filter((s) => s >= lower && s <= upper).length;
  const raw    = Math.round((within / salaries.length) * 100);

  let boost = 0;
  if (verifiedCount > 0 && salaries.length > 0) {
    const ratio = verifiedCount / salaries.length;
    if (ratio >= 0.5)      boost = 20;
    else if (ratio >= 0.3) boost = 10;
  }
  const score = Math.min(100, raw + boost);

  if (score >= 75) {
    return {
      score,
      label: "High Confidence",
      color: "green",
      description: verifiedCount > 0
        ? `${score}% salary consistency, ${verifiedCount} verified submission${verifiedCount !== 1 ? "s" : ""}`
        : `${score}% of submissions fall within a similar salary range, indicating reliable market data.`,
    };
  }
  if (score >= 50) {
    return {
      score,
      label: "Medium Confidence",
      color: "amber",
      description: verifiedCount > 0
        ? `Based on ${salaries.length} submission${salaries.length !== 1 ? "s" : ""}, ${verifiedCount} verified`
        : `${score}% of submissions fall within a similar range. There is some variation in the data.`,
    };
  }
  return {
    score,
    label: "Low Confidence",
    color: "red",
    description: `Only ${score}% of submissions fall within a similar range. Salaries vary significantly — use as a rough guide only.`,
  };
}
