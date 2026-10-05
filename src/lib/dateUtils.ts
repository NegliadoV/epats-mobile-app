/**
 * Утилиты для работы с датами в мобильном приложении epats.wiki.
 * Поддерживают ввод формата ДД.ММ.ГГГГ без необходимости вручную вводить точки или черточки.
 */

/**
 * Автоматическая маска ввода даты (только цифры -> ДД.ММ.ГГГГ)
 */
export function maskDateInput(text: string): string {
  if (!text) return "";
  const digits = text.replace(/\D/g, "").slice(0, 8);
  if (digits.length === 0) return "";
  if (digits.length <= 2) {
    return text.endsWith(".") && digits.length === 2 ? digits + "." : digits;
  }
  if (digits.length <= 4) {
    const base = digits.slice(0, 2) + "." + digits.slice(2);
    return text.endsWith(".") && digits.length === 4 ? base + "." : base;
  }
  return digits.slice(0, 2) + "." + digits.slice(2, 4) + "." + digits.slice(4);
}

/**
 * Парсер даты из формата ДД.ММ.ГГГГ, ДД.ММ.ГГ или ISO YYYY-MM-DD
 */
export function parseDateInput(text: string | null | undefined): Date | null {
  if (!text) return null;
  const trimmed = text.trim();
  const parts = trimmed.split(/[\.\s\-\/]/).filter(Boolean);
  if (parts.length === 3) {
    let day = parseInt(parts[0], 10);
    let month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    // Если формат ГГГГ.ММ.ДД
    if (parts[0].length === 4) {
      year = parseInt(parts[0], 10);
      month = parseInt(parts[1], 10);
      day = parseInt(parts[2], 10);
    }
    if (year < 100) year += 2000;
    if (day >= 1 && day <= 31 && month >= 1 && month <= 12 && year >= 2020 && year <= 2040) {
      const d = new Date(year, month - 1, day);
      if (!isNaN(d.getTime())) return d;
    }
  }
  const iso = new Date(trimmed);
  if (!isNaN(iso.getTime())) return iso;
  return null;
}

/**
 * Преобразование даты в формат отображения ДД.ММ.ГГГГ
 */
export function toDisplayDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (typeof d === "string") {
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(d)) return d;
    const parsed = parseDateInput(d);
    if (!parsed) return d;
    d = parsed;
  }
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}.${month}.${year}`;
}

/**
 * Преобразование даты в формат ISO (YYYY-MM-DD) для хранения в БД и профиле
 */
export function toIsoDate(d: Date | string | null | undefined): string {
  if (!d) return "";
  if (typeof d === "string") {
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return d;
    const parsed = parseDateInput(d);
    if (!parsed) return d;
    d = parsed;
  }
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Безопасное отображение дня недели из прогноза погоды (избегает Invalid Date на Android)
 */
export function formatWeatherDay(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  if (dateStr.includes(",")) {
    return dateStr.split(",")[0].trim();
  }
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.toLocaleDateString("ru-RU", { weekday: "short" });
  }
  return dateStr;
}
