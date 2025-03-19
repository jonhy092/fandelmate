document.addEventListener("DOMContentLoaded", () => {
    const productsTableBody = document.getElementById("products-table-body");

    // Cargar productos
    async function loadProducts() {
        try {
            const response = await fetch("/productos");
            const products = await response.json();
            productsTableBody.innerHTML = ""; // Limpiar tabla
            products.forEach(product => {
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${product.id}</td>
                    <td>${product.nombre}</td>
                    <td>${product.descripcion}</td>
                    <td>${product.cantidad}</td>
                    <td>${product.precio}</td>
                    <td>${product.categoria}</td>
                    <td>
                        <button class="btn btn-warning btn-sm" onclick="editProduct(${product.id})">Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">Eliminar</button>
                    </td>
                `;
                productsTableBody.appendChild(row);
            });
        } catch (error) {
            console.error("Error cargando productos:", error);
        }
    }

    // Agregar producto
    document.getElementById("add-product-form")?.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const newProduct = Object.fromEntries(formData);
        
        try {
            await fetch("/productos", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newProduct)
            });
            loadProducts();
            e.target.reset();
        } catch (error) {
            console.error("Error agregando producto:", error);
        }
    });

    // Editar producto
    window.editProduct = async (id) => {
        const nombre = prompt("Nuevo nombre:");
        const descripcion = prompt("Nueva descripción:");
        const cantidad = prompt("Nueva cantidad:");
        const precio = prompt("Nuevo precio:");
        const categoria = prompt("Nueva categoría:");

        if (nombre && descripcion && cantidad && precio && categoria) {
            try {
                await fetch(`/productos/${id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ nombre, descripcion, cantidad, precio, categoria })
                });
                loadProducts();
            } catch (error) {
                console.error("Error editando producto:", error);
            }
        }
    };

    // Eliminar producto
    window.deleteProduct = async (id) => {
        if (confirm("¿Seguro que quieres eliminar este producto?")) {
            try {
                await fetch(`/productos/${id}`, { method: "DELETE" });
                loadProducts();
            } catch (error) {
                console.error("Error eliminando producto:", error);
            }
        }
    };

    // Cargar productos al iniciar
    loadProducts();
});
