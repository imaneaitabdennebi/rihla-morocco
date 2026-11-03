export default function Login() {
  return (
    <div className="container">
      <h1>Connexion</h1>
      <form>
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Mot de passe" />
        <button type="submit">Se connecter</button>
      </form>
    </div>
  );
}