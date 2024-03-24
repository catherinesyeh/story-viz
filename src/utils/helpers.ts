// capitalize first letter of string
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// normalize rating (originally between -1 and 1) to between 0 and 1
export const normalizeRating = (rating: number) => (rating + 1) / 2;

// normalize value to between 4 and 10
export const normalizeValue = (value: number, min: number, max: number) =>
  4 + ((value - min) * 6) / (max - min);
