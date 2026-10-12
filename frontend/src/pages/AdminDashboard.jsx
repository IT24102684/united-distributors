import { useEffect, useState } from "react";

import { apiRequest } from "../services/api";
import "./AdminDashboard.css";

const emptyProduct = {
  code: "",
  name: "",
  category: "",
  description: "",
  imageUrl: "",
  price: "",
  stock: "",
  active: true,
};

function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("orders");

  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [admins, setAdmins] = useState([]);

  const [productForm, setProductForm] =
    useState(emptyProduct);

const [productImage, setProductImage] = useState(null);
const [productImagePreview, setProductImagePreview] = useState("");

  const [editingProductId, setEditingProductId] =
    useState(null);

  const [adminEmail, setAdminEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingProduct, setSavingProduct] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadDashboard();
  }, []);

function handleProductImageChange(event) {
  const file = event.target.files[0];

  if (!file) {
    return;
  }

  setProductImage(file);

  const previewUrl = URL.createObjectURL(file);
  setProductImagePreview(previewUrl);
}

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [
        ordersData,
        productsData,
        usersData,
        adminsData,
      ] = await Promise.all([
        apiRequest("/admin/orders"),
        apiRequest("/admin/products"),
        apiRequest("/admin/users"),
        apiRequest("/admin/admins"),
      ]);

      setOrders(ordersData);
      setProducts(productsData);
      setUsers(usersData);
      setAdmins(adminsData);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  function showSuccess(successMessage) {
    setError("");
    setMessage(successMessage);

    window.setTimeout(() => {
      setMessage("");
    }, 3000);
  }

  function updateProductField(event) {
    const { name, value } = event.target;

    setProductForm({
      ...productForm,
      [name]: value,
    });
  }

  function editProduct(product) {
    setEditingProductId(product.id);

    setProductForm({
      code: product.code,
      name: product.name,
      category: product.category,
      description: product.description || "",
      imageUrl: product.imageUrl || "",
      price: product.price,
      stock: product.stock,
      active: product.active,
    });

    setActiveTab("products");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

function cancelProductEdit() {
  setEditingProductId(null);
  setProductForm(emptyProduct);
  setProductImage(null);
  setProductImagePreview("");
}

async function saveProduct(event) {
  event.preventDefault();

  try {
    setSavingProduct(true);
    setError("");

    let imageUrl = productForm.imageUrl || "";

    // New image selected නම් මුලින් image එක backend එකට upload කරනවා
    if (productImage) {
      const imageFormData = new FormData();

      imageFormData.append("image", productImage);

      const uploadResult = await apiRequest(
        "/admin/products/upload-image",
        {
          method: "POST",
          body: imageFormData,
        },
      );

      imageUrl = uploadResult.imageUrl;
    }

    const productBody = {
      code: productForm.code,
      name: productForm.name,
      category: productForm.category,
      description: productForm.description,
      imageUrl: imageUrl,
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      active: productForm.active,
    };

    if (editingProductId) {
      await apiRequest(
        `/admin/products/${editingProductId}`,
        {
          method: "PUT",
          body: JSON.stringify(productBody),
        },
      );

      showSuccess("Product updated successfully.");
    } else {
      await apiRequest("/admin/products", {
        method: "POST",
        body: JSON.stringify(productBody),
      });

      showSuccess("Product created successfully.");
    }

    cancelProductEdit();

    const productsData = await apiRequest(
      "/admin/products",
    );

    setProducts(productsData);

  } catch (requestError) {
    setError(requestError.message);
  } finally {
    setSavingProduct(false);
  }
}

  async function deleteProduct(productId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this product?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/admin/products/${productId}`, {
        method: "DELETE",
      });

     setProducts((currentProducts) =>
  currentProducts.filter(
    (product) => product.id !== productId
  )
);

      showSuccess("Product removed successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateOrderStatus(orderId, status) {
    try {
      const updatedOrder = await apiRequest(
        `/admin/orders/${orderId}/status`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
      );

      setOrders(
        orders.map((order) =>
          order.id === orderId ? updatedOrder : order,
        ),
      );

      showSuccess("Order status updated successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function addAdmin(event) {
    event.preventDefault();

    try {
      await apiRequest("/admin/admins", {
        method: "POST",
        body: JSON.stringify({
          email: adminEmail,
        }),
      });

      setAdminEmail("");

      const [adminsData, usersData] = await Promise.all([
        apiRequest("/admin/admins"),
        apiRequest("/admin/users"),
      ]);

      setAdmins(adminsData);
      setUsers(usersData);

      showSuccess("Administrator assigned successfully.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function removeAdmin(userId) {
    const confirmed = window.confirm(
      "Remove administrator access from this user?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/admin/admins/${userId}`, {
        method: "DELETE",
      });

      const [adminsData, usersData] = await Promise.all([
        apiRequest("/admin/admins"),
        apiRequest("/admin/users"),
      ]);

      setAdmins(adminsData);
      setUsers(usersData);

      showSuccess("Administrator access removed.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function disableUser(userId) {
    const confirmed = window.confirm(
      "Are you sure you want to disable this user?",
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/admin/users/${userId}`, {
        method: "DELETE",
      });

      setUsers(
        users.map((user) =>
          user.id === userId
            ? { ...user, enabled: false }
            : user,
        ),
      );

      showSuccess("User account disabled.");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  function formatPrice(price) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(price);
  }

  function formatDate(date) {
    return new Date(date).toLocaleString("en-LK");
  }

  if (loading) {
    return (
      <div className="page-loading">
        Loading administrator dashboard...
      </div>
    );
  }

  return (
    <main className="admin-page">
      <div className="container">
        <div className="admin-heading">
          <div>
            <p>ADMIN PANEL</p>
            <h1>Admin Dashboard</h1>
            <span>
              Manage orders, products, users and administrators.
            </span>
          </div>

          <button type="button" onClick={loadDashboard}>
            Refresh
          </button>
        </div>

        {error && (
          <div className="error-message">{error}</div>
        )}

        {message && (
          <div className="success-message">{message}</div>
        )}

        <nav className="admin-tabs">
          <button
            className={activeTab === "orders" ? "active" : ""}
            onClick={() => setActiveTab("orders")}
          >
            Customer Orders
          </button>

          <button
            className={activeTab === "products" ? "active" : ""}
            onClick={() => setActiveTab("products")}
          >
            Products
          </button>

          <button
            className={activeTab === "users" ? "active" : ""}
            onClick={() => setActiveTab("users")}
          >
            Users
          </button>

          <button
            className={activeTab === "admins" ? "active" : ""}
            onClick={() => setActiveTab("admins")}
          >
            Administrators
          </button>
        </nav>

        {activeTab === "orders" && (
          <section className="admin-panel">
            <h2>Customer Orders</h2>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order Code</th>
                    <th>Products</th>
                    <th>Customer</th>
                    <th>Delivery</th>
                    <th>Mobile</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Date</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.orderCode}</td>

                      <td>
                        {order.items
                          .map(
                            (item) =>
                              `[${item.productCode}] ${item.productName} x${item.quantity}`,
                          )
                          .join(", ")}
                      </td>

                      <td>
                        {order.customer?.fullName ||
                          order.deliveryName}
                      </td>

                      <td>
                        {order.deliveryAddress}
                        <br />
                        {order.postalCode}
                      </td>

                      <td>{order.deliveryMobile}</td>
                      <td>{formatPrice(order.total)}</td>

                      <td>
                        <select
                          value={order.status}
                          onChange={(event) =>
                            updateOrderStatus(
                              order.id,
                              event.target.value,
                            )
                          }
                        >
                          <option value="SUCCESS">
                            Success
                          </option>

                          <option value="PROCESSED">
                            Processed
                          </option>

                          <option value="REJECTED">
                            Rejected
                          </option>
                        </select>
                      </td>

                      <td>{formatDate(order.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {orders.length === 0 && (
              <p className="admin-empty">
                No customer orders found.
              </p>
            )}
          </section>
        )}

        {activeTab === "products" && (
          <>
            <section className="admin-panel">
              <h2>
                {editingProductId
                  ? "Update Product"
                  : "Create Product"}
              </h2>

              <form
                className="product-admin-form"
                onSubmit={saveProduct}
              >
                <select
  name="code"
  value={productForm.code}
  onChange={(event) =>
    setProductForm({
      ...productForm,
      code: event.target.value,
    })
  }
  required
>
  <option value="">Select Product Code</option>

  <option value="PC001">PC001 - Mociogrome Inject 80gsm - 40mm × 45.7m</option>
  <option value="PC030">PC030 - Mociogrome Inject 80gsm - 600mm × 45.7m</option>
  <option value="PC033">PC033 - Mociogrome Inject 80gsm - 841mm × 45.7m</option>
  <option value="PC031">PC031 - Mociogrome Inject 80gsm - 914mm × 45.7m</option>

  <option value="PC009">PC009 - Coated Inject Colour 90g - 600mm × 45.7m</option>
  <option value="PC010">PC010 - Coated Inject Colour 90g - 914mm × 45.7m</option>
  <option value="PC019">PC019 - Coated Inject Colour 90g - 1067mm × 45.7m</option>
  <option value="PC022">PC022 - Coated Inject Colour 90g - 1067mm × 45.7m</option>

  <option value="PC018">PC018 - Coated Inject Colour 120g - 1067mm × 30m</option>
  <option value="PC021">PC021 - Coated Inject Colour 120g - 600mm × 30m</option>
  <option value="PC020">PC020 - Coated Inject Colour 120g - 914mm × 30m</option>
  <option value="PC039">PC039 - Coated Inject Colour 120g - 914mm × 100m</option>

  <option value="PC001">PC001 - Translucent Inkjet 90/95g - 420mm × 45.7m</option>
  <option value="TP002">TP002 - Translucent Inkjet 90/95g - 600mm × 45.7m</option>
  <option value="TP003">TP003 - Translucent Inkjet 90/95g - 841mm × 45.7m</option>
  <option value="TP004">TP004 - Translucent Inkjet 90/95g - 914mm × 45.7m</option>

  <option value="PC013">PC013 - Purewhite Plain Paper 80g - 420mm × 150m</option>
  <option value="PC014">PC014 - Purewhite Plain Paper 80g - 600mm × 150m</option>
  <option value="PC015">PC015 - Purewhite Plain Paper 80g - 841mm × 150m</option>
  <option value="PC016">PC016 - Purewhite Plain Paper 80g - 914mm × 150m</option>

  <option value="PC028">PC028 - Purewhite Plain Paper 100g - 600mm × 150m</option>
  <option value="PC027">PC027 - Purewhite Plain Paper 100g - 914mm × 150m</option>

  <option value="TP025">TP025 - Natural Tracing Paper 90/95g - 600mm × 150m</option>
  <option value="TP022">TP022 - Natural Tracing Paper 90/95g - 914mm × 150m</option>
</select>

                <input
                  name="name"
                  placeholder="Product name"
                  value={productForm.name}
                  onChange={updateProductField}
                  required
                />

                <select
  name="category"
  value={productForm.category}
  onChange={updateProductField}
  required
  style={{
    width: "100%",
    height: "60px",
    padding: "0 16px",
    border: "1px solid #dfe5ef",
    borderRadius: "12px",
    backgroundColor: "#ffffff",
    fontSize: "17px",
    color: "#111827",
    cursor: "pointer",
  }}
>
  <option value="">Select Category</option>

  <option value="Mociogrome Inject 80gsm">
    Mociogrome Inject 80gsm
  </option>

  <option value="Coated Inject Colour 90g">
    Coated Inject Colour 90g
  </option>

  <option value="Coated Inject Colour 120g">
    Coated Inject Colour 120g
  </option>

  <option value="Translucent Inkjet 90/95g">
    Translucent Inkjet 90/95g
  </option>

  <option value="Purewhite Plain Paper 80g">
    Purewhite Plain Paper 80g
  </option>

  <option value="Purewhite Plain Paper 100g">
    Purewhite Plain Paper 100g
  </option>

  <option value="Natural Tracing Paper 90/95g">
    Natural Tracing Paper 90/95g
  </option>
</select>

                <textarea
                  name="description"
                  placeholder="Description"
                  value={productForm.description}
                  onChange={updateProductField}
                />



                <div className="product-image-upload">

                  {!productImagePreview && (
  <label className="image-upload-box">
    <input
      type="file"
      accept="image/png,image/jpeg,image/jpg,image/webp"
      onChange={handleProductImageChange}
      hidden
    />


    <div className="upload-content">
      <span className="upload-icon">⬆️</span>
      <strong>Upload Product Image</strong>
      <span>Click here to choose an image</span>
      <small>JPG, JPEG, PNG or WEBP</small>
    </div>
  </label>
)}


  {productImagePreview && (
    <div className="image-preview">
      <img
        src={productImagePreview}
        alt="Product preview"
      />
    </div>
  )}
</div>

                <input
  type="number"
  name="price"
  min="0"
  step="0.01"
  placeholder="Price"
  value={productForm.price}
  onChange={updateProductField}
  style={{
    height: "45px",
    minHeight: "45px",
    alignSelf: "start",
  }}
  required
/>

                <input
  type="number"
  name="stock"
  min="0"
  placeholder="Stock quantity"
  value={productForm.stock}
  onChange={updateProductField}
  style={{
    height: "45px",
    minHeight: "45px",
    alignSelf: "start",
  }}
  required
/>

                <div className="admin-form-buttons">
                  <button
                    type="submit"
                    disabled={savingProduct}
                  >
                    {savingProduct
                      ? "Saving..."
                      : editingProductId
                        ? "Update Product"
                        : "Add Product"}
                  </button>

                  {editingProductId && (
                    <button
                      type="button"
                      className="cancel-button"
                      onClick={cancelProductEdit}
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="admin-panel">
              <h2>Products</h2>

              <div className="admin-table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Image </th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {products.map((product) => (
                      <tr key={product.id}>
                        <td>{product.code}</td>
                        <td>{product.name}</td>
                        <td>{product.category}</td>
                        <td>{product.description}</td>
                        <td>
  {product.imageUrl ? (
    <img
      src={
  product.imageUrl?.startsWith("/uploads/")
    ? `http://localhost:8080${product.imageUrl}`
    : product.imageUrl
}
      alt={product.name}
      style={{
        width: "60px",
        height: "60px",
        objectFit: "cover",
        borderRadius: "8px"
      }}
    />
  ) : (
    "No Image"
  )}
