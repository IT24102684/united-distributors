function AboutUs() {
  return (
    <main className="information-page">
      <section className="page-banner">
        <div className="container">
          <p>ABOUT US</p>
          <h1>About United Distributors</h1>
          <span>
            Quality paper products and dependable service.
          </span>
        </div>
      </section>

      <section className="container about-section">
        <div className="about-image">
          <img
            src="https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=1200&q=80"
            alt="United Distributors warehouse"
          />
        </div>

        <div className="about-content">
          <p className="information-eyebrow">ABOUT US</p>

          <h2>About United Distributors (Pvt) Ltd</h2>

          <p>
            United Distributors (Pvt) Ltd is a leading paper
            supplier in Sri Lanka, committed to providing
            premium-quality paper products for businesses,
            schools, offices and individual customers.
          </p>

          <p>
            With years of industry experience, we understand
            the importance of quality, consistency and timely
            delivery. We provide paper solutions including
            photocopy paper, printing paper, coloured paper,
            speciality paper and more.
          </p>

          <p>
            Our goal is to deliver the right paper for every
            requirement with competitive prices and exceptional
            customer service.
          </p>

          <div className="about-values">
            <article>
              <div>♙</div>
              <span>
                <strong>Premium Quality</strong>
                Carefully selected products
              </span>
            </article>

            <article>
              <div>▦</div>
              <span>
                <strong>Wide Product Range</strong>
                Products for every need
              </span>
            </article>

            <article>
              <div>₨</div>
              <span>
                <strong>Competitive Prices</strong>
                Excellent value for money
              </span>
            </article>

            <article>
              <div>🚚</div>
              <span>
                <strong>Reliable Service</strong>
                Convenient and dependable
              </span>
            </article>
          </div>
        </div>
      </section>
    </main>
  );
}

export default AboutUs;