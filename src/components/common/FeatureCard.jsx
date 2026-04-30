export default function FeatureCard({ logo, name, link }) {
  return (
    <div className="feature-card" onClick={() => window.location.href=link}>
      <img src={logo} alt={name} className="feature-logo" />
      <h3>{name}</h3>
    </div>
  );
}
