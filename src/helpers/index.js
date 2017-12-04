/* eslint import/prefer-default-export: 0 */
export const getDate = (unix = false) => {
  const date = new Date().getTime();
  if (!unix) return date;
  return Math.round(date / 1000);
};
