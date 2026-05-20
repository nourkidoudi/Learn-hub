# Guide de Déploiement K3s Multi-nœuds (3 VMs) & Longhorn

Ce guide décrit pas-à-pas comment installer votre cluster K3s sur 3 machines virtuelles (VMs) Linux (ex: Ubuntu Server 22.04 LTS) et déployer Longhorn pour le stockage persistant distribué.

---

## 🛠️ Architecture du Cluster
*   **VM 1 (Server / Master)** : Nom d'hôte: `master` | IP conseillée: `192.168.56.10` (2 vCPUs, 2 Go+ RAM)
*   **VM 2 (Agent / Worker 1)** : Nom d'hôte: `worker1` | IP conseillée: `192.168.56.11` (2 vCPUs, 2 Go+ RAM)
*   **VM 3 (Agent / Worker 2)** : Nom d'hôte: `worker2` | IP conseillée: `192.168.56.12` (2 vCPUs, 2 Go+ RAM)

---

## 📋 ÉTAPE 0 : Préparation des 3 VMs (À faire sur CHAQUE VM)

Avant d'installer K3s, nous devons nous assurer que les VMs peuvent communiquer et possèdent les prérequis réseau et stockage.

1.  **Mettre à jour le système** :
    ```bash
    sudo apt update && sudo apt upgrade -y
    ```

2.  **Installer open-iscsi et nfs-common** (Prérequis indispensables exigés par **Longhorn** pour monter les disques persistants) :
    ```bash
    sudo apt install -y open-iscsi nfs-common
    sudo systemctl enable --now iscsid
    ```

3.  **Configurer les noms d'hôtes** :
    *   Sur la VM 1 : `sudo hostnamectl set-hostname master`
    *   Sur la VM 2 : `sudo hostnamectl set-hostname worker1`
    *   Sur la VM 3 : `sudo hostnamectl set-hostname worker2`

4.  **Désactiver le Swap** (Recommandé pour la stabilité de Kubernetes) :
    ```bash
    sudo swapoff -a
    # Pour le désactiver de façon permanente au redémarrage :
    sudo sed -i '/ swap / s/^\(.*\)$/#\1/g' /etc/fstab
    ```

---

## 👑 ÉTAPE 1 : Configuration du Nœud "Server" (Master) - VM 1

Nous allons installer K3s en mode Master avec une base de données `etcd` embarquée et sécurisée.

1.  **Lancer l'installation du Master** :
    ```bash
    curl -sfL https://get.k3s.io | sh -s - server --cluster-init --write-kubeconfig-mode 644
    ```
    *(L'option `--cluster-init` initialise la base de données distribuée etcd intégrée).*

2.  **Vérifier que le Master est actif** :
    ```bash
    kubectl get nodes
    ```
    *Vous devriez voir le nœud `master` avec le statut `Ready`.*

3.  **Récupérer le Token de sécurité** (Nécessaire pour connecter les Workers) :
    ```bash
    sudo cat /var/lib/rancher/k3s/server/node-token
    ```
    *Copiez ce token qui ressemble à une longue chaîne de caractères.*

---

## 👷 ÉTAPE 2 : Configuration des Nœuds "Agent" (Workers) - VM 2 & VM 3

Nous allons connecter vos deux serveurs Workers au Master pour agrandir votre cluster.

### Sur la VM 2 (`worker1`) :
Exécutez la commande suivante en remplaçant `IP_DU_MASTER` (ex: `192.168.56.10`) et `TOKEN_DU_MASTER` (celui copié à l'étape précédente) :
```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<IP_DU_MASTER>:6443 K3S_TOKEN=<TOKEN_DU_MASTER> sh -
```

### Sur la VM 3 (`worker2`) :
Exécutez exactement la même commande :
```bash
curl -sfL https://get.k3s.io | K3S_URL=https://<IP_DU_MASTER>:6443 K3S_TOKEN=<TOKEN_DU_MASTER> sh -
```

### 🔍 Vérification sur la VM 1 (Master) :
Retournez sur votre VM Master et tapez :
```bash
kubectl get nodes
```
*Magie ! Vous devriez voir vos 3 nœuds s'afficher en statut `Ready` !*
```text
NAME      STATUS   ROLES                       AGE   VERSION
master    Ready    control-plane,master,etcd   5m    v1.28.x+k3s1
worker1   Ready    <none>                      2m    v1.28.x+k3s1
worker2   Ready    <none>                      1m    v1.28.x+k3s1
```

---

## 💾 ÉTAPE 3 : Installation de Longhorn (Sur la VM 1 - Master)

Longhorn est le système de stockage distribué cloud-native qui va synchroniser vos volumes persistants PostgreSQL, MongoDB, Redis et MinIO entre vos 3 nœuds.

1.  **Déployer Longhorn à l'aide du manifeste officiel** :
    ```bash
    kubectl apply -f https://raw.githubusercontent.com/longhorn/longhorn/v1.5.3/deploy/longhorn.yaml
    ```

2.  **Surveiller l'installation** (Attendez que tous les pods soient au statut `Running`) :
    ```bash
    kubectl get pods -n longhorn-system --watch
    ```
    *Cette étape peut prendre 2 à 3 minutes le temps que Longhorn configure le stockage distribué sur vos 3 VMs.*

---

## 🚀 ÉTAPE 4 : Déploiement de LearnHub (Sur la VM 1 - Master)

Votre cluster K3s et le stockage persistant Longhorn sont maintenant prêts à 100%. Il ne reste plus qu'à déployer l'application !

1.  **Copiez votre dossier `kubernetes/`** sur votre VM Master.
2.  **Appliquez les fichiers dans l'ordre** :
    
    *   **A. Créer les volumes persistants (PVCs) dans Longhorn** :
        ```bash
        kubectl apply -f kubernetes/pvc-postgres.yaml
        kubectl apply -f kubernetes/pvc-mongodb.yaml
        kubectl apply -f kubernetes/pvc-redis.yaml
        kubectl apply -f kubernetes/pvc-minio.yaml
        kubectl apply -f kubernetes/pvc-ollama.yaml
        kubectl apply -f kubernetes/pvc-n8n.yaml
        ```
        *(Vous pouvez vérifier que les volumes sont créés dans Longhorn avec `kubectl get pvc`)*.

    *   **B. Déployer les bases de données** :
        ```bash
        kubectl apply -f kubernetes/deployment-databases.yaml
        ```

    *   **C. Déployer les microservices applicatifs et l'IA** :
        ```bash
        kubectl apply -f kubernetes/deployment-services.yaml
        ```

    *   **D. Déployer le frontend et la passerelle réseau** :
        ```bash
        kubectl apply -f kubernetes/deployment-frontend.yaml
        ```

3.  **Vérifier le statut global** :
    ```bash
    kubectl get pods
    ```
    *Une fois que tous les pods sont `Running`, l'application est en ligne !*

---

## 🎯 Accéder à LearnHub en direct :
Ouvrez votre navigateur et allez sur l'adresse IP de n'importe laquelle de vos VMs sur le port `30080` :
`http://<IP_DE_VOTRE_VM>:30080`

Félicitations, votre plateforme de microservices e-learning avec IA et stockage S3 tourne désormais sur votre cluster Kubernetes K3s hautement disponible ! 🐳🌟
