import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
//Primereact css file
import "primereact/resources/themes/lara-light-cyan/theme.css";
import "primeflex/primeflex.css";
import 'primeicons/primeicons.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
