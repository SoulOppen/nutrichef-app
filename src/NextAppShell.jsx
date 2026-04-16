'use client';

import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';

export default function NextAppShell() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
