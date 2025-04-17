import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
//import { jsPDF } from "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

class PedidosManager {
  constructor() {
    this.socket = null;
    this.token = localStorage.getItem('token');
    this.initSocket();
    this.initElements();
    this.initEventListeners();
    this.pedidosPendientes = 0;
    this.cargarPedidos();
  }

  initSocket() {
    this.socket = io("http://localhost:3001", {
      auth: { token: this.token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000
    });

    this.socket.on('connect', () => {
      console.log('Conectado a Socket.io');
      this.socket.emit('joinAdminRoom', 'admin');
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Desconectado:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('connect_error', (err) => {
      console.error('Error de conexión:', err.message);
      this.mostrarError('Error de conexión con el servidor');
    });

    this.socket.on('nuevoPedido', (pedido) => {
      this.handleNuevoPedido(pedido);
    });
  }

  initElements() {
    this.elements = {
      tablaPedidos: document.getElementById("tablaPedidos"),
      badgePedidos: document.getElementById("badgePedidos"),
      btnPedidos: document.getElementById("btnPedidos"),
      seccionPedidos: document.getElementById("seccionPedidos"),
      btnCerrarPedidos: document.getElementById("btnCerrarPedidos"),
      paginacion: document.getElementById("paginacionPedidos"),
      loading: document.getElementById("loadingPedidos"),
      errorContainer: document.getElementById("errorPedidos")
    };
  }

  initEventListeners() {
    this.elements.btnPedidos.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleSeccionPedidos();
    });

    this.elements.btnCerrarPedidos.addEventListener('click', () => {
      this.elements.seccionPedidos.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
      if (e.target.closest('.btnProcesar')) {
        this.procesarPedido(e);
      }
      if (e.target.closest('.btnVer')) {
        this.generarPDF(e);
      }
      if (e.target.closest('.page-link')) {
        this.cambiarPagina(e);
      }
    });
  }

  async cargarPedidos(pagina = 1, limite = 10) {
    this.mostrarLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/pedidos?pagina=${pagina}&limite=${limite}`, {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const { data, paginacion } = await response.json();
      
      this.pedidosPendientes = data.filter(p => p.estado === 'pendiente').length;
      this.actualizarBadge();
      this.mostrarPedidos(data);
      this.mostrarPaginacion(paginacion);
      
    } catch (error) {
      console.error('Error al cargar pedidos:', error);
      this.mostrarError('Error al cargar pedidos. Intente nuevamente.');
    } finally {
      this.mostrarLoading(false);
    }
  }

  mostrarLoading(mostrar) {
    this.elements.loading.style.display = mostrar ? 'block' : 'none';
    this.elements.tablaPedidos.style.display = mostrar ? 'none' : 'table';
  }

  mostrarError(mensaje) {
    this.elements.errorContainer.textContent = mensaje;
    this.elements.errorContainer.style.display = 'block';
    
    setTimeout(() => {
      this.elements.errorContainer.style.display = 'none';
    }, 5000);
  }

  toggleSeccionPedidos() {
    const display = this.elements.seccionPedidos.style.display;
    this.elements.seccionPedidos.style.display = display === 'none' ? 'block' : 'none';
    
    if (this.elements.seccionPedidos.style.display === 'block') {
      this.cargarPedidos();
    }
  }

  actualizarBadge() {
    this.elements.badgePedidos.textContent = this.pedidosPendientes;
    this.elements.badgePedidos.classList.toggle('d-none', this.pedidosPendientes === 0);
    
    if (this.pedidosPendientes > 0) {
      this.elements.badgePedidos.classList.add('animate__animated', 'animate__pulse');
      setTimeout(() => {
        this.elements.badgePedidos.classList.remove('animate__animated', 'animate__pulse');
      }, 1000);
    }
  }

  formatearFecha(fechaStr) {
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(fechaStr).toLocaleDateString('es-AR', opciones);
  }

  mostrarPedidos(pedidos) {
    this.elements.tablaPedidos.innerHTML = '';
  
    if (pedidos.length === 0) {
      const sinPedidos = document.createElement('div');
      sinPedidos.className = "fila-pedido";
      sinPedidos.innerHTML = '<div style="grid-column: span 8; text-align:center;">No hay pedidos</div>';
      this.elements.tablaPedidos.appendChild(sinPedidos);
      return;
    }
  
    pedidos.forEach(pedido => {
      const productos = pedido.productos;
      const productosStr = productos.map(p => 
        `${p.nombre} (${p.cantidad} x $${p.precio.toFixed(2)})`
      ).join('<br>');
  
      const fila = document.createElement('div');
      fila.className = 'fila-pedido';
      fila.innerHTML = `
        <div>${pedido.id.substring(0, 8)}</div>
        <div>${pedido.cliente_nombre}</div>
        <div>${pedido.cliente_email}</div>
        <div>${productosStr}</div>
        <div>$${pedido.total && !isNaN(pedido.total) ? Number(pedido.total).toFixed(2) : '0.00'}</div>
        <div>
          ${pedido.forma_pago === 'cash-debit' ? 'Efectivo/Débito' : 'Tarjeta Crédito'}<br>
          ${pedido.tiene_descuento ? 'Con descuento' : 'Sin descuento'}
        </div>
        <div>
          ${pedido.necesita_envio ? 'Sí' : 'No'}<br>
          ${pedido.direccion || ''}
        </div>
        <div>
          <button class="btn btn-sm ${pedido.estado === 'pendiente' ? 'btn-success' : 'btn-secondary'} 
                  btnProcesar" data-id="${pedido.id}" 
                  ${pedido.estado !== 'pendiente' ? 'disabled' : ''}>
            ${pedido.estado === 'pendiente' ? '<i class="bi bi-check-lg"></i> Procesar' : 'Procesado'}
          </button>
          <button class="btn btn-sm btn-primary btnVer" data-id="${pedido.id}">
            <i class="bi bi-eye"></i> Ver
          </button>
        </div>
      `;
      this.elements.tablaPedidos.appendChild(fila);
    });
  }
  

  mostrarPaginacion({ total, pagina, totalPaginas, limite }) {
    this.elements.paginacion.innerHTML = '';
    
    if (totalPaginas <= 1) return;
    
    const ul = document.createElement('ul');
    ul.className = 'pagination justify-content-center';
    
    // Botón Anterior
    const liPrev = document.createElement('li');
    liPrev.className = `page-item ${pagina === 1 ? 'disabled' : ''}`;
    liPrev.innerHTML = `
      <a class="page-link" href="#" aria-label="Previous" data-page="${pagina - 1}">
        <span aria-hidden="true">&laquo;</span>
      </a>
    `;
    ul.appendChild(liPrev);
    
    // Números de página
    const inicio = Math.max(1, pagina - 2);
    const fin = Math.min(totalPaginas, pagina + 2);
    
    for (let i = inicio; i <= fin; i++) {
      const li = document.createElement('li');
      li.className = `page-item ${i === pagina ? 'active' : ''}`;
      li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
      ul.appendChild(li);
    }
    
    // Botón Siguiente
    const liNext = document.createElement('li');
    liNext.className = `page-item ${pagina === totalPaginas ? 'disabled' : ''}`;
    liNext.innerHTML = `
      <a class="page-link" href="#" aria-label="Next" data-page="${pagina + 1}">
        <span aria-hidden="true">&raquo;</span>
      </a>
    `;
    ul.appendChild(liNext);
    
    this.elements.paginacion.appendChild(ul);
  }

  async procesarPedido(event) {
    const btn = event.target.closest('.btnProcesar');
    const pedidoId = btn.dataset.id;
    
    try {
      const response = await fetch(`http://localhost:3001/api/pedidos/${pedidoId}/estado`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`
        },
        body: JSON.stringify({ estado: 'completado' })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      btn.innerHTML = '<i class="bi bi-check2-all"></i> Procesado';
      btn.classList.remove('btn-success');
      btn.classList.add('btn-secondary');
      btn.disabled = true;
      
      this.pedidosPendientes--;
      this.actualizarBadge();
      
    } catch (error) {
      console.error('Error al procesar pedido:', error);
      this.mostrarError('Error al procesar pedido. Intente nuevamente.');
    }
  }

  generarPDF(event) {
    const btn = event.target.closest('.btnVer');
    const pedidoId = btn.dataset.id;
    
    // Aquí implementarías la generación del PDF
    // usando jsPDF como en tu ejemplo original
    console.log('Generando PDF para pedido:', pedidoId);
  }

  cambiarPagina(event) {
    event.preventDefault();
    const pagina = parseInt(event.target.dataset.page);
    this.cargarPedidos(pagina);
  }

  handleNuevoPedido(pedido) {
    if (pedido.estado === 'pendiente') {
      this.pedidosPendientes++;
      this.actualizarBadge();
      
      // Mostrar notificación del sistema si está permitido
      if (Notification.permission === "granted") {
        new Notification("Nuevo pedido recibido", {
          body: `De: ${pedido.cliente_nombre} - Total: $${pedido.total.toFixed(2)}`
        });
      }
      
      // Recargar si la sección está visible
      if (this.elements.seccionPedidos.style.display === 'block') {
        this.cargarPedidos();
      }
    }
  }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticación
  if (!localStorage.getItem('token')) {
    window.location.href = 'login.html';
    return;
  }

  new PedidosManager();
  
  // Solicitar permisos para notificaciones
  if (Notification.permission !== "granted") {
    Notification.requestPermission().then(permission => {
      console.log('Permiso de notificación:', permission);
    });
  }
});