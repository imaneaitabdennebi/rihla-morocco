export default function GuideCard({ guide }) {
  const rating = guide.reviews_avg_rating
    ? `${Number(guide.reviews_avg_rating).toFixed(1)} / 5 (${guide.reviews_count} avis)`
    : "Pas encore d'avis";

  return (
    <div className="card">
      <h3>{guide.user?.name}</h3>
      <p>📍 {guide.city}</p>
      <p>🗣️ {guide.languages}</p>
      <p>💰 {Number(guide.rate)} MAD / jour</p>
      <p>⭐ {rating}</p>
      {guide.bio && <p>{guide.bio}</p>}
    </div>
  );
}