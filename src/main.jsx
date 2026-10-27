import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';

// index.htmlのroot要素に、Reactの画面を表示する。
createRoot(document.getElementById('root')).render(<App />);
