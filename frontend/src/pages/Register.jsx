export default function Register() {
  return (
    <div className="container">
      <h1>Inscription</h1>
      <form>
        <input type="text" placeholder="Nom" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Mot de passe" />
        <select>
          <option value="tourist">Touriste</option>
          <option value="guide">Guide</option>
        </select>
        <button type="submit">S'inscrire</button>
      </form>
    </div>
  );
}