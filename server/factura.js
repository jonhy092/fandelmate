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
      const response = await fetch("http://localhost:3001/productos"); 
      const data = await response.json();

      if (!Array.isArray(data.productos)) {
          throw new Error("La respuesta del servidor no contiene un array de productos");
      }

      productos = data.productos; //  array
      console.log("Productos cargados:", productos);
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
      const filteredProducts = productos.filter(p => p.nombre && p.nombre.toLowerCase().includes(searchValue));

      filteredProducts.forEach(product => {
          const item = document.createElement("li");
          item.textContent = product.nombre;
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
  tbody.innerHTML = ""; // Asegurar que el contenido se limpie antes de actualizarlo
  let total = 0;
  
  selectedProducts.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td>${product.nombre}</td>
          <td>${product.precio}</td>
          <td><input type="number" min="1" value="${product.cantidad}" data-id="${product.id}"></td>
          <td class="subtotal">${product.precio * product.cantidad}</td>
          <td><button data-id="${product.id}">Eliminar</button></td>
      `;
      
      row.querySelector("input").addEventListener("input", updateCantidad);
      row.querySelector("button").addEventListener("click", removeProduct);
      
      tbody.appendChild(row); // Asegurar que los productos se agreguen al tbody
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
generateInvoiceButton.addEventListener("click", () => {
  const paymentMethod = paymentMethodSelect.value;
  const total = selectedProducts.reduce((sum, product) => sum + (product.precio * product.cantidad), 0);

  const facturaData = {
      razonSocial: document.getElementById("razon-social").value, // Se toma desde el input
      cuit: document.getElementById("cuit").value,
      dni: document.getElementById("dni").value,
      condicion: document.getElementById("condicion").value,
      formaPago: paymentMethod,
      productos: selectedProducts.map(product => ({
          idProducto: product.id,
          cantidad: product.cantidad
      }))
  };

  console.log("Enviando datos de factura:", facturaData); // Verifica qué se está enviando

  fetch("http://localhost:3001/factura", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(facturaData)
  })
  .then(response => response.json())
  .then(data => {
      if (data.error) {
          alert(`Error: ${data.error}`);
      } else {
          alert("Factura generada exitosamente");
      }
  })
  .catch(error => {
      console.error("Error al generar factura:", error);
  });
});

  

