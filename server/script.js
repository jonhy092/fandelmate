document.addEventListener("DOMContentLoaded", () => {
    const btnVerProductos = document.getElementById("btnVerProductos");
    const productsTableBody = document.getElementById("products-table-body");

    if (!productsTableBody) {
        console.error("Error: No se encontró 'products-table-body' en el DOM.");
        return;
    }

    async function loadProducts() {
        fetch("http://localhost:3002/products")
            .then(response => response.json())
            .then(products => {
                console.log("Productos recibidos del backend:", products); // Verifica la respuesta en consola
                console.log("Productos recibidos del backend:", products);
                renderProducts(products);
            })
            .catch(error => {
                console.error("Error al obtener productos:", error);
            });
    }
    

    btnVerProductos.addEventListener("click", loadProducts);

    function renderProducts(products) {
        if (!productsTableBody) {
            console.error("Error: 'productsTableBody' es null.");
            return;
        }
    
        productsTableBody.innerHTML = ""; // Limpia la tabla antes de agregar nuevos productos
        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.quantity}</td>
                <td>$${product.price}</td>
                <td>${product.category_name || "Sin categoría"}</td>  <!-- Aquí se usa category_name -->
                <td>
                    <img src="${product.image_url}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                    <button class="btn btn-warning btn-sm update-btn" data-id="${product.id}">✏️ Editar Stock</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">🗑 Eliminar</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });
    
        document.querySelectorAll(".update-btn").forEach(button => {
            button.addEventListener("click", updateStock);
        });
    
        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", deleteProduct);
        });
    }
    
//ACTUALIZAR STOCK DE PRODUCTOS//
async function updateStock(event) {
    const productId = event.target.dataset.id;
    const newQuantity = prompt("Ingrese la nueva cantidad:");

    if (!newQuantity || isNaN(newQuantity) || newQuantity < 0) {
        alert("Cantidad inválida.");
        return;
    }

    try {
        const response = await fetch(`http://localhost:3002/products/${productId}/update-stock`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ quantity: parseInt(newQuantity) })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || "Error al actualizar stock");
        }

        alert("Stock actualizado.");
        loadProducts(); // Recargar la lista de productos
    } catch (error) {
        console.error(error);
        alert("Error al actualizar stock.");
    }
}
//ELIMINAR PRODUCTOS//


    async function deleteProduct(event) {
        const productId = event.target.dataset.id;
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;

        try {
            const response = await fetch(`http://localhost:3002/products/${productId}`, { method: "DELETE" });
            if (!response.ok) {
                throw new Error("Error al eliminar producto");
            }

            alert("Producto eliminado.");
            loadProducts();
        } catch (error) {
            console.error(error);
            alert("Error al eliminar producto.");
        }
    }
});
