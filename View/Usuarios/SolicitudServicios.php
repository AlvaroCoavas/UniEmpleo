<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Publicar Vacante</title>
    <link rel="stylesheet" href="../Css/style.css">
</head>
<body>
    <header class="header">
    <h1 class="logo">Uniempleo</h1>
    <nav class="nav">
      <a href="../View/Usuarios/">Volver</a>
    </nav>
  </header>

    <main class="main-content">
    <section class="form-section">
      <form action="../../controllers/ServicioController.php?action=solicitar" method="post" class="formulario">
        <h2 class="form-title">Solicitar Servicio</h2>
       <br> 
        <div class="form-group">
          <label for="nombre">Nombre del Servicio</label>
          <input type="text" id="titulo" name="nombre_servicio" required>
        </div>

        <div class="form-group">
          <label for="descripcion">Descripcion</label>
          <textarea id="descripcion" name="descripcion" rows="5" required></textarea>
        </div>

        <div class="form-group">
          <button type="submit" class="btn-submit">Solicitar Servicio</button>
        </div>
      </form>
    </section>
  </main>
    <footer class="footer">
        <p>&copy; 2025 UniEmpleo</p>
    </footer>
</body>
</html>