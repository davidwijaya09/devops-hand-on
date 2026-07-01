# DevOps & CI/CD Fundamentals — Hands-on Practice Guide

> Panduan step-by-step untuk semua hands-on exercise.
> Setiap lab berisi instruksi lengkap, kode yang harus ditulis, dan expected output.

---

## Prasyarat Umum

Sebelum mulai, pastikan semua sudah terpasang:

```bash
# Cek instalasi
git --version          # >= 2.30
node --version         # >= 18
npm --version          # >= 9
docker --version       # >= 24
docker compose version # >= 2.20
code --version         # VS Code (opsional)
```

- Akun GitHub aktif (https://github.com)
- Akses terminal / command prompt
- Editor kode (VS Code direkomendasikan)

---

## Lab 0 · Setup Project

Buat project Node.js sederhana yang akan digunakan di semua lab.

### Step 1 — Buat repository di GitHub

1. Buka https://github.com/new
2. Nama repo: `devops-lab`
3. Pilih **Public**, centang **Add a README**
4. Klik **Create repository**

### Step 2 — Clone dan inisialisasi project

```bash
git clone https://github.com/<username>/devops-lab.git
cd devops-lab
npm init -y
```

### Step 3 — Buat aplikasi sederhana

Buat file `server.js`:

```javascript
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '1.0.0' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello DevOps!');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

Buat file `sum.js`:

```javascript
function sum(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

module.exports = { sum, multiply };
```

### Step 4 — Update package.json

```json
{
  "name": "devops-lab",
  "version": "1.0.0",
  "scripts": {
    "start": "node server.js",
    "test": "jest --verbose",
    "test:coverage": "jest --coverage",
    "build": "echo 'Build complete'",
    "lint": "echo 'Lint passed'"
  },
  "devDependencies": {
    "jest": "^29.0.0"
  }
}
```

### Step 5 — Install dependencies dan commit

```bash
npm install
echo "node_modules/" > .gitignore
git add .
git commit -m "chore: initial project setup"
git push origin main
```

**✅ Expected:** Repo di GitHub sudah berisi `server.js`, `sum.js`, `package.json`, `.gitignore`.

---

## Lab 1 · Git Workflow Exercise

> **Tujuan:** Memahami alur kerja Git — branch, commit, push, PR, review, merge.
> **Durasi:** 15 menit

### Step 1 — Buat branch baru

```bash
git checkout -b feature/add-greeting
```

### Step 2 — Tambah fitur baru

Buat file `greeting.js`:

```javascript
function greet(name) {
  return `Hello, ${name}! Welcome to DevOps.`;
}

module.exports = { greet };
```

### Step 3 — Commit perubahan

```bash
git add greeting.js
git commit -m "feat: add greeting function"
```

### Step 4 — Push ke remote

```bash
git push origin feature/add-greeting
```

### Step 5 — Buat Pull Request

1. Buka GitHub → repository Anda
2. Klik banner **"Compare & pull request"**
3. Judul: `feat: add greeting function`
4. Deskripsi: `Menambahkan fungsi greeting sederhana`
5. Klik **Create pull request**

### Step 6 — Review dan Merge

1. Buka tab **Files changed** → review kode
2. Klik **Review changes** → pilih **Approve**
3. Klik **Merge pull request** → **Confirm merge**
4. Kembali ke terminal:

```bash
git checkout main
git pull origin main
```

**✅ Expected:** Branch sudah di-merge, `greeting.js` ada di `main`.

---

## Lab 2 · Membangun CI Pipeline Pertama (GitHub Actions)

> **Tujuan:** Membuat CI pipeline yang otomatis build + test di setiap push.
> **Durasi:** 60 menit (Lab 1 di slide)

### Step 1 — Buat folder workflow

```bash
mkdir -p .github/workflows
```

### Step 2 — Buat file CI pipeline

Buat file `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline
on: [push, pull_request]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test
```

### Step 3 — Buat test file

Buat file `sum.test.js`:

```javascript
const { sum, multiply } = require('./sum');

describe('sum', () => {
  test('1 + 2 should equal 3', () => {
    expect(sum(1, 2)).toBe(3);
  });

  test('handles negative numbers', () => {
    expect(sum(-1, 1)).toBe(0);
  });

  test('handles zero', () => {
    expect(sum(0, 0)).toBe(0);
  });
});

describe('multiply', () => {
  test('2 * 3 should equal 6', () => {
    expect(multiply(2, 3)).toBe(6);
  });

  test('handles zero', () => {
    expect(multiply(5, 0)).toBe(0);
  });
});
```

### Step 4 — Push dan amati pipeline

```bash
git add .
git commit -m "ci: add GitHub Actions CI pipeline"
git push origin main
```

### Step 5 — Amati di GitHub

1. Buka tab **Actions** di repository
2. Lihat workflow **CI Pipeline** berjalan
3. Klik untuk melihat log tiap step
4. Pastikan status **✅ hijau**

### Step 6 — Buat test gagal (simulasi)

Edit `sum.test.js`, tambahkan test yang salah:

```javascript
  test('this will fail', () => {
    expect(sum(1, 1)).toBe(999); // sengaja salah!
  });
```

```bash
git add .
git commit -m "test: add failing test (intentional)"
git push origin main
```

Buka tab **Actions** → lihat pipeline **❌ merah**!

### Step 7 — Fix dan push ulang

Hapus test yang salah, lalu:

```bash
git add .
git commit -m "fix: remove failing test"
git push origin main
```

**✅ Expected:** Pipeline kembali hijau. Anda sudah mengalami siklus merah → fix → hijau.

---

## Lab 3 · Automated Testing + Coverage

> **Tujuan:** Menambahkan coverage report ke pipeline CI.
> **Durasi:** 15 menit

### Step 1 — Tambah test untuk greeting

Buat file `greeting.test.js`:

```javascript
const { greet } = require('./greeting');

describe('greet', () => {
  test('greets by name', () => {
    expect(greet('Budi')).toBe('Hello, Budi! Welcome to DevOps.');
  });

  test('greets another name', () => {
    expect(greet('Siti')).toContain('Siti');
  });
});
```

### Step 2 — Update CI pipeline untuk coverage

Edit `.github/workflows/ci.yml`:

```yaml
name: CI Pipeline
on: [push, pull_request]

jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - run: npm test -- --coverage
      - name: Upload coverage report
        uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/
```

### Step 3 — Push dan verifikasi

```bash
git add .
git commit -m "ci: add test coverage reporting"
git push origin main
```

### Step 4 — Lihat hasil coverage

1. Buka **Actions** → klik run terbaru
2. Di bagian **Artifacts**, download **coverage-report**
3. Buka `coverage/lcov-report/index.html` di browser

**✅ Expected:** Coverage report menunjukkan persentase kode yang ter-cover test.

---

## Lab 4 · Secrets & Environment Variables

> **Tujuan:** Mengelola secrets di CI/CD pipeline tanpa hardcode.
> **Durasi:** 10 menit

### Step 1 — Tambah secrets di GitHub

1. Buka repo → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Tambahkan:
   - Name: `DB_PASSWORD`, Value: `supersecret123`
   - Name: `API_KEY`, Value: `sk-test-abc123xyz`

### Step 2 — Buat workflow yang menggunakan secrets

Buat file `.github/workflows/deploy.yml`:

```yaml
name: Deploy Pipeline
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    env:
      DB_PASSWORD: ${{ secrets.DB_PASSWORD }}
      API_KEY: ${{ secrets.API_KEY }}
    steps:
      - uses: actions/checkout@v4

      - name: Show masked secrets
        run: |
          echo "DB_PASSWORD is set: ${{ secrets.DB_PASSWORD != '' }}"
          echo "API_KEY is set: ${{ secrets.API_KEY != '' }}"
          echo "Attempting to print secret: $DB_PASSWORD"
          # GitHub akan otomatis mask secret di log → tampil ***

      - name: Simulate deployment
        run: |
          echo "Deploying with database connection..."
          echo "Deploy complete!"
```

### Step 3 — Buat .env.example

Buat file `.env.example` (dokumentasi, BUKAN secret asli):

```bash
# Environment variables yang dibutuhkan
# Jangan isi nilai asli di sini! Gunakan GitHub Secrets.
DB_PASSWORD=your_database_password_here
API_KEY=your_api_key_here
PORT=3000
```

### Step 4 — Update .gitignore

```bash
echo ".env" >> .gitignore
```

### Step 5 — Push dan verifikasi

```bash
git add .
git commit -m "ci: add deploy pipeline with secrets"
git push origin main
```

### Step 6 — Cek log di Actions

1. Buka **Actions** → **Deploy Pipeline**
2. Lihat log → secret ditampilkan sebagai `***`

**✅ Expected:** Secret tidak pernah muncul di log. GitHub otomatis mem-mask-nya.

---

## Lab 5 · Menulis Dockerfile

> **Tujuan:** Membuat Docker image untuk aplikasi Node.js.
> **Durasi:** 15 menit

### Step 1 — Buat Dockerfile

Buat file `Dockerfile` di root project:

```dockerfile
# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files dulu (untuk cache layer)
COPY package*.json ./

# Install dependencies (production only)
RUN npm ci --production

# Copy seluruh kode
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Command default saat container jalan
CMD ["node", "server.js"]
```

### Step 2 — Buat .dockerignore

```
node_modules
npm-debug.log
.github
coverage
*.test.js
.git
.gitignore
```

### Step 3 — Build image

```bash
docker build -t devops-lab:v1.0 .
```

Expected output:
```
 => [1/5] FROM node:20-alpine
 => [2/5] WORKDIR /app
 => [3/5] COPY package*.json ./
 => [4/5] RUN npm ci --production
 => [5/5] COPY . .
 => => naming to docker.io/library/devops-lab:v1.0
```

### Step 4 — Jalankan container

```bash
docker run -d --name myapp -p 3000:3000 devops-lab:v1.0
```

### Step 5 — Test

```bash
# Cek response
curl http://localhost:3000
# Output: Hello DevOps!

curl http://localhost:3000/health
# Output: {"status":"ok","version":"1.0.0"}

# Lihat logs
docker logs myapp

# Lihat running containers
docker ps
```

### Step 6 — Cleanup

```bash
docker stop myapp
docker rm myapp
```

**✅ Expected:** App berjalan di container, response "Hello DevOps!" di port 3000.

---

## Lab 6 · Docker Compose — Multi-Container App

> **Tujuan:** Menjalankan app + database + cache dalam satu command.
> **Durasi:** 15 menit

### Step 1 — Update server.js untuk support DB dan Redis

Buat file `server-compose.js`:

```javascript
const http = require('http');
const PORT = process.env.PORT || 3000;
const DB_HOST = process.env.DB_HOST || 'localhost';
const REDIS_HOST = process.env.REDIS_HOST || 'localhost';

const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'ok',
      version: '1.0.0',
      services: {
        database: `postgresql://${DB_HOST}:5432`,
        cache: `redis://${REDIS_HOST}:6379`
      }
    }));
    return;
  }

  if (req.url === '/info') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      app: 'devops-lab',
      environment: process.env.NODE_ENV || 'development',
      db_host: DB_HOST,
      redis_host: REDIS_HOST
    }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello DevOps! (Docker Compose Edition)');
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`DB: ${DB_HOST}, Redis: ${REDIS_HOST}`);
});
```

### Step 2 — Buat docker-compose.yml

```yaml
services:
  app:
    build: .
    command: ["node", "server-compose.js"]
    ports:
      - "3000:3000"
    environment:
      - DB_HOST=db
      - REDIS_HOST=cache
      - NODE_ENV=development
    depends_on:
      - db
      - cache
    restart: unless-stopped

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secret123
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

  cache:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  pgdata:
```

### Step 3 — Jalankan semua service

```bash
docker compose up -d
```

Expected output:
```
 ✔ Container devops-lab-db-1     Started
 ✔ Container devops-lab-cache-1  Started
 ✔ Container devops-lab-app-1    Started
```

### Step 4 — Verifikasi

```bash
# Cek semua container jalan
docker compose ps

# Test app
curl http://localhost:3000
# Output: Hello DevOps! (Docker Compose Edition)

curl http://localhost:3000/health
# Output: {"status":"ok","version":"1.0.0","services":{"database":"postgresql://db:5432","cache":"redis://cache:6379"}}

# Lihat log app
docker compose logs -f app
```

### Step 5 — Lihat network otomatis

```bash
# Container bisa saling terhubung via nama service
docker compose exec app ping db -c 2
docker compose exec app ping cache -c 2
```

### Step 6 — Cleanup

```bash
docker compose down       # stop & hapus container
docker compose down -v    # juga hapus volume (data DB)
```

**✅ Expected:** 3 container jalan bersamaan, app terhubung ke DB dan Redis via nama service.

---

## Lab 7 · Nginx Reverse Proxy & Load Balancer

> **Tujuan:** Konfigurasi Nginx sebagai reverse proxy dan simple load balancer.
> **Durasi:** 10 menit

### Step 1 — Buat konfigurasi Nginx

Buat file `nginx.conf`:

```nginx
upstream app_servers {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}

