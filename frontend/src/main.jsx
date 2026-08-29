import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const originalFetch = window.fetch;
window.fetch = async (...args) => {
    let [resource, config] = args;
    if (typeof resource === 'string' && resource.includes('loca.lt')) {
        config = config || {};
        config.headers = {
            ...config.headers,
            'Bypass-Tunnel-Reminder': 'true'
        };
    }
    return originalFetch(resource, config);
};

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)
