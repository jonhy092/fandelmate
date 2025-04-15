/*
                          FUNCIONES GENERALES
*/

const hide = (element) => {
	return element.classList.add('is-hidden');
};
const show = (element) => {
	return element.classList.remove('is-hidden');
};
const normalize = (str) => {
	str = str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
	str = str.toLowerCase();
	return str;
};
const showOverlay = () => {
	show(overlay);
};
const hiddeOverlay = () => {
	hide(overlay);
};
const bodyNoScroll = () => {
	document.body.classList.add('no-scroll');
};
const bodyScroll = () => {
	document.body.classList.remove('no-scroll');
};
function redirectToLogin() {
	// Aquí pones la URL de la página de inicio de sesión
	window.location.href = 'usuario.html';
  }
  

/*
                              FILTROS
*/
/*                         ALGORITMO
1- Seleccionar los elementos necesarios y guardarlos en variables
2- Inicializar filtros. Recorrer todos los inputs de los filtros
y llamar a la funcion -filtrarproducts- si el usuario hace click en alguno.
3- Filtrarproducts (incluye varias funciones)
4- Inicializar boton de limpiar filtros y Ejecutar la funcion
LImpiar Filtros
*/

/**************  1- SELECCIONAR ELEMENTOS *********** */

const inputSearch = document.querySelector('#input-search');
const products = document.querySelectorAll('.product'); /*LISTA DE PRODUCTOS*/
const reviewFilters = document.getElementsByClassName('filter-review'); /*LISTA DE REVIEWS*/
const categoryFilters = document.getElementsByClassName('filter-category'); /* LISTA DE CATEGORIAS*/
const checkboxes = document.querySelectorAll('.filter'); /*LISTA DE CHECKBOXES*/
const clearBtn = document.querySelector('.clear-btn');

/**************  3- FILTRAR PRODUCTOS *********** */

/*----Chequea si hay checkbox chequeados ON */
const searchOn = () => {
	if (inputSearch.value.length !== 0) {
		return true;
	} else {
		return false;
	}
};
const categoryOn = () => {
	for (const filtro of categoryFilters) {
		if (filtro.checked) {
			return true;
		}
	}
	return false;
};
const reviewOn = () => {
	for (const filtro of reviewFilters) {
		if (filtro.checked) {
			return true;
		}
	}
	return false;
};

// /* --------- Pasa Filtros por separado -----------*/
const passCategoryFilter = (product) => {
	const category = product.dataset.category;
	//selecciona UN solo filtro que coincide con la product y lo pone chequeado !!
	const categoryFilter = document.querySelector(`.filter-category[value="${category}"]`);
	return categoryFilter.checked;
};
const passReviewFilter = (product) => {
	const review = product.dataset.review;
	const reviewFilter = document.querySelector(`.filter-review[value="${review}"]`);
	return reviewFilter.checked;
};
const passInputSearch = (product) => {
	let name = product.dataset.name;
	let nameStandard = normalize(name);
	let inputSearchStandard = inputSearch.value;
	inputSearchStandard = normalize(inputSearchStandard);
	return nameStandard.includes(inputSearchStandard);
};


document.addEventListener('DOMContentLoaded', () => {
	const categoryLinks = document.querySelectorAll('.filter-category');
  
	categoryLinks.forEach(link => {
	  link.addEventListener('click', (event) => {
		event.preventDefault(); // Evita el comportamiento predeterminado del enlace
		const selectedCategory = link.getAttribute('data-category'); // Obtén la categoría seleccionada
  
		filtrarProductosPorCategoria(selectedCategory);
	  });
	});
  });
  
  function filtrarProductosPorCategoria(category) {
	const productos = document.querySelectorAll('.product'); // Selecciona todos los productos
  
	productos.forEach(product => {
	  const productCategory = product.dataset.category; // Obtén la categoría del producto
	  if (productCategory === category || category === "All") {
		product.style.display = 'block'; // Muestra el producto
	  } else {
		product.style.display = 'none'; // Oculta el producto
	  }
	});
  }
  


// const passAllFilters = (product) => {
// 	return (
// 		// condicion: si pasa filtro o no esta chequeado-incluyendo a todos
// 		(passCategoryFilter(product) || !categoryOn()) &&
// 		(passReviewFilter(product) || !reviewOn()) &&
// 		(passInputSearch(product) || !searchOn())
// 	);
// };

// /* ------- Actualizar products Filtrados ------ */
// let productsQty = document.getElementById('products-qty');

// const updateQtyProducts = () => {
// 	let contador = 0;
// 	for (const product of products) {
// 		if (passAllFilters(product)) {
// 			contador++;
// 		}
// 	}
// 	productsQty.innerText = `Mostrando ${contador} product(s) de ${products.length}`;
// };

/* -------- Mostrar productos que pasen los filtros -------------*/

// const showProducts = () => {
// 	for (const product of products) {
// 		hide(product); //Escondo todas las products para empezar
// 		if (passAllFilters(product)) {
// 			show(product);
// 		} else {
// 			hide(product);
// 		}
// 	}
// };

// // /*-------- Inicio del proceso de filtrado ---------*/

// const filterProducts = () => {
// 	showProducts();
// 	updateQtyProducts();
// };

/****************** 4- LIMPIAR FILTROS ********************* */

// const clearSearchInput = () => {
// 	 inputSearch.value = ''
// };

