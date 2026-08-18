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
| Paiements | LeekPay (optionnel) |
| Messagerie | API WhatsApp OTP (optionnelle) |
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
    integrations/      # leekpay (optionnel), whatsapp (optionnel)
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
- Intégrations externes (LeekPay, WhatsApp OTP) **optionnelles** : si `*_ENABLED=false` ou clés absentes → fonctionnalité désactivée proprement, jamais d'erreur au build/démarrage.
- Stockage abstrait : interface `StorageService` avec implémentation locale par défaut ; prêt pour un stockage externe (S3) plus tard. Un problème de stockage ne bloque pas le démarrage.
- Health check : `GET /api/v1/health` → 200 quand l'API tourne.
- Port : `process.env.PORT` (Render) avec fallback local 3000.
- Node LTS stabilisé : `engines.node >= 20` ; testé sur v24.

## Fonctionnalités prévues

- [x] Structure 3 apps + mémoire de travail
- [x] Backend NestJS complet (auth, users, biens, locataires, propriétaires, contrats, loyers, paiements, dashboard, notifications, documents, stats)
- [x] Auth : inscription, connexion, JWT, refresh, déconnexion, profil, rôles, invité
- [x] Endpoint santé /api/v1/health
- [x] Intégration LeekPay optionnelle
- [x] Intégration WhatsApp OTP optionnelle
- [x] Frontend PWA moderne (dashboard, navigation, formulaires, états de chargement/erreur) — **refonte design premium terminée**
- [x] Frontend mobile Flutter (design premium harmonisé avec le PWA, APK release construit ✅)
- [x] Déploiement Render (backend) + Vercel (PWA) + APK (mobile)
- [ ] Validation finale complète (17 points)

## État actuel de chaque partie

- **backend** : complet — auth (register/login/guest/refresh/logout/me), users, properties, tenants, owners, contracts, rents, payments (LeekPay optionnel), dashboard/stats, notifications, documents+uploads, storage abstrait, health `/api/v1/health`. Déployé sur Render : https://immofaso-backend.onrender.com. **Vérifié en réel (2026-08-17)** : health→200, guest→201, register→201, me→200, properties→200 (liste publique, vide car pas de données), dashboard/stats→403 pour rôle TENANT (réservé ADMIN/MANAGER/OWNER).
- **frontend-pwa** : **refonte design terminée** — pages Home, Login, Register, Dashboard, Properties, PropertyDetail, Navbar, PropertyCard, AuthContext, ToastContext, EmptyState, Skeleton, Spinner, services API. Design system moderne (teal `#0f766e`, gradient, glassmorphism, animations fadeUp/stagger, skeletons, toasts). URL API par défaut : https://immofaso-backend.onrender.com (fallback si `VITE_API_URL` absent). Build `npm run build` ✅ OK. Déployé sur Vercel : https://frontend-pwa-umber.vercel.app.
- **frontend-mobile** : **design premium terminé et harmonisé avec le PWA** — palette teal `#0f766e` (`lib/theme.dart`), composants premium (cards, dégradés, glassmorphism, badges, FCFA), états chargement/squelette/erreur/vide élégants (`lib/widgets/state_widgets.dart`), animations (TweenAnimationBuilder sur Welcome/Splash), Welcome hero, login/register/properties/property_detail/profile. Auth (register/login/guest/logout) + propriétés branchés sur l'API Render. `flutter analyze` ✅ OK. **APK release construit** : `build/app/outputs/flutter-apk/app-release.apk` (48,4 MB).

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
- `LEEKPAY_ENABLED`, `LEEKPAY_PUBLIC_KEY`, `LEEKPAY_SECRET_KEY`, `LEEKPAY_API_URL` : paiements (optionnel)
- `WHATSAPP_ENABLED`, `WHATSAPP_API_KEY`, `WHATSAPP_AUTH_KEY`, `WHATSAPP_API_URL` : WhatsApp OTP (optionnel)
- `PUBLIC_URL` / `FRONTEND_URL` : CORS
- `STORAGE_DRIVER` : `local` (défaut)

## Intégrations externes

- **LeekPay** : optionnelle. Désactivée par `LEEKPAY_ENABLED=false`. Ne bloque jamais le démarrage.
- **WhatsApp OTP** : optionnelle. Désactivée par `WHATSAPP_ENABLED=false`. Ne bloque jamais le démarrage.

