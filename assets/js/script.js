// variables globales
const divPantallas = document.querySelectorAll(".pantalla");
const divCarrito = document.querySelector("#divCarrito");
const divDisco = document.querySelector("#discos");
let ultimoId = 0;
let discos = [];
let ventas = [];
let favoritos = [];
let usuarios = [];
usuarios.push(
  new Usuario("usuario@usuario.com", "123456", "Matias"),
  new Usuario(
    "administrador@administrador.com",
    "123456",
    "Administrador",
    "admin"
  )
);
let usuarioConectado = null;


inicio();
function inicio() {
  if (localStorage.getItem("favoritos") === null) {
    // chequeamos que no exista el item favoritos en el local storage
    localStorage.setItem("favoritos", JSON.stringify([]));
    // si no existe se crea el item asignándole como valor un array vacío
  }
  favoritos = JSON.parse(localStorage.getItem("favoritos"));
  // se guarda en una variable el item favoritos

  if (localStorage.getItem("ventas") === null) {
    localStorage.setItem("ventas", JSON.stringify([]));
  }
  ventas = JSON.parse(localStorage.getItem("ventas"));
  ultimoId = ventas.length;

  cambiarPantalla("logIn");
  document
    .querySelector("#iniciarSesion")
    .addEventListener("click", iniciarSesion);
  document
    .querySelector("#btnCerrarSesion")
    .addEventListener("click", cerrarSesion);
  document
    .querySelector("#btnTop")
    .addEventListener("click", btnHandlerTop);
  document
    .querySelector("div.carrito")
    .addEventListener("click", mostrarCarrito);
  document
    .querySelector("#btnBuscar")
    .addEventListener("click", btnHandlerBuscar);
  document
    .querySelector("#btnOrdenarPrecio")
    .addEventListener("click", btnHandlerOrdenarPrecio);
  document
    .querySelector("#btnOrdenarCantidad")
    .addEventListener("click", mostrarDiscosOrdenadosPorCantidad);
  document
    .querySelector("#btnPocoStock")
    .addEventListener("click", pocoStock);
  document
    .querySelector("#btnAgotados")
    .addEventListener("click", agotados);
  document
    .querySelector("#btnVentasFecha")
    .addEventListener("click", btnHandlerMostrarVentasPorFecha);
  document
    .querySelector("#btnAgregarDisco")
    .addEventListener("click", () => cambiarPantalla("admin, .form"));
}


const cargarDatos = (url) => {
  fetch(url)
    .then((response) => response.json())
    .then((json) => cargarDiscosEnMemoria(json));
}


function cargarDiscosEnMemoria(data) {
  discos = data.map(
    ({ imagen, titulo, artista, discografica, anio, copias, precio }) =>
      new Disco(imagen, titulo, artista, discografica, anio, copias, precio)
  );
  cargarDiscos(discos, "Novedades", `.${usuarioConectado.rol}`);
}


function iniciarSesion() {
  let email = document.querySelector("#txtEmail").value;
  let clave = document.querySelector("#txtPassword").value;
  let usuario = usuarios.find((u) => u.email === email && u.clave === clave);

  if (usuario) {
    usuarioConectado = usuario;
    if (discos.length == 0) {
      cargarDatos("assets/json/datos.json");
    } else {
      cargarDiscos(discos, "Top", `.${usuarioConectado.rol}`);
    }
  } else {
    Swal.fire({
      text: "Datos incorrectos",
      icon: "error",
      backdrop: "white",
      confirmButtonText: "Volver a intentarlo",
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-dark",
      },
    });
  }
}


function cerrarSesion() {
  usuarioConectado = null;
  cambiarPantalla("logIn");
}


function cambiarPantalla(selectorPantalla) {
  const pantallaOcultar = document.querySelectorAll(`.pantalla`);
  const pantallaMostrar = document.querySelectorAll(`.${selectorPantalla}`);

  pantallaOcultar.forEach((p) => (p.style.display = "none"));
  pantallaMostrar.forEach((p) => (p.style.display = "block"));
}


function volver() {
  btnVolverTienda.addEventListener("click", () =>
    cambiarPantalla("user, .disco")
  );
}


function asociarFuncionElemento(selector, fn) {
  // se recibe un selector y un callback, con el selector se obtienen los nodos del dom y se asocia
  // el call back al evento click de esos nodos
  const botones = document.querySelectorAll(selector);
  botones.forEach((b) => {
    b.addEventListener("click", fn);
  });
}


