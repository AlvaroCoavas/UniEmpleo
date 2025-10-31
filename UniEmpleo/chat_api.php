<?php
require_once __DIR__ . '/auth.php';
start_secure_session();

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? $_POST['action'] ?? '';

function db() {
  $conn = mysqli_connect('localhost','root','','uniempleo');
  if (!$conn) { http_response_code(500); echo json_encode(['error'=>'db_connect']); exit; }
  mysqli_set_charset($conn, 'utf8mb4');
  return $conn;
}

function ensure_chat_tables($conn){
  $sqls = [
    "CREATE TABLE IF NOT EXISTS conversations (id INT AUTO_INCREMENT PRIMARY KEY, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS conversation_participants (id INT AUTO_INCREMENT PRIMARY KEY, conversation_id INT NOT NULL, participant_type ENUM('egresado','empresa') NOT NULL, participant_id INT NOT NULL, UNIQUE KEY uniq_conv_part (conversation_id, participant_type, participant_id), FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE) ENGINE=InnoDB",
    "CREATE TABLE IF NOT EXISTS messages (id INT AUTO_INCREMENT PRIMARY KEY, conversation_id INT NOT NULL, sender_type ENUM('egresado','empresa') NOT NULL, sender_id INT NOT NULL, body TEXT NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, read_at TIMESTAMP NULL, FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE) ENGINE=InnoDB"
  ];
  foreach ($sqls as $q) { mysqli_query($conn, $q); }
}

function current_user($conn){
  if (isset($_SESSION['empresa_id'])){
    $id = (int)$_SESSION['empresa_id'];
    $name = $_SESSION['empresa_nombre'] ?? '';
    if (!$name) { $res = mysqli_query($conn, "SELECT nombre FROM empresas WHERE id=".$id." LIMIT 1"); if ($res && $row = mysqli_fetch_assoc($res)) { $name = $row['nombre']; } }
    return ['type'=>'empresa','id'=>$id,'name'=>$name];
  }
  if (isset($_SESSION['correo'])){
    $correo = $_SESSION['correo'];
    $stmt = mysqli_prepare($conn, "SELECT id, nombre FROM egresados WHERE correo = ? LIMIT 1");
    mysqli_stmt_bind_param($stmt, 's', $correo);
    mysqli_stmt_execute($stmt);
    $res = mysqli_stmt_get_result($stmt);
    if ($res && $row = mysqli_fetch_assoc($res)) { return ['type'=>'egresado','id'=>(int)$row['id'],'name'=>$row['nombre']]; }
  }
  return null;
}

$conn = db();
ensure_chat_tables($conn);
$user = current_user($conn);
if (!$user) { http_response_code(401); echo json_encode(['error'=>'unauthorized']); exit; }

function get_other_participant($conn, $conversation_id, $user){
  $stmt = mysqli_prepare($conn, "SELECT participant_type, participant_id FROM conversation_participants WHERE conversation_id = ? AND NOT (participant_type = ? AND participant_id = ?)");
  mysqli_stmt_bind_param($stmt,'isi',$conversation_id,$user['type'],$user['id']);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  $other = mysqli_fetch_assoc($res);
  mysqli_stmt_close($stmt);
  if (!$other) return null;
  if ($other['participant_type']==='empresa'){
    $q = mysqli_query($conn, "SELECT id, nombre FROM empresas WHERE id=".(int)$other['participant_id']." LIMIT 1");
    if ($q && $r = mysqli_fetch_assoc($q)) return ['type'=>'empresa','id'=>(int)$r['id'],'name'=>$r['nombre']];
  } else {
    $q = mysqli_query($conn, "SELECT id, nombre FROM egresados WHERE id=".(int)$other['participant_id']." LIMIT 1");
    if ($q && $r = mysqli_fetch_assoc($q)) return ['type'=>'egresado','id'=>(int)$r['id'],'name'=>$r['nombre']];
  }
  return null;
}

if ($action === 'list_conversations'){
  $stmt = mysqli_prepare($conn, "SELECT DISTINCT c.id FROM conversations c JOIN conversation_participants p ON p.conversation_id=c.id WHERE p.participant_type=? AND p.participant_id=? ORDER BY c.id DESC");
  mysqli_stmt_bind_param($stmt,'si',$user['type'],$user['id']);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  $rows = [];
  while ($row = mysqli_fetch_assoc($res)){
    $other = get_other_participant($conn, (int)$row['id'], $user);
    $last = mysqli_query($conn, "SELECT id, body, sender_type, created_at FROM messages WHERE conversation_id=".(int)$row['id']." ORDER BY id DESC LIMIT 1");
    $lastMsg = $last && ($lm = mysqli_fetch_assoc($last)) ? $lm : null;
    $rows[] = ['id'=>(int)$row['id'],'other'=>$other,'last'=>$lastMsg];
  }
  echo json_encode(['ok'=>true,'conversations'=>$rows]);
  exit;
}

