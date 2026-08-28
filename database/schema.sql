CREATE DATABASE IF NOT EXISTS vinetaboutique;
USE vinetaboutique;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image VARCHAR(255),
    category VARCHAR(50),
    stock INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('pending','paid','shipped','cancelled') DEFAULT 'pending',
    mp_preference_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Productos de ejemplo (vinos)
INSERT INTO products (name, description, price, image, category, stock) VALUES
('Malbec Reserva 2020', 'Intenso y elegante, notas de ciruela y chocolate. Crianza 18 meses en roble francés.', 8500.00, 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400', 'Tinto', 25),
('Chardonnay Premium 2022', 'Fresco y mineral, con notas cítricas y un final cremoso.', 6200.00, 'https://images.unsplash.com/photo-1474722883778-792e7990302f?w=400', 'Blanco', 18),
('Cabernet Sauvignon Gran Reserva', 'Cuerpo robusto, taninos suaves, ideal para carnes rojas.', 9800.00, 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=400', 'Tinto', 12),
('Espumante Brut Nature', 'Burbujas finas y persistentes, aroma a pan tostado y manzana verde.', 4500.00, 'https://images.unsplash.com/photo-1594146664769-c20c1eb40d65?w=400', 'Espumante', 30),
('Rosé de Provence Style', 'Delicado y floral, perfecto para tardes de verano.', 5500.00, 'https://images.unsplash.com/photo-1553361371-9b22f78e8b1d?w=400', 'Rosado', 20),
('Blend de Autor 2019', 'Mezcla única de Malbec, Cabernet y Syrah. Edición limitada.', 12000.00, 'https://images.unsplash.com/photo-1566995541428-f2246c17cda1?w=400', 'Tinto', 8);
