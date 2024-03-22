// capitalize first letter of string
export const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// normalize rating (originally between -1 and 1) to between 0 and 1
export const normalizeRating = (rating: number) => (rating + 1) / 2;
