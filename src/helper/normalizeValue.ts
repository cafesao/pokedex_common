export default function normalizeValue(
  value: number,
  minInput = 1,
  maxInput = 255,
  minOutput = 1,
  maxOutput = 100,
): number {
  // First, we limit the input value to the specified range
  const clampedValue = Math.max(Math.min(value, maxInput), minInput);

  // Calculate the percentage of the value in the input range
  const percentage = (clampedValue - minInput) / (maxInput - minInput);

  // Map this percentage to the output range
  const result = minOutput + percentage * (maxOutput - minOutput);

  // Round to the nearest integer
  return Math.round(result);
}
