# How to Connect & Run — Cash Plus Gestion des Ouvertures

Projet full-stack : API Spring Boot (backend) + SPA React/TypeScript (frontend) pour suivre
l'ouverture d'une agence Cash Plus (Prospection → Demande → Suivi).

---

## 1. Pré-requis (Prerequisites)

| Outil | Version | Vérification |
|---|---|---|
| **Java (JDK)** | 25 | `java -version` |
| **Maven** | 3.9+ | `mvn -version` |
| **Node.js** | 20+ (LTS recommandé) | `node -v` |
| **npm** | fourni avec Node | `npm -v` |
| **MySQL** | 8.x | `mysql --version` |

> ⚠️ Le `pom.xml` cible `java.version = 25`. Utilise un JDK 25, sinon le build échoue.
> Pas de `mvnw` fourni : Maven doit être installé globalement.

---

## 2. Configuration des secrets

Le projet lit ses secrets depuis des variables d'environnement (voir `backend/src/main/resources/application.yml`).

1. Copie le modèle :
   ```bash
   cp .env.example .env
   ```
2. Renseigne les valeurs dans `.env` (le `.env` est **gitignoré**, ne jamais le commit) :
   ```
   DB_URL=jdbc:mysql://localhost:3306/cash_plus_ouverture
   DB_USERNAME=root
   DB_PASSWORD=
   JWT_SECRET=<clé base64 longue et aléatoire>
   JWT_EXPIRATION_MS=86400000
   UPLOAD_BASE_DIR=./uploads
   ```
3. Exporte ces variables dans ton shell avant de lancer le backend, **ou** configure-les
   dans l'IDE (Run Configuration → Environment variables).

---

## 3. Base de données MySQL

1. Démarre MySQL, puis crée la base et insère les données de démo :
   ```bash
   mysql -u root < DB/seed.sql
   ```
   (ou ouvre le fichier `DB/seed.sql` dans ton client MySQL et exécute-le).

2. Comptes de démo (mot de passe commun : **`password123`**) :
   | Email | Rôle |
   |---|---|
   | `agent@cashplus.com` | AGENT |
   | `validateur@cashplus.com` | VALIDATEUR |
   | `manager@cashplus.com` | MANAGER |

> Le backend utilise `spring.jpa.hibernate.ddl-auto: update`, donc au démarrage il met à jour
> le schéma automatiquement même sans `seed.sql`.

---

## 4. Lancer le backend (Spring Boot)

Depuis la racine du projet :

```bash
cd backend
mvn spring-boot:run
```

Le backend démarre sur **http://localhost:8080** (API sous `/api/**`).

---

## 5. Lancer le frontend (React + Vite)

Dans un **autre terminal** :

```bash
cd frontend
npm install
npm run dev
```

Le frontend démarre sur **http://localhost:5173**.

---

## 6. Vérification

1. Ouvre http://localhost:5173
2. Connecte-toi avec `agent@cashplus.com` / `password123`
3. Tu arrives sur le tableau de bord Prospection.

### Endpoints API utiles (test avec curl)
```bash
# Login → récupère le token JWT
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"agent@cashplus.com","password":"password123"}'

# Liste des prospections (page 0, taille 10)
curl http://localhost:8080/api/prospections?page=0&size=10&sort=id,desc \
  -H "Authorization: Bearer <TOKEN>"
```

---

## 7. Build de production (optionnel)

```bash
# Frontend
cd frontend && npm run build        # génère frontend/dist

# Backend
cd backend && mvn package           # génère backend/target/*.jar
java -jar backend/target/ouverture-api-1.0.0.jar
```

---

## 8. Dépannage (Troubleshooting)

| Symptôme | Cause probable | Solution |
|---|---|---|
| `mvn` introuvable | Maven non installé | Installe Maven 3.9+ |
| Erreur de compilation Java | Mauvais JDK | Utilise JDK 25 |
| `Access denied for user 'root'@'localhost'` | Mauvais mot de passe DB | Renseigne `DB_PASSWORD` dans `.env` |
| 401 sur les appels API | Token absent/expiré | Reconnecte-toi, le token dure 24h (`JWT_EXPIRATION_MS`) |
| Photos non affichées | dossier `uploads/` vide | Normal sans uploads ; les chemins pointent vers `backend/uploads/` |
| Port 8080 / 5173 déjà utilisé | Autre process | Change `server.port` (backend) ou `--port` (vite) |
