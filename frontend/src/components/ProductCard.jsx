import { useState } from "react";

function ProductCard({ product, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const available = product.stock > 0;

  function formatPrice(price) {
    return new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 2,
    }).format(price);
  }

  async function handleAdd() {
    try {
      setAdding(true);
      await onAddToCart(product.id, quantity);
    } finally {
      setAdding(false);
    }
  }

  return (
    <article className="catalog-product-card">
      <div className="catalog-product-image">
        {product.imageUrl &&
        product.imageUrl !== "placeholder.jpg" ? (
          <img
            src={
  product.imageUrl?.startsWith("/uploads/")
    ? `http://localhost:8080${product.imageUrl}`
    : product.imageUrl
}
            alt={product.name}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <div className="catalog-placeholder">📄</div>
        )}
      </div>

      <div className="catalog-product-content">
        <p className="product-category">{product.category}</p>
        <span className="product-code">{product.code}</span>

        <h3>{product.name}</h3>

        <p className="catalog-description">
          {product.description || "Premium quality paper product."}
        </p>

        <p className={available ? "stock-yes" : "stock-no"}>
          {available
            ? `In Stock: ${product.stock}`
            : "Out of Stock"}
        </p>

        <strong className="catalog-price">
          {formatPrice(product.price)}
        </strong>

        <div className="catalog-actions">
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            disabled={!available}
            onChange={(event) => {
              const value = Number(event.target.value);

              setQuantity(
                Math.max(
                  1,
                  Math.min(value || 1, product.stock),
                ),
              );
            }}
          />

          <button
            type="button"
            disabled={!available || adding}
            onClick={handleAdd}
          >
            {adding
              ? "Adding..."
              : available
                ? "Add to Cart"
                : "Unavailable"}
          </button>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;