import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useResolveDispute } from "../useDisputes";
import type { DisputeDecisionType } from "../dispute.types";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  disputeId: number | null;
}

export default function ResolveDisputeModal({
  open,
  onOpenChange,
  disputeId,
}: Props) {
  const { t } = useTranslation();
  const [decision, setDecision] = useState<DisputeDecisionType | "">("");
  const [comment, setComment] = useState("");
  const resolveMutation = useResolveDispute();

  const handleSubmit = useCallback(() => {
    if (!disputeId || !decision) return;
    resolveMutation.mutate(
      {
        disputeId,
        decision: decision as DisputeDecisionType,
        adminComment: comment,
      },
      {
        onSuccess: () => {
          setDecision("");
          setComment("");
          onOpenChange(false);
        },
      },
    );
  }, [disputeId, decision, comment, resolveMutation, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("disputes.resolveDispute")} #{disputeId}
          </DialogTitle>
          <DialogDescription>{t("disputes.chooseDecision")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>{t("disputes.decision")}</Label>
            <Select
              value={decision}
              onValueChange={(v) => setDecision(v as DisputeDecisionType)}
            >
              <SelectTrigger>
                <SelectValue placeholder={t("disputes.selectDecision")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Resolved">
                  {t("disputes.resolved")}
                </SelectItem>
                <SelectItem value="Rejected">
                  {t("disputes.rejected")}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("disputes.adminComment")}</Label>
            <Textarea
              rows={4}
              placeholder={t("disputes.provideReasoning")}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="hover:bg-muted hover:text-foreground"
          >
            {t("common.cancel")}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={resolveMutation.isPending || !decision}
          >
            {resolveMutation.isPending && (
              <Loader2 className="h-4 w-4 animate-spin mr-1" />
            )}
            {t("disputes.submitDecision")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
