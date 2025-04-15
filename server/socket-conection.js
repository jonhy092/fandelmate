import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

document.querySelector(".btn-finish-buy").addEventListener("click", async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Usuario no autenticado');

    // ... todos tus datos del pedido ...

    const response = await fetch("http://localhost:3001/api/pedidos", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify(pedido)
    });

    if (!response.ok) throw new Error('Error al procesar el pedido');

    const data = await response.json();
    console.log("Pedido enviado:", data);

    // ✅ ENVIAR EVENTO AL ADMIN VÍA SOCKET.IO
    const socket = io("http://localhost:3001", {
      auth: {
        token
      }
    });

    socket.emit("nuevoPedido", data.pedido); // este evento lo debería escuchar el admin

    // ✅ Darle tiempo a emitir antes de redirigir
    setTimeout(() => {
      alert("Pedido realizado con éxito!");
      window.location.href = "gracias.html";
    }, 500);

  } catch (error) {
    console.error("Error al enviar el pedido:", error);
    alert(`Error: ${error.message}`);
  }
});
