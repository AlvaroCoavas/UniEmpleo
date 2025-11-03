<?php
require_once __DIR__ . '/auth.php';
start_secure_session();

// Determina a qué login volver según el rol
if (isset($_SESSION['empresa_id'])) {
    // Antes: LoginEmpresa.html?logout=1
    secure_logout('/View/LoginEmpresa.html?logout=1');
} elseif (isset($_SESSION['correo'])) {
    // Antes: LoginEgresados.php?logout=1
    secure_logout('/View/LoginEgresados.php?logout=1');
} else {
    // Si ya no hay sesión, asegura no-cache y vuelve al inicio
    no_cache();
    // Antes: Index.php
    header('Location: /View/Index.php');
    exit;
}