server {
    listen 80;
    server_name localhost;

    location / {
        proxy_pass http://app_servers;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /health {
        return 200 "OK\n";
        add_header Content-Type text/plain;
    }
}
```

### Step 2 — Buat docker-compose.lb.yml

```yaml
services:
  app1:
    build: .
    environment:
      - INSTANCE=app1

  app2:
    build: .
    environment:
      - INSTANCE=app2

  app3:
    build: .
    environment:
      - INSTANCE=app3

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - app1
      - app2
      - app3
```

### Step 3 — Update server.js untuk menampilkan instance

Buat file `server-lb.js`:

```javascript
const http = require('http');
const INSTANCE = process.env.INSTANCE || 'unknown';
const PORT = 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    message: 'Hello from DevOps!',
    instance: INSTANCE,
    timestamp: new Date().toISOString()
  }));
});

server.listen(PORT, () => {
  console.log(`[${INSTANCE}] running on port ${PORT}`);
});
```

Update `docker-compose.lb.yml` — tambah `command` di setiap app:

```yaml
  app1:
    build: .
    command: ["node", "server-lb.js"]
    environment:
      - INSTANCE=app1
```

(Sama untuk app2 dan app3)

### Step 4 — Jalankan dan test load balancing

```bash
docker compose -f docker-compose.lb.yml up -d

