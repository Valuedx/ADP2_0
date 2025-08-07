import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

import { Provider } from 'react-redux';
import { store } from '../src/store/index.ts'; // adjust path based on where your store is

const root = document.getElementById('root')!;
createRoot(root).render(
  <Provider store={store}>
    <App />
  </Provider>
);
