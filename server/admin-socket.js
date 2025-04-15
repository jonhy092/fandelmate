import { io } from "https://cdn.socket.io/4.7.2/socket.io.esm.min.js";

const token = localStorage.getItem("token");

const socket = io("http://localhost:3001", {
  auth: {
    token
  }
});

socket.on("connect", () => {
  console.log("Socket conectado desde admin");
});

// ✅ Escuchar nuevo pedido
socket.on("nuevoPedido", (pedido) => {
  console.log("Nuevo pedido recibido:", pedido);

  // Aquí actualizás el DOM dinámicamente
  const tbody = document.getElementById("pedidos-table-body");
  if (tbody) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${pedido.cliente_nombre}</td>
      <td>${pedido.cliente_email}</td>
      <td>${pedido.cliente_telefono}</td>
      <td>${pedido.total}</td>
      <td><strong>${pedido.estado}</strong></td>
    `;
    tbody.prepend(row);
  }
});