# Hit endpoint beberapa kali — perhatikan instance berubah (round-robin)
for i in {1..6}; do curl -s http://localhost | jq .instance; done
```

Expected output (bergantian):
```
"app1"
"app2"
"app3"
"app1"
"app2"
"app3"
```

### Step 5 — Cleanup

```bash
docker compose -f docker-compose.lb.yml down
```

**✅ Expected:** Traffic terdistribusi merata ke 3 instance via Nginx round-robin.

---

## Lab 8 · Multi-Stage Pipeline (Build → Test → Deploy)

> **Tujuan:** Membuat pipeline production-grade dengan staging + approval gate.
> **Durasi:** 20 menit

### Step 1 — Setup GitHub Environments

1. Buka repo → **Settings** → **Environments**
2. Buat environment **staging** (tanpa protection)
3. Buat environment **production**:
   - Centang **Required reviewers**
   - Tambahkan username Anda sebagai reviewer

### Step 2 — Buat multi-stage pipeline

Buat file `.github/workflows/production.yml`:

```yaml
name: Production Pipeline
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-artifact@v4
        with:
          name: build-artifact
          path: |
            server.js
            sum.js
            greeting.js
            package*.json

  test:
    needs: build
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test -- --coverage
      - uses: actions/upload-artifact@v4
        with:
          name: coverage-report
          path: coverage/

  deploy-staging:
    needs: test
    runs-on: ubuntu-latest
    environment: staging
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build-artifact

      - name: Deploy to staging
        run: |
          echo "==============================="
          echo "  DEPLOYING TO STAGING"
          echo "==============================="
          echo "Version: $(node -e \"console.log(require('./package.json').version)\")"
          echo "Files:"
          ls -la
          echo "Deploy to staging: SUCCESS ✓"

  deploy-production:
    needs: deploy-staging
    runs-on: ubuntu-latest
    environment: production   # ← ini yang memicu approval gate!
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v4
        with:
          name: build-artifact

      - name: Deploy to production
        run: |
          echo "==============================="
          echo "  DEPLOYING TO PRODUCTION"
          echo "==============================="
          echo "Version: $(node -e \"console.log(require('./package.json').version)\")"
          echo "Deploy to production: SUCCESS ✓"
