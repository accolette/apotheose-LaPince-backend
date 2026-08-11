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
