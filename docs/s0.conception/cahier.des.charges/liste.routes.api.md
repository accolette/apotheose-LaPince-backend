# Liste des routes API

## Description
Liste réelle des endpoints API REST de LaPince, telle qu'implémentée en fin de projet.
Toutes les routes (hors Auth et Catégories) sont protégées par un token JWT passé dans le header :
`Authorization: Bearer <token>`

> 📄 Ce document reflète le code final, livré à la soutenance du 15/06/2026.
> Pour la conception initiale (Sprint 0) et les écarts constatés, voir [`liste.routes.api-old.md`](./liste.routes.api-old.md).

---

## Routes Auth

| Méthode | Route              | Description                         |
|---------|--------------------|-------------------------------------|
| POST    | /api/auth/register | Inscription — crée le compte, un projet de démonstration, et connecte automatiquement l'utilisateur (JWT retourné directement) |
| POST    | /api/auth/login    | Connexion et retour du token JWT (durée de vie : 7 jours) |
| POST    | /api/auth/logout   | Déconnexion (suppression du token côté client)            |
| GET     | /api/auth/me       | Récupérer l'utilisateur connecté    |

> Inchangé par rapport à la conception initiale, à l'exception de la connexion automatique après inscription (ajoutée en cours de développement).

---

## Routes Utilisateurs

**Non implémentées dans le MVP final.**

La gestion du profil (modification, suppression de compte) prévue initialement sous `/api/users`
n'a pas été développée. `GET /api/auth/me` reste la seule route liée à l'utilisateur connecté.

> Cette fonctionnalité reste identifiée comme évolution potentielle ("Page de gestion de compte" — V2).

---

## Routes Projets

| Méthode | Route              | Description                                          |
|---------|---------------------|--------------------------------------------------------|
| GET     | /api/projects       | Lister les projets de l'utilisateur (pagination cursor-based, 5 par page) + KPIs |
| POST    | /api/projects       | Créer un nouveau projet (avec type, budget et participants optionnels, en une transaction) |
| GET     | /api/projects/:id   | Récupérer le détail d'un projet                      |
| PATCH   | /api/projects/:id   | Modifier un projet (nom, description, type, archivage, budget) |
| DELETE  | /api/projects/:id   | Supprimer un projet                                  |

> **Écart avec la conception initiale** : pas de route `PATCH /api/projects/:id/archive` dédiée —
> l'archivage se fait via `PATCH /api/projects/:id` avec le champ `isArchived`.
>
> **Budget** : créé, modifié ou supprimé directement dans ce même `PATCH`, via un objet `budget`
> ou le flag `deleteBudget: true` (opération idempotente). Pas de routes budget séparées (voir plus bas).
>
> **Type de projet** : champ `type`, enum à 6 valeurs (`Voyage`, `Maison_Coloc`, `Anniversaire`,
> `Repas_Sortie`, `Pro_Travail`, `Autre`), absent de la conception initiale — ajouté en cours de développement.

---

## Routes Participants

| Méthode | Route                              | Description                                              |
|---------|-------------------------------------|-------------------------------------------------------------|
| PATCH   | /api/projects/:id/participants     | Ajout, modification et suppression des participants en un seul appel |

> **Écart avec la conception initiale** : pas de `GET`, `POST` ni `DELETE` séparés.
> Le front envoie la liste complète des participants souhaités ; le back compare avec l'existant
> et déduit les créations/modifications/suppressions dans une transaction unique.
> Un participant lié à une ou plusieurs opérations ne peut pas être supprimé — la requête échoue avec une erreur explicite.

---

## Routes Opérations

| Méthode | Route                                       | Description              |
|---------|-----------------------------------------------|--------------------------|
| GET     | /api/projects/:id/operations                 | Lister les opérations du projet |
| POST    | /api/projects/:id/operations                 | Créer une opération      |
| PATCH   | /api/projects/:id/operations/:operationId    | Modifier une opération   |
| DELETE  | /api/projects/:id/operations/:operationId    | Supprimer une opération  |

> Conforme à la conception initiale. Le body inclut la répartition entre participants
> (`operationParticipants`), avec `repartitionAmount` par participant. Chaque écriture/modification/suppression
> déclenche une réévaluation automatique des alertes budgétaires du projet (création ou résolution).

---

## Routes Budgets

| Méthode | Route                        | Description                    |
|---------|-------------------------------|--------------------------------|
| GET     | /api/projects/:id/budgets     | Consulter le budget du projet  |