// const clearCheckboxesChequed = () => {
// 	for (let checkbox of checkboxes) {
// 		if (checkbox.checked) {
// 			checkbox.checked = false;
// 		}
// 	}
// };

// const showAllProducts = () => {
// 	for (let product of products) {
// 		show(product);
// 	}
// };



// /************** 2- INICIALIZAR FILTROS *********** */

// // Si hace click en un checkbox o inicia una busqueda-> Filtrar productos

// for (let checkbox of checkboxes) {
// 	checkbox.onclick = () => {
// 		filterProducts();
// 	};
// }
// // Si empieza una busqueda por nombre

// inputSearch.oninput = () => {
// 	filterProducts();
// };

// clearBtn.onclick = () => {
// 	clearCheckboxesChequed(); //destildo todos los checkboxes
// 	clearSearchInput(); // borro form de busqueda
// 	showAllProducts(); // vuelvo a mostrar todas los productos
// 	updateQtyProducts(); // actualiza el conteo de productos que muestra
// };

/*
                      LISTA DE PRODUCTOS:GRID o LIST
*/
/** Algoritmo
 * 1- Seleccionar los botones de grid y list, y contenedor de productos
 * 2- Inicializar evento onclick para ambos botones
 * 3- Modificar layout de lista de productos:
 * agregar o quitar clases in-line o in-grid segun corresponda.
 * Mas agregar descripcion a cada tarjeta.
 */
/*********************** 1- SELECCIONAR BOTONES  ********************/
const btnGrid = document.querySelector('#view-button-grid');
const btnList = document.querySelector('#view-button-list');
const productsListContainer = document.querySelector('.products-list');
const productsDescriptions = document.querySelectorAll('.product-description'); //todas las descripciones de los productos

/*********************** 2-MODIFICAR LAYOUT CONTENEDOR DE PRODUCTOS ********************/

const showGrid = () => {
	productsListContainer.classList.remove('in-stack');
	productsListContainer.classList.add('in-grid');
	const products = document.querySelectorAll('.product'); // Asegúrate de seleccionar productos correctamente
	const descriptions = document.querySelectorAll('.product-description');
  
	products.forEach((product) => product.classList.remove('in-line-product'));
	descriptions.forEach((desc) => hide(desc)); // Oculta descripciones
  };

  const showList = () => {
	productsListContainer.classList.remove('in-grid');
	productsListContainer.classList.add('in-stack');
	const products = document.querySelectorAll('.product');
	const descriptions = document.querySelectorAll('.product-description');
  
	products.forEach((product) => product.classList.add('in-line-product'));
	descriptions.forEach((desc) => show(desc)); // Muestra descripciones
  };
/*********************** 3-INICIALIZAR EVENTO DE BOTONES GRID O LINE ********************/
btnGrid.onclick = () => {
	showGrid();
};

btnList.onclick = () => {
	showList();
};

/******************************************************************
                              FILTROS EN RESPONSIVE
******************************************************************/
// const btnOpenFilters = document.querySelector('.open-filters-btn');
// const btnCloseFilters = document.querySelector('.close-filters-btn');
// const filtersAside = document.querySelector('.filters-aside');

// btnOpenFilters.onclick = () => {
// 	filtersAside.classList.add('aside-responsive');
// 	filtersAside.classList.add('theme-sky-dark');
// 	filtersAside.style.display = 'block';
// };

// btnCloseFilters.onclick = () => {
// 	filtersAside.classList.remove('aside-responsive');
// 	filtersAside.classList.remove('theme-sky-dark');
// 	filtersAside.style.display = 'none';
// };

/******************************************************************
                              CARRITO
******************************************************************/
/** Algoritmo
 * 1- Seleccionar todos los elementos necesarios
 * 2- Inicializar evento que escuche el on-click en el boton de abrir carrito
 * y otro que escuche el boton cerrar carrito
 * 3- Ir a la funcion Mostrar Carrito u Ocultar carrito 
 * segun corresponda.
 * Cuando se abre carrito mostrar overlay y evitar scroll en screen.
 * 4- Inicializar evento en Botones Comprar y en contador de 
 * productos del carrito
 * 5-Agregar Funcionalidades: contar productos del carrito y calcular
 * subtotal de la compra
 * 6-Agregar funcionalidades: dentro del carrito sumar mas productos
 * del mismo tipo o eliminarlos individualmente
 */

/*********************** 1-SELECCIONAR ELEMENTOS  ********************/
const btnOpenCart = document.querySelector('.btn-cart');
const btnCloseCart = document.querySelector('.btn-close');
const cart = document.querySelector('.header-menu-add-to-card');
const overlay = document.querySelector('.overlay');
const cartSubtotalOutput = document.querySelectorAll('.cart-subtotal-value');
const allBtnAddToCart = document.querySelectorAll('.button-add-to-cart');
const counterProducts = document.querySelectorAll('.cart-qty');
const cartFullMsg = document.querySelector('.cart-full');
const cartEmptyMsg = document.querySelector('.cart-empty');
const carrito = document.querySelector('.cart-products-added');
const deliveryCheckbox = document.getElementById('delivery');
const shippingSection = document.getElementById('shippingSection');

