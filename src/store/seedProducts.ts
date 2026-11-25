/**
 * seedProducts.ts — default catalogue ("données démo").
 *
 * These products used to be hardcoded in mockData.ts. They now only seed the shared product store
 * (see ProductProvider): on first visit — or after "Réinitialiser les données démo" — the store
 * starts from this list, then everything lives in localStorage.
 *
 * SEED_PRODUCTS follows StoreProduct (productModel.ts), which maps 1-to-1 to a future backend table.
 * Storefront-only presentation extras (icon, feature bullets, variants) live apart in SEED_EXTRAS.
 */
import type { IconName } from '../mockData'
import type { StoreProduct } from './productModel'

/** Every photo in src/assets/products/images, resolved to a hashed URL by Vite. */
const imageFiles = import.meta.glob<string>('../assets/products/images/*.jpg', {
  eager: true,
  import: 'default',
})

const urlByKey: Record<string, string> = {}
for (const [path, url] of Object.entries(imageFiles)) {
  const m = /product-(\d+-\d+)\.jpg$/.exec(path)
  if (m) urlByKey[m[1]] = url
}
const keyByUrl = new Map(Object.entries(urlByKey).map(([key, url]) => [url, key]))

/** img('01-3') → URL of product-01-3.jpg. */
function img(key: string): string {
  const url = urlByKey[key]
  if (!url) throw new Error(`Missing product photo: product-${key}.jpg`)
  return url
}

/**
 * Vite hashes asset URLs at every build, so persisting them would break photos after a redeploy.
 * Bundled photos are therefore saved in localStorage as stable "asset:01-3" tokens.
 */
const ASSET_PREFIX = 'asset:'

export function toStoredImage(url: string): string {
  const key = keyByUrl.get(url)
  return key ? `${ASSET_PREFIX}${key}` : url
}

/** Returns null when the token points to a bundled photo that no longer exists. */
export function fromStoredImage(stored: string): string | null {
  if (!stored.startsWith(ASSET_PREFIX)) return stored
  return urlByKey[stored.slice(ASSET_PREFIX.length)] ?? null
}