> **Écart avec la conception initiale** : plus de CRUD séparé, et plus de découpage "par catégorie".
> Un seul budget existe par projet (`Budget.projectId @unique`). Création, modification et suppression
> passent par `PATCH /api/projects/:id`. `limitCriteria = 100` encode par convention "alerte désactivée"
> (pas de colonne dédiée en base).

---

## Routes Catégories

| Méthode | Route           | Description                      |
|---------|-----------------|------------------------------------|
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
>
> **Statuts** : `unread`, `read`, `resolved`. Le statut `resolved` n'est **jamais** déclenché manuellement
> depuis l'interface — il est appliqué automatiquement par le back si le total des dépenses repasse
> sous le seuil d'alerte après modification ou suppression d'une opération.

---

## Routes Solde / Remboursements

| Méthode | Route                          | Description                                  |
|---------|----------------------------------|-------------------------------------------------|
| GET     | /api/balance                    | Solde net global de l'utilisateur (tous projets confondus) |
| GET     | /api/projects/:id/balance       | Solde net des participants d'un projet donné (+ remboursements suggérés) |

> **Écart avec la conception initiale** : la route prévue `/api/projects/:id/reimbursements`
> a été renommée en `balance`, et complétée par une route globale (`/api/balance`) non prévue au départ.

---

## Corps des requêtes (POST / PATCH)

Tous les champs sont validés côté back avec **Zod**. Le nommage suit le camelCase JS/TS — aucun champ français, aucun champ `type` de mouvement (`debit`/`credit`) contrairement à ce que prévoyait la conception initiale.

### `POST /api/projects`

```json
{
  "name": "Voyage à Barcelone",
  "description": "Weekend entre amis",
  "type": "Voyage",
  "budget": {
    "amount": 1000,
    "alertEnabled": true,
    "limitCriteria": 80
  },
  "participants": [
    { "name": "Alice", "isMe": true },
    { "name": "Bob" }
  ]
}
```
> `name` seul est obligatoire. `type` vaut `"Voyage"` par défaut si omis. `budget` et `participants` sont optionnels. Si `alertEnabled` est `false`, `limitCriteria` est forcé à `100` côté service, quelle que soit la valeur envoyée.

---

### `PATCH /api/projects/:id`

Au moins un champ doit être renseigné. Quatre usages typiques :

```json
// Modifier le nom
{ "name": "Voyage à Madrid" }

// Ajouter ou modifier le budget
{ "budget": { "amount": 1200, "limitCriteria": 90 } }

// Supprimer le budget existant (opération idempotente)
{ "deleteBudget": true }

// Archiver le projet
{ "isArchived": true }
```
> Champs disponibles : `name`, `description`, `isArchived`, `type`, `budget` (objet `{amount, limitCriteria}`), `deleteBudget` (booléen). `deleteBudget: true` vérifie d'abord l'existence du budget avant suppression — un second appel identique renvoie 200 sans erreur (idempotent).

---

### `PATCH /api/projects/:id/participants`

```json
[
  { "id": 1, "name": "Alice" },
  { "id": 2, "name": "Bob" },
  { "name": "Charlie" }
]
```
> Tableau complet des participants souhaités. Un `id` présent = participant existant à conserver/modifier. Un `id` absent = nouveau participant à créer. Tout participant existant absent de ce tableau est supprimé — sauf s'il est lié à une opération, auquel cas la requête entière échoue.

---

### `POST` / `PATCH /api/projects/:id/operations(/:operationId)`

```json
{
  "name": "Restaurant",
  "amount": 100,
  "date": "2026-06-11",
  "categoryId": 1,
  "payerParticipantId": 2,
  "isAmountCalculated": false,
  "operationParticipants": [
    { "participantId": 2, "repartitionAmount": 50, "isRepartitionAmountCalculated": false },
    { "participantId": 3, "repartitionAmount": 50, "isRepartitionAmountCalculated": false }
  ]
}
```
> `amount` doit être positif, avec au maximum 2 décimales. `repartitionAmount` accepte `0` (participant exempté). La répartition est calculée et envoyée **par le front** — l'API valide et enregistre ce qu'elle reçoit, elle ne recalcule rien elle-même.

---

### `PATCH /api/alertes/:alerteId`

```json
{ "status": "read" }
```
> `status` accepte techniquement `read`, `unread` ou `resolved` côté validation Zod, mais en usage réel seul `read` est envoyé manuellement — le passage à `resolved` est automatique côté back.