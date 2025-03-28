import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const socket = io("http://localhost:3001");
const pedidosTableBody = document.getElementById("pedidos-table-body");

socket.on("nuevoPedido", (pedido) => {
    console.log("Nuevo pedido recibido:", pedido);

    const row = document.createElement("tr");
    row.innerHTML = `
        <td>${pedido.cliente.nombre}</td>
        <td>${pedido.cliente.email}</td>
        <td>${pedido.cliente.telefono}</td>
        <td>${pedido.productos.map(p => `${p.nombre} (${p.cantidad})`).join(", ")}</td>
        <td>$${pedido.total}</td>
        <td>
            <button class="btn btn-primary ver-pedido">Ver Pedido</button>
        </td>
    `;

    pedidosTableBody.appendChild(row);
});
//descarga en pdf//
import { jsPDF } from "jspdf";

document.addEventListener("click", (e) => {
    if (e.target.classList.contains("ver-pedido")) {
        const row = e.target.closest("tr");
        const cliente = row.children[0].innerText;
        const email = row.children[1].innerText;
        const telefono = row.children[2].innerText;
        const productos = row.children[3].innerText;
        const total = row.children[4].innerText;

        const doc = new jsPDF();
        doc.text("Factura de Pedido", 20, 20);
        doc.text(`Cliente: ${cliente}`, 20, 40);
        doc.text(`Email: ${email}`, 20, 50);
        doc.text(`Teléfono: ${telefono}`, 20, 60);
        doc.text(`Productos: ${productos}`, 20, 80);
        doc.text(`Total: ${total}`, 20, 100);
        doc.save("pedido.pdf");
    }
});
