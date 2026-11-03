export default function GuideCard({ guide }) {
  return (
    <div className="card">
      <h3>{guide.name}</h3>
      <p>📍 {guide.city}</p>
      <p>🗣️ {guide.languages}</p>
      <p>💰 {guide.price} MAD / jour</p>
      <p>⭐ {guide.rating}</p>
    </div>
  );
}