import { useCallback, useEffect, useState } from "react";

import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Products from "./pages/Products";
import AboutUs from "./pages/AboutUs";
import Services from "./pages/Services";
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import MyOrders from "./pages/MyOrders";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";

import {
  apiRequest,
  clearAuth,
  getGuestToken,
  getStoredAuth,
} from "./services/api";

import "./App.css";

function App() {
  const [user, setUser] = useState(() => getStoredAuth());
  const [cartCount, setCartCount] = useState(0);

  const loadCartCount = useCallback(async () => {
    try {
      const cart = user
        ? await apiRequest("/cart")
        : await apiRequest(
            `/cart/guest/${getGuestToken()}`,
          );

      setCartCount(cart.itemCount || 0);
    } catch {
      setCartCount(0);
    }
  }, [user]);

  useEffect(() => {
    loadCartCount();
  }, [loadCartCount]);

  function handleLogin(authData) {
    setUser(authData);
  }

  function handleLogout() {
    clearAuth();
    setUser(null);
    setCartCount(0);
  }

  return (
    <div className="app">
      <Navbar
        user={user}
        cartCount={cartCount}
        onLogout={handleLogout}
      />

      <div className="page-content">
        <Routes>
          <Route path="/" element={<Home />} />

          <Route
            path="/products"
            element={
              <Products
                user={user}
                onCartChanged={loadCartCount}
              />
            }
          />

          <Route path="/about" element={<AboutUs />} />

          <Route
            path="/services"
            element={<Services />}
          />

          <Route
            path="/contact"
            element={<ContactUs />}
          />

          <Route
            path="/cart"
            element={
              <Cart
                user={user}
                onCartChanged={loadCartCount}
              />
            }
          />

          <Route
            path="/login"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Login onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/register"
            element={
              user ? (
                <Navigate to="/" replace />
              ) : (
                <Register onLogin={handleLogin} />
              )
            }
          />

          <Route
            path="/orders"
            element={
              user ? (
                <MyOrders />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route
            path="/admin"
            element={
              user?.role === "ADMIN" ? (
                <AdminDashboard />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
}

export default App;