```

### Step 3 — Push dan amati

```bash
git add .
git commit -m "ci: add multi-stage production pipeline"
git push origin main
```

### Step 4 — Amati alur pipeline

1. Buka **Actions** → lihat **Production Pipeline**
2. Build → Test jalan otomatis
3. Deploy Staging jalan otomatis setelah test lolos
4. Deploy Production **menunggu approval** ← 🔒
5. Klik **Review deployments** → centang **production** → **Approve and deploy**

**✅ Expected:** Pipeline berhenti di production, menunggu approval manual. Setelah approve, deploy ke production jalan.

---

## Lab 9 · DevSecOps — Security Scanning di Pipeline

> **Tujuan:** Menambahkan security scanning otomatis ke CI pipeline.
> **Durasi:** 15 menit

### Step 1 — Buat security workflow

Buat file `.github/workflows/security.yml`:

```yaml
name: Security Scan
on: [push, pull_request]

jobs:
  dependency-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Audit dependencies
        run: npm audit --audit-level=high
        continue-on-error: true  # jangan gagalkan pipeline untuk demo

      - name: Check for known vulnerabilities
        run: |
          echo "=== Dependency Audit Report ==="
          npm audit --json | head -50 || true
          echo "=== End Report ==="

  secret-detection:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0  # full history untuk scan semua commit
      - name: Run Gitleaks
        uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        continue-on-error: true  # untuk demo

  code-quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - name: Check code quality
        run: |
          echo "=== Code Quality Check ==="
          echo "Checking for console.log in production code..."
          grep -rn "console.log" --include="*.js" --exclude-dir=node_modules --exclude="*.test.js" || echo "No console.log found ✓"
          echo ""
          echo "Checking for TODO/FIXME..."
          grep -rn "TODO\|FIXME" --include="*.js" --exclude-dir=node_modules || echo "No TODO/FIXME found ✓"
```

### Step 2 — Simulasikan secret leak (JANGAN di repo production!)

Buat file `config-test.js` (sengaja berisi "secret"):

```javascript
// INTENTIONAL - ini untuk demo secret detection
// JANGAN lakukan ini di project asli!
const config = {
  // gitleaks akan mendeteksi ini:
  apiKey: 'AKIAIOSFODNN7EXAMPLE',  // contoh format AWS key
  dbPassword: 'password123',
};

module.exports = config;
```

### Step 3 — Push dan amati

```bash
git add .
git commit -m "security: add security scanning pipeline"
git push origin main
```

### Step 4 — Cek hasil scan

1. Buka **Actions** → **Security Scan**
2. Lihat 3 job: dependency-audit, secret-detection, code-quality
3. **secret-detection** seharusnya mendeteksi `config-test.js`

### Step 5 — Fix: hapus secret dan tambahkan ke .gitignore

```bash
rm config-test.js
echo "config-test.js" >> .gitignore
git add .
git commit -m "security: remove leaked secret"
git push origin main
```

**✅ Expected:** Pipeline mendeteksi secret dan kode bermasalah. Setelah fix, scan bersih.

---

## Lab 10 · Simulasi Deploy Gagal & Rollback

> **Tujuan:** Mempraktikkan rollback ketika deployment gagal.
> **Durasi:** 15 menit

### Step 1 — Pastikan v1.0 bekerja

```bash
# Tag versi stabil
git tag v1.0.0
git push origin v1.0.0

# Verifikasi app berjalan baik
curl http://localhost:3000/health
```

### Step 2 — Buat perubahan yang "rusak"

Edit `server.js` — tambahkan bug:

```javascript
const http = require('http');

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  // BUG: typo pada method yang tidak ada
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', version: '1.1.0-broken' }));
    return;
  }

  // BUG: memanggil function yang tidak ada
  const result = processRequest(req); // ← ReferenceError!
  res.end(result);
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Step 3 — Deploy versi bermasalah

```bash
git add .
git commit -m "feat: add request processing (broken)"
git tag v1.1.0
git push origin main --tags
```

### Step 4 — Test — ini akan error

```bash
docker build -t devops-lab:v1.1.0 .
docker run -d --name myapp-broken -p 3001:3000 devops-lab:v1.1.0

# Request ke / akan crash
curl http://localhost:3001/
# → Error atau no response karena processRequest tidak ada

docker stop myapp-broken && docker rm myapp-broken
```

### Step 5 — Rollback Option A: Git Revert

