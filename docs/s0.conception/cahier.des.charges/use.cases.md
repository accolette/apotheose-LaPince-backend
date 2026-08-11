# Use Cases — La Pince

> 📄 Ce document reflète les scénarios réellement livrés à la soutenance du 15/06/2026.
> Pour la conception initiale (Sprint 0) et les écarts constatés, voir [`use.cases-old.md`](./use.cases-old.md).

## Acteurs

| Acteur | Description |
|---|---|
| **Utilisateur** | Toute personne ayant un compte sur La Pince. C'est l'unique acteur du système — il crée et gère ses projets, saisit les dépenses et consulte les remboursements. |

---

## UC-01 — S'inscrire

**Acteur** : Utilisateur (non connecté)

### Scénario nominal

1. L'utilisateur accède à la page d'inscription.
2. Il renseigne son nom, son email et un mot de passe.
3. Il soumet le formulaire.
4. Le système valide les données, crée le compte, génère automatiquement un projet de démonstration (avec 3 participants fictifs, un budget, des opérations d'exemple et une alerte déjà déclenchée) afin de faciliter la découverte de l'application.
5. L'utilisateur est automatiquement connecté (JWT généré à l'inscription) et redirigé vers la liste de ses projets, sans repasser par l'écran de connexion.

### Scénarios alternatifs

- **Email déjà utilisé** : le système renvoie une erreur 409 et invite l'utilisateur à se connecter.
- **Mot de passe trop faible** : le système affiche les critères de sécurité non respectés (validation Zod).
- **Champ manquant** : le système bloque l'envoi et indique les champs obligatoires.

---

## UC-02 — Se connecter

**Acteur** : Utilisateur (non connecté)

### Scénario nominal

1. L'utilisateur accède à la page de connexion.
2. Il saisit son email et son mot de passe.
3. Il soumet le formulaire.
4. Le système vérifie les identifiants et retourne un token JWT.
5. L'utilisateur est redirigé vers la liste de ses projets.

### Scénarios alternatifs

- **Identifiants incorrects** : le système affiche un message d'erreur générique 401 (sans préciser si c'est l'email ou le mot de passe).
- **Compte inexistant** : même message d'erreur générique pour des raisons de sécurité.

> ❌ **Non implémenté dans le MVP** : il n'existe pas de fonctionnalité "mot de passe oublié" / réinitialisation par email. Reste une évolution potentielle à ajouter au périmètre V2.

---

## UC-03 — Se déconnecter

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur le bouton "Se déconnecter".
2. Le système supprime le token d'authentification stocké côté client.
3. L'utilisateur est redirigé vers la page de connexion.

### Scénarios alternatifs

- **Token expiré** : le token JWT a une durée de vie fixe de 7 jours. À l'expiration, le prochain appel API renvoie une erreur 401 ; le front intercepte cette réponse (événement `auth:unauthorized`), affiche un message ("Votre session a expiré") et redirige vers la connexion.

> ❌ **Écart avec la conception initiale** : il n'existe **pas** de mécanisme de déconnexion automatique après une période d'inactivité. Seule l'expiration fixe du JWT (7 jours) déclenche une déconnexion forcée.

---

## UC-04 — Voir ses projets

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur arrive sur la page `/projects` après connexion.
2. Le système affiche les indicateurs clés (KPIs) : projets actifs, montant dû, montant dû par les autres, solde net.
3. Le système affiche la liste paginée (curseur) de ses projets avec nom, type, participants, budget et solde actuel.
4. L'utilisateur peut cliquer sur une ligne pour accéder au détail d'un projet (`/project/:id`).

### Scénarios alternatifs

- **Aucun projet** : le système affiche un écran vide avec un bouton "Créer mon premier projet".

---

## UC-05 — Créer un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur "Nouveau projet" depuis la liste des projets.
2. Il saisit le nom du projet, choisit un **type** parmi 6 valeurs prédéfinies (`Voyage`, `Maison / Coloc`, `Anniversaire`, `Repas / Sortie`, `Pro / Travail`, `Autre` — `Voyage` par défaut), peut ou non activer un seuil d'alerte avec un budget associé, et ajouter des participants.
3. Il valide la création.
4. Le système crée le projet (et son budget, ses participants, si fournis) en une seule transaction, et redirige vers sa page de détail.

### Scénarios alternatifs

- **Nom manquant** : le système bloque la validation et indique que le nom est obligatoire.
- **Annulation** : l'utilisateur annule et revient à la liste des projets sans création.

---

## UC-06 — Gérer le budget

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la création ou l'édition d'un projet, l'utilisateur active un seuil d'alerte.
2. Il définit un montant plafond et un seuil d'alerte en % (par défaut 80%, réglable via un curseur de 1 à 100).
3. Il valide. Le système enregistre le budget et l'affiche avec sa barre de progression.

### Scénarios alternatifs

