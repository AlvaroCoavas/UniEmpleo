-- Base de datos para Uniempleo (XAMPP / MySQL)
-- Charset: utf8mb4, Collation: utf8mb4_general_ci

CREATE DATABASE IF NOT EXISTS `uniempleo` CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `uniempleo`;

-- Tabla de empresas
CREATE TABLE IF NOT EXISTS `empresas` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `ubicacion` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de egresados
CREATE TABLE IF NOT EXISTS `egresados` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `nombre` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `correo` VARCHAR(255) UNIQUE,
  `contrasena` VARCHAR(255) NULL,
  `telefono` VARCHAR(50) NULL,
  `programa` VARCHAR(255) NULL,
  `graduacion` INT NULL,
  `perfil` TEXT NULL,
  `cv` VARCHAR(255) NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_egresados_email` (`email`),
  INDEX `idx_egresados_correo` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabla de vacantes
CREATE TABLE IF NOT EXISTS `vacantes` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `empresa_id` INT NULL,
  `empresa` VARCHAR(255) NULL,
  `titulo` VARCHAR(255) NOT NULL,
  `descripcion` TEXT NOT NULL,
  `ubicacion` VARCHAR(255) NOT NULL,
  `tipo_empleo` VARCHAR(100) NOT NULL,
  `area` VARCHAR(255) NULL,
  `experiencia` VARCHAR(100) NULL,
  `fecha_publicacion` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`empresa_id`) REFERENCES `empresas`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  INDEX `idx_vacantes_titulo` (`titulo`),
  INDEX `idx_vacantes_ubicacion` (`ubicacion`),
  INDEX `idx_vacantes_tipo` (`tipo_empleo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Datos de ejemplo
INSERT INTO `empresas` (`nombre`, `email`, `password`, `ubicacion`) VALUES
('TechCorp', 'empresa@techcorp.com', '1234', 'Bogotá');

INSERT INTO `egresados` (`nombre`, `email`, `correo`, `contrasena`, `telefono`, `programa`, `graduacion`, `perfil`, `cv`) VALUES
('Juan Perez', 'juan@example.com', 'juan@example.com', '1234', '3001234567', 'Tecnología en Desarrollo de Software', 2024, 'Desarrollador junior con bases en PHP y MySQL', 'cvs/juan.pdf');

INSERT INTO `vacantes` (`empresa_id`, `empresa`, `titulo`, `descripcion`, `ubicacion`, `tipo_empleo`, `area`, `experiencia`) VALUES
(1, 'TechCorp', 'Desarrollador PHP Junior', 'Soporte y nuevas funcionalidades en plataforma PHP.', 'Bogotá', 'Tiempo completo', 'Tecnología', '1-2 años'),
(1, 'TechCorp', 'Analista QA', 'Pruebas manuales y automatizadas, reporte de bugs.', 'Medellín', 'Medio tiempo', 'Tecnología', 'Sin experiencia');