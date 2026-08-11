# 🗓️ Suivi post-sprint — Aurore

## 📅 Date

11/08/26

---

## Tâches réalisées

### 📄 Documentation

* Mise à jour des README (back et front) avec quelques compléments :

* clarification de la disponibilité de Swagger sur le port de l'API,
* correction d'incohérences de nommage de repo,
* corrections de typos identifiées lors de la relecture.

* Ajout de la documentation post-sprint (ce fichier).

---

### 🎨 Front — Landing page

* Mise à jour de la landing page (`Hero`, `FeatureGrid`) :

* ajout de mentions **"Bientôt disponible"** sur les fonctionnalités hors périmètre MVP (objectifs d'épargne, comptes partagés),
* reformulation des textes qui laissaient penser à des fonctionnalités déjà actives (catégorisation automatique, temps réel, partage multi-utilisateur),
* alignement du contenu affiché avec l'état réel du MVP.

---

### 🛠️ CI/CD — Correction de la CI backend

* Diagnostic et correction de plusieurs échecs de la CI sur `Backend CI` :

* ajout du secret `JWT_SECRET` manquant dans les GitHub Actions du repo (suite au clonnage de ce dernier, oubli de ma part),
* ajout d'une étape `Setup test environment` (`cp .env.test.example .env.test`) pour que `global-setup.ts` dispose des variables nécessaires au lancement du conteneur Docker de test en CI,
* identification et correction d'un test (`projects.integration.test.ts`) dont l'URL de base était codée en dur (`http://localhost:3001`) au lieu de lire dynamiquement `process.env.PORT` — bug invisible en local car le port codé en dur coïncidait par hasard avec le `.env.test` local, mais révélé par la CI qui utilise un port différent (3000).

* CI backend fonctionnelle de bout en bout (lint, tests unitaires, tests d'intégration).

---

### 📄 Documentation — Audit et fiabilisation des README (FR/EN, back/front)

* Relecture croisée complète des deux README (back et front, versions FR et EN), en confrontant systématiquement le contenu documenté au code réel (routers, `app.ts`, schémas Zod, `AppRouter.tsx`) plutôt qu'aux docs de conception initiales.
* Corrections apportées :

* inversion des liens `git clone` entre les README back et front (FR puis EN) — bug bloquant l'installation si suivi à la lettre,
* section "Résumé des endpoints" (back) entièrement revue : suppression des routes `/api/users` (jamais implémentées), correction du CRUD participants (un seul `PATCH` bulk au lieu de GET/POST/PATCH/DELETE), correction du CRUD budgets (`GET` seul, création/modif via `PATCH /api/projects/:id`), renommage `/reimbursements` → `/api/balance`,
* renommage `routes/` → `routers/` et ajout du dossier `schemas/` manquant dans les diagrammes d'architecture (FR et EN),
* table des routes front entièrement revue pour matcher `AppRouter.tsx` (`/project/:id` au singulier, ajout des pages légales/erreurs, suppression des routes fantômes `/alerts`, `/profile`, etc.),
* correction des liens cassés dans la table Documentation et RGPD (chemins dupliqués, ancien nom de dossier `rgdp`),
* suppression de plusieurs titres de section dupliqués (`## Routes`, `### Résumé des endpoints`),
* ajout d'un bandeau honnête dans la section Tests du front, précisant qu'aucun test n'a encore été écrit côté front.

---

### 📄 Documentation — Mise à jour des docs de conception (dossier `s0.conception/`)

* Audit complet des documents de conception du back (cahier des charges, use cases, user stories, choix d'architecture, liste des technos) pour identifier les écarts entre la conception initiale (Sprint 0) et l'implémentation finale.
* Deux fichiers jugés fiables et laissés inchangés : `choix.architecture.md`, `listes.technos.utilisees.md`.
* Quatre fichiers présentant un écart significatif, traités selon le même pattern : archivage de la version initiale sous suffixe `-old` avec bandeau explicatif, et réécriture du fichier au nom d'origine avec le contenu réellement livré, afin de ne pas casser les liens existants dans le reste de la documentation :

* `liste.routes.api.md` — écarts sur les routes utilisateurs (jamais implémentées), participants et budgets (CRUD complet prévu vs endpoints simplifiés livrés), remboursements renommés en balance,
* `mvp.md` — correction du budget (par projet, pas par catégorie comme prévu initialement) ; la répartition automatique, elle, s'est révélée conforme à l'intention initiale après vérification du code front (`recalculateOperationState.ts`) — correction de ma propre erreur d'interprétation en cours de relecture,
* `use.cases.md` — correction de UC-06 (gestion du budget) et signalement de l'absence de la fonctionnalité "mot de passe oublié" (UC-02), jamais implémentée côté back,
* `user.stories.md` — correction de la section "Gestion des projets" sur le même point budget.