</td>
                        <td>{formatPrice(product.price)}</td>
                        <td>{product.stock}</td>


                        <td>
                          <div className="table-actions">
                            <button
                              onClick={() =>
                                editProduct(product)
                              }
                            >
                              Update
                            </button>

                            {product.active && (
                              <button
                                className="delete-button"
                                onClick={() =>
                                  deleteProduct(product.id)
                                }
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}

        {activeTab === "users" && (
          <section className="admin-panel">
            <h2>Registered Users</h2>

            <div className="admin-table-wrapper">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Mobile</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.fullName}</td>
                      <td>{user.email}</td>
                      <td>{user.mobile}</td>
                      <td>{user.role}</td>

                      <td>
                        {user.enabled
                          ? "Enabled"
                          : "Disabled"}
                      </td>

                      <td>{formatDate(user.createdAt)}</td>

                      <td>
                        {user.enabled && (
                          <button
                            className="delete-button"
                            onClick={() =>
                              disableUser(user.id)
                            }
                          >
                            Disable
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {activeTab === "admins" && (
          <>
            <section className="admin-panel">
              <h2>Add Admin Email</h2>

              <form
                className="add-admin-form"
                onSubmit={addAdmin}
              >
                <input
                  type="email"
                  placeholder="admin@example.com"
                  value={adminEmail}
                  onChange={(event) =>
                    setAdminEmail(event.target.value)
                  }
                  required
                />

                <button type="submit">Add Admin</button>
              </form>
            </section>

            <section className="admin-panel">
              <h2>Administrators</h2>

              <div className="admin-list">
                {admins.map((admin) => (
                  <article key={admin.id}>
                    <div>
                      <strong>{admin.fullName}</strong>
                      <span>{admin.email}</span>
                    </div>

                    <button
                      className="delete-button"
                      onClick={() =>
                        removeAdmin(admin.id)
                      }
                    >
                      Remove
                    </button>
                  </article>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}

export default AdminDashboard;