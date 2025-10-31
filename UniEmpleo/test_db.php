<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);
$c = mysqli_connect('localhost','root','','uniempleo');
if (!$c) { echo 'ERROR:' . mysqli_connect_error(); exit(1); }
echo 'OK';