import { Button, Snackbar } from '@mui/material';
import { SNACKBAR_OFFSET_SX } from '../hooks/useLayout';

export interface UndoState {
  message: string;
  undo: () => void | Promise<void>;
}

interface UndoSnackbarProps {
  state: UndoState | null;
  onClose: () => void;
}

export default function UndoSnackbar({ state, onClose }: UndoSnackbarProps) {
  return (
    <Snackbar
      open={state !== null}
      autoHideDuration={6000}
      onClose={(_, reason) => reason !== 'clickaway' && onClose()}
      message={state?.message}
      sx={SNACKBAR_OFFSET_SX}
      action={
        state ? (
          <Button
            color="primary"
            size="small"
            onClick={async () => {
              await state.undo();
              onClose();
            }}
          >
            Undo
          </Button>
        ) : undefined
      }
    />
  );
}
