# url-shortener-lab03

**1. Clone the repository**

```bash
git clone https://github.com/poridhioss/url-shortener-lab03.git
```

**2. Install dependencies**

```bash
cd url-shortener-lab03
npm install
```

**3. Create a `.env` file and set the environment variables**

```bash
PORT=3000
MONGO_URI=mongodb://localhost:27017/url_shortener
PG_HOST=localhost
PG_PORT=5432
PG_USER=your_pg_user
PG_PASSWORD=your_pg_password
PG_DATABASE=url_shortener
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password
BASE_URL=http://localhost:3000/api/urls
```

**4. Initialize the Database**

```bash
docker-compose up -d
```

**5. Prepopulate PostgreSQL Database with 1000000 keys**

```bash
node src/utils/keyGenerator.js
```

**6. Run the application**

```bash
npm run dev
```

**7. Test the project**

```bash
node test/testEndpoint.js
```

> Make sure to run these commands in the root directory of the project.





