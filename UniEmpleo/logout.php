<?php
require_once __DIR__ . '/auth.php';
start_secure_session();

// Determina a qué login volver según el rol
if (isset($_SESSION['empresa_id'])) {
    secure_logout('LoginEmpresa.html?logout=1');
} elseif (isset($_SESSION['correo'])) {
    secure_logout('LoginEgresados.php?logout=1');
} else {
    // Si ya no hay sesión, asegura no-cache y vuelve al inicio
    no_cache();
    header('Location: Index.php');
    exit;
}