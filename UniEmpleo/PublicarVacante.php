<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Publicar Vacante</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h2>Publicar Nueva Vacante</h2>
    <form action="guardar_vacante.php" method="post" class="formulario">
        <label for="titulo">Título del Puesto:</label>
        <input type="text" name="titulo" required>

        <label for="descripcion">Descripción:</label>
        <textarea name="descripcion" required></textarea>

        <label for="ubicacion">Ubicación:</label>
        <input type="text" name="ubicacion" required>

        <label for="tipo_empleo">Tipo de Empleo:</label>
        <select name="tipo_empleo" required>
            <option value="Tiempo completo">Tiempo completo</option>
            <option value="Medio tiempo">Medio tiempo</option>
            <option value="Prácticas">Prácticas</option>
        </select>

        <input type="submit" value="Publicar Vacante">
    </form>
</body>
</html>