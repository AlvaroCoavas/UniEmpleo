<?php
require_once __DIR__ . '/auth.php';
require_egresado();

// Conexión a la base de datos
$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
  die("Error de conexión: " . mysqli_connect_error());
}

// Helper: obtener noticias de Google News (RSS)
function fetch_google_news($q = 'empleo OR trabajo', $max = 6){
  $url = 'https://news.google.com/rss/search?q=' . urlencode($q) . '&hl=es-419&gl=CO&ceid=CO:es-419';
  $feed = @file_get_contents($url);
  if ($feed === false) { return []; }
  $xml = @simplexml_load_string($feed);
  if ($xml === false) { return []; }
  $items = [];
  foreach ($xml->channel->item as $i) {
    $items[] = [
      'title' => (string)$i->title,
      'link' => (string)$i->link,
      'pubDate' => (string)$i->pubDate,
      'source' => isset($i->source) ? (string)$i->source : 'Noticia'
    ];
    if (count($items) >= $max) break;
  }
  return $items;
}

// Empresas destacadas por cantidad de vacantes
$empresas_destacadas = [];
if ($stmt = mysqli_prepare($conexion, "SELECT e.id, e.nombre, COUNT(v.id) AS vacantes FROM empresas e LEFT JOIN vacantes v ON v.empresa_id = e.id GROUP BY e.id, e.nombre ORDER BY vacantes DESC LIMIT 6")) {
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  while ($row = mysqli_fetch_assoc($res)) { $empresas_destacadas[] = $row; }
  mysqli_stmt_close($stmt);
}

// Últimas vacantes
$ultimas_vacantes = [];
if ($stmt = mysqli_prepare($conexion, "SELECT v.id, v.titulo, v.ubicacion, v.tipo_empleo, e.nombre AS empresa FROM vacantes v JOIN empresas e ON e.id = v.empresa_id ORDER BY v.id DESC LIMIT 8")) {
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  while ($row = mysqli_fetch_assoc($res)) { $ultimas_vacantes[] = $row; }
  mysqli_stmt_close($stmt);
}

// Videos publicados por usuarios (si existe tabla videos)
$videos_publicados = [];
$tabla_videos_existe = false;
if ($check = mysqli_query($conexion, "SHOW TABLES LIKE 'videos'")) {
  $tabla_videos_existe = (mysqli_num_rows($check) > 0);
  mysqli_free_result($check);
}
if ($tabla_videos_existe) {
  if ($res = mysqli_query($conexion, "SELECT id, titulo, url, publisher_type, publisher_id, created_at FROM videos ORDER BY created_at DESC LIMIT 6")) {
    while ($row = mysqli_fetch_assoc($res)) { $videos_publicados[] = $row; }
    mysqli_free_result($res);
  }
}

// Fallback videos: YouTube Data API (requiere API key en entorno GOOGLE_API_KEY)
$youtube_videos = [];
$GOOGLE_API_KEY = getenv('GOOGLE_API_KEY') ?: '';
if (!$tabla_videos_existe && $GOOGLE_API_KEY) {
  $q = urlencode('empleo OR trabajo OR vacantes');
  $ytUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q={$q}&key=" . $GOOGLE_API_KEY;
  $json = @file_get_contents($ytUrl);
  if ($json) {
    $data = json_decode($json, true);
    foreach (($data['items'] ?? []) as $it){
      $youtube_videos[] = [
        'title' => $it['snippet']['title'] ?? 'Video',
        'videoId' => $it['id']['videoId'] ?? '',
        'thumb' => $it['snippet']['thumbnails']['medium']['url'] ?? '',
        'channel' => $it['snippet']['channelTitle'] ?? ''
      ];
    }
  }
}

$noticias = fetch_google_news();

