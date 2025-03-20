

import express from 'express';
//import { guardarFactura, obtenerFacturasPorFecha } from '../fan_mate3/app.js';
import bcrypt from 'bcryptjs';
import cors from 'cors';
import jwt from'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import db from'./db.js';
import pool  from './db.js';
import dotenv from 'dotenv';
import PDFDocument from 'pdfkit';
import fs from 'fs';



// Obtener la ruta del directorio actual
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Configurar dotenv
dotenv.config({ path: path.join(__dirname, '../.env') });




const app = express();
const PORT = process.env.PORT || 3001;
app.use(cors());

app.use(express.json());// parseo JSON.. para que el body sea un json
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.json());  // Habilita la lectura de JSON en las peticiones POST
app.use(express.urlencoded({ extended: true })); // Habilita datos de formularios




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
    const result = await pool.query('SELECT * FROM products ORDER BY id');
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
app.patch('/products/:productId/reduce-stock', async (req, res) => {
  const { productId } = req.params;
  let { quantity } = req.body;

  console.log("Datos recibidos en el backend:", { productId, quantity }); // <-- LOG PARA DEPURAR

  // Validar si quantity es un número válido
  quantity = Number(quantity);
  if (!quantity || isNaN(quantity) || quantity <= 0) {
      console.log("Cantidad inválida:", quantity); // <-- LOG PARA DEPURAR
      return res.status(400).send({ error: 'Cantidad inválida' });
  }

  try {
      const result = await pool.query(
          'UPDATE products SET quantity = quantity - $1 WHERE id = $2 AND quantity >= $1 RETURNING *',
          [quantity, productId]
      );

      if (result.rows.length === 0) {
          console.log("Stock insuficiente o producto no encontrado"); // <-- LOG PARA DEPURAR
          return res.status(400).send({ error: 'Stock insuficiente o producto no encontrado' });
      }

      console.log("Stock actualizado correctamente:", result.rows[0]); // <-- LOG PARA DEPURAR
      res.status(200).send({ message: 'Stock actualizado', product: result.rows[0] });
  } catch (error) {
      console.error('Error al actualizar el stock:', error);
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

  
//RUTA DE REMITO//
  app.post('/guardar-remito', async (req, res) => {
    try {
        let {
            fecha,
            cuit,
            nombre,
            domicilio,
            localidad,
            condiciones,
            cantidad,
            descripcion
        } = req.body;

        console.log('Datos recibidos:', req.body); // Para depuración

        // Verificar si cantidad es un array y convertir a números
        if (Array.isArray(cantidad)) {
            cantidad = cantidad.map(num => parseInt(num, 10) || 0); // Convertir cada valor a número
        } else {
            cantidad = [parseInt(cantidad, 10) || 0]; // Convertir a array si es un solo valor
        }

        // Asegurar que descripcion es un array
        if (!Array.isArray(descripcion)) {
            descripcion = [descripcion]; // Convertir a array si es un solo valor
        }

        // Validar que ambos arrays tengan la misma longitud
        if (cantidad.length !== descripcion.length) {
            return res.status(400).json({ error: "Los arrays de cantidad y descripción no coinciden en longitud" });
        }

        // Insertar múltiples líneas si hay varias cantidades/descripciones
        const query = `
            INSERT INTO remitos (fecha, cuit, nombre, domicilio, localidad, condiciones, cantidad, descripcion)
            VALUES ${cantidad.map((_, i) => `($1, $2, $3, $4, $5, $6, $${i + 7}, $${i + 8})`).join(", ")}
            RETURNING *;
        `;

        const values = [fecha, cuit, nombre, domicilio, localidad, condiciones, ...cantidad.flat(), ...descripcion.flat()];

        const result = await pool.query(query, values);

        res.status(201).json({ message: "Remito guardado correctamente", remito: result.rows });
    } catch (err) {
        console.error('Error al guardar el remito:', err);
        res.status(500).json({ error: "Error al guardar el remito" });
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

// Ruta para crear una nueva factura
app.post('/api/facturas', async (req, res) => {
  console.log('POST /api/facturas');
  const { razon_social, domicilio_comercial, condicion_iva, cuit, ingresos_brutos, fecha_inicio_actividades, fecha_emision } = req.body;
  console.log('Datos de la factura:', razon_social, domicilio_comercial, condicion_iva, cuit, ingresos_brutos, fecha_inicio_actividades, fecha_emision);
  try {
    const result = await guardarFactura({ razon_social, domicilio_comercial, condicion_iva, cuit, ingresos_brutos, fecha_inicio_actividades, fecha_emision });
    res.json({ message: 'Factura guardada', factura: result });
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar la factura' });
  }
});

// Ruta para generar y descargar facturas en PDF por fecha
app.get('/api/facturas/pdf', async (req, res) => {
  const { desde, hasta } = req.query;

  try {
    const result = await obtenerFacturasPorFecha(desde, hasta);

    if (result.length === 0) {
      return res.status(404).json({ error: 'No hay facturas en ese rango de fechas' });
    }

    const doc = new PDFDocument();
    const filePath = `facturas_${desde}_a_${hasta}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    doc.fontSize(18).text('Facturación AFIP', { align: 'center' });
    doc.moveDown();

    result.forEach(factura => {
      doc.fontSize(12).text(`Razón Social: ${factura.razon_social}`);
      doc.text(`Domicilio Comercial: ${factura.domicilio_comercial}`);
      doc.text(`Condición frente al IVA: ${factura.condicion_iva}`);
      doc.text(`CUIT: ${factura.cuit}`);
      doc.text(`Ingresos Brutos: ${factura.ingresos_brutos}`);
      doc.text(`Fecha de Inicio de Actividades: ${factura.fecha_inicio_actividades}`);
      doc.text(`Fecha de Emisión: ${factura.fecha_emision}`);
      doc.moveDown();
    });

    doc.end();

    res.download(filePath, (err) => {
      if (err) {
        console.error('Error al descargar el PDF:', err);
        res.status(500).json({ error: 'Error al generar el PDF' });
      }
      fs.unlinkSync(filePath); // Borra el archivo después de la descarga
    });

  } catch (error) {
    res.status(500).json({ error: 'Error al generar el PDF' });
  }
});
  


  
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