/*********************** 3-MOSTRAR U OCULTAR SECCIÓN DE ENVÍO ********************/
if (deliveryCheckbox && shippingSection) {
    deliveryCheckbox.addEventListener('change', function() {
        shippingSection.style.display = this.checked ? 'block' : 'none';
        const addressInput = document.getElementById('address');
        if (addressInput) {
            addressInput.required = this.checked;
        }
    });
}

let subtotalProductsAdded = 0; // empiezo con $0 de compra

/*********************** 3-MOSTRAR U OCULTAR CARRITO Y OVERLAY ********************/

const showCart = () => {
	show(cart);
  cart.classList.remove('menu-add-to-card-hidde');
  cart.setAttribute('aria-hidden', false)
	for (let c of counterProducts) {
		if (c.innerText == 0) {
			hide(cartFullMsg);
			show(cartEmptyMsg);
		}
	}
};
const hiddeCart = () => {
  cart.classList.add('menu-add-to-card-hidde');
  cart.setAttribute('aria-hidden', true)
	hide(cart);
	show(cartFullMsg);
	hide(cartEmptyMsg);
};

/*********************** 5-FUNCIONALIDADES DE SUMAR SUBTOTAL Y
 *                       CAMBIAR CONTADOR DE PRODUCTOS  ********************/

const addCounterCart = () => {
	for (let c of counterProducts) {
		let counterNumber = Number(c.innerText);
		counterNumber++;
		c.innerText = counterNumber;
	}
};
const subtractCounterCart = () => {
	for (let c of counterProducts) {
		let counterNumber = Number(c.innerText);
		counterNumber--;
		c.innerText = counterNumber;
	}
};

/** Saber cual es el producto que compraron
 * comparando id del boton con id del producto */
function knowProduct(btn, list) {
	return Array.from(list).find(product => product.dataset.id === btn.id);
}



/** Ir sumando cada producto comprado al valor de Subtotal (de todos los comprados)
 * para usarlo en el checkout (y calcular descuentos y recargos)
 */
const addSubtotal = (subtotal) => {
	//variable acumuladora de subtotales(precio de cada producto)
	subtotalProductsAdded = subtotalProductsAdded + Number(subtotal);
	// para mostrarlo en pantalla
	for (let c of cartSubtotalOutput) {
		c.innerText = subtotalProductsAdded;
	}
};

const subtractSubtotal = (subtotal) => {
	//variable acumuladora de subtotales(precio de cada producto)
	subtotalProductsAdded = subtotalProductsAdded - Number(subtotal);
	// para mostrarlo en pantalla
	for (let c of cartSubtotalOutput) {
		c.innerText = subtotalProductsAdded;
	}
};
/** Algoritmo
   * 1- Recibir el boton para saber su id 
   * 2- Buscar que id de tarjeta coincide con el id del boton
   * 3- saber el precio del producto y sumarlo al subtotal
   * 4- Identificar con una clase el producto agregado
   *   (para seleccionalos y mostrarlos en el carrito)
   */

addPriceToSubtotal = (btnAddToCart) => {
	const products = document.querySelectorAll('.product'); 
	let productAdded = knowProduct(btnAddToCart, products);

	if (!productAdded) {
		console.error("Producto no encontrado", btnAddToCart.id);
		return;
	}

	let subtotal = productAdded.dataset.price;
	addSubtotal(subtotal);
};
//SUMAR CANTIDAD DEL MISMO PRODUCTO//
function actualizarSubtotalGlobal() {
	const productosEnCarrito = document.querySelectorAll('.cart-product-added');
	let nuevoSubtotal = 0;
  
	productosEnCarrito.forEach(producto => {
	  const precioUnitario = parseFloat(producto.dataset.price);
	  const cantidad = parseInt(producto.querySelector('.cart-product-qty').value);
	  nuevoSubtotal += precioUnitario * cantidad;
	});
  
	subtotalProductsAdded = nuevoSubtotal;
  
	cartSubtotalOutput.forEach(c => {
	  c.innerText = subtotalProductsAdded.toFixed(2);
	});
  }
  
  function escucharCambiosDeCantidad() {
	const inputsCantidad = document.querySelectorAll('.cart-product-qty');
  
	inputsCantidad.forEach(input => {
	  input.addEventListener('change', () => {
		const cantidad = parseInt(input.value);
		if (cantidad < 1) {
		  input.value = 1;
		}
		actualizarSubtotalGlobal();
	  });
	});
  }
  // Escuchar cambios de cantidad al cargar la página  

const obtenerPlantillaProductoAgregado = (id, nombre, precio, imagen) => {
	const imagenURL = imagen.startsWith('http') ? imagen : `http://localhost:3001/${imagen.replace(/\\/g, '/')}`;
	return `<article class="cart-product-added" data-id="${id}" data-qty="1" data-price="${precio}">
	  <img src="${imagen}" alt="" class="cart-product-img" />
	  <div class="cart-product-details">
		<div class="cart-product-info">
		  <h3 class="cart-product-name">${nombre}</h3>
		  <button type="button" class="remove-from-cart-btn" id="${id}"><i class="far fa-trash-alt"></i></button>
		</div>
		<div class="cart-product-price-qty">
		  <label>
			<input data-precio="${precio}" type="number" min="1" value="1" class="cart-product-qty" />
			unidades
		  </label>
		  <p class="cart-product-price">x $${precio}</p>
		</div>
	  </div>
	</article>`;
  };
  

