import { memo } from 'react';
import type { Dispute } from '../dispute.types';
import DisputeStatusBadge from './DisputeStatusBadge';
import { format } from 'date-fns';
import { encodeId } from '@/lib/idEncoder';

interface Props {
  dispute: Dispute;
}

const toUrl = (path: string) =>
  path.startsWith('http') ? path : `/${path}`;

const DisputeDetailsView = memo<Props>(({ dispute }) => (
  <div className="space-y-5">
    {/* Header */}
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-lg font-semibold text-foreground">{dispute.propertyName}</h3>
        <p className="text-sm text-muted-foreground">Ref. {encodeId(dispute.bookingId)}</p>
      </div>
      <DisputeStatusBadge status={dispute.status} />
    </div>

    {/* Info grid */}
    <div className="grid grid-cols-2 gap-3 text-sm">
      <div>
        <p className="text-muted-foreground">Complainant</p>
        <p className="font-medium text-foreground">{dispute.complainantName}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Defendant</p>
        <p className="font-medium text-foreground">{dispute.defendantName}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Reason</p>
        <p className="font-medium text-foreground">{dispute.reason}</p>
      </div>
      <div>
        <p className="text-muted-foreground">Filed</p>
        <p className="font-medium text-foreground">{format(new Date(dispute.createdAt), 'MMM dd, yyyy')}</p>
      </div>
      {dispute.resolvedAt && (
        <div className="col-span-2">
          <p className="text-muted-foreground">Resolved At</p>
          <p className="font-medium text-foreground">{format(new Date(dispute.resolvedAt), 'MMM dd, yyyy')}</p>
        </div>
      )}
    </div>

    {/* Description */}
    <div>
      <p className="text-sm text-muted-foreground mb-1">Description</p>
      <p className="text-sm text-foreground bg-secondary/50 rounded-lg p-3">{dispute.description}</p>
    </div>

    {/* Admin Comment */}
    {dispute.adminComment && (
      <div>
        <p className="text-sm text-muted-foreground mb-1">Admin Comment</p>
        <p className="text-sm text-foreground bg-primary/5 rounded-lg p-3 border border-primary/10">
          {dispute.adminComment}
        </p>
      </div>
    )}

    {/* Images */}
    {dispute.images?.length > 0 && (
      <div>
        <p className="text-sm text-muted-foreground mb-2">Attached Images</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {dispute.images.map((img, i) => (
            <a key={i} href={toUrl(img)} target="_blank" rel="noopener noreferrer" className="block">
              <img
                src={toUrl(img)}
                alt={`Evidence ${i + 1}`}
                className="h-28 w-full object-cover rounded-lg border border-border hover:opacity-80 transition-opacity"
                loading="lazy"
                width={200}
                height={112}
              />
            </a>
          ))}
        </div>
      </div>
    )}
  </div>
));

DisputeDetailsView.displayName = 'DisputeDetailsView';
export default DisputeDetailsView;
