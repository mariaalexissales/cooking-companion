import companionImg from "../assets/companion.png";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";

export default function Header() {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box
          component="img"
          src={companionImg}
          alt="Cooking Companion Logo"
          sx={(theme) => ({
            height: 128,
            width: 120,
            border: `4px solid ${theme.palette.text.primary}`,
            borderRadius: "50%",
            backgroundColor: theme.palette.background.paper,
          })}
        />
        <Box sx={{ ml: 2 }}>
          <Typography variant="h1">
            Cooking Companion
          </Typography>
          <Typography variant="subtitle1">
            I am the cooking companion that never leaves your side!
          </Typography>
        </Box>
        <Box sx={{ flexGrow: 1 }} />
        <Button color="inherit">Home</Button>
        <Button color="inherit">Recipes</Button>
        <Button color="inherit">Favorites</Button>
      </Toolbar>
    </AppBar>
  );
}
