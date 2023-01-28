import { DockerMuiThemeProvider } from '@docker/docker-mui-theme';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Header } from './components/Header';
import { CaptureRoute } from './components/Captures/CaptureRoute';

function App() {
  return (
    <BrowserRouter>
      <DockerMuiThemeProvider>
        <CssBaseline />

        <Header />

        <Grid container justifyContent="center" columns={{ xs: 4, md: 12, lg: 12 }}>
          <Grid item xs={12} md={10} lg={8}>
            <Routes>
              <Route path="*" element={<CaptureRoute />} />
            </Routes>
          </Grid>
        </Grid>
      </DockerMuiThemeProvider>
    </BrowserRouter>
  );
}

export default App;
