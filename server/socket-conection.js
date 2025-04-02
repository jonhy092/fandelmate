document.querySelector(".btn-finish-buy").addEventListener("click", async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Usuario no autenticado');
        }

        const nombre = document.getElementById("nameAndSurname").value;
        const email = document.getElementById("email").value;
        const telefono = document.getElementById("phone").value || "123456789";
        const dni = document.getElementById("dni").value || "12345678";
        const direccion = document.getElementById("address").value || "Av. Ejemplo 123";
        const fechaEntrega = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const formaPago = document.querySelector('input[name="payment"]:checked').value;
        const necesitaEnvio = document.getElementById("needsShipping").checked;

        const productos = Array.from(document.querySelectorAll(".cart-products-added tr")).map(row => ({
            id: parseInt(row.dataset.productId),
            nombre: row.children[0].innerText,
            precio: parseFloat(row.children[1].innerText.replace("$", "")),
            cantidad: parseInt(row.children[2].querySelector("input").value),
            subtotal: parseFloat(row.children[3].innerText.replace("$", ""))
        }));

        const total = productos.reduce((acc, p) => acc + p.subtotal, 0);

        const pedido = {
            cliente: { 
                nombre, 
                email, 
                telefono, 
                dni 
            },
            envio: { 
                direccion, 
                fechaEntrega 
            },
            productos,
            formaPago,
            total,
            necesitaEnvio,
            tieneDescuento: false
        };

        // Enviar datos al backend
        const response = await fetch("http://localhost:3001/api/pedidos", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(pedido)
        });

        if (!response.ok) {
            throw new Error('Error al procesar el pedido');
        }

        const data = await response.json();
        console.log("Pedido enviado:", data);
        
        // Notificar en tiempo real (opcional)
        const socket = io("http://localhost:3001", {
            auth: { token }
        });
        socket.emit("nuevoPedido", data.pedido);
        
        // Redirigir o mostrar mensaje de éxito
        alert("Pedido realizado con éxito!");
        window.location.href = "gracias.html";

    } catch (error) {
        console.error("Error al enviar el pedido:", error);
        alert(`Error: ${error.message}`);
    }
});