const BASE_PRODUCTS: Omit<StoreProduct, 'isFeaturedHero'>[] = [
  // --- Entretien & Repassage ---
  {
    id: 'aspirateur-balai-sans-fil',
    name: 'Aspirateur balai sans fil',
    category: 'entretien',
    price: 29000,
    hasDiscount: true,
    discountPrice: 24500,
    warranty: '',
    description:
      "Aspirateur balai sans fil léger avec brosse rotative multi-surfaces et filtration HEPA pour sols et tapis. Jusqu'à 50 minutes d'autonomie par charge, il se transforme facilement en aspirateur à main.",
    images: [img('01-1'), img('01-3')],
    inStock: true,
  },
  {
    id: 'aspirateur-filtration-eau',
    name: 'Aspirateur à filtration par eau',
    category: 'entretien',
    price: 32000,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Aspirateur avec cuve à eau : poussières et allergènes sont piégés dans l'eau pour un air plus sain. Livré avec flexible renforcé, tube télescopique et brosse sols et tapis.",
    images: [img('01-2')],
    inStock: true,
  },
  {
    id: 'robot-aspirateur-wifi',
    name: 'Robot aspirateur intelligent Wi-Fi',
    category: 'entretien',
    price: 45000,
    hasDiscount: true,
    discountPrice: 39000,
    warranty: '',
    description:
      "La navigation LiDAR cartographie votre maison pour un nettoyage méthodique pièce par pièce sur parquet et tapis à poils ras. Programmez les cycles depuis l'application et laissez-le retourner seul à sa base de charge.",
    images: [img('13-3')],
    inStock: true,
  },
  {
    id: 'defroisseur-vapeur-1500w',
    name: 'Défroisseur vapeur portable 1500W',
    category: 'entretien',
    price: 6800,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Prêt en 25 secondes pour lisser chemises, rideaux et tissus d'ameublement sans table à repasser. Réservoir amovible de 300 ml et semelle anti-gouttes.",
    images: [],
    inStock: true,
  },
  {
    id: 'fer-a-repasser-ceramique',
    name: 'Fer à repasser vapeur semelle céramique',
    category: 'entretien',
    price: 7800,
    hasDiscount: true,
    discountPrice: 6200,
    warranty: '',
    description:
      'Glisse facilement sur le coton, le lin et les synthétiques grâce à sa semelle céramique résistante aux rayures et à son jet de vapeur vertical. Système anticalcaire intégré et arrêt automatique pour un repassage en toute sécurité.',
    images: [img('09-1'), img('09-2')],
    inStock: true,
  },
  {
    id: 'centrale-vapeur',
    name: 'Centrale vapeur avec fer à semelle perforée',
    category: 'entretien',
    price: 18500,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Centrale vapeur à réservoir d'eau séparé et fer à semelle perforée pour un repassage rapide et sans plis, même sur de grandes quantités de linge. Le fer se repose en toute sécurité sur sa base.",
    images: [img('09-3')],
    inStock: true,
  },
  {
    id: 'rasoir-anti-bouloches',
    name: 'Rasoir anti-bouloches et anti-peluches',
    category: 'entretien',
    price: 2800,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Rasoir à tissus rechargeable par USB qui retire en toute sécurité bouloches, peluches et poils sur pulls, plaids et canapés. Livré avec un guide de hauteur de protection et un bac à peluches amovible.',
    images: [],
    inStock: true,
  },

  // --- Air & Confort ---
  {
    id: 'purificateur-air-hepa',
    name: "Purificateur d'air True HEPA",
    category: 'air',
    price: 26500,
    hasDiscount: true,
    discountPrice: 22000,
    warranty: '',
    description:
      "Filtration en trois étapes qui capte 99,97 % des poussières, pollens et poils d'animaux dans les pièces jusqu'à 45 m². Capteur automatique de qualité de l'air et mode nuit ultra silencieux.",
    images: [img('02-2'), img('02-3')],
    inStock: true,
  },
  {
    id: 'humidificateur-ultrasonique-4-5l',
    name: 'Humidificateur ultrasonique à brume fraîche 4,5 L',
    category: 'air',
    price: 10500,
    hasDiscount: true,
    discountPrice: 8500,
    warranty: '',
    description:
      "Humidificateur à remplissage par le haut qui diffuse une fine brume jusqu'à 36 heures d'affilée pour soulager l'air sec. Hygrostat intégré et arrêt automatique lorsque le réservoir est vide.",
    images: [img('03-1'), img('03-2')],
    inStock: true,
  },
  {
    id: 'humidificateur-veilleuse-led',
    name: 'Mini humidificateur veilleuse LED',
    category: 'air',
    price: 4500,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Mini humidificateur silencieux avec dôme lumineux LED, idéal comme veilleuse dans la chambre ou sur le bureau. Une simple touche pour l'allumer ou l'éteindre.",
    images: [img('03-3')],
    inStock: true,
  },
  {
    id: 'deshumidificateur-30-pintes',
    name: 'Déshumidificateur compact Energy Star 30 pintes',
    category: 'air',
    price: 34000,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Élimine jusqu'à 14 litres d'humidité par jour dans les sous-sols, buanderies et pièces de vie. Réservoir amovible, option de vidange continue par tuyau et filtre lavable.",
    images: [],
    inStock: true,
  },
  {
    id: 'radiateur-ceramique-oscillant',
    name: 'Radiateur colonne céramique oscillant',
    category: 'air',
    price: 11500,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Le chauffage céramique PTC réchauffe rapidement chambres et bureaux grâce à une large oscillation et un thermostat numérique. Protection anti-basculement, arrêt en cas de surchauffe et télécommande inclus.',
    images: [],
    inStock: true,
  },
  {
    id: 'ventilateur-sur-pied-silencieux',
    name: 'Ventilateur sur pied silencieux à moteur DC',
    category: 'air',
    price: 12000,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Le moteur DC économe en énergie offre un fort débit d'air sur 12 vitesses tout en restant assez silencieux pour la chambre. Hauteur réglable, oscillation horizontale et minuterie 12 heures.",
    images: [],
    inStock: true,
  },
  {
    id: 'eventail-pliant-artisanal',
    name: 'Éventail pliant artisanal',
    category: 'air',
    price: 1500,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Éventail pliable léger et élégant, en bambou finement ajouré ou en tissu décoré. Pratique pour se rafraîchir en été sans électricité, il fait aussi une jolie décoration.',
    images: [img('15-1'), img('15-3'), img('15-2')],
    inStock: true,
  },

  // --- Petit électroménager ---
  {
    id: 'friteuse-air-numerique-6l',
    name: 'Friteuse à air numérique 6 L',
    category: 'cuisine',
    price: 19500,
    hasDiscount: true,
    discountPrice: 16500,
    warranty: '',
    description:
      "Circulation d'air rapide à 360° pour des plats croustillants avec jusqu'à 85 % d'huile en moins qu'une friture classique. Écran tactile numérique, 8 programmes préréglés et panier antiadhésif lavable au lave-vaisselle.",
    images: [img('05-1'), img('05-2'), img('05-3')],
    inStock: true,
  },
  {
    id: 'bouilloire-col-de-cygne',
    name: 'Bouilloire électrique col de cygne',
    category: 'cuisine',
    price: 11500,
    hasDiscount: true,
    discountPrice: 9500,
    warranty: '',
    description:
      "Bouilloire à température réglable : chauffe l'eau rapidement au degré près pour le café, le thé et un usage quotidien. Bec col de cygne de précision et maintien au chaud pendant 60 minutes.",
    images: [img('06-1'), img('10-1'), img('06-2')],
    inStock: true,
  },
  {
    id: 'cafetiere-filtre-verre',
    name: 'Cafetière à filtre manuelle en verre',
    category: 'cuisine',
    price: 9800,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Carafe en verre au design sablier avec filtres en papier pour un café filtre pur et aromatique. À associer à une bouilloire col de cygne pour une extraction parfaitement maîtrisée, tasse après tasse.',
    images: [img('06-3')],
    inStock: true,
  },
  {
    id: 'machine-expresso-semi-automatique',
    name: 'Machine à expresso semi-automatique',
    category: 'cuisine',
    price: 89000,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Machine à expresso au style professionnel pour un café intense digne d'un barista. Porte-filtres, buse vapeur pour des cappuccinos onctueux et plateau chauffe-tasses.",
    images: [img('10-3')],
    inStock: true,
  },
  {
    id: 'blender-1200w',
    name: 'Blender de comptoir haute vitesse 1200W',
    category: 'cuisine',
    price: 13500,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Moteur puissant et lames en acier inoxydable trempé qui broient glace, fruits congelés et noix sans effort. Bol de 1,9 L sans BPA et commandes pulse variables.',
    images: [],
    inStock: true,
  },
  {
    id: 'grille-pain-4-tranches',
    name: 'Grille-pain inox 4 tranches',
    category: 'cuisine',
    price: 8200,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Fentes extra-larges à centrage automatique pour le pain de mie, les tranches épaisses, les bagels et les gaufres, avec six niveaux de brunissage. Deux panneaux de commande indépendants pour griller deux réglages à la fois.',
    images: [img('12-2')],
    inStock: true,
  },
  {
    id: 'autocuiseur-multi-usage-6l',
    name: 'Autocuiseur inox multi-usage 6 L',
    category: 'cuisine',
    price: 17500,
    hasDiscount: true,
    discountPrice: 14500,
    warranty: '',
    description:
      'Autocuiseur en inox à fermeture sécurisée pour cuire viandes, légumes et légumineuses en un temps record. Plusieurs dispositifs de sécurité, soupape de régulation de pression et poignées robustes.',
    images: [img('16-2'), img('16-3')],
    inStock: true,
  },
  {
    id: 'marmite-inox-couvercle-verre',
    name: 'Marmite inox avec couvercle en verre',
    category: 'cuisine',
    price: 5200,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Marmite en inox à fond épais avec couvercle et poignées solides, parfaite pour les pommes de terre, soupes, ragoûts et riz de tous les jours.',
    images: [img('12-3')],
    inStock: true,
  },

  // --- Cuisson & Gros électroménager ---
  {
    id: 'micro-ondes-encastrable-inox',
    name: 'Four micro-ondes encastrable inox',
    category: 'cuisson',
    price: 19500,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      "Micro-ondes 1000 watts à façade inox, avec réchauffage intelligent par capteur, 10 niveaux de puissance et plateau tournant en verre. S'intègre parfaitement dans une cuisine équipée.",
    images: [img('07-2')],
    inStock: true,
  },
  {
    id: 'plaque-vitroceramique-noire',
    name: 'Plaque de cuisson à induction en verre noir',
    category: 'cuisson',
    price: 9200,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Plaque en verre céramique noir de 1800 watts qui chauffe directement le récipient pour des ébullitions rapides et un contrôle précis de la température. Surface lisse qui se nettoie en quelques secondes.',
    images: [img('19-2')],
    inStock: true,
  },
  {
    id: 'plaque-gaz-4-feux',
    name: 'Plaque de cuisson gaz 4 feux noire',
    category: 'cuisson',
    price: 16000,
    hasDiscount: true,
    discountPrice: 13500,
    warranty: '',
    description:
      'Plaque à gaz noire à 4 brûleurs avec supports de casseroles en fonte et boutons de réglage précis de la flamme. Flamme homogène et allumage facile pour cuisiner au quotidien.',
    images: [img('19-3'), img('19-1')],
    inStock: true,
  },
  {
    id: 'lave-vaisselle-inox',
    name: 'Lave-vaisselle inox',
    category: 'cuisson',
    price: 48000,
    hasDiscount: false,
    discountPrice: null,
    warranty: '',
    description:
      'Lave-vaisselle à façade inox pour une vaisselle impeccable sans effort. Cinq programmes de lavage dont intensif, éco et rapide.',
    images: [img('17-1'), img('17-2')],
    inStock: true,
  },
  {
    id: 'mini-refrigerateur-retro',
    name: 'Mini réfrigérateur rétro',
    category: 'cuisson',
    price: 34500,
    hasDiscount: true,
    discountPrice: 29500,
    warranty: '',
    description:
      'Mini réfrigérateur à compresseur silencieux au look rétro, avec deux portes et poignées chromées. Idéal pour un bureau, un coin boissons ou un studio.',
    images: [img('18-2'), img('18-3')],
    inStock: true,
  },
]

