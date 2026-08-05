#!/usr/bin/env bash
set -euo pipefail

# Usage: edit variables below or call with env vars set
# Example: RESOURCE_GROUP=my-rg LOCATION="canadacentral" ./scripts/azure-deploy.sh

RESOURCE_GROUP=${RESOURCE_GROUP:-e4d_group}
LOCATION=${LOCATION:-canadacentral}
ACR_NAME=${ACR_NAME:-e4dacr}
POSTGRES_NAME=${POSTGRES_NAME:-e4dpg}
POSTGRES_ADMIN=${POSTGRES_ADMIN:-e4d}
POSTGRES_PASSWORD=${POSTGRES_PASSWORD:-ChangeThisPassw0rd!}
APP_SERVICE_PLAN=${APP_SERVICE_PLAN:-ASP-wanzotest-9b9f}
WEBAPP_NAME=${WEBAPP_NAME:-e4dbackend}
SKU=${SKU:-P1v3}

echo "Creating resource group $RESOURCE_GROUP in $LOCATION"
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

echo "Creating ACR ($ACR_NAME)"
az acr create --resource-group "$RESOURCE_GROUP" --name "$ACR_NAME" --sku Standard --location "$LOCATION" --admin-enabled true

echo "Creating PostgreSQL Flexible Server ($POSTGRES_NAME)"
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$POSTGRES_NAME" \
  --location "$LOCATION" \
  --admin-user "$POSTGRES_ADMIN" \
  --admin-password "$POSTGRES_PASSWORD" \
  --sku-name Standard_B1ms \
  --public-access all

echo "Creating App Service Plan ($APP_SERVICE_PLAN)"
az appservice plan create --name "$APP_SERVICE_PLAN" --resource-group "$RESOURCE_GROUP" --sku "P1v3" --is-linux

echo "Creating Web App for Containers ($WEBAPP_NAME)"
az webapp create --resource-group "$RESOURCE_GROUP" --plan "$APP_SERVICE_PLAN" --name "$WEBAPP_NAME" --deployment-container-image-name "hello-world"

echo
echo "NEXT STEPS"
echo "1) Build and push your image to ACR:"
echo "   az acr login --name $ACR_NAME"
echo "   docker build -t ${ACR_NAME}.azurecr.io/e4dbackend:latest ."
echo "   docker push ${ACR_NAME}.azurecr.io/e4dbackend:latest"
echo "2) Configure Web App to use your image:"
echo "   az webapp config container set --name $WEBAPP_NAME --resource-group $RESOURCE_GROUP --docker-custom-image-name ${ACR_NAME}.azurecr.io/e4dbackend:latest --docker-registry-server-url https://${ACR_NAME}.azurecr.io"
echo "3) Set application settings (DATABASE_URL, PORT=4000, etc.) in the portal or via az webapp config appsettings set"
