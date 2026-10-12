import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  apiRequest,
  clearGuestToken,
  getGuestToken,
  saveAuth,
} from "../services/api";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateField(event) {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      setLoading(true);
      setError("");

      const authData = await apiRequest("/auth/login", {
        method: "POST",
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          guestToken: getGuestToken(),
        }),
      });

      saveAuth(authData);
      clearGuestToken();
      onLogin(authData);

      navigate(authData.role === "ADMIN" ? "/admin" : "/");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <Link to="/" className="back-home">
          ← Return to Home
        </Link>

        <div className="auth-heading">
          <div className="auth-icon">◆</div>
          <h1>Welcome back</h1>
          <p>Log in to your uShop account.</p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              placeholder="you@example.com"
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={updateField}
              placeholder="Enter your password"
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        <p className="auth-switch">
          New to uShop?{" "}
          <Link to="/register">Create an account</Link>
        </p>
      </section>
    </main>
  );
}

export default Login;