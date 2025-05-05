# We use the following secrets:

Don't forget to check that everthing is working and configured on the
https://github.com/EPFL-ENAC/sxl-recrete-atlas/settings/secrets/actions repository_secrets tab

## For the Continuous Deployment pipeline (on our kube cluster):

Btw the path of the config is located here
cd $repo_org/$repo_name/overlays/$branch

(cf https://github.com/EPFL-ENAC/enack8s-app-config?tab=readme-ov-file#setting-secrets for how to setup)
org = "epfl-sxl" # The organisation folder for the repository manifests in enack8s-app-config
repo = "sxl-recrete-atlas" # The repository name for the manifests in enack8s-app-config ie.
CD_TOKEN = "your-cd-token-secret" # org level

## For the automatic release using google release-please github action

MY_RELEASE_PLEASE_TOKEN = "your-my-release-please-token-secret"
