# Dictionnaire de données — La Pince

Choix du SGBDR : PostgreSQL

## Pour toutes les tables

* `id` = `INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY`
* Ajout des champs via Prisma :
  * `created_at` : `TIMESTAMPTZ DEFAULT NOW()`
  * `up15/08/26d_at` : `TIMESTAMPTZ DEFAULT NOW()`

Notes :
* `DEC(10,2)` est utilisé pour tous les montants financiers afin d'éviter les erreurs de précision des nombres flottants.
* Les tables de liaison utilisent des clés primaires composites.
* Les suppressions utilisent différents comportements (`CASCADE`, `SET NULL`, `RESTRICT`) selon les besoins métier.

---

# Table `app_user`

| Champ       | Type         | Unique | Not null | Référence | Par défaut | Exemple de valeur                         | Explication                              |
| ----------- | ------------ | ------ | -------- | --------- | ---------- | ----------------------------------------- | ---------------------------------------- |
| `id`        | GENERATED    | ✅     | ✅       | -         | -          | 1                                         | Identifiant unique de l'utilisateur      |
| `name`      | VARCHAR(100) | ❌     | ✅       | -         | -          | "Alice"                                   | Nom ou pseudo de l'utilisateur           |
| `email`     | VARCHAR(255) | ✅     | ✅       | -         | -          | "alice@mail.com"                          | Adresse email utilisée pour la connexion |
| `password`  | VARCHAR(255) | ❌     | ✅       | -         | -          | "$argon2id$..."                           | Mot de passe haché avec Argon2           |

---

# Table `category`

| Champ   | Type         | Unique | Not null | Référence | Par défaut | Exemple de valeur | Explication                        |
| ------- | ------------ | ------ | -------- | --------- | ---------- | ----------------- | ----------------------------------- |
| `id`    | GENERATED    | ✅     | ✅       | -         | -          | 1                  | Identifiant unique de la catégorie |
| `name`  | VARCHAR(100) | ❌     | ✅       | -         | -          | "Transport"        | Nom de la catégorie                |
| `color` | VARCHAR(7)   | ✅     | ✅       | -         | -          | "#FF8C00"          | Couleur associée à la catégorie    |

---

# Table `project`

> ⚠️ Corrigé le [15/08/26] : ajout du champ `type`, absent de la version précédente de ce document.

| Champ         | Type              | Unique | Not null | Référence    | Par défaut | Exemple de valeur   | Explication                |
| ------------- | ----------------- | ------ | -------- | ------------ | ---------- | -------------------- | --------------------------- |
| `id`          | GENERATED         | ✅     | ✅       | -            | -          | 10                    | Identifiant du projet       |
| `name`        | VARCHAR(100)      | ❌     | ✅       | -            | -          | "Voyage Milan"        | Nom du projet                |
| `description` | TEXT              | ❌     | ❌       | -            | -          | "Voyage entre amis"   | Description du projet        |
| `type`        | ENUM (6 valeurs)  | ❌     | ✅       | -            | `'Voyage'` | "Voyage"              | Type de projet : `Voyage`, `Maison_Coloc`, `Anniversaire`, `Repas_Sortie`, `Pro_Travail`, `Autre` |
| `is_archived` | BOOLEAN           | ❌     | ✅       | -            | `false`    | `true`                | État d'archivage du projet, une fois archivé il n'est plus modifiable. Peut être désarchivé |
| `app_user_id` | INT               | ❌     | ✅       | app_user(id) | -          | 1                     | Créateur du projet            |

---

# Table `budget`

> ⚠️ Corrigé le [15/08/26] : `project_id` est en réalité **UNIQUE** (contrainte `@unique` confirmée dans le schéma Prisma) — cette contrainte garantit qu'un projet n'a qu'un seul budget. La version précédente de ce document indiquait ce champ comme non-unique par erreur.

| Champ            | Type      | Unique | Not null | Référence   | Par défaut | Exemple de valeur | Explication                           |
| ---------------- | --------- | ------ | -------- | ----------- | ---------- | ------------------ | -------------------------------------- |
| `id`             | GENERATED | ✅     | ✅       | -           | -          | 4                   | Identifiant du budget                  |
| `amount`         | DEC(10,2) | ❌     | ✅       | -           | -          | 1200.00             | Montant maximum autorisé               |
| `limit_criteria` | DEC(5,2)  | ❌     | ✅       | -           | 80.00      | 75.00               | Pourcentage de déclenchement d'alerte entre 1 et 100 % du montant |
| `project_id`     | INT       | ✅     | ✅       | project(id) | -          | 1                   | Projet lié au budget — un seul budget possible par projet |

---

# Table `alert`

| Champ       | Type        | Unique | Not null | Référence  | Par défaut | Exemple de valeur | Explication                     |
| ----------- | ----------- | ------ | -------- | ---------- | ---------- | ------------------ | -------------------------------- |
| `id`        | GENERATED   | ✅     | ✅       | -          | -          | 8                   | Identifiant de l'alerte          |
| `status`    | VARCHAR(20) | ❌     | ✅       | -          | `'unread'` | "read"              | Statut de lecture de l'alerte : `unread`, `read` ou `resolved` (ce dernier appliqué automatiquement par le back) |
| `message`   | TEXT        | ❌     | ✅       | -          | -          | "Budget dépassé"    | Message affiché à l'utilisateur  |
| `budget_id` | INT         | ❌     | ✅       | budget(id) | -          | 4                   | Budget ayant déclenché l'alerte  |

