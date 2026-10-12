import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  apiRequest,
  getGuestToken,
} from "../services/api";

function Cart({ user, onCartChanged }) {
  const navigate = useNavigate();

  const [cart, setCart] = useState({
    items: [],
    itemCount: 0,
    total: 0,
  });

  const [delivery, setDelivery] = useState({
    deliveryName: user?.fullName || "",
    mobile: user?.mobile || "",
    address: "",
    postalCode: "",
  });

  const [loading, setLoading] = useState(true);
  const [buying, setBuying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, [user]);

  async function loadCart() {
    try {
      setLoading(true);
      setError("");

      const data = user
        ? await apiRequest("/cart")
        : await apiRequest(
            `/cart/guest/${getGuestToken()}`,
          );

      setCart(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  async function updateQuantity(productId, quantity) {
    if (quantity < 1) {
      return;
    }

    try {
      const endpoint = user
        ? "/cart/items"
        : `/cart/guest/${getGuestToken()}/items`;

      const data = await apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify({
          productId,
          quantity,
        }),
      });

      setCart(data);
      await onCartChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeItem(productId) {
    try {
      const endpoint = user
        ? `/cart/items/${productId}`
        : `/cart/guest/${getGuestToken()}/items/${productId}`;

      const data = await apiRequest(endpoint, {
        method: "DELETE",
      });

      setCart(data);
      await onCartChanged();
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function updateDelivery(event) {
    setDelivery({
      ...delivery,
      [event.target.name]: event.target.value,
    });
  }

  async function checkout(event) {
    event.preventDefault();

    try {
      setBuying(true);
      setError("");

      await apiRequest("/orders/checkout", {
        method: "POST",
        body: JSON.stringify(delivery),
      });

      await onCartChanged();
      navigate("/orders");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBuying(false);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(price);
  }

  if (loading) {
    return <div className="page-loading">Loading cart...</div>;
  }

  if (cart.items.length === 0) {
    return (
      <main className="empty-cart-page">
        <section className="empty-cart-card">
          <div className="large-cart-icon">🛒</div>
          <h1>Your cart is empty</h1>
          <p>
            Browse our products and add the items you need.
          </p>

          <Link to="/products" className="primary-button">
            Browse Products
          </Link>
        </section>
      </main>
    );
  }

  return (
    <main className="cart-page">
      <div className="container">
        <div className="cart-page-heading">
          <div>
            <h1>Your Cart</h1>
            <p>United Distributors (Pvt) Ltd</p>
          </div>

          <Link to="/products" className="secondary-button">
            Continue Shopping
          </Link>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        <section className="cart-table-card">
          <div className="cart-table-header">
            <span>Product</span>
            <span>Price</span>
            <span>Quantity</span>
            <span>Subtotal</span>
            <span>Action</span>
          </div>

          {cart.items.map((item) => (
            <div className="cart-table-row" key={item.itemId}>
              <div>
                <strong>{item.name}</strong>
                <small>{item.code}</small>
              </div>

              <span>{formatPrice(item.price)}</span>

              <input
                type="number"
                min="1"
                max={item.stock}
                value={item.quantity}
                onChange={(event) =>
                  updateQuantity(
                    item.productId,
                    Number(event.target.value),
                  )
                }
              />

              <strong>{formatPrice(item.subtotal)}</strong>

              <button
                type="button"
                className="remove-button"
                onClick={() => removeItem(item.productId)}
              >
                Remove
              </button>
            </div>
          ))}

          <div className="cart-total">
            Total: {formatPrice(cart.total)}
          </div>
        </section>

        {!user ? (
          <section className="login-to-buy">
            <p>
              Please <Link to="/login">log in</Link> to buy
              products.
            </p>
          </section>
        ) : (
          <form
            className="delivery-card"
            onSubmit={checkout}
          >
            <h2>Delivery Details</h2>

            <div className="delivery-grid">
              <input
                name="deliveryName"
                placeholder="Full name"
                value={delivery.deliveryName}
                onChange={updateDelivery}
                required
              />

              <input
                name="mobile"
                placeholder="Mobile number"
                value={delivery.mobile}
                onChange={updateDelivery}
                required
              />

              <textarea
                name="address"
                placeholder="Delivery address"
                value={delivery.address}
                onChange={updateDelivery}
                required
              />

              <input
                name="postalCode"
                placeholder="Postal code"
                value={delivery.postalCode}
                onChange={updateDelivery}
                required
              />
            </div>

            <button
              type="submit"
              className="buy-button"
              disabled={buying}
            >
              {buying ? "Processing..." : "Buy Now"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default Cart;