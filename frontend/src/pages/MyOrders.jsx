import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { apiRequest } from "../services/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMyOrders();
  }, []);

  async function loadMyOrders() {
    try {
      setLoading(true);
      setError("");

      /*
       * JWT token එක අනුව backend එක දැනට login වී
       * සිටින customerගේ orders පමණක් ලබා දෙනවා.
       */
      const data = await apiRequest(
        "/orders/my-orders",
      );

      setOrders(data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Number(price));
  }

  function formatDate(dateValue) {
    if (!dateValue) {
      return "-";
    }

    const date = new Date(dateValue);

    const year = date.getFullYear();

    const month = String(
      date.getMonth() + 1,
    ).padStart(2, "0");

    const day = String(
      date.getDate(),
    ).padStart(2, "0");

    const hours = String(
      date.getHours(),
    ).padStart(2, "0");

    const minutes = String(
      date.getMinutes(),
    ).padStart(2, "0");

    const seconds = String(
      date.getSeconds(),
    ).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  function getStatusClass(status) {
    return `my-order-status ${status.toLowerCase()}`;
  }

  function getStatusLabel(status) {
    if (status === "SUCCESS") {
      return "Success";
    }

    if (status === "PROCESSED") {
      return "Processed";
    }

    if (status === "REJECTED") {
      return "Rejected";
    }

    return status;
  }

  return (
    <main className="my-orders-page">
      <div className="container">
        <div className="my-orders-heading">
          <div>
            <h1>My Orders</h1>

            <p>
              Track the status of your orders.
            </p>
          </div>

          <div className="my-orders-actions">
            <Link
              to="/products"
              className="orders-shop-button"
            >
              🏠 Shop
            </Link>

            <Link
              to="/cart"
              className="orders-cart-button"
            >
              🛒 Cart
            </Link>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}

            <button
              type="button"
              className="orders-retry-button"
              onClick={loadMyOrders}
            >
              Try Again
            </button>
          </div>
        )}

        {loading ? (
          <div className="orders-loading">
            <div className="loading-spinner" />
            <p>Loading your orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <section className="my-orders-empty">
            <div>📋</div>

            <h2>No orders yet</h2>

            <p>
              You have not placed any orders.
            </p>

            <Link
              to="/products"
              className="primary-button"
            >
              Browse Products
            </Link>
          </section>
        ) : (
          <section className="my-orders-table-card">
            <div className="my-orders-table-wrapper">
              <table className="my-orders-table">
                <thead>
                  <tr>
                    <th>Order Code</th>
                    <th>Date</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>
                        <strong>
                          {order.orderCode}
                        </strong>
                      </td>

                      <td>
                        {formatDate(order.createdAt)}
                      </td>

                      <td>
                        <strong>
                          {formatPrice(order.total)}
                        </strong>
                      </td>

                      <td>
                        <span
                          className={getStatusClass(
                            order.status,
                          )}
                        >
                          {getStatusLabel(
                            order.status,
                          )}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default MyOrders;