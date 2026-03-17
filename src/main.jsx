import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

// Polyfill window.storage API using localStorage
// (replaces Claude Artifact's window.storage with localStorage for standalone deployment)
if (!window.storage) {
  window.storage = {
    async get(key) {
      const val = localStorage.getItem(key);
      if (val === null) throw new Error('Key not found');
      return { key, value: val, shared: false };
    },
    async set(key, value) {
      localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      return { key, value, shared: false };
    },
    async delete(key) {
      localStorage.removeItem(key);
      return { key, deleted: true, shared: false };
    },
    async list(prefix) {
      const keys = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (!prefix || k.startsWith(prefix)) keys.push(k);
      }
      return { keys, shared: false };
    }
  };
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
