import { useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
  type SelectChangeEvent,
} from "@mui/material";

import {
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
  DeleteOutlineOutlined as DeleteOutlineIcon,
} from "@mui/icons-material";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

const UNITS = ["pcs", "g", "kg", "ml", "l", "oz", "lb", "cup", "tbsp", "tsp"];

export default function Pantry() {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState("pcs");

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const items = useLiveQuery(() => db.items.toArray(), []) ?? [];

  const sortedItems = [...items].sort((a, b) => {
    if (a.favourited !== b.favourited) return a.favourited ? -1 : 1;
    return a.name.localeCompare(b.name);
  });

  async function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await db.items.add({
      name: trimmed,
      quantity,
      unit,
      favourited: false,
      addedAt: new Date(),
    });
    setName("");
    setQuantity(1);
    setUnit("pcs");
  }

  async function handleRemove(id: number) {
    await db.items.delete(id);
  }

  async function handleToggleFavourite(id: number, current: boolean) {
    await db.items.update(id, { favourited: !current });
  }

  return (
    <>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 2,
          p: 2,
        }}
      >
        <TextField
          label="Pantry Item"
          variant="outlined"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          fullWidth
          sx={{ flex: 2 }}
        />
        <TextField
          label="Quantity"
          type="number"
          variant="outlined"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          slotProps={{ htmlInput: { min: 0 } }}
          sx={{ flex: 1, minWidth: 100 }}
        />
        <Select
          value={unit}
          onChange={(e: SelectChangeEvent) => setUnit(e.target.value)}
          sx={{ flex: 1, minWidth: 100 }}
        >
          {UNITS.map((u) => (
            <MenuItem key={u} value={u}>
              {u}
            </MenuItem>
          ))}
        </Select>
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Item
        </Button>
      </Box>
      <Box sx={{ p: 2 }}>
        <List>
          {sortedItems.map((item) => (
            <ListItem
              key={item.id}
              secondaryAction={
                isMobile ? (
                  <IconButton onClick={() => handleRemove(item.id)} aria-label="Remove item">
                    <DeleteOutlineIcon />
                  </IconButton>
                ) : (
                  <Button variant="outlined" color="primary" onClick={() => handleRemove(item.id)}>
                    Remove
                  </Button>
                )
              }
            >
              <IconButton
                onClick={() => handleToggleFavourite(item.id, item.favourited)}
                sx={{ mr: 1 }}
              >
                {item.favourited ? (
                  <FavoriteIcon color="error" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </IconButton>
              <ListItemText primary={item.name} secondary={`${item.quantity} ${item.unit}`} />
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
}