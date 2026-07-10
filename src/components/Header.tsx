import { useState } from "react";
import companionImg from "../assets/image.png";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import { Stack, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";

const NAV_ITEMS = ["Home", "Recipes", "Favorites"];

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <AppBar position="static">
      <Toolbar sx={{ gap: 1 }}>
        <Box
          component="img"
          src={companionImg}
          alt="Cooking Companion Logo"
          sx={(theme) => ({
            height: { xs: 64, sm: 128 },
            width: { xs: 60, sm: 120 },
            border: `4px solid ${theme.palette.text.primary}`,
            borderRadius: "50%",
            backgroundColor: theme.palette.background.paper,
          })}
        />
        <Box sx={{ ml: { xs: 1, sm: 2 }, minWidth: 0 }}>
          <Typography variant="h1" sx={{ fontSize: { xs: "22px", sm: "48px" } }}>
            Cooking Companion
          </Typography>
          <Typography variant="subtitle1" sx={{ fontSize: { xs: "15px", sm: "32px" } }}>
            I am the cooking companion that never leaves your side!
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        {isMobile ? (
          <IconButton
            color="inherit"
            aria-label="Open navigation menu"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
        ) : (
          <Stack direction="row" spacing={2}>
            {NAV_ITEMS.map((item) => (
              <Button key={item} color="inherit">
                {item}
              </Button>
            ))}
          </Stack>
        )}
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 240 }} role="presentation">
            <List>
              {NAV_ITEMS.map((item) => (
                <ListItemButton key={item} onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary={item} />
                </ListItemButton>
              ))}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
}
