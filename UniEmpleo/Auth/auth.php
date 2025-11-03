<?php
// Utilidades de autenticación y sesión segura

function start_secure_session(): void {
    $secure = false; // En localhost normalmente no hay HTTPS
    $httponly = true;
    $samesite = 'Lax';

    $active = (session_status() === PHP_SESSION_ACTIVE);

    // Solo configurar parámetros de cookie si la sesión aún NO está activa
    if (!$active) {
        if (PHP_VERSION_ID >= 70300) {
            session_set_cookie_params([
                'lifetime' => 0,
                'path' => '/',
                'domain' => '',
                'secure' => $secure,
                'httponly' => $httponly,
                'samesite' => $samesite,
            ]);
        } else {
            // Fallback para versiones antiguas
            session_set_cookie_params(0, '/; samesite=' . $samesite, '', $secure, $httponly);
        }
        session_start();
    }

    if (!isset($_SESSION['created'])) {
        $_SESSION['created'] = time();
    }
    if (!isset($_SESSION['last_activity'])) {
        $_SESSION['last_activity'] = time();
    }
}

function no_cache(): void {
    if (headers_sent()) return;
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
}

function session_is_timed_out(): bool {
    $max_idle = 1800; // 30 minutos de inactividad
    return isset($_SESSION['last_activity']) && (time() - (int)$_SESSION['last_activity']) > $max_idle;
}

function refresh_activity(): void {
    $_SESSION['last_activity'] = time();
}

function secure_logout(string $redirectTo): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        start_secure_session();
    }
    if (!headers_sent()) {
        no_cache();
    }
    $_SESSION = [];
    if (!headers_sent() && ini_get('session.use_cookies')) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params['httponly']);
    }
    session_destroy();
    if (!headers_sent()) {
        header('Location: ' . $redirectTo);
    } else {
        echo '<script>location.href="' . htmlspecialchars($redirectTo, ENT_QUOTES) . '";</script>';
    }
    exit;
}

function require_egresado(): void {
    start_secure_session();
    if (!headers_sent()) {
        no_cache();
    }

    if (session_is_timed_out()) {
        // Antes: secure_logout('LoginEgresados.php?expired=1')
        secure_logout('/View/LoginEgresados.php?expired=1');
    }

    if (!isset($_SESSION['correo'])) {
        if (!headers_sent()) {
            // Antes: header('Location: LoginEgresados.php?redirect=1')
            header('Location: /View/LoginEgresados.php?redirect=1');
        } else {
            echo '<script>location.href="/View/LoginEgresados.php?redirect=1";</script>';
        }
        exit;
    }

    refresh_activity();
}

function require_empresa(): void {
    start_secure_session();
    if (!headers_sent()) {
        no_cache();
    }

    if (session_is_timed_out()) {
        // Antes: secure_logout('LoginEmpresa.html?expired=1')
        secure_logout('/View/LoginEmpresa.html?expired=1');
    }

    if (!isset($_SESSION['empresa_id'])) {
        if (!headers_sent()) {
            // Antes: header('Location: LoginEmpresa.html?redirect=1')
            header('Location: /View/LoginEmpresa.html?redirect=1');
        } else {
            echo '<script>location.href="/View/LoginEmpresa.html?redirect=1";</script>';
        }
        exit;
    }

    refresh_activity();
}

function safe_login_regenerate(): void {
    if (session_status() !== PHP_SESSION_ACTIVE) {
        start_secure_session();
    }
    // Evitar fijación de sesión
    session_regenerate_id(true);
    $_SESSION['last_activity'] = time();
}