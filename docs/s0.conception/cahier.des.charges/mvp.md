# MVP — Minimum Viable Product

## Définition

Le MVP est la version la plus simple de **LaPince** permettant de valider notre idée auprès des premiers utilisateurs avec un minimum d'efforts. L'objectif n'est pas de livrer un produit fini, mais de **tester nos hypothèses**, recueillir du feedback réel et orienter les développements futurs.

LaPince simplifie le partage des coûts au sein d'un groupe en y intégrant une gestion budgétaire par projet, pour aller au-delà du simple suivi de dépenses.

> 📄 Ce document reflète le périmètre réellement livré à la soutenance du 15/06/2026.
> Pour la définition initiale (Sprint 0), voir [`mvp-old.md`](./mvp-old.md).

---

## Hypothèses

| Hypothèse | Comment on la valide |
|---|---|
| Les utilisateurs ont besoin d'un outil simple pour suivre les dépenses d'un groupe | Utilisation effective de la création de projet et d'opérations |
| La répartition automatique à parts égales est suffisante dans un premier temps | Taux d'utilisation de la répartition automatique vs ajustement manuel |
| Le budget optionnel par projet apporte de la valeur | Pourcentage d'utilisateurs qui activent cette fonctionnalité |
| Catégoriser un projet par type (voyage, coloc...) aide à s'y retrouver | Utilisation du filtre/affichage par type dans le dashboard |

---

## Périmètre fonctionnel

Seules les fonctionnalités **indispensables** au parcours utilisateur
principal sont incluses.

### ✅ Inclus

- **Authentification** — inscription (avec connexion automatique et création d'un projet de démonstration), connexion, déconnexion
- **Gestion des projets** — création, modification, archivage, avec un **type de projet** parmi 6 valeurs prédéfinies (`Voyage`, `Maison_Coloc`, `Anniversaire`, `Repas_Sortie`, `Pro_Travail`, `Autre`), visible dans l'UI dès la création
- **Gestion des dépenses** — ajout, modification, suppression, consultation (CRUD)
- **Catégorisation** — association d'une dépense à une catégorie (catégories prédéfinies)
- **Budget & alertes** — budget optionnel **par projet** (un seul budget par projet), seuil d'alerte réglable (`limitCriteria`, convention : `100` = alerte désactivée), alerte générée automatiquement par le back
- **Statut des alertes** — trois états possibles : `unread` (non lue), `read` (lue), `resolved` (résolue automatiquement par le back si le total des dépenses repasse sous le seuil après modification/suppression d'une opération)
- **Répartition** — calcul automatique par défaut, à parts égales entre les participants sélectionnés sur une dépense (avec gestion précise des centimes et du reste d'arrondi), avec possibilité de fixer manuellement le montant d'un ou plusieurs participants — le reste continue d'être réparti automatiquement entre les autres. Vue balance (qui doit quoi à qui) + calcul des remboursements via algorithme glouton.

### ❌ Hors MVP (exclusions volontaires)

- Réinitialisation de mot de passe
- Gestion du profil utilisateur (modification, suppression de compte)
- Budgets multiples ou budgets par catégorie
- Répartition en pourcentage pondéré (uniquement parts égales ou montants fixes)
- Export des données (PDF/CSV)
- Notifications en temps réel / comptes partagés multi-utilisateurs
- Déconnexion automatique par inactivité (le token JWT expire simplement au bout de 7 jours)

---

## Definition of Done

Le MVP est livrable lorsque le parcours suivant fonctionne de bout en bout :

1. Un utilisateur s'inscrit, est automatiquement connecté et dispose d'un projet de démonstration prêt à explorer
2. Il crée un projet avec un type, et y ajoute des participants
3. Il enregistre des dépenses avec catégorie, payeur et répartition (automatique ou ajustée manuellement)
4. Il consulte la balance et sait exactement qui doit quoi à qui
5. Une alerte se déclenche si le seuil défini est atteint sur le budget du projet, et se résout automatiquement si la situation revient sous le seuil