---

# Table `app_user_alert`

| Champ         | Type | Unique | Not null | Référence    | Par défaut | Exemple de valeur | Explication                   |
| ------------- | ---- | ------ | -------- | ------------ | ---------- | ------------------ | ------------------------------ |
| `app_user_id` | INT  | ❌     | ✅       | app_user(id) | -          | 1                   | Utilisateur recevant l'alerte  |
| `alert_id`    | INT  | ❌     | ✅       | alert(id)    | -          | 8                   | Alerte reçue                   |

Clé primaire composite : (`app_user_id`, `alert_id`)

---

# Table `participant`

| Champ         | Type         | Unique | Not null | Référence    | Par défaut | Exemple de valeur | Explication                                        |
| ------------- | ------------ | ------ | -------- | ------------ | ---------- | ------------------ | --------------------------------------------------- |
| `id`          | GENERATED    | ✅     | ✅       | -            | -          | 12                  | Identifiant du participant                          |
| `name`        | VARCHAR(100) | ❌     | ✅       | -            | -          | "Thomas"            | Nom affiché du participant                          |
| `app_user_id` | INT          | ❌     | ❌       | app_user(id) | NULL       | 1                   | Compte utilisateur associé (optionnel dans le MVP). Un bouton "Moi" permet d'ajouter l'utilisateur comme participant en rattachant automatiquement son nom et son `app_user_id` |

---

# Table `project_participant`

| Champ            | Type | Unique | Not null | Référence       | Par défaut | Exemple de valeur | Explication                   |
| ---------------- | ---- | ------ | -------- | --------------- | ---------- | ------------------ | ------------------------------ |
| `project_id`     | INT  | ❌     | ✅       | project(id)     | -          | 1                   | Projet concerné                |
| `participant_id` | INT  | ❌     | ✅       | participant(id) | -          | 12                  | Participant associé au projet  |

Clé primaire composite : (`project_id`, `participant_id`)

---

# Table `operation`

> ⚠️ Corrigé le [15/08/26] : ajout du champ `is_amount_calculated`, absent de la version précédente de ce document.

| Champ                  | Type         | Unique | Not null | Référence       | Par défaut     | Exemple de valeur | Explication                                                                                                                  |
| ---------------------- | ------------ | ------ | -------- | --------------- | -------------- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| `id`                   | GENERATED    | ✅     | ✅       | -               | -              | 25                   | Identifiant de l'opération                                                                                                    |
| `name`                 | VARCHAR(255) | ❌     | ✅       | -               | -              | "Restaurant"         | Nom de l'opération                                                                                                            |
| `amount`               | DEC(10,2)    | ❌     | ✅       | -               | -              | 84.50                | Montant total de l'opération                                                                                                  |
| `is_amount_calculated` | BOOLEAN      | ❌     | ✅       | -               | `true`         | `false`              | Indique si le montant total a été calculé automatiquement ou saisi manuellement                                              |
| `15/08/26`                 | 15/08/26         | ❌     | ✅       | -               | `CURRENT_15/08/26` | "2026-05-20"         | 15/08/26 de la dépense au moment de la saisie, modifiable par l'utilisateur (antidatage d'une dépense passée possible)           |
| `payer_participant_id` | INT          | ❌     | ✅       | participant(id) | -              | 12                   | Participant ayant avancé la somme                                                                                             |
| `app_user_id`          | INT          | ❌     | ✅       | app_user(id)    | -              | 1                    | Utilisateur ayant créé l'opération                                                                                            |
| `category_id`          | INT          | ❌     | ✅       | category(id)    | id de 'Divers' | 2                    | Catégorie associée. Si aucune catégorie n'est sélectionnée par l'utilisateur, la valeur par défaut est la catégorie "Divers" |
| `project_id`           | INT          | ❌     | ✅       | project(id)     | -              | 1                    | Projet associé                                                                                                                |

---

# Table `operation_participant`

> ⚠️ Corrigé le [15/08/26] : ajout du champ `is_repartition_amount_calculated`, absent de la version précédente de ce document.

| Champ                               | Type      | Unique | Not null | Référence       | Par défaut | Exemple de valeur | Explication                                                              |
| ------------------------------------ | --------- | ------ | -------- | --------------- | ---------- | ------------------- | -------------------------------------------------------------------------- |
| `operation_id`                       | INT       | ❌     | ✅       | operation(id)   | -          | 25                   | Opération concernée                                                       |
| `participant_id`                     | INT       | ❌     | ✅       | participant(id) | -          | 12                   | Participant concerné                                                      |
| `repartition_amount`                 | DEC(10,2) | ❌     | ✅       | -               | -          | 42.25                | Montant dû par le participant (≥ 0, un participant peut être exempté)    |
| `is_repartition_amount_calculated`   | BOOLEAN   | ❌     | ✅       | -               | `true`     | `false`              | Indique si la part a été calculée automatiquement ou fixée manuellement |

Clé primaire composite : (`operation_id`, `participant_id`)
