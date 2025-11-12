const TRUE_VALUES = new Set(["true", "1", "yes", "on"]);
const FALSE_VALUES = new Set(["false", "0", "no", "off"]);

function normalizeFlagValue(value: string | boolean | undefined | null): string | boolean | undefined | null {
  if (typeof value === "string") {
    return value.trim().toLowerCase();
  }
  return value;
}

export function parseBooleanFlag(value: string | boolean | undefined | null, defaultValue = false): boolean {
  const normalized = normalizeFlagValue(value);

  if (typeof normalized === "boolean") {
    return normalized;
  }

  if (typeof normalized === "string") {
    if (TRUE_VALUES.has(normalized)) {
      return true;
    }
    if (FALSE_VALUES.has(normalized)) {
      return false;
    }
  }

  return defaultValue;
}

export function isDashboardAuthDisabled(): boolean {
  // Na froncie dostępne są tylko zmienne z prefiksem PUBLIC_, ale na backendzie używamy tego samego helpera.
  const rawFlag =
    (import.meta.env.PUBLIC_DISABLE_DASHBOARD_AUTH as string | undefined) ??
    (import.meta.env.DISABLE_DASHBOARD_AUTH as string | undefined) ??
    undefined;

  if (!import.meta.env.DEV) {
    return false;
  }

  // Domyślnie wyłączamy auth w środowisku development, chyba że flaga jawnie ustawiona na false.
  return parseBooleanFlag(rawFlag, true);
}

