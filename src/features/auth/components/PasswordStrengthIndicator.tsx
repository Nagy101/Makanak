import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";

export const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

interface Rule {
  key: string;
  test: (pw: string) => boolean;
}

const rules: Rule[] = [
  { key: "auth.pwRuleLength", test: (pw) => pw.length >= 8 },
  { key: "auth.pwRuleCase", test: (pw) => /[a-z]/.test(pw) && /[A-Z]/.test(pw) },
  { key: "auth.pwRuleNumber", test: (pw) => /\d/.test(pw) },
  { key: "auth.pwRuleSpecial", test: (pw) => /[@$!%*?&]/.test(pw) },
];

interface PasswordStrengthIndicatorProps {
  password: string;
}

export default function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation();

  const results = useMemo(
    () => rules.map((r) => ({ ...r, passed: r.test(password) })),
    [password],
  );

  const passedCount = results.filter((r) => r.passed).length;

  const strength = passedCount === 0 ? 0 : passedCount <= 2 ? 1 : passedCount <= 3 ? 2 : 3;
  const strengthColors = ["bg-muted", "bg-red-500", "bg-yellow-500", "bg-green-500"];
  const strengthLabels = [
    "",
    t("auth.pwStrengthWeak"),
    t("auth.pwStrengthMedium"),
    t("auth.pwStrengthStrong"),
  ];

  if (!password) return null;

  return (
    <div className="space-y-2 pt-1">
      {/* Progress bar */}
      <div className="flex gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= strength ? strengthColors[strength] : "bg-muted"
            }`}
          />
        ))}
      </div>
      {strength > 0 && (
        <p
          className={`text-xs font-medium ${
            strength === 1
              ? "text-red-500"
              : strength === 2
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-green-600 dark:text-green-400"
          }`}
        >
          {strengthLabels[strength]}
        </p>
      )}

      {/* Checklist */}
      <ul className="space-y-1">
        {results.map((r) => (
          <li
            key={r.key}
            className={`flex items-center gap-1.5 text-xs ${
              r.passed
                ? "text-green-600 dark:text-green-400"
                : "text-muted-foreground"
            }`}
          >
            {r.passed ? (
              <Check className="h-3 w-3 shrink-0" />
            ) : (
              <X className="h-3 w-3 shrink-0" />
            )}
            {t(r.key)}
          </li>
        ))}
      </ul>
    </div>
  );
}