function cargarDiscos(listaDiscosMostrar, titulo) {
  // renderiza la lista de discos con su respectivo título
  let contador = 0;

  if (usuarioConectado.rol === "user") {
    let itemUsuario = favoritos.find(
      // obtengo el item que le corresponda al usuario conectado
      (item) => item.email === usuarioConectado.email
    );

    if (itemUsuario) {
      contador = itemUsuario.productos.length;
    }
    document.querySelector("#contador").textContent = contador;
  }

  cambiarPantalla(`disco, .${usuarioConectado.rol}`);
  // se limpia contenedor html
  divDisco.innerHTML = "";

  // se prepara el contenido que se va a insertar
  let contenido = "";

  // se prepara la función que se va a asociar a los botones insertados
  if (listaDiscosMostrar.length === 0 || listaDiscosMostrar[0] === undefined) {
    contenido =
      "<div class='row'><p class='col-xs-12'>No hay discos para mostrar</p></div>";
  } else {
    contenido = `<div class="row"><h2 class="col-xs-12">${titulo}</h2></div> <div class="discos row">`;
    listaDiscosMostrar.forEach((d) => {
      let valor = favoritos.some(
        (f) =>
          f.email == usuarioConectado.email &&
          f.productos.some((p) => p.titulo == d.titulo)
      )
        ? "Sacar del carrito"
        : "Agregar al carrito";

      let btnAgregarCarrito = `<input type="button" id="btC${
        d.titulo
      }" class="btC btn btn-dark" value="${valor}" ${
        d.copias > 0 ? "" : "disabled"
      }></input>`;

      let btnAgregar = `<input type="button" id="btA${d.titulo}"  class="btA btn btn-dark" value="Agregar"</input>`;
      // según la pantalla activa se dispondrá de un botón de agregar al Carrito(pantalla usuario) o agregar(pantalla administrador)
      let btnMostrar =
        usuarioConectado.rol === "user" ? btnAgregarCarrito : btnAgregar;
      contenido += `
      <div class="col-xs-12 col-md-6 col-lg-4 mt-3">
      <div class="card">
      <img src="${d.imagen}" class="card-img-top">
      <div class="card-body">
        <h3 class="card-title">${d.titulo}</h3>
      <ul class="card-text"> 
        <li>Artista : ${d.artista}</li>
        <li>Discográfica : ${d.discografica}</li>
        <li>Año : ${d.anio}</li>
        <li>Número de copias : ${d.copias}</li>
        <li>Precio : $ ${d.precio}</li>
      </ul>
        <a href="#" class="btn btn-dark"> ${btnMostrar} </a>
      </div>
    </div>
    </div>`;
    });
    contenido += "</div>";
  }

  // inserción del contenido en el html
  divDisco.innerHTML = contenido;

  if (contenido != "") {
    // si hay contenido para insertar se asocian las funcionalidades correspondientes a los botones
    if (usuarioConectado.rol == "admin") {
      asociarFuncionElemento(".btA", agregarStock);
    } else {
      asociarFuncionElemento(".btC", agregarAlCarrito);
    }
  }
}


function btnHandlerTop() {
  cargarDiscos(discos, "Top");
}


// ÁREA USUARIO


function btnHandlerOrdenarPrecio() {
  const precioOrdenados = [...discos].sort((a, b) => a.precio - b.precio);
  cargarDiscos(precioOrdenados, "menor a mayor");
}


function btnHandlerBuscar() {
  let titulo = document.querySelector("#txtBuscar").value.trim(); //se descartan espacios vacíos
  const discoBuscado = discos.find(
    (disco) => disco.titulo.toUpperCase() === titulo.toUpperCase() //la búsqueda es case insensitive
  );
  //en este caso el disco buscado se convierte en un array pese a que tiene un sólo elemento porque la función cargarDiscos recibe un array
  cargarDiscos([discoBuscado], "Disco Encontrado:");
}


function agregarAlCarrito() {
  const titulo = this.id.substring(3);
  const discoAgregar = discos.find((d) => d.titulo === titulo); // encuentro el disco en memoria
  let itemUsuario = favoritos.find(
    // obtengo el item que le corresponda al usuario conectado
    (item) => item.email === usuarioConectado.email
  );

  if (!itemUsuario) {
    // si no tenía item se lo creo junto al disco porque no habrá problema de repetición
    itemUsuario = {
      email: usuarioConectado.email,
      productos: [discoAgregar],
    };
    favoritos.push(itemUsuario);
    Toastify({
      text: "Disco agregado",
      duration: 3000,
      close: true,
      gravity: "bottom",
      position: "right",
      stopOnFocus: false,
      style: {
        background: "linear-gradient(to right, #007a6c, #75b703)",
      },
    }).showToast();
    this.value = "Sacar del carrito";
  } else if (!itemUsuario.productos.some((d) => d.titulo === titulo)) {
    // aca seguro hay item pero no tiene el disco, por ende se lo agrego
    itemUsuario.productos.push(discoAgregar);
    favoritos = favoritos.filter(
      (item) => item.email != usuarioConectado.email
    );
    favoritos.push(itemUsuario);
    Toastify({
      text: "Disco agregado",
      duration: 3000,
      close: true,
      gravity: "bottom",
      position: "right",
      stopOnFocus: false,
      style: {
        background: "linear-gradient(to right, #007a6c, #75b703)",
      },
    }).showToast();
    this.value = "Sacar del carrito";
  } else {
    Toastify({
      text: "Disco eliminado",
      duration: 3000,
      close: true,
      gravity: "bottom",
      position: "right",
      stopOnFocus: false,
      style: {
        background: "linear-gradient(#cc0d0d, #750b0b)",
      },
    }).showToast();
    this.value = "Agregar al carrito";

    itemUsuario.productos = itemUsuario.productos.filter(
      (p) => p.titulo !== titulo
    );
    favoritos = favoritos.filter(
      (item) => item.email != usuarioConectado.email
    );
    favoritos.push(itemUsuario);
  }

  document.querySelector("#contador").textContent =
    itemUsuario.productos.length;
  localStorage.setItem("favoritos", JSON.stringify(favoritos)); //actualizo favoritos en el local storage
}


