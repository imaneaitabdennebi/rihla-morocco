const FALLBACK = 'linear-gradient(135deg, #c4552d, #14654d)';

const slug = (s) =>
  s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]/g, '');

// Choisit une photo de la ville : variante 1 ou 2 selon l'id du circuit,
// sinon la photo de base, sinon un dégradé.
export function cityPhoto(city, id = 0) {
  const base = slug(city);
  return {
    backgroundImage: `url(/images/${base}-${(id % 2) + 1}.jpg), url(/images/${base}.jpg), ${FALLBACK}`,
  };
}