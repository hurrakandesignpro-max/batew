# ⛵ Escale à deux

Un petit site mignon sur le thème de la mer : un questionnaire en « escales » (panels) pour demander à ta compagne ce qu'elle préfère pour une soirée ou une journée à deux.

- **Côté elle** : une carte avec les escales, des questions une par une (choix unique, choix multiples, « ceci ou cela », réponse libre), des vagues animées, un petit voilier qui avance.
- **Côté toi** (`/admin`, protégé par mot de passe) : créer, modifier, réordonner et supprimer escales et questions, mettre une escale en brouillon, changer **tous** les textes du site, choisir l'apparence de chaque page (mer, sakura, coucher de soleil, nuit étoilée…) et consulter / effacer ses réponses.

Stack : Next.js 15 (App Router) · TypeScript · Upstash Redis pour le stockage · déploiement Vercel.

---

## 1. Tester en local

```bash
npm install
cp .env.example .env.local     # puis change ADMIN_PASSWORD
npm run dev
```

- Site : http://localhost:3000
- Admin : http://localhost:3000/admin

En local, sans Redis, tout est enregistré dans le dossier `.data/` (ignoré par git).

## 2. Mettre en ligne sur Vercel

1. **Pousse le projet sur GitHub** (nouveau dépôt, de préférence privé).
2. Sur [vercel.com](https://vercel.com) : *Add New… → Project*, importe le dépôt. Vercel détecte Next.js tout seul, ne change rien.
3. Avant de lancer le déploiement (ou juste après, puis *Redeploy*), ajoute la variable d'environnement :
   - `ADMIN_PASSWORD` = le mot de passe de ton espace admin.
   - (optionnel) `ADMIN_SECRET` = une longue phrase aléatoire pour signer le cookie de connexion.
4. **Connecte une base de données** : dans ton projet Vercel, onglet **Storage** → *Create Database* (ou *Marketplace*) → choisis **Upstash Redis** (offre gratuite suffisante) → connecte-la au projet. Vercel ajoute automatiquement les variables `KV_REST_API_URL` et `KV_REST_API_TOKEN`.
5. **Redéploie** (*Deployments → ⋯ → Redeploy*) pour que les variables soient prises en compte.

Sans l'étape 4, le site fonctionne mais tes modifications et ses réponses sont perdues dès que le serveur redémarre : l'admin affiche un bandeau d'avertissement dans ce cas.

Une fois en ligne, tu peux aussi brancher un nom de domaine dans *Settings → Domains* si tu veux une jolie adresse à lui envoyer.

## 3. Utiliser l'admin

### Se connecter

1. Va sur `/admin` (ou clique sur le petit symbole en bas de la page d'accueil, ⚓ par défaut).
2. Entre le mot de passe : c'est la valeur de la variable `ADMIN_PASSWORD`.
   - En local : dans `.env.local`.
   - Sur Vercel : *Settings → Environment Variables*, puis **Redeploy** pour que le changement soit pris en compte.
3. La connexion dure 30 jours sur l'appareil. Si l'admin affiche « désactivée », c'est que `ADMIN_PASSWORD` n'est pas défini.

L'admin a quatre onglets, et **rien n'est publié avant d'avoir cliqué sur Enregistrer** (barre en bas).

### Onglet « Escales »

Une escale = un panel de questions. Tu peux la passer en *brouillon* (décoche « Visible sur le site ») pour la préparer tranquillement : elle ne la voit pas, et tu peux l'ouvrir en aperçu. Chaque escale a :

- son titre, son emoji, sa petite description ;
- des **textes à elle** (facultatifs) : un petit mot avant la première question, un titre et un message de fin ;
- sa **propre apparence** (voir plus bas) ;
- ses questions : *choix unique*, *choix multiples*, *ceci ou cela* (2 gros boutons face à face), *réponse libre*, mélangés comme tu veux.

Emojis : colle-les ou tape dans le champ pour voir des suggestions (Windows : touche `Win` + `.` · Mac : `Ctrl` + `Cmd` + `Espace`).

### Onglet « Textes » : tout est modifiable

- **En-tête de l'accueil** : titre du site, salutation, message d'accueil, message de fin.
- **Accueil** : titre au-dessus des escales, message quand il n'y a rien, pastilles « 3 questions » / « ✓ Terminée », symbole du bas de page.
- **Questionnaire** : lien de retour, compteur (`Question {current} sur {total}`), mot « ou » des duels, boutons Retour / Suivant / Terminer, messages d'erreur…
- **Fin d'une escale** : titre, message, bouton.
- **Page introuvable (404)** et **description du lien** (l'aperçu qui s'affiche quand tu envoies l'adresse dans WhatsApp, Messenger…).

Pour un texte obligatoire, laisser le champ vide remet le texte par défaut ; le bouton « ↺ remettre par défaut » apparaît dès que tu as changé un texte. Certains textes (titre au-dessus des escales, aide des choix multiples, message de fin) peuvent être laissés vides pour être masqués.

### Onglet « Apparence » (accueil) et apparence de chaque escale

Pour l'accueil comme pour chaque escale, tu règles indépendamment :

- **Thème** : 🌊 *Mer* (par défaut), 🌸 *Sakura* (fond rose, collines vertes), 🌅 *Coucher de soleil*, 🌙 *Nuit étoilée*. Le thème change le fond, les couleurs, les cartes et le sol.
- **Ce qui flotte à l'écran** : bulles, **pétales de sakura**, étoiles, lucioles, rien, ou « automatique » (celui du thème). On peut tout mélanger : des pétales sur un thème nuit, des étoiles sur un thème mer…
- **Quantité** : léger, normal, beaucoup.
- **Arbres de sakura** : aucun, un à gauche, un à droite, ou un de chaque côté. Ils se balancent doucement.
- **Mascotte** : l'emoji du haut de l'accueil, de la barre de progression et de la fin d'escale (vide = celui du thème). C'est aussi l'icône de l'onglet du navigateur.
- **Couleur des boutons** : un sélecteur de couleur pour les boutons et les choix sélectionnés (vide = couleur du thème).

Exemple « escale sakura » : thème *Sakura*, pétales en quantité *Beaucoup*, arbres *de chaque côté*, mascotte 🌸, et un petit mot avant la première question.

Les personnes qui ont activé « réduire les animations » sur leur téléphone voient un décor figé.

### Onglet « Réponses »

Ce qu'elle a répondu, escale par escale. Tu peux effacer ses réponses (toutes, ou d'une seule escale) pour qu'elle recommence.

Si tu modifies une question à laquelle elle a déjà répondu, ses anciennes réponses restent stockées ; si tu supprimes un choix, il apparaît comme « (choix supprimé) » dans l'onglet Réponses. Le plus propre est d'effacer les réponses de l'escale après un gros changement.

## 4. Confidentialité

- Le site est en `noindex` (Google ne l'indexe pas), mais **toute personne qui a le lien peut répondre**. Ne partage l'adresse qu'avec elle.
- L'admin est protégée par mot de passe (cookie signé, httpOnly). Choisis un mot de passe solide.

## 5. Structure

```
app/
  page.tsx                  carte des escales (accueil)
  escale/[id]/page.tsx      une escale (questionnaire)
  admin/page.tsx            connexion + espace admin
  api/answers               enregistrer ses réponses (public)
  api/admin/*               login, logout, données, réponses (protégé)
components/
  Quiz.tsx                  questionnaire côté elle
  Scene.tsx, Decor.tsx      thème d'une page + décor (vagues, collines, arbres, particules)
  AdminPanel.tsx            éditeur côté admin
  TextsEditor.tsx           onglet Textes
  StyleEditor.tsx           réglages d'apparence (accueil et escales)
  AdminLogin.tsx
lib/
  store.ts                  stockage (Redis / fichier local / mémoire)
  sanitize.ts               validation de ce que l'admin enregistre
  seed.ts                   contenu de départ (4 escales d'exemple)
  texts.ts                  la liste de tous les textes modifiables et leurs valeurs par défaut
  style.ts                  thèmes, particules, mascottes, couleur d'accent
  defaults.ts               complète les anciennes données (rien à migrer à la main)
  auth.ts, types.ts, progress.ts
app/globals.css             tout le thème (couleurs en haut du fichier)
```

## 6. Personnaliser le look dans le code

- Les couleurs du thème « Mer » sont des variables CSS en haut de `app/globals.css` (`--ocean`, `--coral`, `--sand`…). Chaque autre thème redéfinit ces variables dans un bloc `.scene[data-theme="sakura"]`, `.scene[data-theme="sunset"]`, `.scene[data-theme="night"]`.
- **Ajouter un thème** : ajoute son identifiant dans `ThemeId` (`lib/types.ts`), sa fiche dans `THEME_META` et `THEMES` (`lib/style.ts`), puis son bloc de variables dans `globals.css`.
- Les arbres de sakura sont dessinés dans `components/Decor.tsx` (`BRANCHES` pour la forme, `BLOSSOMS` pour les couleurs des fleurs).
- Les polices (Fredoka + Nunito) sont chargées dans `app/layout.tsx`.
- Le contenu de départ est dans `lib/seed.ts` (utilisé tant que tu n'as rien enregistré depuis l'admin). Si tu avais déjà enregistré du contenu, il est conservé : les nouveaux textes et réglages d'apparence prennent automatiquement leur valeur par défaut.

Bon vent ! 🌊
