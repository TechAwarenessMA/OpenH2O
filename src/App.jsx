import { Routes, Route } from 'react-router-dom';
import { EcoDataProvider, useEcoData } from './hooks/useEcoData';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Processing from './pages/Processing';
import Dashboard from './pages/Dashboard';
import Breakdown from './pages/Breakdown';
import Insights from './pages/Insights';
import Methodology from './pages/Methodology';
import About from './pages/About';

function AppRoutes() {
  const { hasData } = useEcoData();

  return (
    <Layout hasData={hasData}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/processing" element={<Processing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/breakdown" element={<Breakdown />} />
        <Route path="/insights" element={<Insights />} />
        <Route path="/methodology" element={<Methodology />} />
        <Route path="/about" element={<About />} />
      </Routes>
    </Layout>
  );
}

export default function App() {
  return (
    <EcoDataProvider>
      <AppRoutes />
    </EcoDataProvider>
  );
}
