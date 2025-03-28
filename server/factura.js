// frontend: buscador y selección de productos
const searchInput = document.getElementById("search-product");
const productList = document.getElementById("product-list");
const selectedProductsTable = document.getElementById("selected-products");
const totalOutput = document.getElementById("total");
const generateInvoiceButton = document.getElementById("generate-invoice");
const paymentMethodSelect = document.getElementById("payment-method");

let productos = [];
let selectedProducts = [];

// Obtener productos desde la base de datos
async function fetchProductos() {
  try {
    const response = await fetch("http://localhost:8080/productos");
    const data = await response.json();

    if (!Array.isArray(data.productos)) {
      throw new Error("La respuesta del servidor no contiene un array de productos");
    }

    productos = data.productos;
    console.log("Productos cargados:", productos);

    // Verifica si ya hay productos cargados en la tabla al abrir la página
    updateTable();
    
  } catch (error) {
    console.error("Error al obtener productos:", error);
  }
}


document.addEventListener("DOMContentLoaded", fetchProductos);

// Filtrar productos mientras se escribe
searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  productList.innerHTML = "";

  if (!Array.isArray(productos)) {
    console.error("Error: productos no es un array", productos);
    return;
  }

  if (searchValue) {
    const filteredProducts = productos.filter(p => p.name && p.name.toLowerCase().includes(searchValue));
 

    filteredProducts.forEach(product => {
      const item = document.createElement("li");
      item.textContent = product.name;

      item.addEventListener("click", () => selectProduct(product));
      productList.appendChild(item);
    });
  }
});


// Agregar producto a la tabla
function selectProduct(product) {
    searchInput.value = "";
    productList.innerHTML = "";
    
    if (selectedProducts.find(p => p.id === product.id)) {
        alert("Este producto ya fue seleccionado");
        return;
    }
    
    product.cantidad = 1;
    selectedProducts.push(product);
    updateTable();
}

// Actualizar tabla de productos seleccionados
function updateTable() {
  const tbody = selectedProductsTable.querySelector("tbody");
  tbody.innerHTML = ""; // Limpiar el contenido antes de actualizar
  let total = 0;

  selectedProducts.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${product.name}</td>
          <td>${product.precio}</td>
          <td><input type="number" min="1" value="${product.cantidad}" data-id="${product.id}"></td>
          <td class="subtotal">${product.precio * product.cantidad}</td>
          <td><button data-id="${product.id}">Eliminar</button></td>
      `;

      // Actualización dinámica del subtotal cuando se cambia la cantidad
      row.querySelector("input").addEventListener("input", updateCantidad);
      row.querySelector("button").addEventListener("click", removeProduct);

      tbody.appendChild(row);
      total += product.precio * product.cantidad;
  });

  totalOutput.textContent = `Total a pagar: $${total}`;
}


// Actualizar cantidad del producto
function updateCantidad(event) {
    const id = event.target.getAttribute("data-id");
    const cantidad = parseInt(event.target.value);
    
    const product = selectedProducts.find(p => p.id == id);
    if (product) {
        product.cantidad = cantidad;
    }
    updateTable();
}

// Eliminar producto de la lista
function removeProduct(event) {
    const id = event.target.getAttribute("data-id");
    selectedProducts = selectedProducts.filter(p => p.id != id);
    updateTable();
}

// Generar factura y enviarla al backend
// Modificar el evento del botón generar factura
generateInvoiceButton.addEventListener("click", async () => {
  // Validar campos obligatorios
  const razonSocial = document.getElementById("razon-social").value.trim();
  const cuit = document.getElementById("cuit").value.trim();
  const dni = document.getElementById("dni").value.trim();

  if (!razonSocial || !cuit || !dni || selectedProducts.length === 0) {
    alert("Por favor complete todos los campos obligatorios");
    return;
  }

  // Crear objeto factura
  const facturaData = {
    razonSocial,
    cuit,
    dni,
    condicion: document.getElementById("condicion").value,
    formaPago: paymentMethodSelect.value,
    productos: selectedProducts.map(product => ({
      idProducto: product.id,
      cantidad: product.cantidad
    }))
  };

  try {
    const response = await fetch("http://localhost:8080/factura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facturaData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al generar la factura');
    }

    const data = await response.json();
    console.log('Factura generada:', data);

    // Descargar PDF
    window.open(`http://localhost:8080/factura/descargar/${data.facturaId}`, '_blank');

  } catch (error) {
    console.error('Error:', error);
    alert('Error al generar la factura: ' + error.message);
  }
});

  

