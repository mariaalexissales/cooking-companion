import Chip from '@mui/material/Chip';
import EventBusyOutlinedIcon from '@mui/icons-material/EventBusyOutlined';
import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import { describeExpiry, type ExpiryStatus } from '../utils/expiry';

type ChipColor = 'default' | 'error' | 'warning' | 'info';

const COLOR_BY_STATUS: Record<ExpiryStatus, ChipColor> = {
  expired: 'error',
  critical: 'warning',
  soon: 'info',
  fresh: 'default',
  none: 'default',
};

const FILLED: ExpiryStatus[] = ['expired', 'critical'];

interface ExpiryChipProps {
  expiresAt?: Date;
  onClick?: () => void;
}

export default function ExpiryChip({ expiresAt, onClick }: ExpiryChipProps) {
  const { status, label } = describeExpiry(expiresAt);

  const icon =
    status === 'expired' ? (
      <EventBusyOutlinedIcon />
    ) : status === 'none' ? (
      <EditCalendarOutlinedIcon />
    ) : (
      <EventAvailableOutlinedIcon />
    );

  return (
    <Chip
      size="small"
      icon={icon}
      label={label}
      color={COLOR_BY_STATUS[status]}
      variant={FILLED.includes(status) ? 'filled' : 'outlined'}
      onClick={onClick}
      aria-label={onClick ? `${label}. Change expiry date` : label}
    />
  );
}
