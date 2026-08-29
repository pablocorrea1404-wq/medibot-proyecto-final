FROM php:8.2-apache

# 1. Instalar dependencias del sistema y extensiones PHP
RUN apt-get update && apt-get install -y \
    git \
    unzip \
    libicu-dev \
    zlib1g-dev \
    libzip-dev \
    libsqlite3-dev \
    libpq-dev \
    && docker-php-ext-install pdo pdo_mysql pdo_pgsql pdo_sqlite intl zip opcache

# 1.1 Configurar PHP y OPCACHE para alto rendimiento
RUN { \
    echo 'opcache.memory_consumption=512'; \
    echo 'opcache.interned_strings_buffer=64'; \
    echo 'opcache.max_accelerated_files=30000'; \
    echo 'opcache.revalidate_freq=2'; \
    echo 'opcache.validate_timestamps=1'; \
    echo 'opcache.fast_shutdown=1'; \
    echo 'memory_limit=512M'; \
    echo 'upload_max_filesize=100M'; \
    echo 'post_max_size=100M'; \
    echo 'realpath_cache_size=4096K'; \
    echo 'realpath_cache_ttl=600'; \
    } > /usr/local/etc/php/conf.d/optimized.ini


# 2. Configurar Apache
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf

# Habilitar mod_rewrite
RUN a2enmod rewrite

# Permitir .htaccess
RUN echo '<Directory /var/www/html/public/>\n\
    AllowOverride All\n\
    Require all granted\n\
    </Directory>' > /etc/apache2/conf-available/symfony.conf \
    && a2enconf symfony

# 3. Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# 4. Preparar directorio
WORKDIR /var/www/html

# 5. Copiar Composer json/lock y# Copiar archivos de composer
COPY composer.json ./

# Copiar el resto del código
COPY . .

# Instalar dependencias de PHP (con dev para modo dev)
ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --optimize-autoloader

# Permisos para directorios y entrypoint
RUN mkdir -p var/cache var/log \
    && chown -R www-data:www-data var \
    && chmod +x docker-entrypoint.sh

ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]