function showProductOnCart(btnAddToCart) {
	const productElement = btnAddToCart.closest('.product');
	const id = productElement.dataset.id;
	const name = productElement.dataset.name;
	const price = productElement.dataset.price;
	const image = productElement.dataset.image;
  
	console.log("Agregando producto al carrito:", { id, name, price, image });
  
	if (!id || !name || !price || !image) {
	  console.error("Error: No se pudo obtener información del producto.");
	  return;
	}
  
	const plantilla = obtenerPlantillaProductoAgregado(id, name, price, image);
	carrito.insertAdjacentHTML('beforeend', plantilla);
	escucharCambiosDeCantidad();
    actualizarSubtotalGlobal();

  }
  


/*********************** 3-INICIALIZAR EVENTO MOSTRAR CARRITO ********************/

btnOpenCart.onclick = () => {
	showOverlay();
	overlay.style.zIndex = '2';
	bodyNoScroll();
	showCart();
};

btnCloseCart.onclick = () => {
	hiddeOverlay();
	overlay.style.zIndex = '1';
	bodyScroll();
	hiddeCart();
};
/*********************** 4-INICIALIZAR EVENTO SUMAR PRODUCTOS ********************/

const removeProductOfTheList = (btnRemove) => {
	/* Averiguar la tarjeta padre*/
	const allProductsAdded = document.querySelectorAll(".cart-product-added")	
	console.log(allProductsAdded)

	let productToRemove = knowProduct(btnRemove, allProductsAdded)

	let subtotal = productToRemove.dataset.price;
	console.log(subtotal)
	subtractSubtotal(subtotal)
	subtractCounterCart()
	productToRemove.remove();
	listenEventsOnCart();
};

const addProductToTheCartList = (inputQty) => {
	let qty = inputQty.getAttribute('value');
	console.log(qty)
	let subtotal = Number(inputQty.dataset.precio) * qty;
	console.log(subtotal)
	/**
	 * Falta: 
	 * -ver sumar o restar el monto si el numero crece o decrece
	 * en relacion a la cantida anterior.
	 * -Actualizar el subtotal de cada producto
	 * si cambia su cantidad
	 * -agregar condicion, si qty igual 0 mostrar mgs carrito vacio
	 */
	addSubtotal(subtotal);
	addCounterCart();
	listenEventsOnCart();
};

/** Escucha eventos remover o agregar producto en carrito*/

// const listenEventsOnCart = () => {
// 	const allBtnRemove = document.querySelectorAll('.remove-from-cart-btn');
// 	console.log(allBtnRemove)
// 	const allInputsProductQty = document.querySelectorAll('.cart-product-qty');

// 	for (allBtnRemove of allBtnRemove) {
// 		allBtnRemove.onclick = () => {
// 			console.log(allBtnRemove)
// 			removeProductOfTheList(allBtnRemove);
// 		};
// 	}

// 	for (inputQty of allInputsProductQty) {
// 		inputQty.onchange = () => {
// 			console.log("apretaste sumar producto")
// 			addProductToTheCartList(inputQty);
// 		};
// 	}
// };

/** INICIALIZA BOTONES QUE AGREGAN O QUITAN PRODUCTOS  */

for (let btnAddToCart of allBtnAddToCart) {
	btnAddToCart.onclick = () => {
		addCounterCart();
		addPriceToSubtotal(btnAddToCart);
		showProductOnCart(btnAddToCart);
		listenEventsOnCart();
	};
}

/******************************************************************
                             MODALES CARRITO
******************************************************************/
/** Algoritmo
 * 1- Seleccionar elementos
 * 2-Inicializar eventos de boton vaciar carrito para
 * abrir modal
 * 3-Agregar Funcionalidad de vaciar carrito con boton
 * aceptar del modal
 */

/*********************** 1- SELECCIONAR ELEMENTOS ********************/

const btnOpenModalEmptyCart = document.querySelector('.btn-empty-cart');
const modalEmptyCart = document.querySelector('.modal-empty-cart');
const btnConfirmEmptyCart = document.querySelector('.confirm-cart-empty-btn');
const btnCancelEmptyCart = document.querySelector('.cancel-empty-cart-btn');

/*********************** 3- FUNCIONALIDAD DE VACIAR CARRITO ********************/

resetCounterCart = () => {
	for (let c of counterProducts) {
		c.innerText = '0';
	}
};

resetPriceToSubtotal = () => {
	subtotalProductsAdded = 0;
	for (let c of cartSubtotalOutput) {
		c.innerText = subtotalProductsAdded;
	}
};

hideAllProductsOnCart = () => {
	carrito.innerHTML = '';
};

const openModalEmptyCart = () => {
  show(modalEmptyCart);
  modalEmptyCart.setAttribute('aria-hidden', false)
};

const emptyCartConfirm = () => {
	resetCounterCart();
	resetPriceToSubtotal();
	hideAllProductsOnCart();
	showCart();
  hide(modalEmptyCart);
  overlay.style.zIndex = 2
  modalEmptyCart.setAttribute('aria-hidden', true)
};
/*********************** 2- INICIALIZAR EVENTO BTN VACIAR ********************/