## Contraintes importantes

- Aucun Dockerfile / docker-compose dans le repo (Render = runtime Node).
- Pas de secrets commités dans Git.
- Node LTS : pas de Node 26 si incompatibilités ; `engines` fixé.
- Les clés API manquantes ne doivent jamais empêcher : `npm install`, `prisma generate`, `prisma migrate deploy`, build backend, start backend, build frontend.

## Problèmes rencontrés et solutions

- **npm.ps1 bloqué par ExecutionPolicy (Windows)** : utiliser `npm.cmd` au lieu de `npm` dans PowerShell.
- **TS2688 minimatch / TS2345 BadRequestException (storage)** : **résolus** — le build backend passe (`npm run build` ✅, `npm run typecheck` ✅). Vérifier au prochain build complet.
- **DELETE → 500 (FK P2003)** : supprimer une propriété/contrat/locataire lié renvoyait 500. Corrigé par `src/common/utils/prisma-errors.ts` (`assertDeletable`) : une entité liée renvoie maintenant **409 Conflict** avec message clair en français, une entité isolée → 200. Vérifié en réel (local) : propriété isolée→200, propriété liée→409, locataire lié→409.

## Décisions déjà prises

- 3 apps indépendantes (backend / pwa / mobile) partageant la même API.
- Auth centralisée backend + mode invité.
- Intégrations externes optionnelles dès le premier déploiement.
- Storage abstrait (local par défaut).

## AUDIT COMPLET — 2026-08-18

### Ce qui existe et fonctionne (NE PAS casser)
- [x] Backend NestJS : auth (register/login/guest/refresh/logout/me, JWT, rôles), users, properties, tenants, owners, contracts, rents, payments, dashboard/stats, notifications, documents+uploads, storage abstrait (local), health `/api/v1/health`.
- [x] Base PostgreSQL + Prisma (schéma : User, RefreshToken, Owner, Tenant, Property, Contract, Rent, Payment, Notification, Document).
- [x] PWA Vite/React/TS/Tailwind : pages Home, Login, Register, Dashboard, Properties, PropertyDetail ; Navbar, PropertyCard, AuthContext, ToastContext, Skeleton, EmptyState, Spinner. Design teal `#0f766e` + glassmorphism + animations.
- [x] Mobile Flutter : Welcome, Login, Register, Home, Properties, PropertyDetail, Profile ; theme premium `lib/theme.dart`, widgets d'état, services API. APK release 48,4 MB.
- [x] Déploiements : Render (backend) + Vercel (PWA) + APK.
- [x] DELETE → 409 via `assertDeletable` (prisma-errors.ts).

### Ce qui MANQUE pour être un vrai SaaS de gestion
- [x] Modèle **Immeuble (Building)** — regroupement des biens, étages, photos, stats (logements, occupation, revenus, impayés). **FAIT (module + stats + UI PWA/Flutter).**
- [x] Modèle **Dépenses (Expense)** avec catégories + justificatif. **FAIT (module + UI PWA).**
- [x] Modèle **Maintenance (MaintenanceTicket)** (plomberie/électricité/peinture/sécurité, priorité, statut). **FAIT (module + UI PWA).**
- [x] **Lien bien → immeuble** (`Property.buildingId`). **FAIT.**
- [x] **Statut RESERVED** pour les biens. **FAIT (enum PropertyStatus).**
- [x] **Paiement flexible** : `Payment.rentId` nullable + `contractId`, avance, paiement partiel, paiement par contrat. **FAIT (waterfall + `Rent.paidAmount`).**
- [x] **Suivi dettes/avances** : solde par contrat calculé backend. **FAIT (`GET /payments/balance/:contractId`).**
- [x] **Reçus PDF** après paiement. **FAIT (`GET /payments/:id/receipt`, pdfkit).**
- [x] **Dashboard enrichi** : stats aujourd'hui/mois/année, impayés, dépenses, travaux en cours. **FAIT (`GET /dashboard/overview` + UI PWA/Flutter).**
- [x] **PWA : pages de gestion CRUD** (immeubles, biens, locataires, contrats, paiements, dépenses, maintenance). **FAIT (`src/pages/manage/*` + routes `/manage/*` protégées).**
- [x] **Mobile : gestion** — service + écrans (dashboard, immeubles, biens, locataires, paiements) + onglet Gestion (rôles ADMIN/MANAGER/OWNER). **FAIT (flutter analyze ✅).**
- [x] **Photo upload UI** : stockage local existait ; **UI PWA ajoutée** (upload/remplacement/suppression photos de biens).