```bash
# Revert commit terakhir (membuat commit baru yang membatalkan)
git revert HEAD --no-edit
git push origin main
```

Cek bahwa `server.js` kembali ke versi sebelumnya.

### Step 6 — Rollback Option B: Re-deploy tag sebelumnya

```bash
# Build ulang dari tag yang stabil
docker build -t devops-lab:rollback .
# Atau langsung gunakan image v1.0.0 yang sudah ada
docker run -d --name myapp-stable -p 3000:3000 devops-lab:v1.0
curl http://localhost:3000/health
# Output: {"status":"ok","version":"1.0.0"} ← kembali normal

docker stop myapp-stable && docker rm myapp-stable
```

### Step 7 — Tag versi fix

```bash
git tag v1.0.1
git push origin v1.0.1
```

**✅ Expected:** App berhasil di-rollback ke versi stabil. History tetap bersih karena menggunakan `git revert`.

---

## Lab 11 · Deployment Strategies (Rolling, Blue-Green, Canary)

> **Tujuan:** Memahami perbedaan tiga strategi deploy secara praktek.
> **Durasi:** 15 menit

### Step 1 — Buat dua versi app

Buat file `server-v1.js`:

```javascript
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ version: 'v1.0', color: 'BLUE', timestamp: new Date().toISOString() }));
});
server.listen(3000, () => console.log('v1.0 (BLUE) on port 3000'));
```

Buat file `server-v2.js`:

```javascript
const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ version: 'v2.0', color: 'GREEN', timestamp: new Date().toISOString() }));
});
server.listen(3000, () => console.log('v2.0 (GREEN) on port 3000'));
```

### Step 2 — Blue-Green Deployment

Buat `docker-compose.bluegreen.yml`:

```yaml
services:
  blue:
    build: .
    command: ["node", "server-v1.js"]

  green:
    build: .
    command: ["node", "server-v2.js"]

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx-bluegreen.conf:/etc/nginx/conf.d/default.conf
    depends_on:
      - blue
      - green
```

Buat `nginx-bluegreen.conf`:

```nginx
# Awalnya traffic ke BLUE
upstream app {
    server blue:3000;
    # server green:3000;  ← uncomment untuk switch
}

server {
    listen 80;
    location / {
        proxy_pass http://app;
    }
}
```

```bash
docker compose -f docker-compose.bluegreen.yml up -d

# Test — semua traffic ke BLUE (v1.0)
for i in {1..3}; do curl -s http://localhost | jq .version; done
# "v1.0"
# "v1.0"
# "v1.0"
```

**Switch ke GREEN:**

Edit `nginx-bluegreen.conf`:

```nginx
upstream app {
    # server blue:3000;
    server green:3000;    # ← switch!
}
```

```bash
docker compose -f docker-compose.bluegreen.yml exec nginx nginx -s reload

# Sekarang semua traffic ke GREEN (v2.0)
for i in {1..3}; do curl -s http://localhost | jq .version; done
# "v2.0"
# "v2.0"
# "v2.0"
```

### Step 3 — Canary Deployment

Buat `nginx-canary.conf`:

```nginx
upstream app {
    server blue:3000 weight=9;   # 90% traffic
    server green:3000 weight=1;  # 10% traffic (canary)
}

server {
    listen 80;
    location / {
        proxy_pass http://app;
    }
}
```

```bash
# Update nginx config
cp nginx-canary.conf nginx-bluegreen.conf
docker compose -f docker-compose.bluegreen.yml exec nginx nginx -s reload

# Test — mayoritas v1.0, sesekali v2.0
for i in {1..20}; do curl -s http://localhost | jq -r .version; done
# Mayoritas "v1.0", sesekali "v2.0"
```

### Step 4 — Cleanup

```bash
docker compose -f docker-compose.bluegreen.yml down
```

**✅ Expected:** Anda bisa melihat perbedaan perilaku Blue-Green (switch sekaligus) vs Canary (gradual).

---

## Lab 12 · Monitoring — Prometheus + Grafana

> **Tujuan:** Setup monitoring stack dan buat dashboard sederhana.
> **Durasi:** 10 menit

### Step 1 — Update app dengan metrics endpoint

Buat file `server-metrics.js`:

