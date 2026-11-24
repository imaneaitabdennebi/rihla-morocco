# Rihla Morocco

Plateforme web de guides touristiques : les touristes recherchent, réservent et évaluent des circuits guidés au Maroc ; les guides gèrent leurs circuits et leurs réservations ; l'administrateur supervise la plateforme.

## Technologies
React (Vite) · Laravel 13 (Sanctum) · MySQL 8 · Docker Compose · jsPDF · SheetJS

## Lancer le projet
Prérequis : Docker Desktop.

```
git clone https://github.com/imaneaitabdennebi/rihla-morocco.git
cd rihla-morocco
docker compose up -d --build
```

Le premier démarrage prend quelques minutes (installation, migrations, données de test).

| Service | Adresse |
|---|---|
| Application (React) | http://localhost:5173 |
| API (Laravel) | http://localhost:8000 |
| phpMyAdmin | http://localhost:8080 |

## Comptes de test (mot de passe : 123456)
| Rôle | Email |
|---|---|
| Administrateur | admin@guides.ma |
| Touriste | touriste@guides.ma |
| Guide | youssef@guides.ma |

## Fonctionnalités
Inscription et connexion, gestion des rôles, profils et circuits (CRUD), réservations avec statuts, avis, recherche, filtres et pagination, notifications, statistiques, export PDF et Excel (guide et administrateur).
