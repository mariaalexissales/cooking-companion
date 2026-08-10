import { Box, Typography } from '@mui/material';
import type { ReactNode } from 'react';

interface PageHeadingProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export default function PageHeading({ title, subtitle, action }: PageHeadingProps) {
  return (
    <Box
      sx={{
        mb: 2,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" component="h2">
          {title}
        </Typography>
        {subtitle && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtitle}
          </Typography>
        )}
      </Box>
      {action}
    </Box>
  );
}
