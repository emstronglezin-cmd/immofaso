# IMMOFASO — Mémoire de travail du projet

## Objectif du projet

IMMOFASO est une plateforme moderne de gestion immobilière (Burkina Faso). Elle permet de gérer des propriétés, biens, locataires, propriétaires, contrats, loyers, paiements, notifications, documents et statistiques. Le MVP doit être totalement fonctionnel et déployable, même sans clés d'API externes.

## Architecture

3 applications indépendantes, déployables séparément :

```
/frontend-pwa      → Application Web/PWA (Vite + React + TypeScript) → Vercel
/frontend-mobile   → Application mobile (Flutter) → APK Android → Google Play
/backend           → API (NestJS + Prisma + PostgreSQL) → Render Web Service (Node)
```

- Le frontend PWA et le mobile partagent la même API backend.
- Aucun Dockerfile / docker-compose (Render doit détecter un runtime Node, pas une app Docker).

## Stack technique

| Partie | Stack |
| ------ | ----- |
| Backend | NestJS, Prisma ORM, PostgreSQL, JWT, Passport |
| Frontend PWA | Vite, React, TypeScript, PWA (vite-plugin-pwa) |
| Frontend mobile | Flutter (Dart) |
| Paiements | LickPay (optionnel) |
| Messagerie | API WhatsApp (optionnelle) |
| Env | Node LTS (>=20, testé sur v24) |

## Structure des dossiers

```
/backend
  prisma/schema.prisma
  src/
    main.ts
    app.module.ts
    prisma/            # service + module Prisma
    auth/              # JWT, refresh token, invité, guards, roles
    users/
    properties/
    biens/             # alias propriétés
    tenants/           # locataires
    owners/            # propriétaires
    contracts/         # contrats
    rents/             # loyers
    payments/          # paiements
    dashboard/         # tableaux de bord + statistiques
    notifications/
    documents/         # documents + uploads
    storage/           # système de stockage abstrait
    integrations/      # lickpay (optionnel), whatsapp (optionnel)
    common/            # pipes, interceptors, utils
  .env.example
/frontend-pwa
  src/
    components/
    pages/
    services/
    models/
    hooks/
  vite.config.ts
  vercel.json
/frontend-mobile
  lib/
    main.dart
  android/  (config APK)
IMMOFASO_CONTEXT.md
.env.example (racine — documente les variables partagées)
```

## Décisions techniques importantes

- Auth centralisée côté backend : inscription, login, JWT, refresh token, déconnexion, profil, guards, rôles.
- Mode invité ("Continuer sans s'inscrire") : token invité éphémère, ne bloque pas les fonctionnalités de lecture/découverte.
- Intégrations externes (LickPay, WhatsApp) **optionnelles** : si `*_ENABLED=false` ou clés absentes → fonctionnalité désactivée proprement, jamais d'erreur au build/démarrage.
- Stockage abstrait : interface `StorageService` avec implémentation locale par défaut ; prêt pour un stockage externe (S3) plus tard. Un problème de stockage ne bloque pas le démarrage.
- Health check : `GET /api/v1/health` → 200 quand l'API tourne.
- Port : `process.env.PORT` (Render) avec fallback local 3000.
- Node LTS stabilisé : `engines.node >= 20` ; testé sur v24.

## Fonctionnalités prévues

- [x] Structure 3 apps + mémoire de travail
- [x] Backend NestJS complet (auth, users, biens, locataires, propriétaires, contrats, loyers, paiements, dashboard, notifications, documents, stats)
- [x] Auth : inscription, connexion, JWT, refresh, déconnexion, profil, rôles, invité
- [x] Endpoint santé /api/v1/health
- [x] Intégration LickPay optionnelle
- [x] Intégration WhatsApp optionnelle
- [x] Frontend PWA moderne (dashboard, navigation, formulaires, états de chargement/erreur)
- [ ] Frontend mobile Flutter (APK Android release)
- [x] Déploiement Render (backend) + Vercel (PWA) + APK (mobile)
- [ ] Validation finale complète (17 points)

## État actuel de chaque partie

- **backend** : complet — auth (register/login/guest/refresh/logout/me), users, properties, tenants, owners, contracts, rents, payments (LickPay optionnel), dashboard/stats, notifications, documents+uploads, storage abstrait, health `/api/v1/health`. Déployé sur Render : https://immofaso-backend.onrender.com (`/api/v1/health` → 200, migrations Prisma appliquées, guest/register/login vérifiés).
- **frontend-pwa** : complet — pages Home, Login, Register, Dashboard, Properties, PropertyDetail, Navbar, AuthContext, services API. Déployé sur Vercel : https://frontend-pwa-umber.vercel.app (env `VITE_API_URL` → backend Render).
- **frontend-mobile** : projet Flutter 3.44.9 généré (template par défaut), `flutter analyze` OK. Écrans réels + API : **à faire** (base URL configurée sur le backend Render).

