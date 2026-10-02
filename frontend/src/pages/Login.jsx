import { useState } from "react";

function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (event) => {
    event.preventDefault();

    if (username === "admin" && password === "admin123") {
      setError("");
      onLogin();
    } else {
      setError("Invalid username or password.");
    }
  };

  return (
    <div className="login-page">

      <div className="login-card">

        <div className="login-logo">
          🌱
        </div>

        <h1>ByteNova</h1>

        <p className="login-subtitle">
          AI-Powered Pollution Compliance Monitoring
        </p>

        <form onSubmit={handleLogin}>

          <label>Username</label>

          <input
            type="text"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter username"
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password"
          />

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          <button type="submit" className="login-button">
            Login
          </button>

        </form>

        <div className="login-demo">
          Demo Login: <strong>admin / admin123</strong>
        </div>

      </div>

    </div>
  );
}

export default Login;