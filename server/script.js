document.addEventListener("DOMContentLoaded", () => {
    const btnVerProductos = document.getElementById("btnVerProductos");
    const productsTableBody = document.getElementById("products-table-body");

    if (!productsTableBody) {
        console.error("Error: No se encontró 'products-table-body' en el DOM.");
        return;
    }

    async function loadProducts() {
        try {
            const response = await fetch("http://localhost:3001/products");

            if (!response.ok) {
                throw new Error(`Error en la respuesta del servidor: ${response.status}`);
            }

            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error("Error cargando productos:", error);
            alert("Hubo un error al obtener los productos. Verifica que el servidor esté corriendo.");
        }
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
                <td>${product.category}</td>
                <td>
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
        const response = await fetch(`http://localhost:3001/products/${productId}/update-stock`, {
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
            const response = await fetch(`http://localhost:3001/products/${productId}`, { method: "DELETE" });
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
