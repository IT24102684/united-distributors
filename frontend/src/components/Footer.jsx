import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-grid">
        <div>
          <div className="footer-brand">
            <div className="brand-icon">
              <span>◆</span>
            </div>

            <div className="brand-text footer-brand-text">
              <strong>United Distributors (Pvt) Ltd</strong>
              <small>Your Trusted Paper Partner</small>
            </div>
          </div>

          <p className="footer-description">
            Your reliable source for high-quality paper products
            and professional paper solutions in Sri Lanka.
          </p>
        </div>

        <div>
          <h3>Quick Links</h3>

          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/products">Products</Link>
            <Link to="/about">About Us</Link>
            <Link to="/services">Services</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>

        <div>
          <h3>Customer</h3>

          <div className="footer-links">
            <Link to="/login">Log In</Link>
            <Link to="/register">Register</Link>
            <Link to="/cart">Your Cart</Link>
            <Link to="/orders">My Orders</Link>
          </div>
        </div>

        <div>
          <h3>Contact</h3>

          <div className="footer-contact">
            <p>📍 Colombo, Sri Lanka</p>
            <p>📞 +94 11 234 5678</p>
            <p>✉️ info@uniteddistributors.lk</p>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} United Distributors
          (Pvt) Ltd. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;