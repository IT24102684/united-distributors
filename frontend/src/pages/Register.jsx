import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  apiRequest,
  clearGuestToken,
  getGuestToken,
  saveAuth,
} from "../services/api";

function Register({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
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
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    try {
      setLoading(true);

      const authData = await apiRequest("/auth/register", {
        method: "POST",
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          mobile: form.mobile,
          password: form.password,
          guestToken: getGuestToken(),
        }),
      });

      saveAuth(authData);
      clearGuestToken();
      onLogin(authData);
      navigate("/");
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
          <h1>Create your account</h1>
          <p>
            Verify your email to start using United
            Distributors.
          </p>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Full name
            <input
              type="text"
              name="fullName"
              value={form.fullName}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Email
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={updateField}
              required
            />
          </label>

          <label>
            Mobile number
            <input
              type="tel"
              name="mobile"
              value={form.mobile}
              onChange={updateField}
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
              required
            />
          </label>

          <label>
            Confirm password
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={updateField}
              required
            />
          </label>

          <button type="submit" disabled={loading}>
            {loading ? "Creating account..." : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <Link to="/login">Log in</Link>
        </p>
      </section>
    </main>
  );
}

export default Register;