```javascript
const http = require('http');

let requestCount = 0;
let errorCount = 0;
const startTime = Date.now();

const server = http.createServer((req, res) => {
  requestCount++;

  if (req.url === '/metrics') {
    const uptime = (Date.now() - startTime) / 1000;
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end([
      '# HELP http_requests_total Total HTTP requests',
      '# TYPE http_requests_total counter',
      `http_requests_total ${requestCount}`,
      '',
      '# HELP http_errors_total Total HTTP errors',
      '# TYPE http_errors_total counter',
      `http_errors_total ${errorCount}`,
      '',
      '# HELP app_uptime_seconds App uptime in seconds',
      '# TYPE app_uptime_seconds gauge',
      `app_uptime_seconds ${uptime}`,
    ].join('\n'));
    return;
  }

  if (req.url === '/error') {
    errorCount++;
    res.writeHead(500);
    res.end('Internal Server Error');
    return;
  }

  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Hello DevOps!');
});

server.listen(3000, () => console.log('Server with metrics on port 3000'));
```

### Step 2 — Buat konfigurasi Prometheus

Buat file `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: "my-app"
    static_configs:
      - targets:
          - "app:3000"
```

### Step 3 — Buat docker-compose.monitoring.yml

```yaml
services:
  app:
    build: .
    command: ["node", "server-metrics.js"]
    ports:
      - "3000:3000"

  prometheus:
    image: prom/prometheus:latest
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana:latest
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    depends_on:
      - prometheus
```

### Step 4 — Jalankan monitoring stack

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

### Step 5 — Generate some traffic

```bash
# Generate normal requests
for i in {1..50}; do curl -s http://localhost:3000 > /dev/null; done

# Generate beberapa error
for i in {1..5}; do curl -s http://localhost:3000/error > /dev/null; done

# Cek metrics endpoint
curl http://localhost:3000/metrics
```

### Step 6 — Setup Grafana dashboard

1. Buka http://localhost:3001
2. Login: `admin` / `admin`
3. Tambah data source:
   - **Connections** → **Data sources** → **Add data source**
   - Pilih **Prometheus**
   - URL: `http://prometheus:9090`
   - Klik **Save & test**
4. Buat dashboard:
   - **Dashboards** → **New** → **New dashboard** → **Add visualization**
   - Query: `http_requests_total`
   - Klik **Run queries** → lihat grafik
   - Tambah panel lagi: `http_errors_total`
   - Tambah panel lagi: `app_uptime_seconds`

### Step 7 — Cek Prometheus langsung

1. Buka http://localhost:9090
2. Query: `http_requests_total` → **Execute**
3. Lihat tab **Graph**

### Step 8 — Cleanup

```bash
docker compose -f docker-compose.monitoring.yml down
```

**✅ Expected:** Prometheus scrape metrics dari app, Grafana menampilkan dashboard visual.

---

## Lab 13 · DORA Metrics — Worksheet

> **Tujuan:** Mengukur performa tim Anda menggunakan 4 metrik DORA.
> **Durasi:** 10 menit (diskusi kelompok)

### Instruksi

Isi tabel berikut berdasarkan data tim Anda (1 bulan terakhir):

```
┌──────────────────────────┬───────────────────┬──────────────┐
│ Metrik                   │ Nilai Tim Anda    │ Level DORA   │
├──────────────────────────┼───────────────────┼──────────────┤
│ Deployment Frequency     │ ___ kali/bulan    │ ☐E ☐H ☐M ☐L │
│ Lead Time for Changes    │ ___ hari          │ ☐E ☐H ☐M ☐L │
│ Change Failure Rate      │ ___ %             │ ☐E ☐H ☐M ☐L │
│ Time to Restore Service  │ ___ jam/hari      │ ☐E ☐H ☐M ☐L │
└──────────────────────────┴───────────────────┴──────────────┘
```

### Benchmark DORA:

| Metrik | Elite | High | Medium | Low |
|--------|-------|------|--------|-----|
| Deploy Frequency | On-demand (multi/hari) | 1×/minggu – 1×/bulan | 1×/bulan – 1×/6bulan | < 1×/6bulan |
| Lead Time | < 1 hari | 1–7 hari | 1–6 bulan | > 6 bulan |
| Change Failure Rate | 0–5% | 5–10% | 10–15% | > 15% |
| Time to Restore | < 1 jam | < 1 hari | 1–7 hari | > 1 minggu |

