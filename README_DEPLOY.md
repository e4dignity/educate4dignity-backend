Déploiement Azure (conteneur) — guide rapide

1) Préparer les ressources (local):

   - Installer `az` CLI et se connecter: `az login`
   - Exécuter le script pour créer RG / ACR / PostgreSQL / App Service:

```bash
RESOURCE_GROUP=e4d_group LOCATION=canadacentral ACR_NAME=e4dacr POSTGRES_PASSWORD=YourStrongPass ./scripts/azure-deploy.sh
```

2) Pousser l'image vers ACR (manuel ou via GitHub Actions):

```bash
az acr login --name e4dacr
docker build -t e4dacr.azurecr.io/e4dbackend:latest .
docker push e4dacr.azurecr.io/e4dbackend:latest
```

3) Configurer l'App Service pour utiliser l'image ACR:

```bash
az webapp config container set --name e4dbackend --resource-group e4d_group --docker-custom-image-name e4dacr.azurecr.io/e4dbackend:latest --docker-registry-server-url https://e4dacr.azurecr.io
```

4) Ajouter les `Application settings` (secrets) dans App Service (Portal > Configuration) ou via CLI:

 - `DATABASE_URL` = postgresql://<user>:<pass>@<host>:5432/<db>?schema=public
 - `PORT` = 4000
 - ajouter les clés pour Cloudinary, Stripe, SMTP, etc.

5) Option GitHub Actions: ajouter les secrets suivants dans le repo GitHub:

 - `AZURE_CREDENTIALS` (service principal JSON)
 - `REGISTRY` (ex: e4dacr.azurecr.io)
 - `REGISTRY_USERNAME` and `REGISTRY_PASSWORD` (ACR admin or service principal)
 - `IMAGE_NAME` (e4dbackend)
 - `WEBAPP_NAME` (e4dbackend)
 - `RESOURCE_GROUP` (e4d_group)

Après push sur `main`, le workflow `.github/workflows/azure-container-deploy.yml` construira/poussera l'image et mettra à jour l'App Service.
