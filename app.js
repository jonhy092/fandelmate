

import express from 'express';
import pkg from 'pg';

import { createServer } from "http";
import { Server } from "socket.io";
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import morgan from 'morgan';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pool from './db.js';
import db from './db.js';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import multer from 'multer';

const app = express();




const corsOptions = {
  origin:[  'http://127.0.0.1:5500', 'http://localhost:3001'], // Permite el origen de tu frontend
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  credentials: true, 
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Aplica CORS antes de definir las rutas
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Manejo de preflight requests



//const server = require('http').createServer(app);

// Obtener la ruta del directorio actual
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//definicion de limiter//
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // límite de 100 solicitudes por IP
  standardHeaders: true, // devuelve info en headers `RateLimit-*`
  legacyHeaders: false, // desactiva los headers `X-RateLimit-*`
});


// Ahora puedes usar __dirname normalmente
console.log(`Directorio actual: ${__dirname}`);
const pedidoId = uuidv4();
// Configurar dotenv
dotenv.config({ path: path.join(__dirname, '../.env') });






// Middlewares de seguridad y monitoreo
app.use(helmet());
app.use(morgan('combined'));

//const fs = require('fs');
app.use(limiter);
app.use(express.json());// parseo JSON.. para que el body sea un json
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());  // Habilita la lectura de JSON en las peticiones POST
app.use(express.urlencoded({ extended: true })); // Habilita datos de formularios

const PORT = process.env.PORT || 3001;

//CONEXION EN TIEMPO REAL CON SOCKET.IO//
// Configuración de Socket.io con autenticación
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || ['http://localhost:3001', 'http://127.0.0.1:5500'],
    methods: ["GET", "POST"],
    credentials: true
  }
});


// Middleware de autenticación para Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    return next(new Error('No autorizado'));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    return next(new Error('Token inválido'));
  }
});

// Manejo de conexiones Socket.io autenticadas
io.on('connection', (socket) => {
  console.log(`Usuario conectado: ${socket.user.id}`);
  
  socket.on('joinAdmin', () => {
    socket.join('admin');
    console.log("👑 Admin unido a sala 'admin'");
  });

  socket.on('disconnect', () => {
    console.log(`❌ Usuario desconectado: ${socket.user.id}`);
  });
});

//***************** *//