btnOpenModalEmptyCart.onclick = () => {
	openModalEmptyCart();
	showOverlay();
    bodyNoScroll();
  overlay.style.zIndex = 4
};
btnConfirmEmptyCart.onclick = () => {
	emptyCartConfirm();
	hiddeOverlay();
	bodyScroll();
	hide(modalEmptyCart);
	overlay.style.zIndex = '1';
};
btnCancelEmptyCart.onclick = () => {
	hiddeOverlay();
	bodyScroll();
	hide(modalEmptyCart);
	overlay.style.zIndex = '1';
};
/******************************************************************
                             CHECKOUT
******************************************************************/

/**    Algoritmo
 * 1- Seleccionar todos los elementos
 * 2- Crear funcionalidad de abrir y cerrar Menu Checkout
 * 3- Crear funcionalidad de Descuentos y Recargos para 
 * calcular el total de la compra
 */
const btnOpenCheckout = document.querySelector('.btn-buy');
const btnFinishBuy = document.querySelector('.btn-finish-buy');
const btnCancelBuy = document.querySelector('.btn-cancel-buy');
const menuCheckout = document.querySelector('.menu-checkout');
const checkoutForm = document.getElementById('checkoutForm');







//EVENTO QUE AL CLICKEAR FINALIZAR COMPRA, SE CARGA EL MODAL DE COMPRA FINALIZADA Y MANEJA EL STOCK//
// Ejemplo de productos en el carrito
//document.querySelector('.btn-finish-buy').addEventListener('click', async () => {
//  try {
//    const response = await fetch('http://localhost:3001/cart/checkout', {
//      method: 'POST',
//      headers: { 'Content-Type': 'application/json' },
//      body: JSON.stringify({ products: cartProducts })
//    });
//
//    if (response.ok) {
//      alert('Compra finalizada con éxito');
//      // Limpia el carrito después de confirmar la compra
//      cartProducts = [];
//      document.querySelector('.cart-subtotal-value').textContent = '0';
 //     document.querySelector('.cart-total-value').textContent = '0';
//    } else {
      //alert('Error al finalizar la compra');
    //}
  //} catch (error) {
    //console.error('Error al finalizar la compra:', error);
  //}
//});

  // Ejemplo de productos en el carrito
//let cartProducts = [];
  
  // FUNCION DE CARRITO VACIO//
  function mostrarMensajeCarritoVacio() {
    alert("El carrito está vacío. Por favor, agrega productos antes de continuar.");
}
 
 



  

//         // Crear objeto pedido
//         const pedido = {
//             cliente: { 
//                 nombre, 
//                 email, 
//                 telefono, 
//                 dni 
//             },
//             envio: necesitaEnvio ? { 
//                 direccion, 
//                 fechaEntrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
//             } : null,
//             productos,
//             formaPago,
//             total,
//             necesitaEnvio,
//             tieneDescuento
//         };

//         // Enviar al backend
//         const response = await fetch('http://localhost:3001/api/pedidos', {
//             method: 'POST',
//             headers: { 
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify(pedido)
//         });

//         if (!response.ok) {
//             const errorData = await response.json();
//             throw new Error(errorData.error || 'Error al procesar el pedido');
//         }

//         const data = await response.json();
//         console.log('Pedido creado:', data);
        
//         // Mostrar confirmación y limpiar carrito
//         alert('¡Pedido realizado con éxito!');
//         resetCounterCart();
//         resetPriceToSubtotal();
//         hideAllProductsOnCart();
//         hiddeCheckout();
//         hiddeCart();

//     } catch (error) {
//         console.error('Error:', error);
//         alert(`Error: ${error.message}`);
//     }
// });
  
  

/*********************** 2- ABRIR Y CERRAR CHECKOUT ********************/
function resetOptionsPay(){
	const cashOption = document.getElementById('payment-cash');
	const creditOption = document.getElementById('payment-credit');
	const deliveryOption = document.getElementById('needs-shipping');
	const discountOption = document.getElementById('has-discount');
	if (cashOption) cashOption.checked = true;
	if (creditOption) creditOption.checked = false;
	if (deliveryOption) deliveryOption.checked = false;
	if (discountOption) discountOption.checked = false;
}

/*********************** EVENT LISTENERS PARA OPCIONES DE CHECKOUT ********************/
document.addEventListener('DOMContentLoaded', () => {
	const shippingOption = document.getElementById('needs-shipping');
	const discountOption = document.getElementById('has-discount');

	shippingOption?.addEventListener('change', () => {
		const shippingInfo = document.querySelector('.checkout-shipping-info');
		if (shippingOption.checked) {
			shippingInfo.classList.remove('hidden');
		} else {
			shippingInfo.classList.add('hidden');
		}
	});

	discountOption?.addEventListener('change', () => {
		const discountInput = document.querySelector('.checkout-discount-code');
		if (discountOption.checked) {
			discountInput.classList.remove('hidden');
		} else {
			discountInput.classList.add('hidden');
		}
	});
});
const showCheckout = () => {
  show(menuCheckout);
  menuCheckout.setAttribute('aria-hidden', false)
  overlay.style.zIndex = 4
};

const hiddeCheckout = () => {
  hide(menuCheckout);
  menuCheckout.setAttribute('aria-hidden', true)
};

btnOpenCheckout.onclick = () => {
	showOverlay();
	overlay.style.zIndex = '3';
	bodyNoScroll();
	showCheckout();
	calculateTotal();
};

// btnFinishBuy.onclick = () => {
// 	hiddeOverlay();
// 	overlay.style.zIndex = '1';
//   bodyScroll();
//   resetCounterCart();
// 	resetPriceToSubtotal();
//   hideAllProductsOnCart();
//   resetOptionsPay()
// 	hiddeCheckout();
// 	hiddeCart();
// };

