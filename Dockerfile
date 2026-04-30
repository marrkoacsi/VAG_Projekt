FROM php:8.3-apache

# Függőségek és PostgreSQL driver
RUN apt-get update && apt-get install -y \
    libpq-dev \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql \
    && a2enmod rewrite \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Composer telepítése
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# 1. Composer fájlok másolása és telepítés (ez hozza létre a vendor-t)
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-interaction

# 2. Alkalmazás kód másolása
# A kép alapján (image_a35e00.png) a PHP fájljaid az src/php-ben vannak
COPY src/php/ ./
COPY ./*.php ./

EXPOSE 80
CMD ["apache2-foreground"]