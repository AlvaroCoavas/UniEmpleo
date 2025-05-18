<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Perfil de Usuario</title>
  <link rel="stylesheet" href="../Css/style.css">
</head>
<body>
  <div class="container">
    <div class="profile-header">
      <img src="https://via.placeholder.com/120" alt="Foto de perfil" />
      <div class="profile-info">
        <h1 id="nombre">Cargando...</h1>
        <p id="correo">Correo: Cargando...</p>
        <p id="tipo_usuario"> Profesion u Oficio: Cargando...</p>
        <button class="edit-btn">Editar Perfil</button>
      </div>
    </div>

    <div class="section">
      <h2>Información adicional</h2>
      <div class="info-grid">
        <div class="info-item">
          <span>Ubicación:</span>
          <span id="ubicacion">Cargando...</span>
        </div>
        <div class="info-item">
          <span>Miembro desde:</span>
          <span id="fecha_registro">Cargando...</span>
        </div>
        <div class="info-item">
          <span>Servicios completados:</span>
          <span id="servicios_completados">Cargando...</span>
        </div>
        <div class="info-item">
          <span>Calificación promedio:</span>
          <span id="calificacion_promedio">Cargando...</span>
        </div>
      </div>
    </div>
  </div>
  
  <script src="../Js/main.js"></script>
</body>
</html>