btnCancelBuy.onclick = () => {
	hiddeOverlay();
	overlay.style.zIndex = '1';
	bodyScroll();
	hiddeCheckout();
	hiddeCart();
};

/*********************** 3- CALCULAR PRECIO TOTAL DEL CHECKOUT ********************/
const allPayOptions = document.querySelectorAll('.pay-option');
// checkboxes
// Elementos de opciones de pago (usando IDs consistentes con el HTML)
const cashOption = document.getElementById('payment-cash');
const creditOption = document.getElementById('payment-credit');
const deliveryOption = document.getElementById('envio');
const discountOption = document.getElementById('descuento');


// Elementos de precios
const cartSubtotalValue = document.querySelector('.cart-subtotal-value');
const cartTaxValue = document.querySelector('.cart-tax-value');
const cartDiscountValue = document.querySelector('.cart-discount-value');
const cartDeliveryValue = document.querySelector('.cart-delivery-value');
const cartTotalValue = document.querySelector('.cart-total-value');




// Función para calcular el total del carrito
function calculateTotal() {
    const subtotal = parseFloat(cartSubtotalValue.textContent) || 0;
    let tax = 0;
    let discount = 0;
    let deliveryCost = 0;

    // Calcular recargo por crédito (10%)
    if (creditOption?.checked) {
        tax = subtotal * 0.1;
        document.querySelector('.cart-tax').classList.remove('is-hidden');
    } else {
        document.querySelector('.cart-tax').classList.add('is-hidden');
    }

    // Calcular costo de envío ($50)
    if (deliveryOption?.checked) {
        deliveryCost = 50;
        document.querySelector('.cart-delivery').classList.remove('is-hidden');
    } else {
        document.querySelector('.cart-delivery').classList.add('is-hidden');
    }

    // Calcular descuento (10%)
    if (discountOption?.checked) {
        discount = subtotal * -0.1;
        document.querySelector('.cart-discount').classList.remove('is-hidden');
    } else {
        document.querySelector('.cart-discount').classList.add('is-hidden');
    }

    // Actualizar valores en la UI
    if (cartTaxValue) cartTaxValue.textContent = tax.toFixed(2);
    if (cartDiscountValue) cartDiscountValue.textContent = discount.toFixed(2);
    if (cartDeliveryValue) cartDeliveryValue.textContent = deliveryCost.toFixed(2);

    const total = subtotal + tax + discount + deliveryCost;
    if (cartTotalValue) cartTotalValue.textContent = total.toFixed(2);
    
    return total;
}

