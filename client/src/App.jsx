import { EthProvider } from './contexts/EthContext';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Header from './components/Header';

function App() {
  return (
    <EthProvider>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </EthProvider>
  );
}

export default App;
