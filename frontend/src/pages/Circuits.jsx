import { circuits } from '../data/circuits';

export default function Circuits() {
  return (
    <div className="container">
      <h1>Nos circuits</h1>
      <div className="grid">
        {circuits.map((c) => (
          <div className="card" key={c.id}>
            <h3>{c.title}</h3>
            <p>📍 {c.city}</p>
            <p>⏱️ {c.duration}</p>
            <p>💰 {c.price} MAD</p>
            <p>{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}