### Règles de non-régression pour la suite
- NE PAS casser auth, sessions, routes existantes, DELETE 409, déploiements.
- `GET /api/v1/dashboard/stats` → 403 pour TENANT/GUEST (garde existante, le PWA gère via EmptyState).
- LeekPay/WhatsApp restent optionnels.
- Stockage local par défaut conservé.

### Décisions de conception retenues
- Solde par contrat = `sum(paiements PAID) - sum(loyers due)` → négatif = dette, positif = avance. Calcul backend.
- Enregistrement paiement : `POST /payments` accepte `contractId` (recommandé) ou `rentId` ; répartition "waterfall" sur les loyers impayés les plus anciens, reste → avance (crédit contrat).
- Reçus : endpoint `GET /payments/:id/receipt` → PDF (lib `pdfkit`, à ajouter).
- Immeubles/biens/dépenses/tickets : rôles ADMIN/MANAGER/OWNER (comme properties/tenants existants).

## Prochaines tâches

> **REPRISE DE SESSION — point de reprise (2026-08-18)**
> Le code est TERMINÉ côté backend (immeubles, dépenses, maintenance, paiements flexibles + reçus PDF, dashboard enrichi, properties enrichies + photos) et côté PWA (pages de gestion complètes + routes protégées + dashboard refait). Flutter a terminé l'amorçage : `management_service.dart`, modèles, écrans `manage_screen`/`manage_buildings_screen`/`manage_properties_screen`/`manage_tenants_screen`/`manage_payments_screen`, et onglet « Gestion » dans `home_screen.dart` (rôles ADMIN/MANAGER/OWNER) — `flutter analyze` ✅.
> Prochaine étape : **déploiements** — commit/push GitHub → Render (backend, migration incluse) → Vercel (PWA) → tests réels en production, puis mise à jour finale de cette mémoire.