// Crear tabla de pedidos (ejecutar solo una vez)
const crearTablas = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id VARCHAR(36) PRIMARY KEY,
        cliente_nombre VARCHAR(255) NOT NULL,
        cliente_email VARCHAR(255) NOT NULL,
        cliente_telefono VARCHAR(20),
        cliente_dni VARCHAR(20),
        direccion TEXT,
        fecha_entrega DATE,
        forma_pago VARCHAR(50) NOT NULL,
        necesita_envio BOOLEAN DEFAULT false,
        tiene_descuento BOOLEAN DEFAULT false,
        total DECIMAL(10, 2) NOT NULL,
        estado VARCHAR(20) DEFAULT 'pendiente',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        productos JSONB NOT NULL,
        usuario_id INTEGER REFERENCES usuarios(id)
      );
    `);
    console.log('Tablas creadas/verificadas');
  } catch (err) {
    console.error('Error al crear tablas:', err);
  }
};
crearTablas();

//***************** *//


// Middleware de autenticación JWT
const autenticar = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Acceso no autorizado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.usuario = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Token inválido' });
  }
};

// Middleware de validación de errores
const validar = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Middleware de manejo de errores
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      error: 'Error de validación',
      detalles: err.message 
    });
  }
  
  if (err.code === '23505') { // Violación de unique constraint
    return res.status(409).json({ 
      error: 'Conflicto de datos',
      detalles: 'El recurso ya existe'
    });
  }
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    mensaje: process.env.NODE_ENV === 'development' ? err.message : 'Ocurrió un error'
  });
});



// Endpoint para crear pedidos con validación robusta
app.post('/api/pedidos', [
  autenticar,
  body('cliente.nombre').trim().isLength({ min: 2 }).escape(),
  body('cliente.email').isEmail().normalizeEmail(),
  body('cliente.telefono').optional().trim().isLength({ min: 8 }),
  body('cliente.dni').optional().trim().isLength({ min: 7 }),
  body('envio.direccion').optional().trim().escape(),
  body('envio.fechaEntrega').optional().isISO8601(),
  body('formaPago').isIn(['cash-debit', 'credit', 'transfer']),
  body('productos').isArray({ min: 1 }),
  body('productos.*.id').isInt(),
  body('productos.*.nombre').trim().notEmpty(),
  body('productos.*.precio').isFloat({ min: 0 }),
  body('productos.*.cantidad').isInt({ min: 1 }),
  body('total').isFloat({ min: 0 }),
  body('necesitaEnvio').optional().isBoolean(),
  body('tieneDescuento').optional().isBoolean(),
  validar
], async (req, res) => {
  const { 
    cliente, 
    envio, 
    productos, 
    formaPago, 
    total,
    descuento,
    subtotal,
    necesitaEnvio = false,
    tieneDescuento = false
  } = req.body;

  const pedidoId = uuidv4();
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');


    //*****  */

// 2. Crear pedido
await client.query(
  `INSERT INTO pedidos (
    id, cliente_nombre, cliente_email, cliente_telefono, cliente_dni,
    direccion, fecha_entrega, forma_pago, necesita_envio, tiene_descuento,
    total, subtotal, descuento, productos, usuario_id
  ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)`,
  [
    pedidoId,
    cliente.nombre,
    cliente.email,
    cliente.telefono,
    cliente.dni,
    envio?.direccion,
    envio?.fechaEntrega,
    formaPago,
    necesitaEnvio,
    tieneDescuento,
    total,
    subtotal,
    descuento, // 🟢
    JSON.stringify(productos),
    req.usuario.id
  ]
);


// 3. Actualizar stock
for (const producto of productos) {
  await client.query(
    'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
    [producto.cantidad, producto.id]
  );
}

await client.query('COMMIT');

// Emitir solo a usuarios autenticados como administradores
const { rows } = await client.query('SELECT * FROM pedidos WHERE id = $1', [pedidoId]);
io.to('admin').emit('nuevoPedido', rows[0]);
    
res.status(201).json({ 
  success: true,
  pedido: rows[0]
});
} catch (err) {
await client.query('ROLLBACK');
console.error('Error en transacción:', err);
throw err; // Será manejado por el middleware de errores
} finally {
client.release();
}
});

// Endpoint para obtener pedidos con paginación
app.get('/api/pedidos', [
  autenticar,
  body('pagina').optional().isInt({ min: 1 }).toInt(),
  body('limite').optional().isInt({ min: 1, max: 100 }).toInt(),
  validar
], async (req, res) => {
  const pagina = req.body.pagina || 1;
  const limite = req.body.limite || 10;
  const offset = (pagina - 1) * limite;

  try {
    // Consulta para los pedidos
    const { rows: pedidos } = await pool.query(
      `SELECT * FROM pedidos 
       ORDER BY fecha_creacion DESC
       LIMIT $1 OFFSET $2`,
      [limite, offset]
    );

    // Consulta para el conteo total
    const { rows: [{ count }] } = await pool.query(
      'SELECT COUNT(*) FROM pedidos'
    );

    res.json({
      success: true,
      data: pedidos,
      paginacion: {
        total: parseInt(count),
        pagina,
        totalPaginas: Math.ceil(count / limite),
        limite
      }
    });
  } catch (err) {
    console.error('Error al obtener pedidos:', err);
    throw err;
  }
});

// Endpoint para actualizar estado de pedido
app.put('/api/pedidos/:id/estado', [
  autenticar,
  body('estado').isIn(['pendiente', 'procesando', 'completado', 'cancelado']),
  validar
], async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;

  try {
    const { rowCount } = await pool.query(
      `UPDATE pedidos SET estado = $1 
       WHERE id = $2 AND usuario_id = $3
       RETURNING *`,
      [estado, id, req.usuario.id]
    );

    if (rowCount === 0) {
      return res.status(404).json({ 
        error: 'Pedido no encontrado o no autorizado' 
      });
    }

    // Notificar a los clientes si es relevante
    if (estado === 'completado') {
      io.emit('pedidoActualizado', { id, estado });
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Error al actualizar estado:', err);
    throw err;
  }
});




//************************ */


      // Reducir stock (similar a tu lógica en /cart/checkout)
//       const client = await pool.connect();
//       try {
//           await client.query('BEGIN');
          
//           for (const producto of pedido.productos) {
//               await client.query(
//                   'UPDATE products SET quantity = quantity - $1 WHERE id = $2',
//                   [producto.cantidad, producto.id]
//               );
//           }
          
//           await client.query('COMMIT');
//           res.status(200).json({ message: "Pedido procesado y stock actualizado" });
//       } catch (error) {
//           await client.query('ROLLBACK');
//           throw error;
//       } finally {
//           client.release();
//       }
//   } catch (error) {
//       console.error('Error al procesar pedido:', error);
//       res.status(500).json({ error: "Error al procesar pedido" });
//   }
// });




// User login YA CREADOS...
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    const user = await db.query('SELECT * FROM usuarios WHERE username = $1', [username]);

    if (user.rows.length > 0 && await bcrypt.compare(password, user.rows[0].password)) {
        const token = jwt.sign({ id: user.rows[0].id }, process.env.JWT_SECRET);
        return res.json({ token });
    }

    res.status(401).send('Credenciales incorrectas');
});

// Usuario registro
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if ( !username || !password){
        return res.status (400).json ({message: 'Faltan datos' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO usuarios (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).send('Usuario creado');

    } catch (error){
        console.error('Error al registrar usuario:', error);
        res.status(500).json({message: 'Error interno del servidor'});
    }
    
});
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, username FROM usuarios');
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error al obtener los usuarios' });
    }
});
//RUTA PARA ACTUALIZAR USUARIOS//
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, password } = req.body;
  
    try {
      let query;
      let values;
  
      if (password) {
        const hashedPassword = await bcrypt.hash(password, 10);
        query = 'UPDATE usuarios SET username = $1, password = $2 WHERE id = $3';
        values = [username, hashedPassword, id];
      } else {
        query = 'UPDATE usuarios SET username = $1 WHERE id = $2';
        values = [username, id];
      }
  
      await pool.query(query, values);
      res.status(200).send('Usuario actualizado');
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).send('Error al actualizar usuario');
    }
  });
  
//RUTA PARA ELIMINAR USUARIOS//
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
      res.status(200).send('Usuario eliminado');
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      res.status(500).send('Error al eliminar usuario');
    }
  });
  

// configuracion de carga de los archivos CON MULTER...
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
//INICIALIZO MULTER

const upload = multer({ storage});



app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:5500');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.sendStatus(204); // Responde sin contenido
});


//POST  PRODUCTS***//
app.post('/products', upload.single('image'), async (req, res) => {
    console.log('ARCHIVOS RECIBIDOS',req.body);
    if (!req.file) {
        return res.status(400).send('No se ha subido ningún archivo.');
    }
    const { name, price, description, quantity, category_id } = req.body;
    const image_url = req.file.path;
   
    try {
        await db.query(
            'INSERT INTO products (name, description,  price,quantity, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6)', 
            [name, description,price,  quantity, image_url, category_id]
        );
        res.status(201).send('Producto agregado');
    } catch (error) {
        console.error('Error al agregar el producto:', error);
        res.status(500).send('Error al agregar el producto');
    }
});


// Get products//
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.name, p.description, p.price, p.quantity, p.image_url, 
             p.category_id, c.name AS category_name 
      FROM products p
      JOIN categories c ON p.category_id = c.id
      ORDER BY p.id
    `);
    
    console.log("Productos obtenidos del backend:", result.rows); // Verifica la respuesta en la terminal
    
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error);
    res.status(500).send('Error al obtener productos');
  }
});



