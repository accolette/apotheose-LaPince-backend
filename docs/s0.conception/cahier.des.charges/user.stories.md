# User Stories — La Pince

> 📄 Ce document reflète le périmètre réellement livré à la soutenance du 15/06/2026.
> Pour la conception initiale (Sprint 0) et les écarts constatés, voir [`user.stories-old.md`](./user.stories-old.md).

## Authentification

| En tant que | Je veux | Afin de |
|---|---|---|
| Nouvel utilisateur | Créer un compte | Accéder à l'application |
| Nouvel utilisateur | Disposer d'un projet de démonstration dès l'inscription | Découvrir l'application sans avoir à tout créer moi-même |
| Utilisateur | Me connecter à mon compte | Accéder à la liste de mes projets |
| Utilisateur | Me déconnecter de mon compte | Sécuriser mon accès et protéger mes données |

> ❌ **Non implémenté dans le MVP** : réinitialisation de mot de passe. Le token JWT expire après 7 jours de manière fixe (pas de déconnexion par inactivité).

---

## Vue d'ensemble des projets

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Voir la liste de tous mes projets | Avoir une vue d'ensemble de mes projets |
| Utilisateur | Voir le budget de chaque projet sur sa carte | Savoir où en est chaque projet |
| Utilisateur | Voir l'avancement du budget pour chaque projet | Identifier les projets qui approchent de leur limite |
| Utilisateur | Voir le solde global et par projet | Avoir une vue d'ensemble de mes projets |
| Utilisateur | Accéder à un projet en un clic | Consulter le détail d'un projet rapidement |

---

## Page détail d'un projet

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Accéder au détail d'un projet | Consulter toutes les informations du projet |
| Utilisateur | Voir le récapitulatif du budget et son avancement | Suivre la consommation du projet |
| Utilisateur | Voir la liste complète des dépenses du projet | Avoir l'historique de toutes les opérations |
| Utilisateur | Voir la liste des participants du projet | Savoir qui est impliqué dans le projet |
| Utilisateur | Voir un résumé des soldes de chaque participant | Avoir une vue rapide de qui doit de l'argent à qui |

---

## Gestion des projets

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Créer un nouveau projet avec un nom | Suivre les dépenses d'un groupe, voyage... |
| Utilisateur | Choisir un type de projet (Voyage, Coloc, Anniversaire, Repas/Sortie, Pro/Travail, Autre) | Catégoriser et me repérer plus facilement parmi mes projets |
| Utilisateur | Définir un budget sur un projet | Fixer un plafond de dépenses avec seuil d'alerte |
| Utilisateur | Désactiver le seuil d'alerte d'un budget | Suivre un budget sans être notifié |
| Utilisateur | Modifier un projet | Corriger une erreur de nom, description, type ou budget |
| Utilisateur | Archiver un projet | Clôturer un projet terminé |
| Utilisateur | Désarchiver un projet | Reprendre un projet archivé par erreur |

> ❌ **Écart avec la conception initiale** : un seul budget par projet, géré globalement — pas de budgets multiples ni de découpage par catégorie.

---

## Gestion des participants

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Créer un ou plusieurs participants à un projet | Représenter les personnes impliquées sans qu'elles aient de compte |
| Utilisateur | Nommer chaque participant | Les identifier facilement lors de la saisie des dépenses |
| Utilisateur | M'ajouter automatiquement comme participant | Ne pas ressaisir mon propre nom dans chaque projet |
| Utilisateur | Modifier la liste des participants en une seule action | Ajuster rapidement qui est impliqué dans le projet |

> Le système m'empêche de supprimer un participant déjà lié à une ou plusieurs opérations, pour préserver la cohérence des dépenses enregistrées.

---

## Gestion des dépenses

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Ajouter une dépense avec montant, catégorie et payeur | Suivre les dépenses du projet |
| Utilisateur | Voir la répartition calculée automatiquement à parts égales | Ne pas avoir à calculer manuellement chaque part |
| Utilisateur | Ajuster manuellement le montant d'un participant, y compris à zéro | Refléter une répartition non équitable ou exempter quelqu'un |
| Utilisateur | Modifier ou supprimer une dépense | Corriger une erreur de saisie |

---

## Remboursements et alertes

| En tant que | Je veux | Afin de |
|---|---|---|
| Utilisateur | Voir le détail des remboursements suggérés | Savoir qui doit rembourser qui, avec un minimum de transactions |
| Utilisateur | Être alerté automatiquement en cas de dépassement de seuil | Garder le contrôle sur mon budget |
| Utilisateur | Marquer une alerte comme lue | Garder une vue claire des alertes actives |
| Utilisateur | Voir une alerte se résoudre automatiquement si je corrige la dépense concernée | Ne pas avoir à gérer manuellement le cycle de vie de mes alertes |