<?php
require_once '../models/Empresa.php';

class EmpresaController {
    public function register($data) {
        $empresa = new Empresa($data);

        if ($empresa->save()) {
            return true; // Registro exitoso
        } else {
            return $empresa->errors->full_messages(); // Devuelve los errores
        }
    }
}
?>