function mostrarCarrito() {
  divCarrito.innerHTML = "";
  cambiarPantalla("car");
  let contenido =
    "<div class='row col-xs-12'><button class='btn btn-dark' id='linkVolverTienda'>Volver a la tienda</button></div><div class='row' id='compra'>";
  let itemUsuario = favoritos.find(
    (item) => item.email == usuarioConectado.email
  );

  if (itemUsuario?.productos.length > 0) {
    let productUsuario = itemUsuario.productos;
    productUsuario.forEach(
      ({ imagen, titulo, artista, discografica, precio }, indice) => {
        contenido += `
        <img class="img-fluid img-thumbnail col-xs-12 col-md-5" src="${imagen}">
        <div class="col-xs-12 col-md-7 info-compra">
        <h3>${titulo}</h3>
        <ul> 
            <li>Artista : ${artista}</li>
            <li>Discográfica : ${discografica}</li>  
            <li>Precio : ${precio}</li> 
            <li>Cantidad:</li>
            <input class="form-control" id="cant${indice}" type ="number" min="1"/>
        </ul>
        </div> `;
      }
    );
    contenido +=
      '</div><div class="row" id="flex-botones"><div class="col-xs-12"><input class="btn btn-danger mr-3" id="linkVaciarCarrito" type ="button" value="Vaciar Carrito"><input class="btn btn-success" id="btnComprar" type ="button" value="Comprar"></div></div>';
  } else {
    contenido += "<p class='col-xs-12'>No hay discos en tu carrito.</p>";
  }
  divCarrito.innerHTML = contenido;

  document.getElementById("linkVolverTienda").addEventListener("click", () => {
    cambiarPantalla("user, .disco");
    cargarDiscos(discos, "Top");
  });

  asociarFuncionElemento("#btnComprar", () =>
    comprarDisco(itemUsuario.productos)
  );

  let botonVaciarCarrito = document.querySelector("#linkVaciarCarrito");
  if (botonVaciarCarrito) {
    botonVaciarCarrito.addEventListener("click", btnHandlerVaciarCarrito);
  }
}


function btnHandlerVaciarCarrito() {
  let itemUsuario = favoritos.find(
    // obtengo el item que le corresponda al usuario conectado
    (item) => item.email === usuarioConectado.email
  );
  itemUsuario.productos = [];
  favoritos = favoritos.filter((item) => item.email != usuarioConectado.email);
  favoritos.push(itemUsuario);
  divCarrito.removeChild(divCarrito.children[2]);
  divCarrito.removeChild(divCarrito.children[1]);
}


function comprarDisco(productos) {
  let detalles = [];
  let ok = true;
  let stockSuficiente = false;

  for (let indice = 0; indice < productos.length; indice++) {
    let cantidad = Number(document.getElementById(`cant${indice}`).value);
    if (cantidad <= 0) {
      ok = false;
    } else {
      const producto = productos[indice];
      stockSuficiente = discos.some(d => d.titulo === producto.titulo && cantidad <= d.copias);
      if(stockSuficiente){
        detalles.push(new Detalle(producto, cantidad));
      }
    }
  }

  if (ok && stockSuficiente) {
    let factura = new Factura(usuarioConectado, detalles);
    factura.id = ultimoId + 1; //genero el id de la venta
    ultimoId++;
    ventas.push(factura);
    discos.forEach((disco) => {
      if (detalles.some(({ disco: { titulo } }) => titulo === disco.titulo)) {
        disco.modificarStock(() => -1);
      }
    });
    mostrarCompra(factura);

    favoritos.forEach((item) => {
      if (item.email == usuarioConectado.email) {
        //actualiza los favoritos en el local storage, se quitan porque el usuario ya los compró
        item.productos = [];
        localStorage.setItem("favoritos", JSON.stringify(favoritos)); //se actualiza el local storage
        localStorage.setItem("ventas", JSON.stringify(ventas));
        Swal.fire({
          text: "Compra Existosa",
          icon: "success",
          backdrop: "white",
          confirmButtonText: "Ver compra",
          buttonsStyling: false,
          customClass: {
            confirmButton: "btn btn-dark",
          },
        });
      }
    });
  } else if(!ok){
    Swal.fire({
      text: "Debes seleccionar al menos un disco",
      icon: "error",
      confirmButtonText: "OK",
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-dark",
      },
    });
  }else{
    Swal.fire({
      text: "No hay stock suficiente",
      icon: "error",
      confirmButtonText: "OK",
      buttonsStyling: false,
      customClass: {
        confirmButton: "btn btn-dark",
      },
    });
  }
}


