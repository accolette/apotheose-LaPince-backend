# Liste des routes API

## Description
Liste réelle des endpoints API REST de LaPince, telle qu'implémentée en fin de projet.
Toutes les routes (hors Auth et Catégories) sont protégées par un token JWT passé dans le header :
`Authorization: Bearer <token>`

> 📄 Ce document reflète le code final. Pour la conception initiale (Sprint 0) et les écarts constatés,
> voir [`liste.routes.api-old.md`](./liste.routes.api-old.md).

---

## Routes Auth

| Méthode | Route              | Description                         |
|---------|--------------------|-------------------------------------|
| POST    | /api/auth/register | Inscription d'un nouvel utilisateur |
| POST    | /api/auth/login    | Connexion et retour du token JWT    |
| POST    | /api/auth/logout   | Déconnexion                         |
| GET     | /api/auth/me       | Récupérer l'utilisateur connecté    |

> Inchangé par rapport à la conception initiale.

---

## Routes Utilisateurs

**Non implémentées dans le MVP final.**

La gestion du profil (modification, suppression de compte) prévue initialement sous `/api/users`
n'a pas été développée. `GET /api/auth/me` reste la seule route liée à l'utilisateur connecté.

> Cette fonctionnalité reste identifiée comme évolution potentielle ("Page de gestion de compte" — V2).

---

## Routes Projets

| Méthode | Route              | Description                                          |
|---------|---------------------|------------------------------------------------------|
| GET     | /api/projects       | Lister les projets de l'utilisateur (pagination cursor-based) |
| POST    | /api/projects       | Créer un nouveau projet                              |
| GET     | /api/projects/:id   | Récupérer le détail d'un projet                      |
| PATCH   | /api/projects/:id   | Modifier un projet (nom, description, type, archivage, budget) |
| DELETE  | /api/projects/:id   | Supprimer un projet                                  |

> **Écart avec la conception initiale** : pas de route `PATCH /api/projects/:id/archive` dédiée —
> l'archivage se fait via `PATCH /api/projects/:id` avec le champ `isArchived`.
>
> **Budget** : créé, modifié ou supprimé directement dans ce même `PATCH`, via un objet `budget`
> ou le flag `deleteBudget: true`. Pas de routes budget séparées (voir plus bas).

---

## Routes Participants

| Méthode | Route                              | Description                                              |
|---------|-------------------------------------|-----------------------------------------------------------|
| PATCH   | /api/projects/:id/participants     | Ajout, modification et suppression des participants en un seul appel |

> **Écart avec la conception initiale** : pas de `GET`, `POST` ni `DELETE` séparés.
> Le front envoie la liste complète des participants souhaités ; le back compare avec l'existant
> et déduit les créations/modifications/suppressions dans une transaction unique.

---

## Routes Opérations

| Méthode | Route                                       | Description              |
|---------|-----------------------------------------------|--------------------------|
| GET     | /api/projects/:id/operations                 | Lister les opérations du projet |
| POST    | /api/projects/:id/operations                 | Créer une opération      |
| PATCH   | /api/projects/:id/operations/:operationId    | Modifier une opération   |
| DELETE  | /api/projects/:id/operations/:operationId    | Supprimer une opération  |

> Conforme à la conception initiale. Le body inclut la répartition entre participants
> (`operationParticipants`), avec `repartitionAmount` par participant.

---

## Routes Budgets

| Méthode | Route                        | Description                    |
|---------|-------------------------------|--------------------------------|
| GET     | /api/projects/:id/budgets     | Consulter le budget du projet  |

> **Écart avec la conception initiale** : plus de CRUD séparé, et plus de découpage "par catégorie".
> Un seul budget existe par projet (`Budget.projectId @unique`). Création, modification et suppression
> passent par `PATCH /api/projects/:id`.

---

## Routes Catégories

| Méthode | Route           | Description                      |
|---------|-----------------|-----------------------------------|
| GET     | /api/categories | Lister les catégories disponibles |

> Seule route de l'API à ne **pas** nécessiter de token JWT.
> Catégories prédéfinies, aucune opération d'écriture exposée.

---

## Routes Alertes

| Méthode | Route                           | Description                                    |
|---------|----------------------------------|-------------------------------------------------|
| GET     | /api/alertes                    | Lister les alertes de l'utilisateur connecté     |
| PATCH   | /api/alertes/:alerteId          | Marquer une alerte comme lue                     |
| GET     | /api/projects/:id/alertes       | Lister les alertes liées à un projet spécifique  |

> La route imbriquée `/api/projects/:id/alertes` n'était pas prévue dans la conception initiale —
> ajoutée en cours de développement pour l'affichage contextuel des alertes sur la page projet.

---

## Routes Solde / Remboursements

| Méthode | Route                          | Description                                  |
|---------|----------------------------------|-----------------------------------------------|
| GET     | /api/balance                    | Solde net global de l'utilisateur (tous projets confondus) |
| GET     | /api/projects/:id/balance       | Solde net des participants d'un projet donné  |

> **Écart avec la conception initiale** : la route prévue `/api/projects/:id/reimbursements`
> a été renommée en `balance`, et complétée par une route globale (`/api/balance`) non prévue au départ.