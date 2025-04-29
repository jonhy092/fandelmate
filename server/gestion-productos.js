document.addEventListener("DOMContentLoaded", () => {
    const productForm = document.getElementById("product-form");

    productForm.addEventListener("submit", async (event) => {
        event.preventDefault(); // Evitar el envío por defecto

        const formData = new FormData();
        formData.append("name", document.getElementById("productName").value.trim());
        formData.append("description", document.getElementById("description").value.trim());
        formData.append("price", parseFloat(document.getElementById("price").value));
        formData.append("quantity", parseInt(document.getElementById("quantity").value));
        formData.append("category_id", parseInt(document.getElementById("category_id").value));
        
        // Capturar la imagen seleccionada
        const imageFile = document.getElementById("productImage").files[0];
        if (!imageFile) {
            alert("Por favor, selecciona una imagen.");
            return;
        }
        formData.append("image", imageFile);

        try {
            const response = await fetch("http://localhost:3001/products", { 
                method: "POST",
                body: formData, // Enviar los datos con FormData
            });

            const result = await response.text(); // Recibir la respuesta del servidor

            if (response.ok) {
                alert("Producto agregado con éxito!");
                productForm.reset(); // Limpiar el formulario después de enviarlo
            } else {
                alert("Error al agregar producto: " + result);
            }
        } catch (error) {
            console.error("Error al enviar los datos:", error);
            alert("Producto añadido");
        }
    });
});
