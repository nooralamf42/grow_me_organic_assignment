import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { PrimeReactProvider } from 'primereact/api';
import 'primeicons/primeicons.css';       
import 'primereact/resources/themes/lara-light-indigo/theme.css';


createRoot(document.getElementById('root')).render(
    <PrimeReactProvider>
    <App />
    </PrimeReactProvider>
)
