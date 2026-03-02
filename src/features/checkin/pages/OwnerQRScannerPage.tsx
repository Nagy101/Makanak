import { memo, useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { encodeId } from "@/lib/idEncoder";
import { Html5Qrcode } from "html5-qrcode";
import { useScanQrCode } from "@/features/payment/usePayment";
import type { QrScanBookingData } from "@/features/payment/payment.types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import BookingStatusBadge from "@/features/bookings/components/BookingStatusBadge";
import {
  Camera,
  Upload,
  QrCode,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { format } from "date-fns";

const toUrl = (path: string | null | undefined) =>
  !path ? "/placeholder.svg" : path.startsWith("http") ? path : `/${path}`;

/** Confirmed booking result card */
const ScanResultCard = memo(({ data }: { data: QrScanBookingData }) => {
  const { t } = useTranslation();
  return (
    <Card className="border-success/30 bg-success/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-success text-base">
          <CheckCircle2 className="h-5 w-5" />
          {t("checkin.checkinConfirmed")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <img
            src={toUrl(data.propertyMainImage)}
            alt={data.propertyName}
            className="h-16 w-24 rounded-lg object-cover bg-muted shrink-0"
            loading="lazy"
            width={96}
            height={64}
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.svg";
            }}
          />
          <div className="min-w-0">
            <p className="font-semibold text-foreground line-clamp-1">
              {data.propertyName}
            </p>
            <p className="text-sm text-muted-foreground">
              {t("bookings.ref")} {encodeId(data.id)}
            </p>
            <BookingStatusBadge status={data.status} />
          </div>
        </div>
        <Separator />
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">
              {t("checkin.tenant")}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              <img
                src={toUrl(data.tenantImage)}
                alt={data.tenantName}
                className="h-6 w-6 rounded-full object-cover"
                loading="lazy"
                width={24}
                height={24}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.svg";
                }}
              />
              <span className="font-medium text-foreground">
                {data.tenantName}
              </span>
            </div>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {t("checkin.nights")}
            </p>
            <p className="font-medium text-foreground mt-0.5">
              {data.totalDays}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {t("checkin.checkIn")}
            </p>
            <p className="font-medium text-foreground mt-0.5">
              {format(new Date(data.checkInDate), "MMM dd, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {t("checkin.checkOut")}
            </p>
            <p className="font-medium text-foreground mt-0.5">
              {format(new Date(data.checkOutDate), "MMM dd, yyyy")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {t("checkin.total")}
            </p>
            <p className="font-semibold text-primary mt-0.5">
              {data.totalPrice.toLocaleString()} {t("common.egp")}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">
              {t("checkin.yourPayout")}
            </p>
            <p className="font-semibold text-foreground mt-0.5">
              {data.amountToPayToOwner.toLocaleString()} {t("common.egp")}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
ScanResultCard.displayName = "ScanResultCard";

export default function OwnerQRScannerPage() {
  const { t } = useTranslation();
  const scanMutation = useScanQrCode();
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scanResult = scanMutation.data?.isSuccess
    ? scanMutation.data.data
    : null;

  const stopCamera = useCallback(() => {
    if (scannerRef.current?.isScanning) {
      scannerRef.current.stop().catch(() => {});
    }
    setCameraActive(false);
  }, []);

  const handleScanSuccess = useCallback(
    (decodedText: string) => {
      stopCamera();
      scanMutation.mutate({ qrCode: decodedText });
    },
    [scanMutation, stopCamera],
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    scanMutation.reset();
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("qr-reader");
      }
      await scannerRef.current.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScanSuccess,
        () => {},
      );
      setCameraActive(true);
    } catch (err: any) {
      setCameraError(
        err?.message?.includes("NotAllowedError") ||
          err?.message?.includes("Permission")
          ? t("checkin.cameraAccessDenied")
          : t("checkin.cameraNotAvailable"),
      );
    }
  }, [handleScanSuccess, scanMutation]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    };
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      scanMutation.reset();
      try {
        if (!scannerRef.current) {
          scannerRef.current = new Html5Qrcode("qr-reader");
        }
        const result = await scannerRef.current.scanFile(file, true);
        scanMutation.mutate({ qrCode: result });
      } catch {
        setCameraError(t("checkin.couldNotReadQr"));
      }
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    [scanMutation],
  );

  const handleReset = useCallback(() => {
    stopCamera();
    scanMutation.reset();
    setCameraError(null);
  }, [stopCamera, scanMutation]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">
        {t("checkin.qrCheckinScanner")}
      </h1>
      <p className="text-muted-foreground">{t("checkin.scanTenantQr")}</p>

      {/* Scanner area */}
      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Camera viewport */}
          <div
            ref={containerRef}
            className="relative mx-auto overflow-hidden rounded-xl bg-muted"
            style={{ maxWidth: 400 }}
          >
            <div id="qr-reader" style={{ width: "100%" }} />
            {!cameraActive && !scanResult && (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <QrCode className="h-10 w-10 text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {t("checkin.openCameraOrUpload")}
                </p>
              </div>
            )}
          </div>

          {/* Camera error */}
          {cameraError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
          )}

          {/* Mutation error */}
          {scanMutation.isError && (
            <div className="flex items-start gap-2 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{t("checkin.qrVerificationFailed")}</span>
            </div>
          )}

          {/* Action buttons */}
          {!scanResult && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              {!cameraActive ? (
                <Button onClick={startCamera} className="gap-2">
                  <Camera className="h-4 w-4" />
                  {t("checkin.openCamera")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={stopCamera}
                  className="gap-2"
                >
                  {t("checkin.stopCamera")}
                </Button>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                {t("checkin.uploadQrImage")}
              </Button>
            </div>
          )}

          {/* Loading */}
          {scanMutation.isPending && (
            <div className="space-y-3 py-4">
              <Skeleton className="h-20 w-full rounded-lg" />
              <Skeleton className="h-5 w-2/3 mx-auto" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scan result */}
      {scanResult && (
        <div className="space-y-4">
          <ScanResultCard data={scanResult} />
          <div className="flex justify-center">
            <Button variant="outline" onClick={handleReset} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              {t("checkin.scanAnother")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
