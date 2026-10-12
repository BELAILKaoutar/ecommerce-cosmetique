# 🛍️ E-commerce Cosmétique

Application e-commerce développée avec **React + Vite**, **Node.js + Express**, **PostgreSQL**, **Prisma** et **Docker**.

## 1. Prérequis

Installer sur votre ordinateur :

- Git
- Node.js et npm
- Docker Desktop
- VS Code (recommandé)

## 2. Cloner le projet

```bash
git clone https://github.com/BELAILKaoutar/ecommerce-cosmetique.git
cd ecommerce-cosmetique
```

Récupérer les branches et travailler à partir de `develop` :

```bash
git fetch origin
git switch -c develop --track origin/develop
```

> Si `develop` existe déjà localement, utiliser `git switch develop`.

## 3. Installer les dépendances

**Backend :**

```bash
cd backend
npm install
cd ..
```

**Frontend :**

```bash
cd frontend
npm install
cd ..
```

## 4. Configurer les variables d'environnement

Dans le dossier `backend`, créer un fichier `.env` à partir de `.env.example`.

```bash
cd backend
cp .env.example .env
cd ..
```

Vérifier que `backend/.env` contient les valeurs correspondant à votre configuration Docker locale.

Exemple pour le développement :

```env
DATABASE_URL="postgresql://ecommerce:ecommerce_dev_password@localhost:5432/ecommerce_cosmetique?schema=public"
PORT=5000
```

Ne jamais pousser le fichier `.env` sur GitHub.

## 5. Lancer PostgreSQL et pgAdmin

Ouvrir **Docker Desktop**, puis depuis la racine du projet :

```bash
docker compose up -d
```

Services disponibles :

| Service | Adresse |
|---|---|
| PostgreSQL | localhost:5432 |
| pgAdmin | http://localhost:5050 |

**Connexion pgAdmin :**

- Email : `admin@example.com`
- Mot de passe : `admin_dev_password`

**Ajouter le serveur PostgreSQL dans pgAdmin :**

- Host : `postgres`
- Port : `5432`
- Database : `ecommerce_cosmetique`
- Username : `ecommerce`
- Password : `ecommerce_dev_password`

Ces identifiants sont uniquement destinés au développement local.

## 6. Initialiser la base de données avec Prisma

Depuis le dossier `backend` :

```bash
cd backend
npx prisma validate
npx prisma migrate dev
npx prisma generate
```

Ces commandes permettent de :

- Valider le schéma Prisma.
- Appliquer les migrations existantes à PostgreSQL.
- Générer Prisma Client.

Les tables actuellement créées sont `categories` et `products`, à condition d'avoir récupéré la branche contenant leur migration.

**Important :** pour récupérer cette migration avant son intégration dans `develop`, travailler depuis la branche `feat/EH-2-database-setup` ou attendre sa fusion.

## 7. Démarrer le projet

Ouvrir deux terminaux.

**Terminal 1 — Backend :**

```bash
cd backend
npm run dev
```

**Terminal 2 — Frontend :**

```bash
cd frontend
npm run dev
```

Le frontend Vite est généralement accessible sur `http://localhost:5173`.

Le backend utilise le port `5000` selon la configuration `.env`. Vérifier les scripts disponibles dans chaque `package.json` si une commande ne fonctionne pas encore.

## 8. Workflow Git de l'équipe

Chaque développeuse travaille sur une branche dédiée à son ticket Jira.

Avant de commencer un ticket :

```bash
git switch develop
git pull origin develop
git switch -c feat/EH-XX-description
```

Après avoir terminé :

```bash
git add .
git commit -m "feat(EH-XX): description du travail"
git push -u origin feat/EH-XX-description
```

Créer ensuite une **Pull Request vers `develop`** sur GitHub.

Ne pas travailler directement sur `main` ou `develop`.

## 9. Commandes utiles

| Commande | Utilité |
|---|---|
| `docker compose up -d` | Démarrer PostgreSQL et pgAdmin |
| `docker compose down` | Arrêter les conteneurs |
| `docker compose ps` | Vérifier les conteneurs |
| `npx prisma validate` | Vérifier le schéma |
| `npx prisma migrate dev` | Appliquer les migrations |
| `npx prisma generate` | Générer Prisma Client |
| `git status` | Vérifier les modifications |
| `git pull origin develop` | Récupérer les changements |

## 10. Organisation de l'équipe

Le développement est réparti entre trois développeuses full-stack. Chaque personne travaille sur ses fonctionnalités frontend, backend et base de données.

**Règles importantes :**

- Ne pas modifier les fonctionnalités assignées aux autres sans coordination.
- Ne pas supprimer les migrations Prisma existantes.
- Communiquer avant de modifier des modèles Prisma partagés.
- Faire une Pull Request pour chaque ticket terminé.
- Ne jamais commiter les mots de passe ou fichiers `.env`.