// Evento para finalizar compra
// Evento para finalizar compra
btnFinishBuy?.addEventListener('click', async (e) => {
	e.preventDefault();

	try {
		const token = localStorage.getItem('token');
		if (!token) {
			redirectToLogin();
			return;
		}

		// Cliente
		const cliente = {
			nombre: document.getElementById('nombre').value.trim(),
			email: document.getElementById('email').value.trim(),
			telefono: document.getElementById('phone').value.trim(),
			dni: document.getElementById('dni').value.trim()
		};

		// Opciones
		const deliveryOption = document.querySelector('#envio');
        const discountOption = document.querySelector('#descuento');
		const formaPago = document.querySelector('input[name="payment"]:checked')?.value || 'cash-debit';
		const necesitaEnvio = deliveryOption.checked;
		const tieneDescuento = discountOption.checked;
		const direccion = necesitaEnvio ? document.getElementById('address').value.trim() : null;
		const fechaEntrega = necesitaEnvio
			? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
			: null;

			// ENVIO//
			const envio = necesitaEnvio
  ? {
      direccion: document.querySelector('#address')?.value.trim(),
      fechaEntrega: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }
  : undefined; // importante: NO null, sino undefined (no se envía)



		// Productos del carrito
		const productos = Array.from(document.querySelectorAll('.cart-product-added')).map(item => {
			const nombre = item.querySelector('.cart-product-name')?.textContent.trim() || '';
			const cantidad = parseInt(item.querySelector('.cart-product-qty')?.value) || 1;
			const precio = parseFloat(item.dataset.price) || 0;
			const id = parseInt(item.dataset.id);

			return { id, nombre, cantidad, precio };
		}).filter(p => !isNaN(p.id));



		const formData = {
			cliente: {
			  nombre: document.querySelector('#nombre')?.value.trim(),
			  email: document.querySelector('#email')?.value.trim(),
			  telefono: document.querySelector('#phone')?.value.trim(),
			  dni: document.querySelector('#dni')?.value.trim()
			},
			envio: {
			  direccion: necesitaEnvio ? document.querySelector('#address')?.value.trim() : null,
			  fechaEntrega: necesitaEnvio ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] : null
			},
			formaPago,
			necesitaEnvio,
			tieneDescuento
		  };
		  
		 // body('descuento').optional().isFloat({ min: 0 })


		//const total = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
		const subtotal = productos.reduce((acc, p) => acc + (p.precio * p.cantidad), 0);
        const descuento = formData.tieneDescuento ? subtotal * 0.1 : 0; // Ejemplo de descuento
        const total = subtotal - descuento;

		// Enviar al backend
		const response = await fetch('http://localhost:3001/api/pedidos', {
			method: 'POST',
			headers: {
			  'Content-Type': 'application/json',
			  'Authorization': `Bearer ${token}`
			},
			body: JSON.stringify({
				cliente,
				envio, // si undefined, no se incluye
				formaPago,
				necesitaEnvio,
				tieneDescuento,
				productos,
				subtotal,
				descuento,
				total
			  })
			})
			  
		  

		const result = await response.json();
		console.log('Respuesta del servidor:', result);

		if (!response.ok) throw new Error(result.message || 'Error al realizar el pedido');

		// Reset general
		document.querySelector('.cart-products-added').innerHTML = '';
		cartSubtotalValue.textContent = '0';
		cartTotalValue.textContent = '0';
		menuCheckout.classList.add('is-hidden');
		document.body.classList.remove('no-scroll');

		hiddeOverlay();
		overlay.style.zIndex = '1';
		bodyScroll();
		resetCounterCart();
		resetPriceToSubtotal();
		hideAllProductsOnCart();
		resetOptionsPay();
		hiddeCheckout();
		hiddeCart();

		alert("¡Compra finalizada con éxito!");

	} catch (error) {
		console.error('Error al finalizar compra:', error);
		alert(error.message);
	}
});


		  
// Inicialización de eventos
document.addEventListener('DOMContentLoaded', () => {
    // Eventos para actualizar el total cuando cambian las opciones
    [cashOption, creditOption, deliveryOption, discountOption].forEach(option => {
        if (option) {
            option.addEventListener('change', calculateTotal);
        }
    });

    // Abrir checkout
    btnOpenCheckout?.addEventListener('click', () => {
        menuCheckout.classList.remove('is-hidden');
        document.body.classList.add('no-scroll');
        calculateTotal();
    });

    // Cancelar checkout
    btnCancelBuy?.addEventListener('click', () => {
        menuCheckout.classList.add('is-hidden');
        document.body.classList.remove('no-scroll');
    });
});
// USANDO OBJETOS..
const productosFallback = [
{
	id: 0,
	name: 'Mate Rosa',
	category: 'Mates',
	price: 5000,
	image: '/public/images/mate-rosa.jpg',
	review: 3
},
{
	id: 1,
	name: 'Mate Goma',
	category: 'Mates',
	price: 6500,
	image: '/public/images/mate-goma.jpg',
	review:5

},
{
	id: 2,
	name: 'Yerba Taragui',
	category: 'Yerbas',
	price: 8500,
	image: '/public/images/yerba-taragui.jpg',
	review: 5
},
{
	id: 3,
	name: 'Termo Acero Inoxidable',
	category: 'Termos',
	price: 15000,
	image: 'public/images/termo.jpg',
	review: 5
},
{
	id: 4,
	name: 'Bombilla',
	category: 'Bombillas',
	price: 4000,
	image: '/public/images/bombilla-alpaca.jpg',
	review: 5
},
{
	id: 5,
	name: 'Termo',
	category: 'Termos',
	price: 12500,
	image: '/public/images/termo500.jpg',
	review: 5
},
{
	id: 6,
	name: 'Posta Termo',
	category: 'Accesorios',
	price: 55500,
	image: '/public/images/setcuero.jpg',
	review: 5
},
{
	id: 7,
	name: 'Bombilla acero',
	category: 'Bombillas',
	price: 8500,
	image: '/public/images/bombilla-sim.jpg',
	review: 5
},
{
	id: 8,
	name: 'Bombilla acero',
	category: 'Bombillas',
	price: 10500,
	image: '/public/images/bombilla-sim.jpg',
	review: 5
},
{
	id: 9,
	name: 'Termo Stanley',
	category: 'Termos',
	price: 95000,
	image: '/public/images/termo-inoxidable.jpg',
	review: 5
},
{
	id: 10,
	name: 'Estuche de cuero',
	category: 'Accesorios',
	price: 95000,
	image: '/public/images/estuche-equipo-mate.jpg',
	review: 5
},
{
	id: 11,
	name: 'bombilla',
	category: 'Bombillas',
	price: 95000,
	image: '/public/images/bombilla-personalizada.webp',
	review: 5
},

];
// FUNCION QUE ME GENERA EL HTML DE LOS PRODUCTOS//

const productsContainer = document.querySelector('.products-list');

async function insertarProductos() {
  try {
	const response = await fetch('http://localhost:3001/products');
	if (!response.ok) throw new Error("Error al obtener productos");
	
	const productos = await response.json(); // ahora sí se declara bien
	

    productsContainer.innerHTML = ''; // Limpia el contenedor
    productos.forEach(product => {
      const productHTML = generarProductoHTML(product);
      productsContainer.insertAdjacentHTML('beforeend', productHTML);
    });

    agregarEventosCarrito(); // Agrega eventos después de cargar
    agregarFiltradoCategorias(); 
  } catch (error) {
    console.error('Error:', error);
  }
}

