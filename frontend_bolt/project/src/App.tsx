import { useState } from 'react';
import Landing from './components/Landing';
import ScannerPageSimple from './components/ScannerPageSimple';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  const [currentPage, setCurrentPage] = useState<'landing' | 'scanner'>('landing');
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return <ErrorBoundary error={error} />;
  }

  const handleStartScan = () => {
    setCurrentPage('scanner');
  };

  const handleBackToLanding = () => {
    setCurrentPage('landing');
  };

  try {
    return (
      <>
        {currentPage === 'landing' && <Landing onGetStarted={handleStartScan} />}
        {currentPage === 'scanner' && <ScannerPageSimple onBack={handleBackToLanding} />}
      </>
    );
  } catch (err) {
    setError(err as Error);
    return null;
  }
}

export default App;