function mostrarCompra({ costo, detalles }) {
  let contenido = detalles
    .map(
      ({ disco: { imagen, titulo, artista }, cantidad, costoDetalle }) =>
        `<div class="row flex-mostrar-compra">
          <img class="img-fluid img-thumbnail col-xs-12 col-md-5" src="${imagen}">
          <div class="col-xs-12 col-md-7 info-compra">
            <h3>${titulo}</h3>
            <ul> 
              <li>Artista: ${artista}</li>
              <li>Cantidad: ${cantidad}</li>
              <li>Costo: ${costoDetalle}</li>   
            </ul>
            </div>
          </div>`
      ).join("");
  contenido += `<p col-xs-12>Costo total: $${costo}</p>`;
  divCarrito.children[1].innerHTML = contenido;
  document.getElementById("btnComprar").style.display = "none";
  document.getElementById("linkVaciarCarrito").style.display = "none";
}


// ÁREA ADMINISTRADOR


const formularioDatos = document.querySelector("#formularioDatos");
formularioDatos.addEventListener("submit", AgregarDisco);


function AgregarDisco(evento) {
  //se evita el recargo por defecto de la página que origina el botón submit
  evento.preventDefault();

  //con evento.target se obtiene la referencia al formulario y con ésta se hace una instancia de un objeto formData que contiene toda la información ingresada en el formulario
  let formData = new FormData(evento.target);

  // se prepara el disco que se va a llenar con los datos del formulario
  const disco = new Disco();

  // se itera por cada una de las propiedades que tiene el objeto formData, los name del formulario
  for (const propiedad of formData.keys()) {
    let valor; // se acondiciona el tipo de dato que necesita el objeto disco para cada propiedad

    if (
      propiedad === "anio" ||
      propiedad === "copias" ||
      propiedad === "precio"
    ) {
      valor = Number(formData.get(propiedad)); // se obtiene el value de la propiedad
    } else if (propiedad === "imagen") {
      let file = formData.get(propiedad);
      valor = URL.createObjectURL(file);
    } else {
      valor = formData.get(propiedad);
    }
    disco[propiedad] = valor;
  }
  discos.unshift(disco);
  cargarDiscos(discos, "Lista de Discos");
}


function agregarStock() {
  let titulo = this.id.substring(3);
  let disco = discos.find((d) => d.titulo == titulo);
  disco.modificarStock((_) => 1);
  cargarDiscos(discos, "Top");
}


function mostrarDiscosOrdenadosPorCantidad() {
  const cantidadOrdenados = [...discos].sort((a, b) => b.copias - a.copias);
  cargarDiscos(cantidadOrdenados, "mayor a menor");
}


function pocoStock() {
  const ultimos = discos.filter(
    (disco) => disco.copias > 0 && disco.copias < 100
  );
  cargarDiscos(ultimos, "1-99 copias");
}


function agotados() {
  const agotado = discos.filter((disco) => disco.copias === 0);
  cargarDiscos(agotado, "Discos Agotados");
}


function btnHandlerMostrarVentasPorFecha() {
  cambiarPantalla(`disco, .admin`);
  divDisco.innerHTML = "";
  let contenido = "";

  if (ventas.length > 0) {
    contenido = `
    <h2 class="row titulo-ventas">Ventas</h2>
    <table class="table table-striped">
    <thead class="thead-dark">
      <tr>
        <th scope="col">#</th>
        <th scope="col">Fecha</th>
        <th scope="col">Cliente</th>
        <th scope="col">Total</th>
      </tr>
    </thead>
    <tbody>`;
    ventas.forEach(
      ({ id, costo, usuario: { nombre }, fecha }) =>
        (contenido += `
        <tr>
        <th scope="row">${id}</th>
        <td>${fecha}</td>
        <td>${nombre}</td>
        <td>${costo}</td>
      </tr>`)
    );
    contenido += `</tbody></table>`;
  } else {
    contenido = `<p>No hay ventas</p>`;
  }
  divDisco.innerHTML = contenido;
}
