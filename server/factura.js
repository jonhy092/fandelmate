document.addEventListener('DOMContentLoaded', () => {
    cargarFacturas();

async function cargarFacturas() {
    try {
        const response = await fetch("http://localhost:3001/facturas");
        const facturas = await response.json();
        const facturasList = document.getElementById('facturas-list');
        
        facturasList.innerHTML = ''; // Limpiar la tabla antes de agregar nuevas filas
        
        facturas.forEach(factura => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${factura.id}</td>
                <td>${factura.cliente_nombre}</td>
                <td>${new Date(factura.fecha).toLocaleDateString()}</td>
                <td>$${factura.total.toFixed(2)}</td>
                <td><button class="btn-download" data-id="${factura.id}">Descargar PDF</button></td>
            `;
            facturasList.appendChild(row);
        });

        // Añadir evento a los botones de descarga
        document.querySelectorAll('.btn-download').forEach(button => {
            button.addEventListener('click', (e) => {
                const facturaId = e.target.getAttribute('data-id');
                descargarFacturaPDF(facturaId);
            });
        });
    } catch (error) {
        console.error('Error al cargar facturas:', error);
    }
}

async function descargarFacturaPDF(facturaId) {
    try {
        const response = await fetch(`http://localhost:3001/factura-pdf/${facturaId}`);
        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `factura-${facturaId}.pdf`;
        link.click();
    } catch (error) {
        console.error('Error al descargar PDF:', error);
    }
}
});
//document.addEventListener('DOMContentLoaded', cargarFacturas);

