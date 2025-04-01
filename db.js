import dotenv from 'dotenv';
import pkg from 'pg';
import path from 'path';
const { Pool } = pkg; 
// Obtener la ruta del directorio actual
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Configurar dotenv
dotenv.config({ path: path.join(process.cwd(), '.env') });
//console.log('Password:', typeof process.env.DB_PASSWORD, process.env.DB_PASSWORD);




// Crear el pool de conexiones
const pool = new Pool({
  user: process.env.DB_USER,
  host: '127.0.0.1',
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
  
});

// Conectar y realizar una prueba
pool.connect()
  .then(client => {
    console.log('Conexión exitosa');
    client.release(); // Liberar el cliente si es necesario
  })
  .catch(err => {
    console.error('Error al conectar a la base de datos', err);
  });

export default pool;
