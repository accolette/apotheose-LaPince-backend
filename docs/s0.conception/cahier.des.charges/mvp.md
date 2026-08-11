# MVP — Minimum Viable Product

## Définition

Le MVP est la version la plus simple de **LaPince** permettant de valider notre idée auprès des premiers utilisateurs avec un minimum d'efforts. L'objectif n'est pas de livrer un produit fini, mais de **tester nos hypothèses**, recueillir du feedback réel et orienter les développements futurs.

LaPince simplifie le partage des coûts au sein d'un groupe en y intégrant une gestion budgétaire par projet, pour aller au-delà du simple suivi de dépenses.

> 📄 Ce document reflète le périmètre réellement livré. Pour la définition initiale (Sprint 0),
> voir [`mvp-old.md`](./mvp-old.md).

---

## Hypothèses

| Hypothèse                                                                          | Comment on la valide                                                  |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| Les utilisateurs ont besoin d'un outil simple pour suivre les dépenses d'un groupe | Utilisation effective de la création de projet et d'opérations        |
| La répartition automatique à parts égales est suffisante dans un premier temps     | Taux d'utilisation de la répartition automatique vs ajustement manuel |
| Le budget optionnel par projet apporte de la valeur                                | Pourcentage d'utilisateurs qui activent cette fonctionnalité          |

---

## Périmètre fonctionnel

Seules les fonctionnalités **indispensables** au parcours utilisateur
principal sont incluses.

### ✅ Inclus

- **Authentification** — inscription, connexion, déconnexion
- **Gestion des projets** — création, modification, archivage
- **Gestion des dépenses** — ajout, modification, suppression, consultation (CRUD)
- **Catégorisation** — association d'une dépense à une catégorie (catégories prédéfinies)
- **Budget & alertes** — budget optionnel **par projet** (un seul budget par projet), seuil d'alerte réglable, alerte générée automatiquement par le back
- **Répartition** — calcul automatique par défaut, à parts égales entre les participants sélectionnés sur une dépense (avec gestion précise des centimes et du reste d'arrondi), avec possibilité de fixer manuellement le montant d'un ou plusieurs participants — le reste continue d'être réparti automatiquement entre les autres. Vue balance (qui doit quoi à qui) + calcul des remboursements via algorithme glouton.

### ❌ Écarts avec la conception initiale

- Le budget n'est **pas** découpé par catégorie, contrairement à ce qui était envisagé — il est géré au niveau du projet dans son ensemble.

> La répartition automatique, elle, est conforme à l'intention initiale — avec une précision à apporter : c'est une répartition à **parts égales**, pas une répartition **proportionnelle pondérée** (ex : 64%/36% selon les revenus des participants). Cette pondération individualisée reste une évolution potentielle (V3).

---

## Definition of Done

Le MVP est livrable lorsque le parcours suivant fonctionne de bout en bout :

1. Un utilisateur s'inscrit et se connecte
2. Il crée un projet et y ajoute des participants
3. Il enregistre des dépenses avec catégorie, payeur et répartition (automatique ou ajustée manuellement)
4. Il consulte la balance et sait exactement qui doit quoi à qui
5. Une alerte s'affiche si le seuil d'alerte défini est atteint sur le budget du projet