<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Login Egresado | Uniempleo</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <h1>Login de Egresados</h1>
    </header>

    <main>
        <form action="verificarEgresado.php" method="post" class="formulario">
            <h3>Ingresa tus datos</h3>
            <input type="email" name="correo" placeholder="Correo institucional" required>
            <input type="password" name="contrasena" placeholder="Contraseña" required>
            <input type="submit" value="Iniciar Sesión">
        </form>
    </main>

    <footer class="footer">
        <p>&copy; 2025 Uniempleo - Todos los derechos reservados</p>
    </footer>
</body>
</html>
