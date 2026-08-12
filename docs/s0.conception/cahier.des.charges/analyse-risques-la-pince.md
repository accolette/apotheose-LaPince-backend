# Analyse des risques — La Pince

> 📄 Ce document reflète les mesures réellement mises en place à la livraison du 15/06/2026.
> Pour l'analyse initiale (Sprint 0) et les écarts constatés, voir
> [`analyse-risques-la-pince-old.md`](./analyse-risques-la-pince-old.md).
>
> Identifier les risques pouvant survenir pendant le développement et les solutions envisagées pour les limiter.

---

## Risques techniques

| Risque | Probabilité | Impact | Criticité |
|---|---|---|---|
| Erreur dans l'algorithme de calcul des remboursements | Moyenne | Élevé | 🔴 Critique |
| Failles de sécurité sur l'authentification JWT | Faible | Élevé | 🔴 Critique |
| Mauvaise modélisation de la base de données (migrations difficiles) | Moyenne | Élevé | 🔴 Critique |
| Absence de sanitization des données entrantes (formulaires) | Moyenne | Élevé | 🔴 Critique |
| Problèmes de performance sur les requêtes avec beaucoup de données | Faible | Moyen | 🟡 Modéré |
| Incompatibilité entre les versions des dépendances | Faible | Moyen | 🟡 Modéré |
| Gestion incorrecte des erreurs API côté front | Moyenne | Moyen | 🟡 Modéré |

---

## Risques organisationnels

| Risque | Probabilité | Impact | Criticité |
|---|---|---|---|
| Sous-estimation du temps de développement | Moyenne | Élevé | 🔴 Critique |
| Périmètre fonctionnel trop large pour le MVP | Moyenne | Élevé | 🔴 Critique |
| Manque de communication sur les choix techniques | Moyenne | Moyen | 🟡 Modéré |
| Dépendance à une seule personne sur une partie critique | Moyenne | Moyen | 🟡 Modéré |
| Mauvaise priorisation des tâches | Faible | Moyen | 🟢 Faible |

---

## Solutions mises en place pour chaque risque critique

### 🔴 Erreur dans l'algorithme de calcul des remboursements

L'algorithme de répartition des dépenses et de calcul des remboursements est le cœur métier de l'application. Une erreur fausserait tous les soldes et briserait la confiance des utilisateurs.

**Mesures réellement mises en place :**

- Tests unitaires sur l'algorithme glouton (`greedy.unit.test.ts`, 12 cas couverts) → évite des calculs faux qui passeraient inaperçus jusqu'en production
- Jeu de données de seed dédié à la validation de cas limites réels (participant seul, répartition inégale, balances nulles, greedy à 2/3/4 participants) → évite les cas limites non anticipés
- Validation croisée des choix techniques via les pull requests → participe à la fiabilisation, sans être une revue de code formalisée systématique (voir plus bas)

---

### 🔴 Failles de sécurité sur l'authentification JWT

Un token mal géré (non expiré, non invalidé à la déconnexion, secret faible) peut exposer les données de tous les utilisateurs.

**Mesures réellement mises en place :**

