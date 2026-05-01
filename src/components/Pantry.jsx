import { useState } from "react";
import { Box, Button, List, ListItem, ListItemText } from "@mui/material";
import TextField from "@mui/material/TextField";

export default function Pantry() {
    const [input, setInput] = useState("");
    const [items, setItems] = useState([]);

    function handleAdd() {
        const trimmed = input.trim();
        if (!trimmed) return;
        setItems((prev) => [...prev, trimmed]);
        setInput("");
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
                    {items.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText primary={item} />
                        </ListItem>
                    ))}
                </List>
            </Box>
        </>
    );
}