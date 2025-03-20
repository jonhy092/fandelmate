document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");

    productForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evitar el envío por defecto

        // Capturar los valores del formulario
        const productData = {
            name: document.getElementById("productName").value.trim(),
            description: document.getElementById("description").value.trim(),
            price: parseFloat(document.getElementById("price").value),
            quantity: parseInt(document.getElementById("quantity").value),
            category_id: parseInt(document.getElementById("category_id").value),
        };

        try {
            const response = await fetch("http://localhost:3000/products", { // Cambia la URL según tu backend
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(productData)
            });

            const result = await response.json();

            if (response.ok) {
                alert("Producto agregado con éxito!");
                productForm.reset(); // Limpiar el formulario después de enviarlo
            } else {
                alert("Error al agregar producto: " + result.message);
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            alert("Hubo un problema al agregar el producto.");
        }
    });
});
