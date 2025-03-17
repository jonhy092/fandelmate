//FRONT DE FACTURAS//
document.getElementById('facturaForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const factura = {
        razon_social: document.getElementById('razon_social').value,
        domicilio_comercial: document.getElementById('domicilio_comercial').value,
        condicion_iva: document.querySelector('input[name="condicion_iva"]:checked').value,
        cuit: document.getElementById('cuit').value,
        ingresos_brutos: document.getElementById('ingresos_brutos').value,
        fecha_inicio_actividades: document.getElementById('fecha_inicio').value,
        fecha_emision: new Date().toISOString().split('T')[0],
    };
    console.log(factura);
    const res = await fetch('http://localhost:3001/api/facturas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(factura)
    });
    if (res.ok) alert('Factura generada correctamente');
});

document.getElementById('descargarFactura').addEventListener('click', () => {
    const desde = document.getElementById('desde').value;
    const hasta = document.getElementById('hasta').value;
    if (desde && hasta) {
        window.location.href = `http://localhost:3001/api/facturas/pdf?desde=${desde}&hasta=${hasta}`;
    } else {
        alert('Selecciona un rango de fechas');
    }
});