//ELIMINAR CANTIDAD PRODUCTOS//
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Verificar si el producto existe
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).send({ error: 'Producto no encontrado' });
    }

    // Eliminar el producto
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.status(200).send({ message: 'Producto eliminado', product: result.rows[0] });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).send({ error: 'Error al eliminar producto' });
  }
});
// ELIMINAR PRODUCTOS CON CANTIDAD 0 //

app.delete('/products/remove-empty', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM products WHERE quantity = 0 RETURNING *');
    if (result.rows.length === 0) {
      return res.status(200).send({ message: 'No hay productos vacíos para eliminar' });
    }

    res.status(200).send({ message: 'Productos vacíos eliminados', deletedProducts: result.rows });
  } catch (error) {
    console.error('Error al eliminar productos vacíos:', error);
    res.status(500).send({ error: 'Error al eliminar productos vacíos' });
  }
});

// MODIFICAR EL STOCK DE PRODUCTOS//
app.patch('/products/:productId/update-stock', async (req, res) => {
  const { productId } = req.params;
  let { quantity } = req.body;

  console.log("📥 Datos recibidos en el backend:", { productId, quantity });

  // Validar si quantity es un número válido
  quantity = Number(quantity);
  if (isNaN(quantity) || quantity < 0) {
      return res.status(400).send({ error: 'Cantidad inválida' });
  }

  try {
      const result = await pool.query(
          'UPDATE products SET quantity = $1 WHERE id = $2 RETURNING *',
          [quantity, productId]
      );

      if (result.rows.length === 0) {
          return res.status(404).send({ error: 'Producto no encontrado' });
      }

      res.status(200).send({ message: 'Stock actualizado', product: result.rows[0] });
  } catch (error) {
      console.error('❌ Error al actualizar el stock:', error);
      res.status(500).send({ error: 'Error al actualizar el stock' });
  }
});


   // MANEJO REDUCCION DEL STOCK //
   
   app.post('/cart/checkout', async (req, res) => {
    const { products } = req.body; // [{ id: 1, quantity: 2 }, { id: 3, quantity: 1 }]
  
    if (!products || !Array.isArray(products) || products.length === 0) {
      return res.status(400).send({ error: 'Productos no válidos o vacíos' });
    }
  
    try {
      const client = await pool.connect();
  
      try {
        // Iniciar una transacción
        await client.query('BEGIN');
  
        for (const product of products) {
          const { id, quantity } = product;
  
          const result = await client.query(
            'UPDATE products SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1 RETURNING *',
            [quantity, id]
          );
  
          if (result.rows.length === 0) {
            throw new Error(`Stock insuficiente para el producto con ID ${id}`);
          }
        }
  
        // Confirmar la transacción
        await client.query('COMMIT');
        res.status(200).send({ message: 'Compra finalizada y stock actualizado' });
      } catch (error) {
        // Revertir la transacción en caso de error
        await client.query('ROLLBACK');
        console.error('Error al procesar la compra:', error);
        res.status(400).send({ error: error.message });
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('Error al conectar con la base de datos:', error);
      res.status(500).send({ error: 'Error al conectar con la base de datos' });
    }
  });

  

  //TABLA DE FACTURACION//
  const crearTablaFactura = async () => {
    const query = `CREATE TABLE IF NOT EXISTS facturas (
        id SERIAL PRIMARY KEY,
        razon_social VARCHAR(255) NOT NULL,
        domicilio_comercial TEXT NOT NULL,
        condicion_iva VARCHAR(50) NOT NULL,
        cuit VARCHAR(15) NOT NULL,
        ingresos_brutos VARCHAR(50),
        fecha_inicio_actividades DATE,
        fecha_emision DATE NOT NULL
    );`;
    await pool.query(query);
};
crearTablaFactura();


/// Obtener productos desde la base de datos
app.get('/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json({ productos: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error al obtener productos');
  }
});