### Pertanyaan Diskusi

1. Di level mana tim Anda untuk setiap metrik?
2. Metrik mana yang **paling lemah**?
3. Apa **satu langkah pertama** yang bisa memperbaiki metrik terlemah itu?
4. Adakah korelasi antara metrik yang lemah? (misal: deploy jarang → lead time panjang)

---

## Lab 14 · Incident Response Simulation

> **Tujuan:** Mempraktikkan alur investigasi dan response saat insiden production.
> **Durasi:** 15 menit (roleplay kelompok)

### Skenario

> **14:00 WIB** — Alert Grafana: p95 response time API melonjak dari 200ms ke 2000ms (10×).
> Error rate naik dari 0.1% ke 5%.
> Tidak ada deploy dalam 2 jam terakhir.

### Step 1 — Detect (2 menit)

Jalankan investigasi awal:

```bash
# Cek status app
curl -w "\nResponse time: %{time_total}s\n" http://localhost:3000/health

# Cek resource usage
docker stats --no-stream

# Cek log terbaru
docker compose logs --tail=50 app
```

### Step 2 — Triage (3 menit)

Diskusikan di kelompok — checklist investigasi:

```
☐ Apakah ada deploy baru dalam 1-2 jam terakhir?
☐ Apakah CPU/memory usage melonjak?
☐ Apakah ada query database yang lambat di log?
☐ Apakah ada lonjakan traffic yang tidak biasa?
☐ Apakah service dependency (DB, Redis, external API) bermasalah?
☐ Apakah ada perubahan infrastruktur (scaling, config)?
```

### Step 3 — Mitigate (3 menit)

Pilih tindakan darurat:

```bash
# Opsi A: Scale up (tambah instance)
docker compose up -d --scale app=5

# Opsi B: Rollback ke versi sebelumnya
docker compose down
git checkout v1.0.0
docker compose up -d

# Opsi C: Restart service
docker compose restart app
```

### Step 4 — Resolve (2 menit)

Setelah mitigasi berhasil, simulasikan fix:

```bash
# Verifikasi sudah normal
curl -w "\nResponse time: %{time_total}s\n" http://localhost:3000/health

# Cek error rate sudah turun
curl http://localhost:3000/metrics | grep error
```

### Step 5 — Blameless Postmortem (5 menit)

Isi template bersama kelompok:

```markdown
# Postmortem — API Latency Spike

## Timeline
- 14:00 — Alert Grafana: p95 latency > 2s
- 14:02 — Tim mulai investigasi
- 14:05 — Root cause identified: _______________
- 14:08 — Mitigasi diterapkan: _______________
- 14:10 — Service kembali normal

## Root Cause
(Apa penyebab sebenarnya?)

## Impact
- Durasi: ___ menit
- Users affected: ___ %
- Revenue impact: ___

## Action Items
1. [ ] _______________
2. [ ] _______________
3. [ ] _______________

## Lessons Learned
- Apa yang berjalan baik?
- Apa yang bisa diperbaiki?
- Bagaimana mencegah terulang?
```

**✅ Expected:** Tim sudah mempraktikkan alur Detect → Triage → Mitigate → Resolve → Postmortem.

---

## Checklist Akhir

Setelah semua lab selesai, pastikan Anda sudah memahami:

```
☐ Git workflow (branch, commit, PR, merge)
☐ GitHub Actions CI pipeline (ci.yml)
☐ Automated testing + coverage
☐ Secrets management (GitHub Secrets)
☐ Dockerfile + build + run
☐ Docker Compose (multi-container)
☐ Nginx reverse proxy + load balancing
☐ Multi-stage pipeline (build → test → staging → prod)
☐ Security scanning (DevSecOps)
☐ DORA metrics assessment
☐ Deployment strategies (Rolling, Blue-Green, Canary)
☐ Monitoring (Prometheus + Grafana)
☐ Rollback strategies
☐ Incident response + postmortem
```

---

## Resources Lanjutan

- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Docker Docs](https://docs.docker.com/)
- [DORA Report](https://dora.dev/)
- [Prometheus Docs](https://prometheus.io/docs/)
- [Grafana Docs](https://grafana.com/docs/)
- [12 Factor App](https://12factor.net/)
- [SemVer](https://semver.org/)