- Clé secrète forte stockée en variable d'environnement, avec validation obligatoire au démarrage du serveur (`requireEnv`, principe fail fast) → évite qu'un attaquant puisse forger des tokens valides, et évite un serveur qui tourne silencieusement sans secret valide
- Token JWT avec expiration fixe (7 jours) → limite la fenêtre d'exploitation d'un token compromis
- Tests des routes protégées avec des tokens invalides ou expirés (tests unitaires et d'intégration) → évite des routes accessibles sans authentification valide

**Écart assumé avec la conception initiale :** le stockage du token dans un cookie `httpOnly` était envisagé pour se prémunir des attaques XSS. Faute de temps, le token est finalement stocké en `localStorage` côté front. C'est un axe d'amélioration identifié plutôt qu'un oubli — le risque XSS reste partiellement couvert par la sanitization des entrées (Zod, express-xss-sanitizer) et l'absence de rendu HTML brut côté client.

---

### 🔴 Mauvaise modélisation de la base de données

Une erreur de modélisation détectée tard entraîne des migrations complexes, voire une réécriture partielle du schéma et des requêtes.

**Mesures réellement mises en place :**

- MCD et schéma Prisma validés avant le développement des fonctionnalités
- 7 migrations successives et versionnées tout au long du projet (traçabilité complète de l'évolution du schéma, de l'initialisation jusqu'aux ajustements de contraintes)
- Refactorisations effectuées en cours de route plutôt que différées (ex. évolution du modèle de budget, ajout du type de projet)

---

### 🔴 Sous-estimation du temps de développement

**Mesures réellement mises en place :**

- MVP strict défini et respecté (voir périmètre fonctionnel, section 2.3)
- Découpage en tâches individuelles suivies via GitHub Projects
- Réévaluation des priorités à chaque fin de sprint

---

### 🔴 Périmètre fonctionnel trop large pour le MVP

**Mesures réellement mises en place :**

- Périmètre MVP clairement défini et respecté, évolutions repoussées en V2/V3/V4 (voir section 2.3)
- Nouvelles idées ajoutées au backlog plutôt qu'au sprint en cours

---

### 🔴 Absence de sanitization des données entrantes (formulaires)

**Mesures réellement mises en place :**

- Validation Zod sur toutes les routes API, côté back, avant tout traitement
- Double validation : le front revalide également les données (ex. montant de budget, longueur des noms de participants) avant envoi, sans jamais faire confiance uniquement à cette validation côté client
- Protection native contre les injections SQL par l'usage de Prisma (requêtes paramétrées)
- express-xss-sanitizer en middleware global pour neutraliser les scripts malveillants dans les corps de requêtes

---

## Solutions mises en place pour chaque risque modéré

### 🟡 Problèmes de performance sur les requêtes avec beaucoup de données

**Mesures réellement mises en place :**

- Pagination par curseur sur la liste des projets (`take: 5`) et sur les listes d'opérations
- Sélection ciblée des champs Prisma (`select`) plutôt que des requêtes complètes, pour limiter la charge retournée

**Écart assumé avec la conception initiale :** l'ajout d'index dédiés sur les colonnes les plus filtrées (`projectId`, `appUserId`) était envisagé mais n'a pas été formalisé (aucune directive `@@index` au-delà des clés primaires et contraintes uniques dans le schéma). Le volume de données du MVP ne le rendait pas critique à ce stade — reste un axe d'optimisation identifié avant un passage à l'échelle.

---

### 🟡 Incompatibilité entre les versions des dépendances

**Mesures réellement mises en place :**

- Dépendances versionnées explicitement dans `package.json`
- `package-lock.json` partagé et versionné sur le dépôt
- Build et tests vérifiés en CI (GitHub Actions) à chaque push et pull request

**Écart assumé avec la conception initiale :** l'installation en CI utilise `npm i` plutôt que `npm ci`. La différence entre les deux commandes était bien identifiée par l'équipe (documentée en commentaire dans le workflow), mais `npm i` a été conservé — ce qui n'offre pas la garantie stricte d'installation déterministe que permettrait `npm ci`.

---

### 🟡 Gestion incorrecte des erreurs API côté front

**Mesures réellement mises en place :**

- Gestion centralisée des réponses HTTP dans `api.ts` (fonction `handleResponse` commune à tous les appels), avec traitement dédié pour les statuts 401, 429 et 500
- Messages explicites affichés à l'utilisateur via Sonner selon le type d'erreur
- Événement `auth:unauthorized` propagé à l'`AuthContext` pour une déconnexion silencieuse en cas de session expirée

---

### 🟡 Manque de communication sur les choix techniques

**Mesures réellement mises en place :**

- Choix techniques discutés et documentés en pull request
- Merges systématiquement réalisés par une personne différente de l'auteur de la PR

**Écart assumé avec la conception initiale :** un fichier `DECISIONS.md` dédié était envisagé pour centraliser les choix structurants ; il n'a pas été mis en place. La revue de code n'a par ailleurs pas été systématique — certaines PR ont été mergées sans review formalisée (validée uniquement par le changement d'auteur du merge).

---

### 🟡 Dépendance à une seule personne sur une partie critique

**Mesures réellement mises en place :**

- Documentation des parties complexes dans les README et la documentation Swagger
- Alternance partielle des responsabilités entre membres au fil des sprints (full-stack tournant)

---

## Solutions mises en place pour le risque faible

### 🟢 Mauvaise priorisation des tâches

**Mesures réellement mises en place :**

- Backlog priorisé en début de sprint via GitHub Projects
- Priorisation réajustée lors des dailies en cas d'imprévu