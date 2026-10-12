import { useEffect, useMemo, useState } from "react";

import ProductCard from "../components/ProductCard";

import {
  apiRequest,
  getGuestToken,
} from "../services/api";

function Products({ user, onCartChanged }) {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadProducts();
  }, []);

  async function loadProducts() {
    try {
      setLoading(true);
      setError("");

      const data = await apiRequest("/products");
      setProducts(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  const categories = useMemo(() => {
    return [
      "ALL",
      ...new Set(products.map((product) => product.category)),
    ];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesCategory =
        category === "ALL" || product.category === category;

      const matchesSearch =
        !keyword ||
        product.name.toLowerCase().includes(keyword) ||
        product.code.toLowerCase().includes(keyword) ||
        product.description?.toLowerCase().includes(keyword);

      return matchesCategory && matchesSearch;
    });
  }, [products, search, category]);

  async function addToCart(productId, quantity) {
    try {
      setError("");
      setMessage("");

      if (user) {
        await apiRequest("/cart/items", {
          method: "POST",
          body: JSON.stringify({
            productId,
            quantity,
          }),
        });
      } else {
        const guestToken = getGuestToken();

        await apiRequest(
          `/cart/guest/${guestToken}/items`,
          {
            method: "POST",
            body: JSON.stringify({
              productId,
              quantity,
            }),
          },
        );
      }

      setMessage("Product added to your cart successfully.");
      await onCartChanged();
    } catch (requestError) {
      setError(requestError.message);
      throw requestError;
    }
  }

  return (
    <main className="catalog-page">
      <section className="page-banner">
        <div className="container">
          <p>PRODUCT CATALOG</p>
          <h1>Our Premium Products</h1>
          <span>
            Explore our range of quality paper products.
          </span>
        </div>
      </section>

      <section className="container catalog-section">
        <div className="catalog-toolbar">
          <input
            type="search"
            placeholder="Search products..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />

          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            {categories.map((item) => (
              <option value={item} key={item}>
                {item === "ALL" ? "All Categories" : item}
              </option>
            ))}
          </select>
        </div>

        {message && (
          <div className="success-message">{message}</div>
        )}

        {error && (
          <div className="error-message">{error}</div>
        )}

        {loading ? (
          <div className="page-loading">Loading products...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h2>No products found</h2>
            <p>Try a different search or category.</p>
          </div>
        ) : (
          <div className="catalog-grid">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={addToCart}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default Products;