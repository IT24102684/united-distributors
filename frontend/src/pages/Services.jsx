import { Link } from "react-router-dom";

function Services() {
  const services = [
    {
      icon: "📦",
      title: "Island-wide Distribution",
      description:
        "Prompt and secure distribution covering all major cities and locations across Sri Lanka.",
    },
    {
      icon: "🚚",
      title: "Fast and Reliable Delivery",
      description:
        "Dependable delivery service designed to get your paper products to you on time.",
    },
    {
      icon: "🏢",
      title: "Corporate and Bulk Orders",
      description:
        "Paper supply solutions for offices, schools, printing businesses and corporate customers.",
    },
    {
      icon: "📄",
      title: "Custom Sheeting and Sizing",
      description:
        "Precision cutting and converting paper products according to customer requirements.",
    },
    {
      icon: "💬",
      title: "Customer Support",
      description:
        "Helpful assistance with product selection, availability, orders and delivery information.",
    },
    {
      icon: "✓",
      title: "Quality Checked Products",
      description:
        "Our products are carefully selected and checked to maintain consistent quality standards.",
    },
  ];

  return (
    <main className="information-page">
      <section className="page-banner">
        <div className="container">
          <p>OUR SERVICES</p>
          <h1>Paper Solutions for Every Need</h1>
          <span>
            Professional service from product selection to
            delivery.
          </span>
        </div>
      </section>

      <section className="container services-section">
        <div className="services-grid">
          {services.map((service) => (
            <article
              className="service-card"
              key={service.title}
            >
              <div className="service-icon">
                {service.icon}
              </div>

              <h2>{service.title}</h2>
              <p>{service.description}</p>
            </article>
          ))}
        </div>

        <div className="service-promise">
          <div>
            <p>OUR PROMISE</p>
            <h2>Experience Unmatched Paper Quality & Service</h2>
            <span>
              We continuously work to provide reliable products,
              competitive prices and excellent customer service.
            </span>
          </div>

          <Link to="/products" className="primary-button">
            Browse Products →
          </Link>
        </div>
      </section>
    </main>
  );
}

export default Services;