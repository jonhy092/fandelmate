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
// FROTEND DE PRODUCTOS.HTML CARGA DE PRODUCTOS DESDE POSTGRESQL/
document.addEventListener("DOMContentLoaded", () => {
    const btnVerProductos = document.getElementById("btnVerProductos");
    const productsTableBody = document.getElementById("products-table-body");

    // Obtener productos de la base de datos
    btnVerProductos.addEventListener("click", async () => {
        try {
            const response = await fetch("/products");
            if (!response.ok) throw new Error("Error al obtener productos");

            const products = await response.json();
            renderProducts(products);
        } catch (error) {
            console.error(error);
            alert("Error al obtener productos");
        }
    });

    // Función para mostrar productos en la tabla
    function renderProducts(products) {
        productsTableBody.innerHTML = "";
        products.forEach(product => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.description}</td>
                <td>${product.quantity}</td>
                <td>$${product.price.toFixed(2)}</td>
                <td>${product.category}</td>
                <td>
                    <button class="btn btn-warning btn-sm update-btn" data-id="${product.id}">✏️ Editar Stock</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-id="${product.id}">🗑 Eliminar</button>
                </td>
            `;
            productsTableBody.appendChild(row);
        });

        // Agregar eventos a los botones después de renderizar la tabla
        document.querySelectorAll(".update-btn").forEach(button => {
            button.addEventListener("click", updateStock);
        });

        document.querySelectorAll(".delete-btn").forEach(button => {
            button.addEventListener("click", deleteProduct);
        });
    }

    // Actualizar stock de un producto
    async function updateStock(event) {
        const productId = event.target.dataset.id;
        const newQuantity = prompt("Ingrese la nueva cantidad:");

        if (!newQuantity || isNaN(newQuantity) || newQuantity < 0) {
            alert("Cantidad inválida.");
            return;
        }

        try {
            const response = await fetch(`/products/${productId}/reduce-stock`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ quantity: parseInt(newQuantity) })
            });

            if (!response.ok) throw new Error("Error al actualizar stock");

            alert("Stock actualizado.");
            btnVerProductos.click(); // Refrescar productos
        } catch (error) {
            console.error(error);
            alert("Error al actualizar stock.");
        }
    }

    // Eliminar un producto
    async function deleteProduct(event) {
        const productId = event.target.dataset.id;
        if (!confirm("¿Estás seguro de eliminar este producto?")) return;

        try {
            const response = await fetch(`/products/${productId}`, { method: "DELETE" });
            if (!response.ok) throw new Error("Error al eliminar producto");

            alert("Producto eliminado.");
            btnVerProductos.click(); // Refrescar productos
        } catch (error) {
            console.error(error);
            alert("Error al eliminar producto.");
        }
    }
});

    // Cargar productos al iniciar
    loadProducts();
});
