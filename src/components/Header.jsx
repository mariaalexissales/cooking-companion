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
          sx={{
            height: 128,
            width: 120,
            border: "4px solid #e3b68e",
            borderRadius: "50%",
            backgroundColor: "#561d20",
          }}
        />
        <Box sx={{ ml: 2 }}>
          <Typography
            variant="h1"
            sx={{
              fontFamily: '"Roboto", sans-serif',
              fontSize: "48px",
              color: "#e3b68e",
            }}
          >
            Cooking Companion
          </Typography>
          <Typography
            variant="subtitle1"
            sx={{
              fontFamily: '"Mea Culpa", cursive',
              fontSize: "32px",
              color: "#d4a57d",
            }}
          >
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
