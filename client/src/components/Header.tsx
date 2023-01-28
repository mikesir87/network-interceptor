import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

export const Header = () => {
  const navigate = useNavigate();

  const navigateTo = (url: string) => () => navigate(url);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Container>
          <Toolbar disableGutters>
            <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
              Network Mentor
            </Typography>
          </Toolbar>
        </Container>
      </AppBar>
      </Box>
  );
};