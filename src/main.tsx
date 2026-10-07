import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import App from './ui/App';
import { applyParts } from './ui/parts';
import { Studio } from './ui/Studio';
import { useLang } from './ui/useLang';
import { getLang } from './i18n';
import './ui/styles.css';

applyParts();
document.documentElement.lang = getLang();

// #studio opens the card studio, anything else the game
function Root() {
  useLang(); // re-render everything when the language changes
  const [hash, setHash] = useState(location.hash);
  useEffect(() => {
    const onChange = () => setHash(location.hash);
    addEventListener('hashchange', onChange);
    return () => removeEventListener('hashchange', onChange);
  }, []);
  return hash === '#studio' ? <Studio /> : <App />;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
);
