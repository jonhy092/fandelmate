document.addEventListener('DOMContentLoaded', function () {
    // Datos de ejemplo de la factura (esto lo recuperamos del backend)
    const cliente = {
      razonSocial: 'Empresa Ejemplo S.A.',
      cuit: '20-12345678-9',
      dni: '12345678'
    };
  
    const productos = [
      { nombre: 'Producto 1', precio: 100, cantidad: 2 },
      { nombre: 'Producto 2', precio: 200, cantidad: 1 }
    ];
  
    // Fecha de emisión
    const fechaEmision = new Date().toLocaleDateString();
    document.getElementById('fecha-emision').textContent = fechaEmision;
  
    // Datos del cliente
    document.getElementById('razon-social').textContent = cliente.razonSocial;
    document.getElementById('cuit').textContent = cliente.cuit;
    document.getElementById('dni').textContent = cliente.dni;
  
    // Rellenar la tabla de productos
    let totalFactura = 0;
    const productosLista = document.getElementById('productos-lista');
    productos.forEach(producto => {
      const totalProducto = producto.precio * producto.cantidad;
      totalFactura += totalProducto;
  
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${producto.nombre}</td>
        <td>$${producto.precio}</td>
        <td>${producto.cantidad}</td>
        <td>$${totalProducto}</td>
      `;
      productosLista.appendChild(tr);
    });
  
    // Mostrar el total
    document.getElementById('total-factura').textContent = `$${totalFactura}`;
  });
  