- **Montant invalide** : le système refuse une valeur nulle ou négative.
- **Modification** : l'utilisateur peut modifier le montant ou le seuil du budget existant.
- **Suppression / désactivation** : si le seuil d'alerte est désactivé, `limitCriteria` est fixé à `100` par convention (aucune colonne dédiée "alerte activée" en base — c'est ce champ qui encode l'état désactivé).

> ❌ **Écart avec la conception initiale** : un projet ne peut avoir qu'**un seul budget**, géré au niveau global du projet — pas de découpage par catégorie, pas de budgets multiples sur un même projet.

---

## UC-07 — Gérer les participants

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet, l'utilisateur accède à la gestion des participants.
2. Il ajoute un participant fictif en renseignant son prénom, ou s'ajoute lui-même via une case "Moi" (rattache son compte au participant créé).
3. Le système enregistre la liste des participants et l'affiche dans la liste du projet.

### Scénarios alternatifs

- **Nom manquant** : le système bloque l'ajout et indique que le prénom est obligatoire.
- **Suppression d'un participant lié à des opérations** : le système **refuse** la suppression et renvoie une erreur explicite ("Participant... cannot be deleted because they are linked to operations"). Le participant doit d'abord être retiré de toutes ses opérations.

> La gestion des participants ne se fait pas par CRUD unitaire : un seul appel `PATCH` envoie la liste complète souhaitée. Le back compare avec l'existant et déduit les créations/modifications/suppressions dans une transaction unique.

---

## UC-08 — Voir le détail d'un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur un projet depuis la liste des projets.
2. Le système affiche la page de détail avec :
   - Le récapitulatif du budget et son avancement.
   - La liste des dépenses du projet.
   - La liste des participants.
   - Un résumé des soldes de chaque participant.

### Scénarios alternatifs

- **Projet sans dépenses** : les sections dépenses et soldes affichent un état vide avec un message d'invitation à saisir la première dépense.

---

## UC-09 — Saisir une dépense

**Acteur** : Utilisateur (connecté)

**Include** : UC-10 (Répartir par participant)

### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur clique sur "Ajouter une dépense".
2. Il renseigne : nom, montant, date, catégorie et participant payeur.
3. Il sélectionne les participants concernés par la dépense.
4. Il valide. Le système enregistre la dépense, met à jour le budget et les soldes, et vérifie automatiquement si un seuil d'alerte est franchi.

### Scénarios alternatifs

- **Montant manquant, invalide ou négatif** : le système bloque la validation.
- **Aucun participant sélectionné** : le système bloque la validation.
- **Projet archivé** : impossible d'ajouter une dépense sur un projet archivé.

---

## UC-10 — Répartir une dépense par participant

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Lors de la saisie d'une dépense, l'utilisateur choisit les participants concernés.
2. Par défaut, chaque participant sélectionné a sa part calculée automatiquement, à parts égales entre tous les participants "automatiques" (division en centimes avec gestion du reste d'arrondi).
3. L'utilisateur peut fixer manuellement le montant d'un ou plusieurs participants (montant `>= 0` autorisé, pour exempter un participant tout en le gardant dans la répartition) — le reste continue d'être réparti automatiquement entre les autres.
4. Le système vérifie que la somme des montants individuels correspond au total de la dépense.
5. L'utilisateur valide.

### Scénarios alternatifs

- **Somme incorrecte** : le système affiche un écart et bloque la validation.
- **Montant négatif** : refusé côté front avant envoi.

> Cette répartition automatique se fait uniquement à **parts égales** — pas de pondération par pourcentage individualisé (évolution potentielle V3).

---

## UC-11 — Modifier ou supprimer une dépense

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la liste des dépenses, l'utilisateur sélectionne une dépense.
2. Il modifie les champs souhaités et valide.
3. Le système met à jour la dépense, recalcule le budget et les soldes, et réévalue les alertes (déclenchement ou résolution automatique selon le nouveau total).

### Scénarios alternatifs

- **Suppression** : l'utilisateur supprime une dépense ; le système recalcule les soldes et réévalue les alertes.

---

## UC-12 — Voir les soldes et remboursements

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur consulte la section balance.
2. Le système affiche le solde de chaque participant (ce qu'il a payé vs ce qu'il doit).
3. Le système affiche la liste optimisée des remboursements : qui doit combien à qui, avec un minimum de transactions (algorithme glouton).

Une vue globale du solde net de l'utilisateur, tous projets confondus, est également disponible.

### Scénarios alternatifs

- **Comptes équilibrés** : le système affiche un message indiquant qu'aucun remboursement n'est nécessaire.
- **Aucune dépense** : la section affiche un état vide.

---

## UC-13 — Consulter et gérer les alertes

**Acteur** : Utilisateur connecté

### Scénario nominal

1. L'utilisateur consulte la liste de ses alertes (toutes projets confondus) ou les alertes d'un projet spécifique.
2. Un seuil d'alerte atteint sur le budget d'un projet génère automatiquement une alerte côté back, avec le statut