if ($action === 'start_conversation'){
  $target_type = $_POST['target_type'] ?? '';
  $target_id = (int)($_POST['target_id'] ?? 0);
  if (!$target_type || !$target_id) { echo json_encode(['error'=>'bad_request']); exit; }
  $stmt = mysqli_prepare($conn, "SELECT c.id FROM conversations c JOIN conversation_participants p1 ON p1.conversation_id=c.id AND p1.participant_type=? AND p1.participant_id=? JOIN conversation_participants p2 ON p2.conversation_id=c.id AND p2.participant_type=? AND p2.participant_id=? LIMIT 1");
  mysqli_stmt_bind_param($stmt,'siss',$user['type'],$user['id'],$target_type,$target_id);
  mysqli_stmt_execute($stmt);
  $res = mysqli_stmt_get_result($stmt);
  if ($res && ($found = mysqli_fetch_assoc($res))) { echo json_encode(['ok'=>true,'conversation_id'=>(int)$found['id']]); exit; }
  mysqli_query($conn, "INSERT INTO conversations () VALUES ()");
  $conv_id = (int)mysqli_insert_id($conn);
  $s1 = mysqli_prepare($conn, "INSERT IGNORE INTO conversation_participants (conversation_id, participant_type, participant_id) VALUES (?,?,?)");
  mysqli_stmt_bind_param($s1,'isi',$conv_id,$user['type'],$user['id']);
  mysqli_stmt_execute($s1);
  $s2 = mysqli_prepare($conn, "INSERT IGNORE INTO conversation_participants (conversation_id, participant_type, participant_id) VALUES (?,?,?)");
  mysqli_stmt_bind_param($s2,'isi',$conv_id,$target_type,$target_id);
  mysqli_stmt_execute($s2);
  echo json_encode(['ok'=>true,'conversation_id'=>$conv_id]);
  exit;
}

if ($action === 'fetch_messages'){
  $conversation_id = (int)($_GET['conversation_id'] ?? $_POST['conversation_id'] ?? 0);
  if (!$conversation_id) { echo json_encode(['error'=>'bad_request']); exit; }
  $m = mysqli_prepare($conn, "SELECT id, sender_type, sender_id, body, created_at FROM messages WHERE conversation_id=? ORDER BY id ASC");
  mysqli_stmt_bind_param($m,'i',$conversation_id);
  mysqli_stmt_execute($m);
  $res = mysqli_stmt_get_result($m);
  $msgs = [];
  while ($row = mysqli_fetch_assoc($res)){
    $msgs[] = ['id'=>(int)$row['id'],'sender_type'=>$row['sender_type'],'sender_id'=>(int)$row['sender_id'],'body'=>$row['body'],'created_at'=>$row['created_at']];
  }
  echo json_encode(['ok'=>true,'messages'=>$msgs]);
  exit;
}

if ($action === 'send_message'){
  $conversation_id = (int)($_POST['conversation_id'] ?? 0);
  $body = trim($_POST['body'] ?? '');
  if (!$conversation_id || $body==='') { echo json_encode(['error'=>'bad_request']); exit; }
  $stmt = mysqli_prepare($conn, "INSERT INTO messages (conversation_id, sender_type, sender_id, body) VALUES (?,?,?,?)");
  mysqli_stmt_bind_param($stmt,'isis',$conversation_id,$user['type'],$user['id'],$body);
  mysqli_stmt_execute($stmt);
  echo json_encode(['ok'=>true]);
  exit;
}

if ($action === 'search_participants'){
  $q = trim($_GET['q'] ?? $_POST['q'] ?? '');
  $empresas = [];
  $egresados = [];
  $qe = $q ? " WHERE nombre LIKE '%".mysqli_real_escape_string($conn,$q)."%'" : '';
  $resE = mysqli_query($conn, "SELECT id, nombre FROM empresas".$qe." ORDER BY nombre LIMIT 20");
  while ($resE && $row = mysqli_fetch_assoc($resE)){ $empresas[] = ['id'=>(int)$row['id'],'nombre'=>$row['nombre']]; }
  $qe2 = $q ? " WHERE nombre LIKE '%".mysqli_real_escape_string($conn,$q)."%'" : '';
  $resG = mysqli_query($conn, "SELECT id, nombre FROM egresados".$qe2." ORDER BY nombre LIMIT 20");
  while ($resG && $row = mysqli_fetch_assoc($resG)){ if ($row['id'] != $user['id']) $egresados[] = ['id'=>(int)$row['id'],'nombre'=>$row['nombre']]; }
  echo json_encode(['ok'=>true,'empresas'=>$empresas,'personas'=>$egresados]);
  exit;
}

echo json_encode(['error'=>'unknown_action']);