mysqli_close($conexion);
?>
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Inicio Egresado</title>
  <link rel="stylesheet" href="style.css">
  <style>
     /* Estilos mínimos para grid del inicio */
     .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
     /* Fuerza una sola columna en pantallas grandes para scroll vertical continuo */
     @media (min-width: 1000px){ .dashboard-grid { grid-template-columns: 1fr; } }
     .list { list-style: none; padding: 0; margin: 0; }
     .list li { padding: 8px 0; border-bottom: 1px solid #e5e7eb; }
     .list li:last-child { border-bottom: 0; }
     .news-item a { color: #1f2937; text-decoration: none; }
     .news-item a:hover { color: #4338ca; }
     .company-grid { display: grid; grid-template-columns: 1fr; gap: 8px; }
     .company-card { padding: 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
     .vacante-card { padding: 10px; border: 1px solid #e5e7eb; border-radius: 10px; background: #fff; }
     .video-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
     .video-card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden; }
     .video-card img { width:100%; display:block; }
     .video-card .info { padding:8px 10px; }
     .subtl { color:#6b7280; font-size:12px; }
     /* Feed vertical */
     .feed { display: grid; gap: 12px; }
     .feed-item { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:10px; }
     .feed-item .title { font-weight:600; }
     .feed-item .meta { color:#6b7280; font-size:12px; margin-top:4px; }
     .feed-item--news .title a { color:#1f2937; text-decoration:none; }
     .feed-item--news .title a:hover { color:#4338ca; }
     .sentinel { height:1px; }
   </style>
</head>
<body>
  <header class="header">
    <button class="hamburger" id="menuToggle" aria-label="Abrir menú"><span></span><span></span><span></span></button>
    <h1>Inicio Egresado</h1>
  </header>
  <div class="backdrop" id="backdrop"></div>

  <div class="layout">
    <aside class="sidebar sidebar--drawer">
      <h3>Egresado</h3>
      <div class="menu">
        <a href="InicioEgresado.php" class="active">Inicio</a>
        <a href="BuscarVacantes.php">Buscar Vacantes</a>
        <a href="Vacantes.php">Ver Vacantes</a>
        <a href="PerfilEgresado.php">Mi Perfil</a>
        <a href="RegistroEgresados.html">Actualizar Perfil</a>
        <a href="logout.php">Salir</a>
      </div>
    </aside>

    <div class="content content--two-col">
      <div class="col-left">
        <?php include __DIR__ . '/profile_card.php'; ?>
      </div>
      <div class="col-right">
        <div class="dashboard-grid">
          <section class="card card--center">
            <h2>Novedades</h2>
            <div id="feed" class="feed"></div>
            <div id="feed-sentinel" class="sentinel"></div>
          </section>
          <!-- feed-only: secciones adicionales ocultas para probar vista con un único feed -->
        </div>
      </div>
    </div>
  </div>

  <footer class="footer">
    <p>© 2025 Uniempleo - Todos los derechos reservados</p>
  </footer>

  <script>
    (function(){
      const toggle = document.getElementById('menuToggle');
      const backdrop = document.getElementById('backdrop');
      const body = document.body;
      if (toggle) toggle.addEventListener('click', () => body.classList.toggle('sidebar-open'));
      if (backdrop) backdrop.addEventListener('click', () => body.classList.remove('sidebar-open'));
    })();
    // Feed infinito
    (function(){
      const feedEl = document.getElementById('feed');
      const sentinel = document.getElementById('feed-sentinel');
      let page = 0;
      let loading = false;
      async function loadPage(){
        if (loading) return; loading = true;
        try {
          const res = await fetch('feed_api.php?page=' + page + '&limit=10', { cache: 'no-store' });
          const json = await res.json();
          (json.items || []).forEach(renderItem);
          page += 1;
        } catch (e) { console.error('feed error', e); }
        loading = false;
      }
      function renderItem(it){
        const div = document.createElement('div');
        div.className = 'feed-item feed-item--' + (it.type || 'post');
        if (it.type === 'vacante') {
          div.innerHTML = `
            <div class="title">${escapeHtml(it.title)}</div>
            <div class="meta">Empresa: ${escapeHtml(it.empresa || '—')} · ${escapeHtml(it.ubicacion || '—')} · ${escapeHtml(it.tipo || '—')}</div>
            <p>${escapeHtml(it.desc || '').slice(0, 220)}...</p>
          `;
        } else if (it.type === 'news') {
          div.innerHTML = `
            <div class="title"><a href="${escapeAttr(it.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(it.title)}</a></div>
            <div class="meta">${escapeHtml(it.source || 'Noticia')} · ${formatDate(it.date)}</div>
          `;
        } else if (it.type === 'video') {
          const iframe = it.videoId ? 
            `<iframe src="https://www.youtube.com/embed/${escapeAttr(it.videoId)}" frameborder="0" allowfullscreen></iframe>` :
            `<iframe src="${escapeAttr(it.url || '')}" frameborder="0" allowfullscreen></iframe>`;
          div.innerHTML = `
            <div class="title">${escapeHtml(it.title || 'Video')}</div>
            <div class="meta">Publicado por: ${escapeHtml(it.publisher || '')} ${it.date ? '· ' + formatDate(it.date) : ''}</div>
            <div style="aspect-ratio:16/9;">${iframe}</div>
          `;
        }
        feedEl.appendChild(div);
      }
      function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c])); }
      function escapeAttr(s){ return escapeHtml(s); }
      function formatDate(d){ try { const dt = new Date(d); return dt.toLocaleString('es-CO'); } catch(e){ return ''; } }
      if (sentinel) {
        const io = new IntersectionObserver(entries => {
          entries.forEach(e => { if (e.isIntersecting) loadPage(); });
        });
        io.observe(sentinel);
      }
      loadPage();
    })();
  </script>
  <?php include __DIR__ . '/messages_widget.php'; ?>
</body>
</html>