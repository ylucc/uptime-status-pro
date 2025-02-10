import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/app';
import Login from './components/Login';
import './app.scss';

function Main() {
  const [loggedIn, setLoggedIn] = useState(false);

  const handleLogin = () => {
    setLoggedIn(true);
  };

  return (
    loggedIn ? <App /> : <Login onLogin={handleLogin} />
  );
}

const root = ReactDOM.createRoot(document.getElementById('app'));
root.render(<Main />);