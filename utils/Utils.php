<?php
class Utils {
    public static function verificarSesion() {
        if (!isset($_SESSION['id_usuario'])) {
            header("Location: ../View/login.php");
            exit();
        }
    }

    public static function redirigirSiEsNuevoUsuario() {
        if (isset($_SESSION['nuevo_usuario']) && $_SESSION['nuevo_usuario'] === true) {
            unset($_SESSION['nuevo_usuario']);
            return true;
        }
        return false;
    }
    public static function sanitizarEntrada($entrada) {
        return htmlspecialchars(strip_tags(trim($entrada)));
    }

    public static function redirigirConMensaje($url) {
        header("Location: $url"); // Redirige al usuario
        exit();
    }
}
?>