// Endpoint para generar factura
app.post('/factura', async (req, res) => {
  try {
    const { razonSocial, cuit, dni, condicion, formaPago, productos } = req.body;

    // Validaciones
    if (!razonSocial || !productos || productos.length === 0) {
      return res.status(400).json({ 
        error: "Faltan datos obligatorios de la factura" 
      });
    }

    let total = 0;
    for (const producto of productos) {
      if (!producto.idProducto || !producto.cantidad || !producto.precio) {
        return res.status(400).json({
          error: `El producto con ID ${producto.idProducto} está incompleto.`
        });
      }

      const result = await pool.query(
        'SELECT id, precio FROM products WHERE id = $1',
        [producto.idProducto]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: `El producto con ID ${producto.idProducto} no existe`
        });
      }

      total += result.rows[0].precio * producto.cantidad;
    }

    // Verificar si el cliente existe o insertarlo
    const clienteCheck = await pool.query(
      'SELECT id FROM clientes WHERE dni = $1',
      [dni]
    );

    let clienteId;
    if (clienteCheck.rows.length > 0) {
      clienteId = clienteCheck.rows[0].id;
    } else {
      const clienteResult = await pool.query(
        'INSERT INTO clientes (razon_social, cuit, dni, condicion) VALUES ($1, $2, $3, $4) RETURNING id',
        [razonSocial, cuit, dni, condicion]
      );
      clienteId = clienteResult.rows[0].id;
    }

    // Generar factura
    const facturaResult = await pool.query(
      'INSERT INTO facturas (cliente_id, dni, condicion, total, forma_pago) VALUES ($1, $2, $3, $4, $5) RETURNING id',
      [clienteId, dni, condicion, total, formaPago]
    );
    const facturaId = facturaResult.rows[0].id;

    // Insertar productos
    for (const producto of productos) {
      const productoResult = await pool.query(
        'SELECT precio FROM products WHERE id = $1',
        [producto.idProducto]
      );
      
      const precioUnitario = productoResult.rows[0].precio;

      await pool.query(
        'INSERT INTO facturas_productos (factura_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
        [facturaId, producto.idProducto, producto.cantidad, precioUnitario]
      );
    }

    res.json({ 
      mensaje: "Factura generada correctamente",
      facturaId 
    });

  } catch (error) {
    console.error('Error al procesar factura:', error);
    res.status(500).json({ 
      error: "Error al procesar la factura" 
    });
  }
});



httpServer.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
