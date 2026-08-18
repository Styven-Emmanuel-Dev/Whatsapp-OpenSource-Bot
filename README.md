# Styven WhatsApp Bot 

Bot WhatsApp open source basé sur Node.js et Baileys.

**Créé et codé par Styven Emmanuel.**

## Fonctionnalités

- Pairing code pour connecter le bot
- Préfixe configurable
- Menu avec image
- Commandes générales
- Gestion de groupes
- Gestion des administrateurs
- Système owner/admin
- Reconnexion automatique
- Stockage JSON simple
- Structure modulaire

## Installation

```bash
npm install
cp .env.example .env
```

Configure ensuite `.env`.

```bash
npm start
```

Le terminal demandera le numéro WhatsApp si `PHONE_NUMBER` n'est pas configuré.

## Commandes

### Général
- `!menu`
- `!help`
- `!ping`
- `!owner`

### Groupe
- `!groupinfo`
- `!admins`
- `!promote @user`
- `!demote @user`
- `!add 24206XXXXXXXX`
- `!remove @user`
- `!setname Nom`
- `!setdesc Description`
- `!grouponly`

### Utilisateur
- `!profile`
- `!userinfo @user`

## Sécurité

Le bot vérifie les droits d'administrateur avant les commandes de gestion de groupe.

Utilise uniquement le bot sur des groupes et comptes que tu es autorisé à administrer.

## Licence

MIT

## Auteur

Styven Emmanuel
