import { toast, type ExternalToast } from "sonner";
import i18n from "@/lib/i18n";

type MessageValues = Record<string, string | number>;

const DEFAULT_OPTIONS: ExternalToast = {
  position: "top-center",
};

function resolveMessage(messageKeyOrText: string, values?: MessageValues): string {
  if (i18n.exists(messageKeyOrText)) {
    return i18n.t(messageKeyOrText, values);
  }
  return messageKeyOrText;
}

export function showSuccessMessage(
  messageKeyOrText: string,
  options?: ExternalToast,
  values?: MessageValues,
): void {
  toast.success(resolveMessage(messageKeyOrText, values), {
    ...DEFAULT_OPTIONS,
    ...options,
  });
}

export function showErrorMessage(
  messageKeyOrText: string,
  options?: ExternalToast,
  values?: MessageValues,
): void {
  toast.error(resolveMessage(messageKeyOrText, values), {
    ...DEFAULT_OPTIONS,
    ...options,
  });
}

export function showInfoMessage(
  messageKeyOrText: string,
  options?: ExternalToast,
  values?: MessageValues,
): void {
  toast.info(resolveMessage(messageKeyOrText, values), {
    ...DEFAULT_OPTIONS,
    ...options,
  });
}
