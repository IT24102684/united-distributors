import {
  Link,
  NavLink,
  useNavigate,
} from "react-router-dom";

function Navbar({ user, cartCount, onLogout }) {
  const navigate = useNavigate();

  function handleLogout() {
    onLogout();
    navigate("/");
  }

  function getNavLinkClass({ isActive }) {
    return isActive
      ? "nav-link active"
      : "nav-link";
  }

  return (
    <header className="site-header">
      <nav className="navbar container">
        <Link to="/" className="brand">
          <div className="brand-icon">
            <span>◆</span>
          </div>

          <div className="brand-text">
            <strong>
              United Distributors (Pvt) Ltd
            </strong>

            <small>Your Trusted Paper Partner</small>
          </div>
        </Link>

        <div className="nav-menu">
          <NavLink
            to="/"
            end
            className={getNavLinkClass}
          >
            Home
          </NavLink>

          <NavLink
            to="/products"
            className={getNavLinkClass}
          >
            Products
          </NavLink>

          <NavLink
            to="/about"
            className={getNavLinkClass}
          >
            About Us
          </NavLink>

          <NavLink
            to="/services"
            className={getNavLinkClass}
          >
            Services
          </NavLink>

          <NavLink
            to="/contact"
            className={getNavLinkClass}
          >
            Contact Us
          </NavLink>
        </div>

        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">
                {user.fullName}
              </span>

              {/* My Orders icon */}
              <Link
                to="/orders"
                className="orders-icon-link"
                title="My Orders"
                aria-label="View my orders"
              >
                📋
              </Link>

              {user.role === "ADMIN" && (
                <Link
                  to="/admin"
                  className="admin-link"
                >
                  Admin Panel
                </Link>
              )}

              <button
                type="button"
                className="logout-button"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="login-link"
              >
                Log In
              </Link>

              <Link
                to="/register"
                className="register-link"
              >
                Register
              </Link>
            </>
          )}

          <Link
            to="/cart"
            className="cart-button"
          >
            <span>🛒</span>
            <span>Cart ({cartCount})</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}

export default Navbar;