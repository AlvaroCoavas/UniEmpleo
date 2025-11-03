<?php
require_once dirname(__DIR__) . '/Auth/auth.php';
require_egresado();
header('Content-Type: application/json');

$conexion = mysqli_connect("localhost", "root", "", "uniempleo");
if (!$conexion) {
  http_response_code(500);
  echo json_encode(['error' => 'DB connection failed']);
  exit;
}

$page = isset($_GET['page']) ? max(0, (int)$_GET['page']) : 0;
$limit = isset($_GET['limit']) ? max(1, min(20, (int)$_GET['limit'])) : 10;
$offset = $page * $limit;

$items = [];

// Vacantes: usar id DESC como aproximación cronológica
if ($res = mysqli_query($conexion, "SELECT v.id, v.titulo, v.descripcion, v.ubicacion, v.tipo_empleo, e.nombre AS empresa FROM vacantes v LEFT JOIN empresas e ON e.id = v.empresa_id ORDER BY v.id DESC LIMIT {$limit} OFFSET {$offset}")) {
  while ($row = mysqli_fetch_assoc($res)) {
    $items[] = [
      'type' => 'vacante',
      'id' => (int)$row['id'],
      'title' => $row['titulo'],
      'desc' => $row['descripcion'],
      'empresa' => $row['empresa'] ?: 'Empresa',
      'ubicacion' => $row['ubicacion'],
      'tipo' => $row['tipo_empleo'],
      'ts' => (int)$row['id'] // aproximación de orden
    ];
  }
  mysqli_free_result($res);
}

// Noticias: Google News RSS (tomar 30 y paginar en servidor)
function fetch_news_feed($q = 'empleo OR trabajo'){ 
  $url = 'https://news.google.com/rss/search?q=' . urlencode($q) . '&hl=es-419&gl=CO&ceid=CO:es-419';
  $feed = @file_get_contents($url);
  if ($feed === false) { return []; }
  $xml = @simplexml_load_string($feed);
  if ($xml === false) { return []; }
  $out = [];
  foreach ($xml->channel->item as $i) {
    $out[] = [
      'type' => 'news',
      'title' => (string)$i->title,
      'link' => (string)$i->link,
      'source' => isset($i->source) ? (string)$i->source : 'Noticia',
      'date' => (string)$i->pubDate,
      'ts' => strtotime((string)$i->pubDate) ?: time(),
    ];
    if (count($out) >= 30) break;
  }
  return $out;
}
$newsAll = fetch_news_feed();
$newsSlice = array_slice($newsAll, $offset, $limit);
$items = array_merge($items, $newsSlice);

// Videos: tabla local si existe
$videos = [];
$tabla_videos_existe = false;
if ($check = mysqli_query($conexion, "SHOW TABLES LIKE 'videos'")) {
  $tabla_videos_existe = (mysqli_num_rows($check) > 0);
  mysqli_free_result($check);
}
if ($tabla_videos_existe) {
  if ($res = mysqli_query($conexion, "SELECT id, titulo, url, publisher_type, created_at FROM videos ORDER BY created_at DESC LIMIT {$limit} OFFSET {$offset}")) {
    while ($row = mysqli_fetch_assoc($res)) {
      $items[] = [
        'type' => 'video',
        'id' => (int)$row['id'],
        'title' => $row['titulo'],
        'url' => $row['url'],
        'publisher' => $row['publisher_type'] ?: 'Usuario',
        'date' => $row['created_at'] ?: '',
        'ts' => strtotime($row['created_at'] ?: '') ?: time()
      ];
    }
    mysqli_free_result($res);
  }
} else {
  // Fallback YouTube (máx 12 elementos globales)
  $GOOGLE_API_KEY = getenv('GOOGLE_API_KEY') ?: '';
  if ($GOOGLE_API_KEY) {
    $q = urlencode('empleo OR trabajo OR vacantes');
    $ytUrl = "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=50&q={$q}&key=" . $GOOGLE_API_KEY;
    $json = @file_get_contents($ytUrl);
    if ($json) {
      $data = json_decode($json, true);
      $ytAll = [];
      foreach (($data['items'] ?? []) as $it){
        $ytAll[] = [
          'type' => 'video',
          'title' => $it['snippet']['title'] ?? 'Video',
          'videoId' => $it['id']['videoId'] ?? '',
          'thumb' => $it['snippet']['thumbnails']['medium']['url'] ?? '',
          'publisher' => $it['snippet']['channelTitle'] ?? '',
          'date' => $it['snippet']['publishedAt'] ?? '',
          'ts' => strtotime($it['snippet']['publishedAt'] ?? '') ?: time()
        ];
      }
      $items = array_merge($items, array_slice($ytAll, $offset, $limit));
    }
  }
}

// Mezclar por ts descendente para variedad
usort($items, function($a,$b){ return ($b['ts'] ?? 0) <=> ($a['ts'] ?? 0); });

mysqli_close($conexion);

echo json_encode([
  'page' => $page,
  'limit' => $limit,
  'count' => count($items),
  'items' => $items
]);