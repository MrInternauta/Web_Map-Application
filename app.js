var google = google
let map;
let marker;
let form = document.getElementById("myForm");
let autocompleteItems = []
let divDirecciones = document.getElementById('div_select');
let geocoder;
let select;
let markers = [];
function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 29.083165, lng: -110.976592 },
        zoom: 16,
    });
    geocoder = new google.maps.Geocoder();
    //EVENTO CLICK al mapa
    google.maps.event.addListener(map, 'click', function (location) {
        //Solo permite una direccion
        if (location.latLng && location.latLng.lat && location.latLng && location.latLng.lng) {
            geocodeLatLng(location.latLng.lat(), location.latLng.lng());
        }
    });
    //Si el usuario da click al boton de busqueda
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        updateSearchResults(form.search.value)
    });
}

//Obtener la direccion apartir de la latitud y  longitud
function geocodeLatLng(lat, lng) {

    const latlng = {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
    };
    let direccion = {
        descripcion: '',
        lat: 0,
        lng: 0
    }
    geocoder.geocode({ location: latlng }, (results, status) => {
        if (status === "OK") {
            if (results[0]) {
                if (results[0].formatted_address) {
                    direccion.descripcion = results[0].formatted_address;
                }
                if (results[0].geometry.location.lat && results[0].geometry.location.lng) {
                    direccion.lat = results[0].geometry.location.lat();
                    direccion.lng = results[0].geometry.location.lng();
                }
                //DIRECCION LISTA
                crearMarcador(direccion);
            } else {
                alert("No results found");
            }
        } else {
            alert("Geocoder failed due to: " + status);
        }
    });
}

// AUTOCOMPLETE, SIMPLEMENTE ACTUALIZAMOS LA LISTA CON CADA EVENTO DE ION CHANGE EN LA VISTA.
//Crea el select con las predicciones apartir del texto ingresado por el usuario
function updateSearchResults(input) {
    if (input == '') {
        autocompleteItems = []
        return alert('Debe ingresar un valor')
    }
    // QUITA LOS ELEMENTOS DEL SELECT
    if (select && autocompleteItems.length > 0) {
        divDirecciones.removeChild(select)
        autocompleteItems = []
    }

    let googleAutocomplete = new google.maps.places.AutocompleteService();
    //Limites de busqueda
    const sw = new google.maps.LatLng(29.088925, -110.972252);
    const ne = new google.maps.LatLng(29.088925, -110.972252);
    const boundsCity = new google.maps.LatLngBounds(sw, ne);

    googleAutocomplete.getPlacePredictions({
        input: input,
        bounds: boundsCity,
        radius: 10000,
        componentRestrictions: {
            country: 'mx',
        },
    },
        (predictions, status) => {
            autocompleteItems = []
            if (predictions === null) {
                return;
            }
            //CREA EL SELECT
            select = document.createElement('select');
            select.setAttribute('id', 'idselect');
            select.setAttribute('size', 2);
            select.setAttribute('onchange', 'changeFunc()');
            predictions.forEach((prediction, index) => {
                autocompleteItems.push(prediction);
                //CREA LOS OPTIONS
                var opt = document.createElement('option');
                // create text node to add to option element (opt)
                opt.appendChild(document.createTextNode(prediction.description));
                // set value property of opt
                opt.value = index;
                // add opt to end of select box (sel)
                select.appendChild(opt);
            });
            //AÑADE EL SELECT AL DIV
            divDirecciones.appendChild(select);
        }
    );
}
//Funcion que se ejecuta cuando el usuario selecciona una direccion del buscador
function changeFunc() {
    let direccion = {
        descripcion: '',
        lat: 0,
        lng: 0
    } 
    var selectedValue = select.options[select.selectedIndex].value; //Se obtiene le index de la direccion
    //Valida que el indice exista
    if (selectedValue <= autocompleteItems.length) { 
        //Selecciona la direccion
        let direccionSeleccionada = autocompleteItems[selectedValue];
        //Se obtiene nuevamente la dirreccion seleccionada pero apartir del ID de lugar        
        geocoder.geocode({ placeId: direccionSeleccionada.place_id }, async (responses, status) => {
            if (status == google.maps.GeocoderStatus.OK) {
                if (responses.length > 0) { 
                    //Valida que exxista una direccion (descripcion)
                    if (responses[0].formatted_address) {
                        direccion.descripcion = responses[0].formatted_address;
                    }
                        //Valida que exxista una lat y lng
                    if (responses[0].geometry.location.lat && responses[0].geometry.location.lng) {
                        direccion.lat = responses[0].geometry.location.lat();
                        direccion.lng = responses[0].geometry.location.lng();
                    }
                    //DIRECCION LISTA
                    crearMarcador(direccion);
                } else {
                    console.log('No existe la dirección, intenta de nuevo.');
                }
            } else {
                console.log('Error al solicitar la dirección, intenta de nuevo.');
            }
        }, (e) => {
            console.log('Error al obtener la dirección, intenta de nuevo.');
        });

    }
    // QUITA LOS ELEMENTOS DEL SELECT
    // QUITA LOS ELEMENTOS DEL SELECT
    if (select && autocompleteItems.length > 0) {
        divDirecciones.removeChild(select)
        autocompleteItems = []
    }

}
//Permite crear el marcado apartir de la dirección, se eliminan el marcador anterior y se cambia el valor la barra de busqueda
    //ESTRUCTURA DEL OBJ direccion
    // direccion: {
    //     descripcion: '',
    //     lat: 0,
    //     lng: 0
    // }
function crearMarcador(direccion) {
    const latlng = {
        lat: parseFloat(direccion.lat),
        lng: parseFloat(direccion.lng),
    };
    //ELiminar los marcadores anteriores
    markers.forEach(marcador => {
        // Para eliminar el marker
        marcador.setMap(null);
    });
    //Centrar el mapa apartir de la dirección
    setTimeout(() => {
        map.setCenter(latlng);
        // map.setZoom(16);
    }, 500);
    //Se crea el marcado apartir de la dirección
    marker = new google.maps.Marker({
        position: latlng,
        map: map,
    });
    //LISTO
    console.log("DIRECCION SELECCIONADA", direccion);
    form.search.value = direccion.descripcion; //Se le asigna la descripción de la dirección a la barra de busqueda
    //LISTO
    markers.push(marker); //Se guarda el marcador actual
}