## Conventions de code

- TypeScript strict côté NestJS/React (pas de `skipLibCheck` pour masquer les erreurs).
- Pas de secrets en clair dans le repo. Tout passe par variables d'environnement.
- Modules NestJS par domaine, DTOs pour les entrées, validation `class-validator`.
- Pas de commentaires inutiles ; code clair et nommé.
- Frontends sans dépendance au build l'un de l'autre ni au backend.

## Commandes importantes

Backend :
```
cd backend
npm install
npx prisma generate
npx prisma migrate dev      # local
npx prisma migrate deploy   # prod
npm run build
npm run start:prod
```

PWA :
```
cd frontend-pwa
npm install
npm run build
```

Mobile :
```
cd frontend-mobile
flutter pub get
flutter analyze
flutter build apk --release
```

## Configuration de build

- Backend : `npm run build` → `dist/` ; start prod : `node dist/main`.
- PWA : `npm run build` (Vite) → `dist/`.
- Mobile : `flutter build apk --release` → `build/app/outputs/flutter-apk/app-release.apk`.

## Configuration de déploiement

### Render (backend, Web Service Node)
- Root Directory : `backend`
- Build Command : `npm install && npx prisma generate && npm run build`
- Start Command : `npx prisma migrate deploy && node dist/main`
- Health Check Path : `/api/v1/health`
- Auto Deploy : activé (push sur `main`)

### Vercel (frontend-pwa)
- Root Directory : `frontend-pwa`
- Build : Vite (framework preset React/Vite)
- Le build ne touche ni backend ni mobile (pas d'Android/Gradle/APK).

### Mobile
- `flutter build apk --release` → APK à distribuer.

## Variables d'environnement

Voir `.env.example` (racine) et `backend/.env.example`. Rôle principal :
- `DATABASE_URL` : connexion PostgreSQL (requis)
- `JWT_SECRET` : secret JWT (requis, défaut dev)
- `JWT_REFRESH_SECRET` : secret refresh token
- `PORT` : port serveur (Render fournit)
- `LICKPAY_ENABLED`, `LICKPAY_API_KEY`, `LICKPAY_API_URL` : paiements (optionnel)
- `WHATSAPP_ENABLED`, `WHATSAPP_API_TOKEN`, `WHATSAPP_API_URL` : WhatsApp (optionnel)
- `PUBLIC_URL` / `FRONTEND_URL` : CORS
- `STORAGE_DRIVER` : `local` (défaut)

## Intégrations externes

- **LickPay** : optionnelle. Désactivée par `LICKPAY_ENABLED=false`. Ne bloque jamais le démarrage.
- **WhatsApp** : optionnelle. Désactivée par `WHATSAPP_ENABLED=false`. Ne bloque jamais le démarrage.

## Contraintes importantes

- Aucun Dockerfile / docker-compose dans le repo (Render = runtime Node).
- Pas de secrets commités dans Git.
- Node LTS : pas de Node 26 si incompatibilités ; `engines` fixé.
- Les clés API manquantes ne doivent jamais empêcher : `npm install`, `prisma generate`, `prisma migrate deploy`, build backend, start backend, build frontend.

## Problèmes rencontrés et solutions

- **npm.ps1 bloqué par ExecutionPolicy (Windows)** : utiliser `npm.cmd` au lieu de `npm` dans PowerShell.
- **TS2688 minimatch / TS2345 BadRequestException (storage)** : à corriger dans le backend (aligner les versions de types, typer correctement les throws). Voir historique backend.

## Décisions déjà prises

- 3 apps indépendantes (backend / pwa / mobile) partageant la même API.
- Auth centralisée backend + mode invité.
- Intégrations externes optionnelles dès le premier déploiement.
- Storage abstrait (local par défaut).

## Prochaines tâches

1. Construire le backend NestJS complet + Prisma.
2. Construire le frontend PWA.
3. Finaliser le frontend mobile (écrans réels + API).
4. Valider les 17 points de validation finale.

## État des tests et validations

- Flutter : `flutter analyze` OK (template).
- À faire : npm install backend, prisma generate, migrate, build, start, health check, build PWA, build APK.