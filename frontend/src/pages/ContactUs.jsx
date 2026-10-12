function ContactUs() {
  return (
    <main className="information-page">
      <section className="page-banner">
        <div className="container">
          <p>CONTACT US</p>
          <h1>Get in Touch With Us</h1>
          <span>
            Contact our team for products, orders and delivery
            information.
          </span>
        </div>
      </section>

      <section className="container contact-section">
        <div className="contact-information">
          <p className="information-eyebrow">CONTACT DETAILS</p>

          <h2>We’re Here to Help</h2>

          <p className="contact-introduction">
            Contact United Distributors for product availability,
            prices, bulk orders and delivery information.
          </p>

          <div className="contact-list">
            <article>
              <div className="contact-icon">📍</div>

              <div>
                <h3>Our Location</h3>
                <p>
                  United Distributors (Pvt) Ltd,
                  <br />
                  Colombo, Sri Lanka
                </p>
              </div>
            </article>

            <article>
              <div className="contact-icon">📞</div>

              <div>
                <h3>Phone Numbers</h3>

                <a href="tel:+94112345678">
                  +94 11 234 5678
                </a>

                <a href="tel:+94771234567">
                  +94 77 123 4567
                </a>
              </div>
            </article>

            <article>
              <div className="contact-icon">✉️</div>

              <div>
                <h3>Email Address</h3>

                <a href="mailto:info@uniteddistributors.lk">
                  info@uniteddistributors.lk
                </a>
              </div>
            </article>

            <article>
              <div className="contact-icon">🕐</div>

              <div>
                <h3>Opening Hours</h3>
                <p>Monday – Friday: 8.30 AM – 5.00 PM</p>
                <p>Saturday: 8.30 AM – 1.00 PM</p>
                <p>Sunday: Closed</p>
              </div>
            </article>
          </div>

          <a
            className="whatsapp-button"
            href="https://wa.me/94771234567"
            target="_blank"
            rel="noreferrer"
          >
            Contact Us on WhatsApp
          </a>
        </div>

        <div className="contact-map">
          <iframe
            title="United Distributors location"
            src="https://www.google.com/maps?q=Colombo,Sri%20Lanka&output=embed"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          <a
            href="https://www.google.com/maps/search/?api=1&query=Colombo%2C%20Sri%20Lanka"
            target="_blank"
            rel="noreferrer"
            className="map-button"
          >
            Open in Google Maps →
          </a>
        </div>
      </section>
    </main>
  );
}

export default ContactUs;