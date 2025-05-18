<?php
class Database {
    private static $host = "localhost";
    private static $user = "root";
    private static $password = "";
    private static $database = "bd_pa_uniempleo";
    private static $conn;

    public static function getConnection() {
        if (self::$conn == null) {
            self::$conn = new mysqli(self::$host, self::$user, self::$password, self::$database);

            if (self::$conn->connect_error) {
                die("Error de conexión: " . self::$conn->connect_error);
            }
        }
        return self::$conn;
    }
}
?>