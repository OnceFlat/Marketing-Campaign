FROM node:24-alpine AS asset-builder
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci
COPY resources ./resources
COPY vite.config.js ./
RUN npm run build

FROM composer:2 AS vendor
WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
  --no-dev \
  --no-interaction \
  --prefer-dist \
  --optimize-autoloader \
  --no-scripts

FROM php:8.3-apache AS app
WORKDIR /var/www/html

RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    libicu-dev \
    libpq-dev \
    libzip-dev \
    unzip \
  && docker-php-ext-install intl opcache pdo_pgsql pdo_sqlite zip \
  && a2enmod rewrite headers \
  && sed -ri 's!/var/www/html!/var/www/html/public!g' /etc/apache2/sites-available/000-default.conf /etc/apache2/apache2.conf \
  && printf '<Directory /var/www/html/public>\n    AllowOverride All\n    Require all granted\n</Directory>\n' > /etc/apache2/conf-available/laravel.conf \
  && a2enconf laravel \
  && rm -rf /var/lib/apt/lists/*

COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=asset-builder /app/public/build ./public/build
COPY docker/entrypoint.sh /usr/local/bin/backend-entrypoint

RUN chmod +x /usr/local/bin/backend-entrypoint \
  && chown -R www-data:www-data storage bootstrap/cache \
  && chmod -R ug+rwX storage bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false

EXPOSE 80

ENTRYPOINT ["backend-entrypoint"]
CMD ["apache2-foreground"]
