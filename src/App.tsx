import Container from '@mui/material/Container';
import Header from './components/Header';
import Pantry from './components/Pantry';

function App() {
  return (
    <>
      <Header />
      <Container maxWidth="sm" disableGutters sx={{ px: 2 }}>
        <Pantry />
      </Container>
    </>
  );
}

export default App;