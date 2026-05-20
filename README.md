# LearnHub - Plateforme Microservices E-Learning

## 🚀 Présentation du Projet
LearnHub est une plateforme d'apprentissage en ligne moderne basée sur une architecture microservices robuste. Ce projet a été réalisé dans le cadre du module **DevOps & Cloud** pour démontrer l'intégration de compétences en conteneurisation, orchestration et intelligence artificielle.

## 🏗️ Architecture Technique

### Microservices
- **API Gateway (Nginx)** : Point d'entrée unique, gestion du reverse proxy et de la sécurité.
- **Learning Portal (React/Vite)** : Interface utilisateur fluide et responsive avec `shadcn/ui`.
- **Course Service (FastAPI)** : Cœur métier gérant les cours, les leçons (Vidéo/PDF) et les inscriptions (PostgreSQL).
- **User Service (Node.js/Express)** : Gestion de l'authentification sécurisée via JWT et profils utilisateurs (MongoDB).
- **Analytics Service (FastAPI)** : Collecte et agrégation des données d'utilisation pour le dashboard instructeur.
- **AI Tutor Service (FastAPI + Ollama)** : Assistance pédagogique intelligente basée sur des modèles de langage (LLM) locaux.
- **n8n Automation** : Workflow automatisé pour la collecte et le traitement des feedbacks.

### Infrastructures & Datastores
- **PostgreSQL** : Persistance des données relationnelles (Cours, Inscriptions).
- **MongoDB** : Stockage des documents utilisateurs et sessions.
- **Redis** : Cache haute performance pour accélérer les requêtes fréquentes.
- **MinIO** : Serveur de stockage d'objets (S3 compatible) pour les médias.
- **Ollama** : Moteur d'exécution local pour l'IA tutorielle.

## 🛠️ Installation et Lancement

### Prérequis
- Docker et Docker Compose installés.
- Minimum 8 Go de RAM recommandés (pour faire tourner l'IA).

### Lancement
```bash
docker-compose up -d --build
```
L'application sera accessible sur :
- **Frontend** : [http://localhost:8080](http://localhost:8080)
- **n8n Automation** : [http://localhost:5678](http://localhost:5678)
- **MinIO Console** : [http://localhost:9001](http://localhost:9001)

## ✨ Fonctionnalités Clés
- **Lecteur de cours hybride** : Supporte les vidéos YouTube et les documents PDF via un viewer intégré.
- **Dashboard Instructeur** : Statistiques en temps réel (étudiants uniques, revenus, progression).
- **AI Tutor** : Chatbot intelligent capable de répondre aux questions sur le contenu des cours.
- **SEO & Performance** : Optimisation des balises meta et utilisation du cache Redis.

## 👤 Auteur
Projet réalisé pour le Master DevOps & Cloud - M1.
