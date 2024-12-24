import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import App from './App';

// Add favicon
const link = document.createElement('link');
link.rel = 'icon';
link.href = '/favicon.ico';
document.head.appendChild(link);

document.title = "DealCost";

ReactDOM.render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
  document.getElementById('root')
);