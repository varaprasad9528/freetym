export default function CareSection() {
  return (
    <section
      className="px-6 pt-12 pb-2 text-center"
      style={{ backgroundColor: "#FFF8F0" }}
    >
      <div
        className="mx-auto"
        style={{
          width: "817px",
          maxWidth: "100%",
        }}
      >
        <h2
          className="text-black mb-2"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "48px",
            fontWeight: 600,
            lineHeight: "140%",
            letterSpacing: "0%",
          }}
        >
          We Take Care of Everything
        </h2>
        <p
          className="text-gray-600 mb-0"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "36px",
            fontWeight: 500,
            lineHeight: "140%",
            letterSpacing: "0%",
          }}
        >
          From Influencer Strategy to Success Metrics.
        </p>
      </div>
    </section>
  );
}