function generarProductoHTML(product) {
	return `
	  <article class="product" 
			   data-id="${product.id}" 
			   data-name="${product.name}" 
			   data-category="${product.category_id}" 
			   data-price="${product.price}" 
			   data-image="${product.image_url}">
		<div class="product-img-container in-line">
		  <img src="${product.image_url}" alt="${product.name}" class="product-img" />
		</div>
		<div class="product-content in-stack">
		  <h2 class="product-name">${product.name}</h2>
		  <p class="product-price" aria-label="Precio en pesos argentinos:">$ ${product.price}</p>
		  ${product.quantity < 5 ? '<p class="low-stock-warning">¡Últimas unidades!</p>' : ''}
		  <div class="product-description is-hidden">
			${product.description || 'Sin descripción disponible.'}
		  </div>
		  <div>
			<button type="button" class="button button-simple-solid button-add-to-cart" id="${product.id}">
			  Agregar al carrito
			</button>
		  </div>
		</div>
	  </article>
	`;
  }
  
  

document.addEventListener('DOMContentLoaded', insertarProductos);


// INSERTA LOS PRODUCTOS EN EL CONTENEDOR
//function insertarProductos() {
	//productsContainer.innerHTML = ''; // Limpia el contenedor antes de insertar
	//productos.forEach(product => {
		//productsContainer.insertAdjacentHTML('beforeend', generarProductoHTML(product));
	//});
	//agregarEventosCarrito(); // Asegura agregar eventos después de insertar productos
	//agregarFiltradoCategorias();
//}
function listenEventsOnCart() {
	const botonesEliminar = document.querySelectorAll('.remove-from-cart-btn');
	const inputsCantidad = document.querySelectorAll('.cart-product-qty');

	botonesEliminar.forEach(boton => {
		boton.addEventListener('click', () => {
			const item = boton.closest('.cart-product-added'); // <--- CAMBIO
			if (item) {
				item.remove(); // Elimina el producto del carrito

				// Actualiza subtotal y contador
				actualizarSubtotalGlobal(); // Usá tu función global aquí
				updateCartCounter();
			}
		});
	});

	inputsCantidad.forEach(input => {
		input.addEventListener('input', () => {
			const item = input.closest('.cart-product-added'); // <--- CAMBIO
			if (item) {
				const price = parseFloat(input.dataset.precio);
				const cantidad = parseInt(input.value) || 1;

				// Actualiza precio visual
				const precioTexto = item.querySelector('.cart-product-price');
				if (precioTexto) {
					precioTexto.textContent = `x $${(price * cantidad).toFixed(2)}`;
				}

				// Actualiza subtotal global
				actualizarSubtotalGlobal();
				updateCartCounter();
			}
		});
	});
}



// FUNCIÓN PARA AGREGAR EVENTOS A LOS BOTONES "AGREGAR AL CARRITO"
function agregarEventosCarrito() {
	const botonesAgregarCarrito = document.querySelectorAll('.button-add-to-cart');
	botonesAgregarCarrito.forEach(boton => {
		boton.addEventListener('click', () => {
			addCounterCart();
			addPriceToSubtotal(boton); // Usa el botón para obtener el precio
			showProductOnCart(boton); // Muestra el producto en el carrito
			listenEventsOnCart();
		});
	});
}

// FILTROS DEL NAVBAR CATEGORÍAS
function agregarFiltradoCategorias() {
	const categoryLinks = document.querySelectorAll('.filter-category');
	const productosCard = document.querySelectorAll('.product');

	categoryLinks.forEach(link => {
		link.addEventListener('click', (event) => {
			event.preventDefault();
			const selectedCategory = link.getAttribute('data-category');

			// Filtra los productos según la categoría seleccionada
			productosCard.forEach(product => {
				const productCategory = product.getAttribute('data-category');
				product.style.display = (productCategory === selectedCategory || selectedCategory === "All") ? 'block' : 'none';
			});
		});
	});
}

// LLAMADA INICIAL
document.addEventListener('DOMContentLoaded', () => {
	insertarProductos();
});

	


// function displayProducts(products) {
// 	const productsContainer = document.querySelector('.products-list');
// 	productsContainer.innerHTML = ''; // Limpiar el contenedor
  
// 	products.forEach(product => {
// 	  const productElement = `
// 		<article class="product"
// 				 data-id="${product.id}"
// 				 data-name="${product.name}" 
// 				 data-category="${product.category}"
// 				 data-price="${product.price}"
// 				 data-image="${product.image}" 
// 				 data-review="${product.review}">
  
// 		  <div class="product-img-container in-line">
// 			<img src="${product.image}"
// 				 alt="${product.description}"
// 				 class="product-img" />
// 		  </div>
  
// 		  <div class="product-content in-stack">
// 			<h2 class="product-name">${product.name}</h2>
// 			<p class="product-price"
// 			   aria-label="Precio en pesos argentinos:">
// 			   $ ${product.price}</p>
// 			<div class="review filters-review" aria-label="Puntaje ${product.review}">
// 			  ${generateStars(product.review)}
// 			</div>
// 			<div>
// 			  <button type="button"
// 					  class="button button-simple-solid button-add-to-cart"
// 					  id="${product.id}">
// 				Comprar
// 			  </button>
// 			</div>
// 		  </div>
// 		  <div class="product-description is-hidden">${product.description}</div>
// 		</article>
// 	  `;
// 	  productsContainer.innerHTML += productElement;
// 	});
//   }
  
  // Función para generar estrellas en la calificación
//   function generateStars(review) {
// 	const fullStar = '<i class="fas fa-star" aria-hidden="true"></i>';
// 	const emptyStar = '<i class="far fa-star" aria-hidden="true"></i>';
// 	return fullStar.repeat(review) + emptyStar.repeat(5 - review);

