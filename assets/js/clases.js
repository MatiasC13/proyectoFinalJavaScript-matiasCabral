class Disco {
    constructor(imagen, titulo, artista, discografica, anio, copias, precio) {
        this.imagen = imagen;
        this.titulo = titulo;
        this.artista = artista;
        this.discografica = discografica;
        this.anio = anio;
        this.copias = copias;
        this.precio = precio;
    }
    modificarStock(fn) {
        this.copias += fn();
    }
}

class Usuario {
    constructor(email, clave, nombre, rol='user') {
        this.email = email;
        this.clave = clave;
        this.nombre = nombre;
        this.rol = rol;
    }
}

class Factura {
    constructor(usuario, detalles) {
        this.usuario = usuario;
        this.detalles = detalles;
        this.costo = 0;
        this.mostrarFecha()
        this.costoTotal();
    }
    costoTotal() {
        this.costo = this.detalles.reduce((acc, item) => {
            return (acc += item.costoDetalle);
        }, 0);
    }
    mostrarFecha(){
        const dateTime = luxon.DateTime;
        this.fecha = dateTime.now().toLocaleString();
    }
}

class Detalle {
    constructor(disco, cantidad) {
        this.disco = disco;
        this.cantidad = cantidad;
        this.costoDetalle = 0;
        this.calcularCostoDetalle();
    }
    calcularCostoDetalle() {
        this.costoDetalle = this.disco.precio * this.cantidad;
    }
}