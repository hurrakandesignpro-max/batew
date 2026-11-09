# ⛵ Escale à deux

Un petit site mignon sur le thème de la mer : un questionnaire en « escales » (panels) pour demander à ta compagne ce qu'elle préfère pour une soirée ou une journée à deux.

- **Côté elle** : une carte avec les escales, des questions une par une (choix unique, choix multiples, « ceci ou cela », réponse libre), des vagues animées, un petit voilier qui avance.
- **Côté toi** (`/admin`, protégé par mot de passe) : créer, modifier, réordonner et supprimer escales et questions, mettre une escale en brouillon, changer **tous** les textes du site, choisir un **thème par page** (mer, sakura avec cerisiers et pétales, nuit étoilée, coucher de soleil), et consulter / effacer ses réponses.

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
4. **Connecte une base de données** : dans ton projet Vercel, onglet **Storage** → *Create Database* (ou *Marketplace*) → choisis **Upstash Redis** (offre gratuite suffisante) → connecte-la au projet. Vercel ajoute automatiquement des variables `…KV_REST_API_URL` et `…KV_REST_API_TOKEN`. Peu importe le préfixe que Vercel leur donne (par exemple `STORAGEONE_`) : le site le détecte tout seul. Une base Redis classique (variable `REDIS_URL`) fonctionne aussi.
5. **Redéploie** (*Deployments → ⋯ → Redeploy*) pour que les variables soient prises en compte.

Sans l'étape 4, le site fonctionne mais tes modifications et ses réponses sont perdues dès que le serveur redémarre : l'admin affiche un bandeau d'avertissement dans ce cas.

Une fois en ligne, tu peux aussi brancher un nom de domaine dans *Settings → Domains* si tu veux une jolie adresse à lui envoyer.

## 3. Utiliser l'admin

Va sur `/admin` (ou clique sur le petit ⚓ en bas de la page d'accueil), connecte-toi, puis :

- **Escales** : une escale = un panel de questions. Tu peux la passer en *brouillon* (décoche « Visible sur le site ») pour la préparer tranquillement : elle ne la voit pas, et tu peux l'ouvrir en aperçu. Chaque question a son type :
  - *Choix unique*, *Choix multiples*, *Ceci ou cela* (2 gros boutons face à face), *Réponse libre*.
  - Tu mélanges les types comme tu veux dans la même escale.
  - Emojis : colle-les ou tape dans le champ pour voir des suggestions (Windows : touche `Win` + `.` · Mac : `Ctrl` + `Cmd` + `Espace`).
- **Réponses** : ce qu'elle a répondu, escale par escale. Tu peux effacer ses réponses (toutes, ou d'une seule escale) pour qu'elle recommence.
- **Réglages** : apparence du site (thème, intensité des décors, couleur des boutons, emoji de l'accueil), titre, salutation, message d'accueil, message de fin, puis **tous les autres textes** (boutons, compteur, messages d'erreur, écran de fin…). Un champ laissé vide retrouve son texte d'origine.
- **Apparence d'une escale** : dans l'onglet Escales, chaque escale a son propre thème, son intensité de décor, sa couleur de boutons et son emoji de progression. « Comme le site » reprend le réglage général. Exemple : une escale « Sous les cerisiers » en thème Sakura, une escale du soir en Nuit étoilée.

⚠️ Pense à cliquer sur **Enregistrer** (barre en bas) : rien n'est publié avant.

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
  AdminPanel.tsx            éditeur côté admin
  AdminLogin.tsx, Waves.tsx
lib/
  store.ts                  stockage (Redis / fichier local / mémoire)
  sanitize.ts               validation de ce que l'admin enregistre
  seed.ts                   contenu de départ (3 escales d'exemple)
  auth.ts, types.ts, progress.ts
app/globals.css             tout le thème (couleurs en haut du fichier)
```

## 6. Personnaliser le look

Les couleurs sont des variables CSS en haut de `app/globals.css` (`--ocean`, `--coral`, `--sand`…). Les polices (Fredoka + Nunito) sont chargées dans `app/layout.tsx`. Le contenu de départ est dans `lib/seed.ts` (utilisé tant que tu n'as rien enregistré depuis l'admin).

Bon vent ! 🌊
