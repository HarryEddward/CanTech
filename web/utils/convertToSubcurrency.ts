export function convertToSubcurrency(amount: number, factor: number = 100): number {
  // Assuming the main currency is in dollars and subcurrency is in cents
  return Math.round(amount * factor);
};