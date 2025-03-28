const socket = io("http://localhost:3001");
const pedidosTableBody = document.getElementById("pedidos-table-body");

// Manejar nuevos pedidos
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
            <button class="btn btn-success procesar-pedido" data-id="${pedido.id}">Procesar</button>
            <button class="btn btn-primary ver-pedido">Ver PDF</button>
        </td>
    `;
    
    pedidosTableBody.prepend(row);
});

// Manejar pedidos anteriores al conectarse
socket.on("pedidosAnteriores", (pedidos) => {
    pedidosTableBody.innerHTML = "";
    pedidos.forEach(pedido => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${pedido.cliente.nombre}</td>
            <td>${pedido.cliente.email}</td>
            <td>${pedido.cliente.telefono}</td>
            <td>${pedido.productos.map(p => `${p.nombre} (${p.cantidad})`).join(", ")}</td>
            <td>$${pedido.total}</td>
            <td>
                <button class="btn btn-success procesar-pedido" data-id="${pedido.id}">Procesar</button>
                <button class="btn btn-primary ver-pedido">Ver PDF</button>
            </td>
        `;
        pedidosTableBody.appendChild(row);
    });
});

// Procesar pedido (reducir stock)
document.addEventListener("click", async (e) => {
    if (e.target.classList.contains("procesar-pedido")) {
        const pedidoId = e.target.getAttribute("data-id");
        try {
            const response = await fetch(`http://localhost:3001/procesar-pedido/${pedidoId}`, {
                method: "POST"
            });
            
            if (response.ok) {
                e.target.textContent = "Procesado";
                e.target.classList.remove("btn-success");
                e.target.classList.add("btn-secondary");
                e.target.disabled = true;
            }
        } catch (error) {
            console.error("Error al procesar pedido:", error);
        }
    }
    
    // Generar PDF (similar a tu código actual)
    if (e.target.classList.contains("ver-pedido")) {
        // ... tu código actual para generar PDF ...
    }
});