import { useState } from "react";
import { Box, Button, List, ListItem, ListItemText } from "@mui/material";
import TextField from "@mui/material/TextField";
import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db";

export default function Pantry() {
  const [input, setInput] = useState("");
  const items = useLiveQuery(() => db.items.toArray(), []) ?? [];

  async function handleAdd() {
    const trimmed = input.trim();
    if (!trimmed) return;
    await db.items.add({
      name: trimmed,
      quantity: 1,
      unit: "",
      favourited: false,
      addedAt: new Date(),
    });
    setInput("");
  }

  async function handleRemove(id: number) {
    await db.items.delete(id);
  }

  return (
    <>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, p: 2 }}>
        <TextField
          label="Pantry Item"
          variant="outlined"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <Button variant="contained" color="primary" onClick={handleAdd}>
          Add Item
        </Button>
      </Box>
      <Box sx={{ p: 2 }}>
        <List>
          {items.map((item) => (
            <ListItem key={item.id}>
              <ListItemText primary={item.name} />
              <Button variant="outlined" color="primary" onClick={() => handleRemove(item.id)}>
                Remove
              </Button>
            </ListItem>
          ))}
        </List>
      </Box>
    </>
  );
}