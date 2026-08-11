# Use Cases — La Pince

> 📄 Ce document reflète les scénarios réellement livrés. Pour la conception initiale (Sprint 0)
> et les écarts constatés, voir [`use.cases-old.md`](./use.cases-old.md).

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
4. Le système valide les données, crée le compte et un projet de démonstration prêt à l'emploi.
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

> ❌ **Non implémenté dans le MVP** : il n'existe pas de fonctionnalité "mot de passe oublié" / réinitialisation par email. Un utilisateur qui perd son mot de passe ne peut pas récupérer l'accès à son compte. Reste une évolution potentielle à ajouter au périmètre V2.

---

## UC-03 — Se déconnecter

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur le bouton "Se déconnecter".
2. Le système ferme la session et supprime le token d'authentification.
3. L'utilisateur est redirigé vers la page de connexion.

### Scénarios alternatifs

- **Déconnexion automatique** : après une période d'inactivité, le système expire la session et redirige l'utilisateur vers la page de connexion avec un message explicatif.

---

## UC-04 — Voir ses projets

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur arrive sur la page `/projects` après connexion.
2. Le système affiche les indicateurs clés (KPIs) : projets actifs, montant dû, montant dû par les autres, solde net.
3. Le système affiche la liste paginée de ses projets avec nom, participants, budget et solde actuel.
4. L'utilisateur peut cliquer sur une ligne pour accéder au détail d'un projet (`/project/:id`).

### Scénarios alternatifs

- **Aucun projet** : le système affiche un écran vide avec un bouton "Créer mon premier projet".

---

## UC-05 — Créer un projet

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. L'utilisateur clique sur "Nouveau projet" depuis la liste des projets.
2. Il saisit le nom du projet, peut ou non ajouter un budget et des participants.
3. Il valide la création.
4. Le système crée le projet et redirige vers sa page de détail.
5. L'utilisateur peut par la suite ajouter un budget et des participants.

### Scénarios alternatifs

- **Nom manquant** : le système bloque la validation et indique que le nom est obligatoire.
- **Annulation** : l'utilisateur annule et revient à la liste des projets sans création.

---

## UC-06 — Gérer le budget

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet, l'utilisateur accède à la gestion du budget.
2. Il définit un budget en renseignant : montant plafond et seuil d'alerte en % (par défaut 80%).
3. Il valide. Le système enregistre le budget et l'affiche avec sa barre de progression.

### Scénarios alternatifs

- **Montant invalide** : le système refuse une valeur nulle ou négative.
- **Modification** : l'utilisateur peut modifier le montant ou le seuil du budget existant.
- **Suppression** : l'utilisateur supprime le budget du projet.

> ❌ **Écart avec la conception initiale** : un projet ne peut avoir qu'**un seul budget**, géré au niveau global du projet — pas de découpage par catégorie, pas de budgets multiples sur un même projet. Création, modification et suppression se font via la même action de mise à jour du projet.

---

## UC-07 — Gérer les participants

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la page de détail du projet, l'utilisateur accède à la gestion des participants.
2. Il ajoute un participant fictif en renseignant son prénom.
3. Le système enregistre le participant et l'affiche dans la liste du projet.
4. L'utilisateur peut ajouter autant de participants que nécessaire.

### Scénarios alternatifs

- **Nom manquant** : le système bloque l'ajout et indique que le prénom est obligatoire.
- **Suppression** : l'utilisateur supprime un participant ; si des dépenses lui sont associées, le système avertit que la suppression impactera les calculs.
- **"Moi"** : l'utilisateur peut s'ajouter automatiquement comme participant via un bouton dédié, qui rattache son compte au participant créé.

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
4. Il valide. Le système enregistre la dépense et met à jour le budget et les soldes.

### Scénarios alternatifs

- **Montant manquant ou invalide** : le système bloque la validation.
- **Aucun participant sélectionné** : le système bloque la validation et indique qu'au moins un participant doit être concerné.
- **Projet archivé** : impossible d'ajouter une dépense sur un projet archivé.

---

## UC-10 — Répartir une dépense par participant

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Lors de la saisie d'une dépense, l'utilisateur choisit les participants concernés.
2. Par défaut, chaque participant sélectionné a sa part calculée automatiquement, à parts égales entre tous les participants "automatiques" (gestion précise des centimes et du reste d'arrondi).
3. L'utilisateur peut fixer manuellement le montant d'un ou plusieurs participants — le reste continue d'être réparti automatiquement entre les autres.
4. Le système vérifie que la somme des montants individuels correspond au total de la dépense.
5. L'utilisateur valide.

### Scénarios alternatifs

- **Somme incorrecte** : le système affiche un écart et bloque la validation tant que les montants ne correspondent pas au total.

> Cette répartition automatique se fait uniquement à **parts égales** — pas de pondération par pourcentage individualisé (évolution potentielle V3).

---

## UC-11 — Modifier ou supprimer une dépense

**Acteur** : Utilisateur (connecté)

### Scénario nominal

1. Depuis la liste des dépenses, l'utilisateur sélectionne une dépense.
2. Il modifie les champs souhaités et valide.
3. Le système met à jour la dépense et recalcule le budget et les soldes.

### Scénarios alternatifs

- **Suppression** : l'utilisateur supprime une dépense ; le système recalcule les soldes.

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
2. Un seuil d'alerte atteint sur le budget d'un projet génère automatiquement une alerte côté back.
3. L'utilisateur marque une alerte comme lue.

### Scénarios alternatifs

- **Aucune alerte** : aucune alerte n'a été déclenchée sur les projets de l'utilisateur.
- **Alerte déjà lue** : reste consultable dans l'historique.

---

## UC-14 — Archiver un projet

**Acteur** : Utilisateur connecté

### Scénario nominal

1. Depuis la page de détail d'un projet, l'utilisateur archive ou désarchive le projet (mise à jour du champ `isArchived`).
2. Un projet archivé n'est plus modifiable (dépenses, participants, budget).
3. Il reste consultable et peut être désarchivé à tout moment.

### Scénarios alternatifs

- **Consultation d'un projet archivé** : accessible en lecture, sans possibilité de modification tant qu'il n'est pas désarchivé.