1. ✅ Audit complet 2026-08-18 (ce qui existe, ce qui manque, règles de non-régression).
2. ✅ Backend Prisma : Building, Expense, MaintenanceTicket, PropertyStatus.RESERVED, PaymentStatus.PARTIAL, ExpenseCategory, TicketPriority, TicketStatus, Property.buildingId/pieces/amenities/floor, Payment.rentId nullable + contractId, Rent.paidAmount. Migration `20260818130210_add_buildings_expenses_maintenance` créée + appliquée (local).
3. ✅ Backend modules buildings/expenses/maintenance (CRUD + stats immeuble + catégories/priorités/statuts, `createdById` via @CurrentUser), enregistrés dans `app.module.ts`.
4. ✅ Backend payments rework : `POST /payments` (contractId ou rentId) + waterfall sur loyers impayés, solde dettes/avances `GET /payments/balance/:contractId`, reçus PDF `GET /payments/:id/receipt` (pdfkit, `receipt.service.ts`).
5. ✅ Backend dashboard : `GET /dashboard/overview` (aujourd'hui/mois/année, impayés par locataire, revenus/dépenses 12 mois, paiements par méthode) ; `stats` conservé.
6. ✅ Backend properties : DTO enrichi (status, pieces, floor, amenities, buildingId), filtre buildingId, `POST/DELETE :id/images`.
7. ✅ Backend vérifié : `npm run typecheck` + `npm run build` ✅.
8. ✅ PWA : types/services (buildings, expenses, maintenance, tenants, contracts, payments + downloadReceipt, properties CRUD + photos + overview), composants UI (Modal, ConfirmDialog, Field, TextArea), CSS gestion, MgmtNav + MgmtLayout, pages `src/pages/manage/*` (Immeubles + détail, Biens + photos, Locataires + détail, Contrats + détail balance/encaissement/loyers, Paiements + reçu, Dépenses, Maintenance), Dashboard refait (stats + bar charts + impayés), routes `/manage/*` protégées (`ManagementRoute`). Build PWA ✅.
9. ✅ Flutter : `api_client.dart` (patch/delete), `models/management.dart`, `services/management_service.dart`, écrans gestion (ManageScreen overview + Immeubles + Biens + Locataires + Paiements), onglet « Gestion » dans HomeScreen pour ADMIN/MANAGER/OWNER. `flutter analyze` ✅.
10. ⏳ Déploiements : commit/push GitHub → Render (backend + migrate deploy) → Vercel (PWA) → tests réels en production → mise à jour finale de cette mémoire.

### Détail de l'étape 3 (design Flutter — TERMINÉE)

- `lib/theme.dart` : palette PWA (primary `#0f766e`, surface claire `#f5f7fa`, `#115e59`, accent `#2dd4bf`, gold invité `#f59e0b`), thème premium (cards arrondies, boutons, inputs, NavigationBar, SnackBar).
- `lib/widgets/property_card.dart` : design premium (cover dégradé si pas d'image, badges statut, prix FCFA, chambres/SdB).
- `lib/screens/welcome_screen.dart` : hero + identité visuelle (gradient deep, glass, animations TweenAnimationBuilder).
- `lib/widgets/state_widgets.dart` : SkeletonBox/SkeletonCard/ErrorState/EmptyState élégants.
- Splash (`main.dart`) : écran de démarrage avec dégradé + logo.
- Pas de surcharge : animations légères, analyse Flutter ✅.

## Rappels backend vérifiés (2026-08-17)

- `POST /api/v1/auth/guest` → 201, user `{role:GUEST, isGuest:true}`, refreshToken null.
- `POST /api/v1/auth/register` → 201, rôle par défaut TENANT.
- `POST /api/v1/auth/login` → 401 si compte inexistant (erreur attendue).
- `GET /api/v1/auth/me` → 200 avec Bearer token.
- `GET /api/v1/properties` → 200 public, format `{items:[], total:0}`.
- `GET /api/v1/dashboard/stats` → 403 pour TENANT/GUEST (rôle ADMIN/MANAGER/OWNER requis). Le PWA gère déjà ce cas via EmptyState. Ne pas casser ce comportement.
- `DELETE /api/v1/{properties|contracts|tenants}/:id` → 409 si entité liée (contrats/loyers/documents), 200 sinon. `DELETE /owners/:id` → 200 (relations optionnelles).

## État des tests et validations

- PWA : `npm run build` ✅ OK (tsc + vite) après ajout des pages de gestion ; ~235 kB JS gzip ~78 kB. **Redéployé sur Vercel (2026-08-17)** : https://frontend-pwa-umber.vercel.app.
- Flutter : `flutter analyze` ✅ OK (écrans réels + services API + écrans de gestion). **APK release construit** : `frontend-mobile/build/app/outputs/flutter-apk/app-release.apk` (48,4 MB).
- Backend : `npm run build` ✅ OK, `npm run typecheck` ✅ OK (TS2688/TS2345 résolus), `pdfkit` installé.
- **Tests réels API Render (2026-08-17)** : 36 tests passent (health, auth public register/login/guest/refresh/logout/me, validations 400/401/409, propriétés publiques + filtres, tenants/payments/notifications 200, gardes de rôle 403 dashboard/users/tenants/owners/contracts/documents, tokens invalides 401, LeekPay désactivé 400). PWA déployée vérifiée (chargement + backend Render référencé).
- **Tests réels API locale (rôles élevés, compte ADMIN)** : dashboard/stats 200, users 200, propriétaire/locataire/propriété/contrat/loyer/paiement/notification CRUD 200/201, upload document multipart 201, validations 400, 404 propre, suppressions → 200 (isolé) / 409 (lié). 3 bugs DELETE 500 corrigés.
- Compte ADMIN local `emstronglezin@gmail.com` / `Immofaso2026!` (base locale immofaso). Compte TENANT du même email créé sur Render.
- À faire : push GitHub → redéploiement Render (auto-deploy) → redéploiement PWA Vercel → tests réels des parcours UI de gestion en production (immeubles, biens + photos, locataires, contrats, paiements + reçu PDF, dépenses, maintenance, dashboard).