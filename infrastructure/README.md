# Docker Deploy

Setup ini menjalankan:

- `nginx`: reverse proxy publik di port 80
- `frontend`: Next.js production standalone
- `backend`: Laravel di Apache/PHP 8.3
- `queue`: Laravel queue worker
- `db`: PostgreSQL

## Deploy ke VPS

1. Install Docker dan Docker Compose plugin di VPS.
2. Upload repo ini ke VPS.
3. Masuk ke folder `infrastructure`.
4. Buat file environment:

```bash
cp .env.example .env
```

5. Isi `.env`, minimal:

```bash
APP_URL=http://IP-ATAU-DOMAIN-VPS
FRONTEND_URL=http://IP-ATAU-DOMAIN-VPS
DB_PASSWORD=password-yang-kuat
```

6. Generate `APP_KEY`:

```bash
docker run --rm -v "$PWD/../projectta:/app" -w /app php:8.3-cli php -r "echo 'base64:'.base64_encode(random_bytes(32)).PHP_EOL;"
```

Tempel hasilnya ke `APP_KEY=` di file `.env`.

7. Build dan jalankan:

```bash
docker compose up -d --build
```

8. Lihat log:

```bash
docker compose logs -f
```

Frontend akan tersedia di `http://IP-ATAU-DOMAIN-VPS`, dan API Laravel lewat path `/api`.

## Perintah Operasional

```bash
docker compose exec backend php artisan migrate --force
docker compose exec backend php artisan optimize:clear
docker compose restart backend queue frontend
docker compose down
```

Data PostgreSQL disimpan di Docker volume `postgres_data`, jadi tidak hilang ketika container direcreate.
