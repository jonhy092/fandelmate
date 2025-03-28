import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io("http://localhost:8080");

document.querySelector(".btn-finish-buy").addEventListener("click", () => {
    const nombre = document.getElementById("nameAndSurname").value;
    const email = document.getElementById("email").value;
    const telefono = "123456789"; // Reemplazar con el input real
    const dni = "12345678"; // Reemplazar con el input real
    const direccion = "Av. Ejemplo 123"; // Reemplazar con input real
    const fechaEntrega = "2025-03-22"; // Generar dinámicamente
    const formaPago = document.querySelector('input[name="payment"]:checked').value;

    const productos = Array.from(document.querySelectorAll(".cart-products-added tr")).map(row => ({
        nombre: row.children[0].innerText,
        precio: parseFloat(row.children[1].innerText.replace("$", "")),
        cantidad: parseInt(row.children[2].querySelector("input").value),
        subtotal: parseFloat(row.children[3].innerText.replace("$", ""))
    }));

    const total = productos.reduce((acc, p) => acc + p.subtotal, 0);

    const pedido = {
        cliente: { nombre, email, telefono, dni },
        envio: { direccion, fechaEntrega },
        productos,
        formaPago,
        total
    };

    // Enviar datos al backend
    fetch("http://localhost:8080/pedido", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pedido)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Pedido enviado:", data);
        socket.emit("nuevoPedido", pedido); // Notificar en tiempo real
    })
    .catch(error => console.error("Error al enviar el pedido:", error));
});
