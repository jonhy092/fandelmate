document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("facturaForm");

    if (!form) {
        console.error("Formulario no encontrado en el DOM.");
        return;
    }

    form.addEventListener("submit", function (event) {
        event.preventDefault(); // Evitar el envío tradicional del formulario

        const formData = new FormData(form);

        // Obtener valores del formulario
        const fecha = formData.get("fecha");
        const cuit = formData.get("cuit");
        const nombre = formData.get("nombre");
        const domicilio = formData.get("domicilio");
        const localidad = formData.get("localidad");
        const condiciones = formData.get("condiciones");

        // Obtener cantidades y descripciones como arrays
        const cantidad = formData.getAll("cantidad").map(num => parseInt(num, 10) || 0);
        const descripcion = formData.getAll("descripcion").map(desc => desc.trim());

        // Validar que ambos arrays tengan la misma longitud
        if (cantidad.length !== descripcion.length) {
            console.error("Error: La cantidad de elementos en 'cantidad' y 'descripcion' no coincide.");
            return;
        }

        // Crear objeto con los datos
        const data = {
            fecha: fecha,
            cuit: cuit,
            nombre: nombre,
            domicilio: domicilio,
            localidad: localidad,
            condiciones: condiciones,
            cantidad: cantidad, // Array de números
            descripcion:descripcion // Array de strings
        };

        console.log("Datos a enviar:", data);

        // Enviar datos al backend
        fetch('http://localhost:8080/guardar-remito', {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Error en la solicitud: ${response.status}`);
            }
            return response.json();
        })
        .then(result => {
            console.log("Remito guardado:", result);
            alert("Remito guardado con éxito.");
        })
        .catch(error => console.error("Error:", error));
    });

    // Función para generar el PDF DE REMITO
    function generarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const remitoContent = document.querySelector(".contfac");

        if (!remitoContent) {
            console.error("No se encontró el contenido del remito.");
            return;
        }

        doc.html(remitoContent.innerHTML, {
            callback: function (doc) {
                doc.save("remito.pdf");
            },
            x: 10,
            y: 10,
            width: 190,
            autoPaging: "text"
        });
    }

    // Verificar que el botón de descarga exista antes de asignar evento
    const descargarBtn = document.getElementById("descargarFactura");
    if (descargarBtn) {
        descargarBtn.addEventListener("click", generarPDF);
    } else {
        console.warn("Botón de descarga no encontrado en el DOM.");
    }
});

