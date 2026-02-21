import { memo } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { QrCode } from 'lucide-react';

interface TenantQRCodeDisplayProps {
  qrCodeValue: string;
  bookingId: number;
  propertyName: string;
}

const TenantQRCodeDisplay = memo(
  ({ qrCodeValue, bookingId, propertyName }: TenantQRCodeDisplayProps) => {
    return (
      <Card className="border-0 ring-1 ring-border">
        <CardHeader className="pb-3 text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-base">
            <QrCode className="h-5 w-5 text-primary" />
            Check-in QR Code
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Show this QR code to the property owner upon arrival
          </p>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 pb-6">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <QRCodeSVG
              value={qrCodeValue}
              size={200}
              level="H"
              includeMargin
              fgColor="hsl(220, 20%, 10%)"
              bgColor="transparent"
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">{propertyName}</p>
            <p className="text-xs text-muted-foreground">Booking #{bookingId}</p>
          </div>
        </CardContent>
      </Card>
    );
  },
);

TenantQRCodeDisplay.displayName = 'TenantQRCodeDisplay';
export default TenantQRCodeDisplay;
