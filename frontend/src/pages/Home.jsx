import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api";

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  async function loadFeaturedProducts() {
    try {
      setLoadingProducts(true);
      setProductError("");

      const products = await apiRequest("/products");

      /*
       * Backend එකෙන් ලැබෙන products වලින්
       * මුල් products 4 පමණක් Home page එකේ පෙන්වනවා.
       */
      setFeaturedProducts(products.slice(0, 4));
    } catch (error) {
      setProductError(error.message);
    } finally {
      setLoadingProducts(false);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(price);
  }

  function hasUsableImage(imageUrl) {
    return (
      imageUrl &&
      imageUrl.trim() !== "" &&
      imageUrl !== "placeholder.jpg"
    );
  }

  return (
    <main>
      {/* =========================
          HERO SECTION
      ========================== */}

      <section className="hero-section">
        <div className="container hero-container">
          <div className="hero-content">
            <p className="hero-eyebrow">
              QUALITY PAPERS. TRUSTED SERVICE.
            </p>

            <h1>
              Premium Paper
              <br />
              Solutions for Every
              <br />
              Need
            </h1>

            <p className="hero-description">
              United Distributors (Pvt) Ltd is your reliable
              source for high-quality paper products at the
              best value.
            </p>

            <div className="hero-buttons">
              <Link
                to="/products"
                className="primary-button"
              >
                View Our Products
              </Link>

              <Link
                to="/contact"
                className="secondary-button"
              >
                Contact Us
              </Link>
            </div>
          </div>

          <div className="hero-visual">
            <div className="paper-shadow paper-shadow-three" />
            <div className="paper-shadow paper-shadow-two" />
            <div className="paper-shadow paper-shadow-one" />

            <div className="paper-main">
              <div className="paper-light" />
            </div>
          </div>
        </div>
      </section>

      {/* =========================
          FEATURED PRODUCTS
      ========================== */}

      <section className="featured-products-section">
        <div className="container">
          <div className="featured-products-header">
            <div>
              <p className="featured-eyebrow">
                OUR PRODUCTS
              </p>

              <h2>Featured Paper Products</h2>

              <span>
                Explore some of our available premium paper
                products.
              </span>
            </div>

            <Link
              to="/products"
              className="view-products-link"
            >
              <span>View All Products</span>
              <span className="view-products-arrow">→</span>
            </Link>
          </div>

          {loadingProducts && (
            <div className="home-products-message">
              <div className="loading-spinner" />
              <p>Loading products...</p>
            </div>
          )}

          {!loadingProducts && productError && (
            <div className="home-products-error">
              <p>
                Products could not be loaded. Make sure the
                backend is running.
              </p>

              <button
                type="button"
                onClick={loadFeaturedProducts}
              >
                Try Again
              </button>
            </div>
          )}

          {!loadingProducts &&
            !productError &&
            featuredProducts.length === 0 && (
              <div className="home-products-message">
                <p>No products are available at the moment.</p>
              </div>
            )}

          {!loadingProducts &&
            !productError &&
            featuredProducts.length > 0 && (
              <div className="home-products-grid">
                {featuredProducts.map((product) => (
                  <article
                    className="home-product-card"
                    key={product.id}
                  >
                    <Link
                      to="/products"
                      className="home-product-image"
                    >
                      {hasUsableImage(product.imageUrl) ? (
  <img
    src={
      product.imageUrl.startsWith("/uploads/")
        ? `http://localhost:8080${product.imageUrl}`
        : product.imageUrl
    }
    alt={product.name}
    onError={(event) => {
      event.currentTarget.style.display = "none";

      if (event.currentTarget.nextElementSibling) {
        event.currentTarget.nextElementSibling.style.display =
          "grid";
      }
    }}
  />
) : null}
                    
                          

                      <div
                        className="product-image-placeholder"
                        style={{
                          display: hasUsableImage(
                            product.imageUrl,
                          )
                            ? "none"
                            : "grid",
                        }}
                      >
                        <div className="paper-stack-icon">
                          <span />
                          <span />
                          <span />
                        </div>
                      </div>
                    </Link>

                    <div className="home-product-details">
                      <p className="product-category">
                        {product.category}
                      </p>

                      <span className="product-code">
                        {product.code}
                      </span>

                      <Link
                        to="/products"
                        className="product-name-link"
                      >
                        <h3>{product.name}</h3>
                      </Link>

                      <p className="product-description">
                        {product.description ||
                          "Premium quality paper product."}
                      </p>

                      <div
                        className={
                          product.stock > 0
                            ? "product-stock available"
                            : "product-stock unavailable"
                        }
                      >
                        {product.stock > 0
                          ? `In Stock: ${product.stock}`
                          : "Out of Stock"}
                      </div>

                      <div className="home-product-footer">
                        <strong>
                          {formatPrice(product.price)}
                        </strong>

                        <Link
                          to="/products"
                          className="small-arrow-button"
                          title="View product"
                        >
                          →
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

          <div className="mobile-view-products">
            <Link
              to="/products"
              className="primary-button"
            >
              View All Products →
            </Link>
          </div>
        </div>
      </section>

      {/* =========================
          WHY CHOOSE US
      ========================== */}

      <section className="home-features">
        <div className="container">
          <div className="section-heading">
            <p>WHY CHOOSE US</p>

            <h2>Your Trusted Paper Partner</h2>

            <span>
              Reliable products and professional service for
              every customer.
            </span>
          </div>

          <div className="feature-grid">
            <article className="feature-card">
              <div className="feature-icon">✓</div>

              <h3>Premium Quality</h3>

              <p>
                Carefully selected paper products that meet
                professional quality standards.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">▦</div>

              <h3>Wide Product Range</h3>

              <p>
                Paper products for printing, plotting,
                photocopying and business requirements.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">₨</div>

              <h3>Competitive Prices</h3>

              <p>
                High-quality paper solutions offered at
                reasonable and competitive prices.
              </p>
            </article>

            <article className="feature-card">
              <div className="feature-icon">🚚</div>

              <h3>Reliable Service</h3>

              <p>
                Convenient ordering and dependable delivery
                service for our customers.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* =========================
          BOTTOM CALLOUT
      ========================== */}

      <section className="home-callout">
        <div className="container callout-content">
          <div>
            <p className="callout-eyebrow">
              FIND THE RIGHT PAPER
            </p>

            <h2>Explore Our Premium Product Collection</h2>

            <p>
              Find suitable paper products for your personal,
              office and commercial requirements.
            </p>
          </div>

          <Link
            to="/products"
            className="light-button"
          >
            Browse Products →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Home;