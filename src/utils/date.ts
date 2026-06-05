import { toJalaali } from "jalaali-js";

const persianDigits = "۰۱۲۳۴۵۶۷۸۹";

const persianMonths = [
  "فروردین", "اردیبهشت", "خرداد", "تیر", "مرداد", "شهریور",
  "مهر", "آبان", "آذر", "دی", "بهمن", "اسفند",
];

export function toPersianDigits(n: number): string {
  return String(n).replace(/\d/g, (d) => persianDigits[+d]);
}

export function toPersianDate(date: Date): string {
  const { jy, jm, jd } = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return `${toPersianDigits(jd)} ${persianMonths[jm - 1]} ${toPersianDigits(jy)}`;
}

export function toPersianYearMonth(date: Date): string {
  const { jy, jm } = toJalaali(
    date.getFullYear(),
    date.getMonth() + 1,
    date.getDate(),
  );
  return `${toPersianDigits(jy)} · ${toPersianDigits(jm).padStart(2, persianDigits[0])}`;
}