/** Demo products shown in the Hero / Slideshow by default. */
export const SEED_HERO_IDS: ReadonlySet<string> = new Set([
  'friteuse-air-numerique-6l',
  'bouilloire-col-de-cygne',
  'plaque-gaz-4-feux',
])

export const SEED_PRODUCTS: StoreProduct[] = BASE_PRODUCTS.map((p) => ({
  ...p,
  isFeaturedHero: SEED_HERO_IDS.has(p.id),
}))

export interface SeedExtras {
  icon: IconName
  features: string[]
  variantLabel?: string
  variants?: string[]
}

/** Storefront-only extras for the demo products, keyed by product id. */
export const SEED_EXTRAS: Record<string, SeedExtras> = {
  'aspirateur-balai-sans-fil': {
    icon: 'brush-cleaning',
    features: ["50 min d'autonomie", 'Filtration HEPA', 'Convertible en aspirateur à main'],
    variantLabel: 'Couleur',
    variants: ['Gris mat', 'Blanc nacré', 'Bleu cobalt', 'Noir minuit'],
  },
  'aspirateur-filtration-eau': {
    icon: 'waves',
    features: ['Filtration par eau', 'Tube télescopique', 'Brosse sols et tapis'],
  },
  'robot-aspirateur-wifi': {
    icon: 'bot',
    features: ['Navigation LiDAR', 'Pilotage par application', 'Retour automatique à la base'],
    variantLabel: 'Couleur',
    variants: ['Noir mat', 'Blanc', 'Gris titane'],
  },
  'defroisseur-vapeur-1500w': {
    icon: 'shirt',
    features: ['Chauffe en 25 secondes', 'Réservoir amovible 300 ml', 'Semelle anti-gouttes'],
    variantLabel: 'Couleur',
    variants: ['Bleu nuit', 'Blanc', 'Graphite', 'Sauge'],
  },
  'fer-a-repasser-ceramique': {
    icon: 'shirt',
    features: ['Semelle céramique', 'Jet de vapeur vertical', 'Anticalcaire intégré'],
    variantLabel: 'Couleur',
    variants: ['Vert & gris', 'Violet & blanc'],
  },
  'centrale-vapeur': {
    icon: 'cloud-fog',
    features: ["Réservoir d'eau séparé", 'Semelle perforée', 'Repose-fer sécurisé'],
  },
  'rasoir-anti-bouloches': {
    icon: 'scissors',
    features: ['Recharge USB', 'Guide de protection', 'Bac à peluches amovible'],
    variantLabel: 'Couleur',
    variants: ['Blanc cassé', 'Anthracite', 'Vert sauge', 'Bleu marine'],
  },
  'purificateur-air-hepa': {
    icon: 'air-vent',
    features: ['Filtre True HEPA 99,97 %', "Capteur de qualité de l'air", 'Mode nuit silencieux'],
    variantLabel: 'Couleur',
    variants: ['Blanc pur', 'Anthracite', 'Gris clair'],
  },
  'humidificateur-ultrasonique-4-5l': {
    icon: 'wind',
    features: ["Jusqu'à 36 h d'autonomie", 'Hygrostat intégré', 'Arrêt automatique'],
    variantLabel: 'Couleur',
    variants: ['Blanc', 'Bleu ardoise', 'Noir mat'],
  },
  'humidificateur-veilleuse-led': {
    icon: 'lightbulb',
    features: ['Dôme lumineux LED', 'Fonctionnement silencieux', 'Bouton tactile unique'],
  },
  'deshumidificateur-30-pintes': {
    icon: 'droplets',
    features: ["14 L d'eau extraits par jour", 'Vidange continue possible', 'Filtre lavable'],
    variantLabel: 'Couleur',
    variants: ['Blanc', 'Gris froid', 'Noir'],
  },
  'radiateur-ceramique-oscillant': {
    icon: 'heater',
    features: ['Oscillation grand angle', 'Thermostat numérique', 'Télécommande incluse'],
    variantLabel: 'Couleur',
    variants: ['Noir mat', 'Blanc', 'Gris argent'],
  },
  'ventilateur-sur-pied-silencieux': {
    icon: 'fan',
    features: ['12 vitesses', 'Minuterie 12 heures', 'Hauteur réglable'],
    variantLabel: 'Couleur',
    variants: ['Blanc', 'Noir mat', 'Gris colombe'],
  },
  'eventail-pliant-artisanal': {
    icon: 'feather',
    features: ['Léger et pliable', 'Finitions artisanales', 'Sans électricité'],
    variantLabel: 'Modèle',
    variants: ['Bambou naturel', 'Rose fuchsia', 'Rose fleuri'],
  },
  'friteuse-air-numerique-6l': {
    icon: 'utensils',
    features: ['Capacité 6 litres', '8 programmes préréglés', 'Panier antiadhésif'],
    variantLabel: 'Couleur',
    variants: ['Noir mat', 'Inox brossé', 'Crème', 'Bleu marine'],
  },
  'bouilloire-col-de-cygne': {
    icon: 'glass-water',
    features: ['Température réglable', 'Bec de précision', 'Maintien au chaud 60 min'],
    variantLabel: 'Couleur',
    variants: ['Blanc & bois', 'Noir mat', 'Inox brossé'],
  },
  'cafetiere-filtre-verre': {
    icon: 'coffee',
    features: ['Carafe en verre', 'Filtres en papier', 'Café pur et aromatique'],
    variantLabel: 'Filtre',
    variants: ['Filtres papier', 'Filtre réutilisable'],
  },
  'machine-expresso-semi-automatique': {
    icon: 'coffee',
    features: ['Design professionnel', 'Buse vapeur', 'Plateau chauffe-tasses'],
  },
  'blender-1200w': {
    icon: 'blend',
    features: ['Moteur 1200W', 'Bol 1,9 L sans BPA', 'Lames en inox trempé'],
    variantLabel: 'Couleur',
    variants: ['Anthracite', 'Argent', 'Noir mat', 'Blanc cassé'],
  },
  'grille-pain-4-tranches': {
    icon: 'sandwich',
    features: ['6 niveaux de brunissage', 'Fentes extra-larges', 'Deux commandes indépendantes'],
    variantLabel: 'Couleur',
    variants: ['Inox brossé', 'Noir mat', 'Crème', 'Ardoise'],
  },
  'autocuiseur-multi-usage-6l': {
    icon: 'cooking-pot',
    features: ['Inox robuste', 'Dispositifs de sécurité', 'Cuisson rapide'],
    variantLabel: 'Finition',
    variants: ['Inox brossé', 'Noir', 'Cuivre'],
  },
  'marmite-inox-couvercle-verre': {
    icon: 'soup',
    features: ['Inox à fond épais', 'Couvercle fourni', 'Poignées solides'],
  },
  'micro-ondes-encastrable-inox': {
    icon: 'microwave',
    features: ['1000 W, 10 niveaux de puissance', 'Réchauffage par capteur', 'Plateau tournant en verre'],
    variantLabel: 'Finition',
    variants: ['Inox', 'Noir mat', 'Blanc'],
  },
  'plaque-vitroceramique-noire': {
    icon: 'grid',
    features: ['1800 W', 'Contrôle précis de la température', 'Surface lisse facile à nettoyer'],
  },
  'plaque-gaz-4-feux': {
    icon: 'flame',
    features: ['4 brûleurs', 'Supports en fonte', 'Réglage précis de la flamme'],
  },
  'lave-vaisselle-inox': {
    icon: 'utensils-crossed',
    features: ['Façade inox', '5 programmes de lavage', 'Programmes éco et rapide'],
    variantLabel: 'Couleur',
    variants: ['Blanc', 'Argent', 'Noir'],
  },
  'mini-refrigerateur-retro': {
    icon: 'refrigerator',
    features: ['Design rétro', 'Compresseur silencieux', 'Deux compartiments'],
    variantLabel: 'Couleur',
    variants: ['Rose fuchsia', 'Bleu ciel'],
  },
}

/** Fresh copy of the demo catalogue. */
export const getSeedProducts = (): StoreProduct[] =>
  SEED_PRODUCTS.map((p) => ({ ...p, images: [...p.images] }))

export const SEED_BY_ID = new Map(SEED_PRODUCTS.map((p) => [p.id, p]))
