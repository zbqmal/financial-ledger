export const getDaysInMonth = (year: string, month: string) =>
  new Date(Number(year), Number(month), 0).getDate();

export const formatUsDate = (isoDate: string) => {
  const [year, month, day] = isoDate.split("-");
  return `${month}/${day}/${year}`;
};

export const getDefaultDate = (): {
  defaultYear: string;
  defaultMonth: string;
} => {
  const today = new Date();
  const defaultYear = String(today.getFullYear());
  const defaultMonth = String(today.getMonth() + 1).padStart(2, "0");

  return { defaultYear, defaultMonth };
};
