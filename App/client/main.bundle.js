webpackJsonp([1,4],{

/***/ 1008:
/***/ (function(module, exports) {

/**
 * This file is licensed under Creative Commons Zero (CC0)
 * http://creativecommons.org/publicdomain/zero/1.0/
 *
 * Author: http://www.openstreetmap.org/user/Zartbitter
 */





var map;

/**
 * Add or replace a parameter (with value) in the given URL.
 * By Adil Malik, http://stackoverflow.com/questions/1090948/change-url-parameters/10997390#10997390
 * @param String url the URL
 * @param String param the parameter
 * @param String paramVal the value of the parameter
 * @return String the changed URL
 */
function updateURLParameter(url, param, paramVal) {
	var theAnchor = null;
	var newAdditionalURL = "";
	var tempArray = url.split("?");
	var baseURL = tempArray[0];
	var additionalURL = tempArray[1];
	var temp = "";

	if (additionalURL) {
		var tmpAnchor = additionalURL.split("#");
		var theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];
		if (theAnchor) {
			additionalURL = theParams;
		}

		tempArray = additionalURL.split("&");

		for (i = 0; i < tempArray.length; i++) {
			if (tempArray[i].split('=')[0] != param) {
				newAdditionalURL += temp + tempArray[i];
				temp = "&";
			}
		}
	} else {
		var tmpAnchor = baseURL.split("#");
		var theParams = tmpAnchor[0];
		theAnchor = tmpAnchor[1];

		if (theParams) {
			baseURL = theParams;
		}
	}

	if (theAnchor) {
		paramVal += "#" + theAnchor;
	}

	var rows_txt = temp + "" + param + "=" + paramVal;
	return baseURL + "?" + newAdditionalURL + rows_txt;
}

/**
 * Add or replace the language parameter of the URL and reload the page.
 * @param String id of the language
 */
function changeLanguage(pLang) {
	window.location.href = updateURLParameter(window.location.href, 'lang', pLang);
}

/**
 * Get all parameters out of the URL.
 * @return Array List of URL parameters key-value indexed
 */
function getUrlParameters() {
	var vars = [], hash;
	var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
	for (var i = 0; i < hashes.length; i++) {
		hash = hashes[i].split('=');
		vars.push(hash[0]);
		vars[hash[0]] = hash[1];
	}
	return vars;
}

/**
 * Callback for successful geolocation.
 * @var position Geolocated position
 */
function foundLocation(position) {
	if (typeof map != "undefined") {
		var lat = position.coords.latitude;
		var lon = position.coords.longitude;
		map.setView(new L.LatLng(lat, lon), 11);
	}
}

/**
 * Example function to replace leaflet-openweathermap's builtin marker by a wind rose symbol.
 * Some helper functions and an event listener are needed, too. See below.
 */
function myWindroseMarker(data) {
	var content = '<canvas id="id_' + data.id + '" width="50" height="50"></canvas>';
	var icon = L.divIcon({ html: content, iconSize: [50, 50], className: 'owm-div-windrose' });
	return L.marker([data.coord.lat, data.coord.lon], { icon: icon, clickable: false });
}

/**
 * Helper function for replacing leaflet-openweathermap's builtin marker by a wind rose symbol.
 * This function draws the canvas of one marker symbol once it is available in the DOM.
 */
function myWindroseDrawCanvas(data, owm) {

	var canvas = document.getElementById('id_' + data.id);
	canvas.title = data.name;
	var angle = 0;
	var speed = 0;
	var gust = 0;
	if (typeof data.wind != 'undefined') {
		if (typeof data.wind.speed != 'undefined') {
			canvas.title += ', ' + data.wind.speed + ' m/s';
			canvas.title += ', ' + owm._windMsToBft(data.wind.speed) + ' BFT';
			speed = data.wind.speed;
		}
		if (typeof data.wind.deg != 'undefined') {
			//canvas.title += ', ' + data.wind.deg + '°';
			canvas.title += ', ' + owm._directions[(data.wind.deg / 22.5).toFixed(0)];
			angle = data.wind.deg;
		}
		if (typeof data.wind.gust != 'undefined') {
			gust = data.wind.gust;
		}
	}
	if (canvas.getContext && speed > 0) {
		var red = 0;
		var green = 0;
		if (speed <= 10) {
			green = 10 * speed + 155;
			red = 255 * speed / 10.0;
		} else {
			red = 255;
			green = 255 - (255 * (Math.min(speed, 21) - 10) / 11.0);
		}
		var ctx = canvas.getContext('2d');
		ctx.translate(25, 25);
		ctx.rotate(angle * Math.PI / 180);
		ctx.fillStyle = 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + 0 + ')';
		ctx.beginPath();
		ctx.moveTo(-15, -25);
		ctx.lineTo(0, -10);
		ctx.lineTo(15, -25);
		ctx.lineTo(0, 25);
		ctx.fill();

		// draw inner arrow for gust
		if (gust > 0 && gust != speed) {
			if (gust <= 10) {
				green = 10 * gust + 155;
				red = 255 * gust / 10.0;
			} else {
				red = 255;
				green = 255 - (255 * (Math.min(gust, 21) - 10) / 11.0);
			}
			canvas.title += ', gust ' + data.wind.gust + ' m/s';
			canvas.title += ', ' + owm._windMsToBft(data.wind.gust) + ' BFT';
			ctx.fillStyle = 'rgb(' + Math.floor(red) + ',' + Math.floor(green) + ',' + 0 + ')';
			ctx.beginPath();
			ctx.moveTo(-15, -25);
			ctx.lineTo(0, -10);
			//ctx.lineTo(15, -25);
			ctx.lineTo(0, 25);
			ctx.fill();
		}
	} else {
		canvas.innerHTML = '<div>'
			+ (typeof data.wind != 'undefined' && typeof data.wind.deg != 'undefined' ? data.wind.deg + '°' : '')
			+ '</div>';
	}
}

/**
 * Helper function for replacing leaflet-openweathermap's builtin marker by a wind rose symbol.
 * This function is called event-driven when the layer and its markers are added. Now we can draw all marker symbols.
 * The this-context has to be the windrose layer.
 */
function windroseAdded(e) {
	for (var i in this._markers) {
		var m = this._markers[i];
		var cv = document.getElementById('id_' + m.options.owmId);
		for (var j in this._cache._cachedData.list) {
			var station = this._cache._cachedData.list[j];
			if (station.id == m.options.owmId) {
				myWindroseDrawCanvas(station, this);
			}
		}
	}
}

/**
 * Example function to replace leaflet-openweathermap's builtin marker.
 */
function myOwmMarker(data) {
	// just a Leaflet default marker
	return L.marker([data.coord.lat, data.coord.lon]);
}

/**
 * Example function to replace leaflet-openweathermap's builtin popup.
 */
function myOwmPopup(data) {
	// just a Leaflet default popup
	return L.popup().setContent(typeof data.name != 'undefined' ? data.name : data.id);
}

/**
 * Initialize the map.
 */
var exp = (function () {
	return {
		func: function initMap() {

			var standard = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			});

			var esri = L.tileLayer('http://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
				attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
			});

			var clouds = L.OWM.clouds({ opacity: 0.8, legendImagePath: 'files/NT2.png' });
			var cloudscls = L.OWM.cloudsClassic({ opacity: 0.5 });
			var precipitation = L.OWM.precipitation({ opacity: 0.5 });
			var precipitationcls = L.OWM.precipitationClassic({ opacity: 0.5 });
			var rain = L.OWM.rain({ opacity: 0.5 });
			var raincls = L.OWM.rainClassic({ opacity: 0.5 });
			var snow = L.OWM.snow({ opacity: 0.5 });
			var pressure = L.OWM.pressure({ opacity: 0.4 });
			var pressurecntr = L.OWM.pressureContour({ opacity: 0.5 });
			var temp = L.OWM.temperature({ opacity: 0.5 });
			var wind = L.OWM.wind({ opacity: 0.5 });

			var localLang = getLocalLanguage();

			// Get your own free OWM API key at http://www.openweathermap.org/appid - please do not re-use mine!
			// You don't need an API key for this to work at the moment, but this will change eventually.

			// stari API key
			//var OWM_API_KEY = '06aac0fd4ba239a20d824ef89602f311';
			var OWM_API_KEY = '9f94544566a949379c1067b25c4000de';
			var city = L.OWM.current({
				intervall: 15, imageLoadingUrl: 'leaflet/owmloading.gif', lang: localLang, minZoom: 2,
				appId: OWM_API_KEY
			});
			var station = L.OWM.current({
				type: 'station', intervall: 15, imageLoadingUrl: 'leaflet/owmloading.gif', lang: localLang,
				appId: OWM_API_KEY /* , markerFunction: myOwmMarker, popupFunction: myOwmPopup */
			});
			var windrose = L.OWM.current({
				intervall: 15, imageLoadingUrl: 'leaflet/owmloading.gif', lang: localLang, minZoom: 2,
				appId: OWM_API_KEY, markerFunction: myWindroseMarker, popup: false, clusterSize: 50,
				imageLoadingBgUrl: 'http://openweathermap.org/img/w0/iwind.png'
			});
			windrose.on('owmlayeradd', windroseAdded, windrose); // Add an event listener to get informed when windrose layer is ready

			var useGeolocation = true;
			var zoom = -5;
			var lat = 44.58;
			var lon = 21.1;
			var urlParams = getUrlParameters();
			if (typeof urlParams.zoom != "undefined" && typeof urlParams.lat != "undefined" && typeof urlParams.lon != "undefined") {
				zoom = urlParams.zoom;
				lat = urlParams.lat;
				lon = urlParams.lon;
				useGeolocation = false;
			}

			map = L.map('map', {
				center: new L.LatLng(lat, lon), zoom: zoom,
				layers: [standard]
			});
			map.attributionControl.setPrefix("");
			/*
				map.addControl(L.languageSelector({
					languages: new Array(
						L.langObject('en', 'English', 'mapicons/en.png')
					,	L.langObject('de', 'Deutsch', 'mapicons/de.png')
					,	L.langObject('fr', 'Français', 'mapicons/fr.png')
					,	L.langObject('es', 'Español', 'mapicons/es.png')
					,	L.langObject('ca', 'Català', 'mapicons/catalonia.png')
					,	L.langObject('ru', 'Русский', 'mapicons/ru.png')
					,	L.langObject('nl', 'Nederlands', 'mapicons/nl.png')
					,	L.langObject('pt_br', 'Português do Brasil', 'mapicons/br.png')
					),
					callback: changeLanguage,
					initialLanguage: localLang,
					hideSelected: false,
					vertical: false
				}));*/

			var baseMaps = {
				"OSM Standard": standard
				//, "ESRI Aerial": esri
			};

			var overlayMaps = {};
			overlayMaps[getI18n('clouds', localLang)] = clouds;
			overlayMaps[getI18n('cloudscls', localLang)] = cloudscls;
			overlayMaps[getI18n('precipitation', localLang)] = precipitation;
			overlayMaps[getI18n('precipitationcls', localLang)] = precipitationcls;
			overlayMaps[getI18n('rain', localLang)] = rain;
			overlayMaps[getI18n('raincls', localLang)] = raincls;
			overlayMaps[getI18n('snow', localLang)] = snow;
			overlayMaps[getI18n('temp', localLang)] = temp;
			overlayMaps[getI18n('windspeed', localLang)] = wind;
			overlayMaps[getI18n('pressure', localLang)] = pressure;
			overlayMaps[getI18n('presscont', localLang)] = pressurecntr;
			overlayMaps[getI18n('city', localLang) + " (min Zoom 5)"] = city;
			overlayMaps[getI18n('station', localLang) + " (min Zoom 7)"] = station;
			overlayMaps[getI18n('windrose', localLang)] = windrose;

			var layerControl = L.control.layers(baseMaps, overlayMaps, { collapsed: false }).addTo(map);
			map.addControl(new L.Control.Permalink({ layers: layerControl, useAnchor: false, position: 'bottomright' }));
			/*
				map.addControl(L.flattrButton({
					autosubmit: true,
					flattrUid: 'kranich',
					flattrUrl: 'https://github.com/buche/leaflet-openweathermap',
					buttonType: 'countercompact',
					popout: false
				}));
			*/
			// patch layerControl to add some titles
			var patch = L.DomUtil.create('div', 'owm-layercontrol-header');
			/*patch.innerHTML = getI18n('layers', localLang); // 'TileLayers';
			layerControl._form.children[2].parentNode.insertBefore(patch, layerControl._form.children[2]);
			patch = L.DomUtil.create('div', 'leaflet-control-layers-separator');
			layerControl._form.children[3].children[0].parentNode.insertBefore(patch, layerControl._form.children[3].children[layerControl._form.children[3].children.length-3]);
			patch = L.DomUtil.create('div', 'owm-layercontrol-header');
			patch.innerHTML = getI18n('current', localLang); // 'Current Weather';
			layerControl._form.children[3].children[0].parentNode.insertBefore(patch, layerControl._form.children[3].children[layerControl._form.children[3].children.length-3]);
			patch = L.DomUtil.create('div', 'owm-layercontrol-header');
			patch.innerHTML = getI18n('maps', localLang); // 'Maps';
			layerControl._form.children[0].parentNode.insertBefore(patch, layerControl._form.children[0]);
		*/
			if (useGeolocation && typeof navigator.geolocation != "undefined") {
				navigator.geolocation.getCurrentPosition(foundLocation);
			}
		}
	}
})(exp || {})

/***/ }),

/***/ 1012:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(520);


/***/ }),

/***/ 225:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__plantation__ = __webpack_require__(344);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PlantationService; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var PlantationService = (function () {
    function PlantationService() {
    }
    PlantationService.prototype.getTypes = function () {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["a" /* tipovi */];
    };
    PlantationService.prototype.getSubTypes = function () {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["b" /* podtipovi */];
    };
    PlantationService.prototype.getProducers = function () {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["c" /* proizvodjaci */];
    };
    PlantationService.prototype.getSingleType = function (ID) {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["a" /* tipovi */].find(function (x) { return x.id == ID; });
    };
    PlantationService.prototype.getSingleSubtype = function (ID) {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["b" /* podtipovi */].find(function (x) { return x.id == ID; });
    };
    PlantationService.prototype.getSingleProducer = function (ID) {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["c" /* proizvodjaci */].find(function (x) { return x.id == ID; });
    };
    PlantationService.prototype.getSubtypesById = function (pid) {
        return __WEBPACK_IMPORTED_MODULE_1__plantation__["b" /* podtipovi */].filter(function (x) { return x.pid == pid; });
    };
    PlantationService = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(), 
        __metadata('design:paramtypes', [])
    ], PlantationService);
    return PlantationService;
}());
//# sourceMappingURL=plantation.service.js.map

/***/ }),

/***/ 343:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__plantation__ = __webpack_require__(344);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(96);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_finally__ = __webpack_require__(243);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_finally___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_finally__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_toPromise__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_toPromise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_toPromise__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__plantation_service__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__services_perm_service_service__ = __webpack_require__(42);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AddPlantation; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};









var AddPlantation = (function () {
    function AddPlantation(permService, fb, plantationService, http) {
        this.permService = permService;
        this.fb = fb;
        this.plantationService = plantationService;
        this.http = http;
        this.imanjeVidljivo = false;
        this.plantazaVidljiva = true;
        this.idVlasnika = [];
        this.ddVisible = false;
        this.tipovi = [];
        this.podtipovi = [];
        this.proizvodjaci = [];
        this.sviPodtipovi = [];
        this.nizPoligona = [];
        this.nizOverlay = [];
        this.sviVlasnici = [];
        this.dozvoleKodGazde = [];
        this.isLoading = false;
        this.smeDaPise = false;
        this.dodatProizvodjac = false;
        this.dodatTip = false;
        this.dodatPodtip = false;
        this.dodataPlantaza = false;
        this.mapProp = null;
        this.map = null;
        this.imanjeIme = "";
        this.drawingManager = null;
        this.komeMozeDaDoda = [];
        this.perm = [];
        this.dodatoImanje = false;
        this.createForm();
    }
    AddPlantation.prototype.promeniTab = function () {
        this.plantazaVidljiva = !this.plantazaVidljiva;
        this.imanjeVidljivo = !this.imanjeVidljivo;
    };
    AddPlantation.prototype.uzmiImanja = function () {
        var _this = this;
        this.http.get("users/uzmiImanja")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.imanja = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddPlantation.prototype.cleanInput = function () {
        for (var i = 0; i < this.nizPoligona.length; i++) {
            this.nizPoligona[i] = null;
            this.nizOverlay[i].setMap(null);
        }
        this.nizPoligona = [];
        this.nizOverlay = [];
    };
    AddPlantation.prototype.createForm = function () {
        this.plantForm = this.fb.group({
            name: ['', __WEBPACK_IMPORTED_MODULE_2__angular_forms__["d" /* Validators */].required],
            vrsta: ['', __WEBPACK_IMPORTED_MODULE_2__angular_forms__["d" /* Validators */].required],
            podvrsta: [''],
            proizvodjacSemena: [''],
            vlasnikPlantaze: ['']
        });
    };
    AddPlantation.prototype.getUser = function () {
        var _this = this;
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            console.log(_this.user);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddPlantation.prototype.dozvoleKodVlasnika = function () {
    };
    AddPlantation.prototype.dodajImanje = function () {
        var _this = this;
        var idvlasnika;
        if (this.isOwner)
            idvlasnika = this.user.id;
        else {
            idvlasnika = document.getElementById("vlasnik");
            idvlasnika = idvlasnika.options[idvlasnika.selectedIndex].value;
            if (idvlasnika == "" || idvlasnika === undefined || idvlasnika === null) {
                alert("Mora vlasnik da se izabere bajo");
                return;
            }
        }
        this.http.get("users/dodajImanje/" + this.imanjeIme + "/" + idvlasnika)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (_this.dodatoImanje == true) {
                setTimeout(function () {
                    _this.dodatoImanje = false;
                }, 3000);
            }
            _this.dodatoImanje = data;
            _this.uzmiImanja();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddPlantation.prototype.close = function () {
        this.dodatoImanje = false;
    };
    AddPlantation.prototype.addPlantation = function (im) {
        var _this = this;
        var idOw;
        var model = this.plantForm.value;
        if (this.isOwner)
            idOw = this.user.id;
        else
            idOw = model.vlasnikPlantaze;
        this.http.get("types/addPlantation/" + idOw + "/" + model.name + "/" + model.vrsta + "/" + model.podvrsta + "/" + model.proizvodjacSemena + "/" + im + "/" + JSON.stringify(this.nizPoligona))
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.test = data;
            if (_this.test.success) {
                _this.dodataPlantaza = true;
            }
            else {
                _this.dodataPlantaza = false;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.plantForm.reset();
        this.cleanInput();
    };
    AddPlantation.prototype.onSubmit = function () {
        var im;
        im = document.getElementById("imanje");
        if (im == "" || im === null || im === undefined) {
            alert("imanje bato!");
            return;
        }
        if (im.options == "" || im.options === null || im.options === undefined) {
            alert("imanje bato!");
            return;
        }
        if (im.options[im.selectedIndex] == "" || im.options[im.selectedIndex] === null || im.options[im.selectedIndex] === undefined) {
            alert("imanje bato!");
            return;
        }
        im = (im.options[im.selectedIndex]).value;
        if (im == "" || im === null || im === undefined) {
            alert("imanje bato!");
            return;
        }
        var model = this.plantForm.value;
        if (this.nizPoligona[0] == null) {
            alert("fali ti poligon!" + this.plantForm.value.name);
        }
        else {
            if (this.plantForm.value.name == null || this.plantForm.value.name == "") {
                alert("fali IME" + this.plantForm.value.name);
            }
            else if (model.vrsta == null || model.podvrsta == null || model.proizvodjacSemena == null || model.vrsta == "" || model.podvrsta == "" || model.proizvodjacSemena == "") {
                alert("vrsta/podvrsta/proizvodjac");
            }
            else if (!this.isOwner && (model.vlasnikPlantaze == null || model.vlasnikPlantaze == '')) {
                alert("unesite ime vlasnika plantaze" + this.plantForm.value.vlasnikPlantaze);
            }
            else {
                this.addPlantation(im);
            }
        }
    };
    ;
    AddPlantation.prototype.userIsOwner = function () {
        var _this = this;
        this.http.get("permisions/userIsOwner")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.isOwner = data.owner;
            if (!_this.isOwner) {
                _this.getOwners();
            }
            else {
                _this.tipovi = _this.getTypes(_this.user.id);
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddPlantation.prototype.getOwners = function () {
        var _this = this;
        this.http.get("users/getOwners")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.sviVlasnici = data;
            _this.getPerms();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddPlantation.prototype.getPerms = function () {
        var _this = this;
        this.http.get("permisions/dozvoleKodVlasnika")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            console.log(data.success + " " + data.dozvole);
            _this.perm = data;
            if (data.dozvole.length > 0) {
                console.log();
                _this.dozvoleKodGazde = data.dozvole.filter(function (x) { return x.vrednosti.plantCRUD == true; });
                if (_this.dozvoleKodGazde.length > 0) {
                    console.log("broj sa dozvolom kod gazde " + _this.dozvoleKodGazde[0].vlasnik);
                    _this.spoji();
                    _this.smeDaPise = true;
                }
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddPlantation.prototype.spoji = function () {
        console.log(this.sviVlasnici.length + " broj svih vlasnika");
        for (var i = 0; i < this.sviVlasnici.length; i++)
            for (var j = 0; j < this.dozvoleKodGazde.length; j++) {
                console.log(this.sviVlasnici[i].idOwner + " " + this.dozvoleKodGazde[j].vlasnik);
                if (this.sviVlasnici[i].idOwner == this.dozvoleKodGazde[j].vlasnik) {
                    var noviG = {
                        id: this.sviVlasnici[i].id,
                        name: this.sviVlasnici[i].name,
                        surname: this.sviVlasnici[i].surname,
                        username: this.sviVlasnici[i].username,
                        email: this.sviVlasnici[i].email
                    };
                    this.komeMozeDaDoda.push(noviG);
                    this.idVlasnika.push(this.sviVlasnici[i].idOwner);
                }
            }
        this.tipovi = this.getTypes(this.idVlasnika);
    };
    AddPlantation.prototype.ngOnInit = function () {
        var _this = this;
        setTimeout(function () {
            console.log("timeout");
        }, 1000);
        this.permService.getPerms().subscribe(function (data) {
            _this.dozvole = data;
        });
        var self = this;
        self.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            console.log(_this.user);
            if (_this.user.id) {
                _this.getArrays();
                _this.userIsOwner();
            }
            _this.uzmiImanja();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        if (document.getElementById('googleMap') == undefined || document.getElementById('googleMap') == null)
            return;
        self.map = new google.maps.Map(document.getElementById('googleMap'), {
            center: { lat: 44.017813, lng: 20.907229 },
            zoom: 7
        });
        self.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['polygon'],
            },
            polygonOptions: {
                clickable: true,
                editable: true,
                zIndex: 1
            }
        });
        google.maps.event.addListener(self.drawingManager, 'overlaycomplete', function (event) {
            var arrayLatLng = event.overlay.getPath().getArray();
            console.log("arrayLatLNg: " + arrayLatLng);
            if (self.nizOverlay == undefined) {
                self.nizOverlay = [];
            }
            self.nizOverlay.push(event.overlay);
            if (self.nizPoligona == undefined) {
                self.nizPoligona = [];
            }
            self.nizPoligona.push(arrayLatLng);
            console.log("nizPOli: " + self.nizPoligona);
        });
        self.drawingManager.setMap(self.map);
    };
    AddPlantation.prototype.getArrays = function () {
        console.log("get arrays");
        this.isLoading = true;
        this.sviPodtipovi = this.getSubtypesById();
        this.proizvodjaci = this.getProducers();
    };
    AddPlantation.prototype.getTypes = function (id) {
        var _this = this;
        console.log(this.user.id + " get tajps");
        this.http.get("types/getTypes/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.tipovi = data;
            console.log(data + " wa wa wa");
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        return this.tipovi;
    };
    AddPlantation.prototype.getSubtypesById = function () {
        var _this = this;
        this.http.get("types/getSubtypes")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.sviPodtipovi = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        console.log(" pa podtipovi" + this.sviPodtipovi);
        return this.sviPodtipovi;
    };
    AddPlantation.prototype.getProducers = function () {
        var _this = this;
        this.http.get("types/getProducers")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.proizvodjaci = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        return this.proizvodjaci;
    };
    AddPlantation.prototype.onSelect = function (typeID) {
        console.log(this.sviPodtipovi[0].idType);
        this.podtipovi = this.sviPodtipovi.filter(function (x) { return x.idType == typeID; });
        console.log("asd dda" + this.podtipovi);
        if (this.podtipovi.length > 0)
            this.ddVisible = true;
        else
            this.ddVisible = false;
    };
    __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(), 
        __metadata('design:type', (typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__plantation__["d" /* Plantation */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__plantation__["d" /* Plantation */]) === 'function' && _a) || Object)
    ], AddPlantation.prototype, "plantation", void 0);
    __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(), 
        __metadata('design:type', (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__plantation__["e" /* Vrsta */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__plantation__["e" /* Vrsta */]) === 'function' && _b) || Object)
    ], AddPlantation.prototype, "Tip", void 0);
    __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(), 
        __metadata('design:type', (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__plantation__["f" /* Proizvodjac */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__plantation__["f" /* Proizvodjac */]) === 'function' && _c) || Object)
    ], AddPlantation.prototype, "proizvodjac", void 0);
    AddPlantation = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'plantation-form',
            //templateUrl:'./plantation.form.component.html',
            template: __webpack_require__(725)
        }), 
        __metadata('design:paramtypes', [(typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_8__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_8__services_perm_service_service__["a" /* PermService */]) === 'function' && _d) || Object, (typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_2__angular_forms__["e" /* FormBuilder */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__angular_forms__["e" /* FormBuilder */]) === 'function' && _e) || Object, (typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_7__plantation_service__["a" /* PlantationService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_7__plantation_service__["a" /* PlantationService */]) === 'function' && _f) || Object, (typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_4__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_4__angular_http__["d" /* Http */]) === 'function' && _g) || Object])
    ], AddPlantation);
    return AddPlantation;
    var _a, _b, _c, _d, _e, _f, _g;
}());
//# sourceMappingURL=addplantation-page.component.js.map

/***/ }),

/***/ 344:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return Plantation; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return Vrsta; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return Proizvodjac; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return tipovi; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return podtipovi; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return proizvodjaci; });
var Plantation = (function () {
    function Plantation() {
        this.name = '';
    }
    return Plantation;
}());
var Vrsta = (function () {
    function Vrsta() {
        this.id = 0;
        this.name = '';
    }
    return Vrsta;
}());
var Proizvodjac = (function () {
    function Proizvodjac() {
        this.id = 0;
        this.name = '';
    }
    return Proizvodjac;
}());
var tipovi = [
    { id: 1, pid: -1, name: "jabuka" },
    { id: 2, pid: -1, name: "kruska" },
    { id: 3, pid: -1, name: "dunja" },
    { id: 4, pid: -1, name: "cvekla" }
];
var podtipovi = [
    { id: 1, pid: 1, name: "zlatni delises" },
    { id: 2, pid: 1, name: "sivi delises" },
    { id: 3, pid: 2, name: "Socna zelena" },
];
var proizvodjaci = [
    { id: 1, name: "ns seme" },
    { id: 2, name: "zemun polje" }
];
//# sourceMappingURL=plantation.js.map

/***/ }),

/***/ 345:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_forms__ = __webpack_require__(96);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_finally__ = __webpack_require__(243);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_finally___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_finally__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_4_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_toPromise__ = __webpack_require__(245);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_toPromise___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_add_operator_toPromise__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_perm_service_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__AddPlantation_plantation_service__ = __webpack_require__(225);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AddTypes; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var AddTypes = (function () {
    function AddTypes(permService, fb, plantationService, http) {
        this.permService = permService;
        this.fb = fb;
        this.plantationService = plantationService;
        this.http = http;
        this.smeDaDodaje = false;
        this.dodatProizvodjac = false;
        this.dodatTip = false;
        this.dodatPodtip = false;
        this.tipovi = [];
        this.podtipovi = [];
        this.komeMozeDaDoda = [];
        this.perm = [];
        this.dozvoleKodGazde = [];
        this.idVlasnika = [];
        this.sviVlasnici = [];
        this.createProducerForm();
        this.createSubtypeForm();
        this.createTypeForm();
    }
    AddTypes.prototype.ngOnInit = function () {
        var _this = this;
        this.permService.getPerms().subscribe(function (data) {
            _this.dozvole = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        var self = this;
        self.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            console.log(_this.user);
            if (_this.user.id) {
                _this.userIsOwner();
            }
            _this.preuzmiStatistiku();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddTypes.prototype.preuzmiStatistiku = function () {
        var _this = this;
        this.http.get("stats/stats")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.stats = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddTypes.prototype.createTypeForm = function () {
        this.typeForm = this.fb.group({
            typeName: ['', __WEBPACK_IMPORTED_MODULE_1__angular_forms__["d" /* Validators */].required],
            isVisible: [''],
            vlasnikPlantaze: ['']
        });
    };
    ;
    AddTypes.prototype.createProducerForm = function () {
        this.producerForm = this.fb.group({
            producerName: ['', __WEBPACK_IMPORTED_MODULE_1__angular_forms__["d" /* Validators */].required]
        });
    };
    ;
    AddTypes.prototype.createSubtypeForm = function () {
        this.subtypeForm = this.fb.group({
            vrsta: ['', __WEBPACK_IMPORTED_MODULE_1__angular_forms__["d" /* Validators */].required],
            subtypeName: ['', __WEBPACK_IMPORTED_MODULE_1__angular_forms__["d" /* Validators */].required]
        });
    };
    AddTypes.prototype.addType = function () {
        var _this = this;
        var novaKultura = this.typeForm.value;
        console.log(novaKultura.isVisible);
        var idOw;
        var vidljiv;
        if (novaKultura.isVisible)
            vidljiv = 1;
        else
            vidljiv = 0;
        if (this.isOwner) {
            idOw = this.user.id;
            console.log(idOw + " add types kad je vlasnik");
            this.http.get("types/addType/" + novaKultura.typeName + "/" + vidljiv + "/" + idOw)
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                _this.test = data;
                if (_this.test.success) {
                    _this.dodatTip = true;
                    setTimeout(function () {
                        _this.dodatTip = false;
                    }, 3000);
                    var novaVrsta = ({
                        id: _this.test.id,
                        name: novaKultura.typeName,
                        pid: -1
                    });
                    _this.tipovi.push(novaVrsta);
                }
                else {
                    _this.dodatTip = false;
                }
            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            this.typeForm.reset();
            console.log(novaKultura.typeName);
        }
        else {
            idOw = novaKultura.vlasnikPlantaze;
            console.log(idOw + " add types kad nije vlasnik");
            if (novaKultura.vlasnikPlantaze == '' || novaKultura.vlasnikPlantaze == null) {
                alert("unesite ime vlasnika plantaze" + novaKultura.vlasnikPlantaze);
            }
            else {
                console.log("vidljiv: " + vidljiv + " od user-a " + this.user.id);
                this.http.get("types/addType/" + novaKultura.typeName + "/" + vidljiv + "/" + idOw)
                    .map(function (res) { return res.json(); })
                    .subscribe(function (data) {
                    _this.test = data;
                    if (_this.test.success) {
                        _this.dodatTip = true;
                        setTimeout(function () {
                            _this.dodatTip = false;
                        }, 3000);
                        var novaVrsta = ({
                            id: _this.test.id,
                            name: novaKultura.typeName,
                            pid: -1
                        });
                        _this.tipovi.push(novaVrsta);
                    }
                    else {
                        _this.dodatTip = false;
                    }
                }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            }
            this.typeForm.reset();
            console.log(novaKultura.typeName);
        }
    };
    AddTypes.prototype.addSubtype = function () {
        var _this = this;
        var novaPodKultura = this.subtypeForm.value;
        console.log(novaPodKultura);
        this.http.get("types/addSubtype/" + novaPodKultura.vrsta + "/" + novaPodKultura.subtypeName)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.test = data;
            if (_this.test.success) {
                _this.dodatPodtip = true;
                setTimeout(function () {
                    _this.dodatPodtip = false;
                }, 3000);
            }
            else {
                _this.dodatPodtip = false;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.subtypeForm.reset();
        console.log(novaPodKultura.typeName);
    };
    AddTypes.prototype.addProducer = function () {
        var _this = this;
        var noviProizvodjac = this.producerForm.value;
        this.http.get("types/addProducer/" + noviProizvodjac.producerName)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.test = data;
            if (_this.test.success) {
                _this.dodatProizvodjac = true;
                setTimeout(function () {
                    _this.dodatProizvodjac = false;
                }, 3000);
                var novPr = ({
                    id: _this.test.id,
                    name: noviProizvodjac.producerName
                });
            }
            else {
                _this.dodatProizvodjac = false;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.producerForm.reset();
        console.log(noviProizvodjac.producerName);
    };
    AddTypes.prototype.getTypes = function (id) {
        var _this = this;
        console.log(this.user.id + " get tajps");
        this.http.get("types/getTypes/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.tipovi = data;
            console.log(data + " wa wa wa");
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        return this.tipovi;
    };
    AddTypes.prototype.userIsOwner = function () {
        var _this = this;
        this.http.get("permisions/userIsOwner")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.isOwner = data.owner;
            if (!_this.isOwner) {
                console.log(_this.isOwner + " u ng on init add types");
                _this.getOwners();
            }
            else {
                _this.tipovi = _this.getTypes(_this.user.id);
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddTypes.prototype.getOwners = function () {
        var _this = this;
        this.http.get("users/getOwners")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.sviVlasnici = data;
            _this.getPerms();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddTypes.prototype.getPerms = function () {
        var _this = this;
        this.http.get("permisions/dozvoleKodVlasnika")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            console.log(data.success + " " + data.dozvole);
            _this.perm = data;
            if (data.dozvole.length > 0) {
                console.log();
                _this.dozvoleKodGazde = data.dozvole.filter(function (x) { return x.vrednosti.tipDodavanje == true; });
                console.log("broj sa dozvolom kod gazde " + _this.dozvoleKodGazde[0].vlasnik);
                if (_this.dozvoleKodGazde.length > 0) {
                    _this.smeDaDodaje = true;
                    _this.spoji();
                }
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddTypes.prototype.spoji = function () {
        console.log(this.sviVlasnici.length + " broj svih vlasnika");
        for (var i = 0; i < this.sviVlasnici.length; i++)
            for (var j = 0; j < this.dozvoleKodGazde.length; j++) {
                console.log(this.sviVlasnici[i].idOwner + " " + this.dozvoleKodGazde[j].vlasnik);
                if (this.sviVlasnici[i].idOwner == this.dozvoleKodGazde[j].vlasnik) {
                    console.log(this.sviVlasnici[i]);
                    // var noviID = {id:this.sviVlasnici[i].idOwner};
                    var noviG = {
                        id: this.sviVlasnici[i].idOwner,
                        name: this.sviVlasnici[i].name,
                        surname: this.sviVlasnici[i].surname,
                        username: this.sviVlasnici[i].username,
                        email: this.sviVlasnici[i].email
                    };
                    this.komeMozeDaDoda.push(noviG);
                    this.idVlasnika.push(this.sviVlasnici[i].idOwner);
                    console.log(this.komeMozeDaDoda[0]);
                }
            }
        this.tipovi = this.getTypes(this.idVlasnika);
    };
    AddTypes = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: "types-form",
            template: __webpack_require__(726)
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_6__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_6__services_perm_service_service__["a" /* PermService */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_forms__["e" /* FormBuilder */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_forms__["e" /* FormBuilder */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_7__AddPlantation_plantation_service__["a" /* PlantationService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_7__AddPlantation_plantation_service__["a" /* PlantationService */]) === 'function' && _c) || Object, (typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_3__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_http__["d" /* Http */]) === 'function' && _d) || Object])
    ], AddTypes);
    return AddTypes;
    var _a, _b, _c, _d;
}());
//# sourceMappingURL=addTypes.js.map

/***/ }),

/***/ 346:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Tab; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var Tab = (function () {
    function Tab() {
        this.active = false;
    }
    __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])('tabTitle'), 
        __metadata('design:type', String)
    ], Tab.prototype, "title", void 0);
    __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Input"])(), 
        __metadata('design:type', Object)
    ], Tab.prototype, "active", void 0);
    Tab = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'tab',
            styles: ["\n    .pane{\n      padding: 1em;\n    }\n  "],
            template: "\n    <div [hidden]=\"!active\" class=\"pane\">\n      <ng-content></ng-content>\n    </div>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], Tab);
    return Tab;
}());
//# sourceMappingURL=tab.js.map

/***/ }),

/***/ 347:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_perm_service_service__ = __webpack_require__(42);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AddWorker; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AddWorker = (function () {
    function AddWorker(permService, http) {
        this.permService = permService;
        this.http = http;
        this.vidljivost = false;
        this.meniVidljiv = false;
        this.updatedRole = false;
        this.uspesnoDodatRadnik = false;
        this.uspesnoIzbrisanRadnik = false;
        this.usernameExists = false;
        this.radnikVecZaposlen = false;
        this.radnikNepostoji = false;
        this.radnikJeVlasnik = false;
    }
    AddWorker.prototype.onChangeRoleUpdate = function (roleID, workerID) {
        this.updateRole = roleID;
        this.updatedRole = true;
        this.workerID = workerID;
        this.update();
        console.log(this.updateRole);
    };
    AddWorker.prototype.onChangeW = function (newValue) {
        this.selectedWorker = newValue;
        console.log(this.selectedWorker);
        console.log(this.user.id);
    };
    AddWorker.prototype.onChangeR = function (newValue) {
        this.selektovan = true;
        this.binary = {};
        this.i = 0;
        this.selectedRole = newValue;
        var n = this.selectedRole;
        var roleValue;
        // foreach petlja za uloge    
        this.roles.forEach(function (data) {
            if (data.id == n)
                roleValue = data.permission;
        });
        // uzmi binarne vrednosti dozvola
        for (this.c = 3; this.c >= 0; this.c--) {
            this.k = roleValue >> this.c;
            if (this.k & 1)
                this.binary[this.i] = 1;
            else
                this.binary[this.i] = 0;
            this.i = this.i + 1;
        }
        console.log(this.binary);
    };
    AddWorker.prototype.meniToggle = function () {
        this.meniVidljiv = !this.meniVidljiv;
    };
    AddWorker.prototype.ngOnInit = function () {
        var _this = this;
        this.permService.getPerms().subscribe(function (data) {
            _this.dozvole = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        console.log("log");
        this.getUsers();
        this.getRoles();
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            console.log(_this.user);
            if (_this.user.success === undefined) {
                _this.vidljivost = true;
                _this.popuniTabelu();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddWorker.prototype.getUsers = function () {
        var _this = this;
        console.log("userrr");
        this.http.get("users/getUsers")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.data = data;
            console.log(_this.data[1]);
            console.log(_this.data);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddWorker.prototype.getUsersWorkers = function () {
        var _this = this;
        console.log("userrr worker");
        this.http.get("users/getUsersWorkers/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.usersWorkers = data;
            console.log("worker user " + _this.usersWorkers);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddWorker.prototype.getRoles = function () {
        var _this = this;
        console.log("userrr");
        this.binary = "";
        this.http.get("users/getRoles")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.roles = data;
            console.log("roles", _this.roles);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AddWorker.prototype.popuniTabelu = function () {
        var _this = this;
        this.http.get("users/prikaziPlantaze/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.vrste = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.getUsersWorkers();
    };
    AddWorker.prototype.dodajRadnika = function () {
        var _this = this;
        this.http.get("users/dodajRadnika2/" + this.user.id + "/" + this.username + "/" + this.selectedRole)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.dataa = data;
            console.log(_this.dataa);
            if (_this.dataa.success) {
                _this.uspesnoDodatRadnik = true;
            }
            else {
                _this.uspesnoDodatRadnik = false;
                if (_this.dataa[0] == "ima") {
                    _this.radnikVecZaposlen = true;
                    setTimeout(function () {
                        _this.radnikVecZaposlen = false;
                    }, 3000);
                }
                else if (_this.dataa[0] == "nema") {
                    _this.radnikNepostoji = true;
                    setTimeout(function () {
                        _this.radnikNepostoji = false;
                    }, 3000);
                }
                else if (_this.dataa[0] == "vlasnik") {
                    _this.radnikJeVlasnik = true;
                    setTimeout(function () {
                        _this.radnikJeVlasnik = false;
                    }, 3000);
                }
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.getUsersWorkers();
    };
    AddWorker.prototype.delete = function (id) {
        var _this = this;
        console.log(id);
        this.http.get("users/deleteWorkers/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.dataa = data;
            _this.uspesnoIzbrisanRadnik = true;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.getUsersWorkers();
    };
    AddWorker.prototype.update = function () {
        var _this = this;
        this.http.get("users/updateWorkers/" + this.workerID + "/" + this.updateRole)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.dataa = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.getUsersWorkers();
    };
    AddWorker = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(727)
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__services_perm_service_service__["a" /* PermService */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _b) || Object])
    ], AddWorker);
    return AddWorker;
    var _a, _b;
}());
//# sourceMappingURL=addworker-page.component.js.map

/***/ }),

/***/ 348:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__ = __webpack_require__(42);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StatisticsPage; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var StatisticsPage = (function () {
    function StatisticsPage(permService, http, localStorageService, router) {
        this.permService = permService;
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.INF = 99999.0;
        this.imaPodataka = false;
        this.podaciTrazeni = false;
        this.vidljivost = false;
        this.vidljivostchart = false;
        this.vidljivostchartBar = false;
        this.vidljivostRadar = false;
        this.meniVidljiv = false;
        this.lineChartOptions = {
            responsive: true
        };
        this.lineChartColors = [
            {
                backgroundColor: 'rgba(12, 16, 127,0.2)',
                borderColor: 'rgba(12, 16, 127,1)',
                pointBackgroundColor: 'rgba(12, 16, 127,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(12, 16, 127,1)'
            },
            {
                backgroundColor: 'rgba(148,159,177,0.2)',
                borderColor: 'rgba(148,159,177,1)',
                pointBackgroundColor: 'rgba(148,159,177,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            },
            {
                backgroundColor: 'rgba(77,83,96,0.2)',
                borderColor: 'rgba(77,83,96,1)',
                pointBackgroundColor: 'rgba(77,83,96,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(77,83,96,1)'
            },
            {
                backgroundColor: 'rgba(35,42,50,0.2)',
                borderColor: 'rgba(35,42,50,1)',
                pointBackgroundColor: 'rgba(35,42,50,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(35,42,50,0.8)'
            },
            {
                backgroundColor: 'rgba(158, 0, 0,0.2)',
                borderColor: 'rgba(158, 0, 0,1)',
                pointBackgroundColor: 'rgba(158, 0, 0,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(158, 0, 0,1)'
            },
            {
                backgroundColor: 'rgba(224, 15, 15,0.2)',
                borderColor: 'rgba(224, 15, 15,1)',
                pointBackgroundColor: 'rgba(224, 15, 15,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(224, 15, 15,1)'
            },
            {
                backgroundColor: 'rgba(247, 91, 91,0.2)',
                borderColor: 'rgba(247, 91, 91,1)',
                pointBackgroundColor: 'rgba(247, 91, 91,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(247, 91, 91,1)'
            },
            {
                backgroundColor: 'rgba(12, 16, 127,0.2)',
                borderColor: 'rgba(12, 16, 127,1)',
                pointBackgroundColor: 'rgba(12, 16, 127,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(12, 16, 127,1)'
            },
            {
                backgroundColor: 'rgba(98, 178, 247,0.2)',
                borderColor: 'rgba(98, 178, 247,1)',
                pointBackgroundColor: 'rgba(98, 178, 247,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(98, 178, 247,1)'
            },
            {
                backgroundColor: 'rgba((3, 61, 155,0.2)',
                borderColor: 'rgba((3, 61, 155,1)',
                pointBackgroundColor: 'rgba(3, 61, 155,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(3, 61, 155,1)'
            },
            {
                backgroundColor: 'rgba(67, 153, 168,0.2)',
                borderColor: 'rgba(67, 153, 168,1)',
                pointBackgroundColor: 'rgba(67, 153, 168,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(67, 153, 168,1)'
            },
            {
                backgroundColor: 'rgba(1, 33, 86,0.2)',
                borderColor: 'rgba(1, 33, 86,1)',
                pointBackgroundColor: 'rgba(1, 33, 86,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(1, 33, 86,1)'
            },
            {
                backgroundColor: 'rgba(1, 9, 22,0.2)',
                borderColor: 'rgba(1, 9, 22,1)',
                pointBackgroundColor: 'rgba(1, 9, 22,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(1, 9, 22,1)'
            }
        ];
        this.lineChartLegend = true;
        this.lineChartType = 'line';
        /////////////////////////////
        this.barChartOptions = {
            scaleShowVerticalLines: false,
            responsive: true
        };
        this.barChartType = 'bar';
        this.barChartLegend = true;
        ///////////////////////////////////////////////////////////////
        this.radarChartLabels = [];
        this.radarChartData = [];
        this.radarChartType = 'radar';
    }
    StatisticsPage.prototype.logout = function () {
        var _this = this;
        this.http.get("sessions/logout")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.localStorageService.set("logged", false);
            _this.router.navigate(['./login']);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    StatisticsPage.prototype.ngOnInit = function () {
        var _this = this;
        this.permService.getPerms().subscribe(function (data) {
            _this.dozvole = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            if (_this.user.success === undefined) {
                _this.vidljivost = true;
                _this.popuniTabelu();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    StatisticsPage.prototype.meniToggle = function () {
        this.meniVidljiv = !this.meniVidljiv;
    };
    StatisticsPage.prototype.popuniTabelu = function () {
        var _this = this;
        this.http.get("users/prikaziPlantaze/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.vrste = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    StatisticsPage.prototype.skloniPoruku = function () {
        this.podaciTrazeni = false;
    };
    /* userIsOwner() {
       this.http.get(`permisions/userIsOwner`)
         .map(res => res.json())
         .subscribe(data => {
           this.isOwner = data.owner;
   
         },
         err => console.log(err),
         () => console.log('Completed'));
     }*/
    StatisticsPage.prototype.prikaziStatistiku = function (id) {
        var _this = this;
        this.http.get("users/informacijeOZemljistu/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.chartdata = data;
            if (_this.chartdata.success) {
                _this.imaPodataka = true;
                _this.vidljivostchart = true;
                _this.lineChartData = _this.chartdata.data;
                _this.lineChartLabels = _this.chartdata.labels;
            }
            else {
                _this.imaPodataka = false;
                _this.podaciTrazeni = true;
                setTimeout(function () {
                    _this.podaciTrazeni = false;
                }, 3000);
                return;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.http.get("users/moisture/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.barData = data;
            if (_this.barData.success) {
                _this.vidljivostchartBar = true;
                _this.barChartData = _this.barData.data;
                _this.barChartLabels = _this.barData.labels;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.http.get("plantations/userPlantation/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            var coords = data;
            _this.coordinates = coords[0].coordinates;
            var xmin = _this.INF, xmax = -_this.INF, ymin = _this.INF, ymax = -_this.INF;
            console.log(_this.coordinates);
            for (var i = 0; i < _this.coordinates[0].length; i++) {
                if (xmin > _this.coordinates[0][i][0])
                    xmin = _this.coordinates[0][i][0];
                if (xmax < _this.coordinates[0][i][0])
                    xmax = _this.coordinates[0][i][0];
                if (ymin > _this.coordinates[0][i][1])
                    ymin = _this.coordinates[0][i][1];
                if (ymax < _this.coordinates[0][i][1])
                    ymax = _this.coordinates[0][i][1];
            }
            _this.centerX = xmin + ((xmax - xmin) / 2);
            _this.centerY = ymin + ((ymax - ymin) / 2);
            _this.uzmiPodatkeOTemperaturi();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    StatisticsPage.prototype.uzmiPodatkeOTemperaturi = function () {
        var _this = this;
        console.log(this.centerY + " : " + this.centerX);
        this.http.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + this.centerY + "&lon=" + this.centerX + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.temperatura = data;
            var datac = new Array();
            ;
            var labels = new Array();
            var limit = _this.temperatura.list.length;
            ;
            for (var i = 0; i < limit; i += 8) {
                datac.push(_this.temperatura.list[i].main.temp);
                labels.push(_this.temperatura.list[i].dt_txt.split(" ")[0]);
            }
            _this.radarChartLabels = labels;
            _this.radarChartData = [{ data: datac, label: "temperatura" }];
            _this.vidljivostRadar = true;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    StatisticsPage.prototype.vratiNaPrikaz = function () {
        this.vidljivostchart = false;
        this.vidljivostchartBar = false;
        this.vidljivostRadar = false;
        this.podaciTrazeni = false;
        this.imaPodataka = false;
    };
    // events
    StatisticsPage.prototype.chartClicked = function (e) {
        console.log(e);
    };
    StatisticsPage.prototype.chartHovered = function (e) {
        console.log(e);
    };
    // events
    StatisticsPage.prototype.chartbarClicked = function (e) {
        console.log(e);
    };
    StatisticsPage.prototype.chartbarHovered = function (e) {
        console.log(e);
    };
    // events
    StatisticsPage.prototype.chartradarClicked = function (e) {
        console.log(e);
    };
    StatisticsPage.prototype.chartradarHovered = function (e) {
        console.log(e);
    };
    StatisticsPage = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(728)
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__["a" /* PermService */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _c) || Object, (typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === 'function' && _d) || Object])
    ], StatisticsPage);
    return StatisticsPage;
    var _a, _b, _c, _d;
}());
//# sourceMappingURL=statistics-page.component.js.map

/***/ }),

/***/ 349:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__ = __webpack_require__(42);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdatePlantation; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var UpdatePlantation = (function () {
    function UpdatePlantation(permService, http, localStorageService, router) {
        this.permService = permService;
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.vidljivost = false;
        this.uspesnoPromenjeniPodaci = false;
        this.mapProp = null;
        this.map = null;
        this.drawingManager = null;
    }
    UpdatePlantation.prototype.callType = function (value) {
        var _this = this;
        this.nazivTip = value;
        window.alert(this.nazivTip);
        this.http.get("users/prikaziIDTipa/" + this.nazivTip)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.idTip = data;
            _this.idT = _this.idTip[0].id;
            _this.popuniPodtip(_this.idT);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation.prototype.callType2 = function (value) {
        this.imePodT = value;
        this.popuniProducer(this.imePodT);
    };
    UpdatePlantation.prototype.initMap = function () {
        var self = this;
        self.map = new google.maps.Map(document.getElementById('googleMap'), {
            center: { lat: 44.017813, lng: 20.907229 },
            zoom: 7
        });
        alert("u initu!");
        self.drawingManager = new google.maps.drawing.DrawingManager({
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['polygon'],
            },
            polygonOptions: {
                clickable: true,
                editable: true,
                zIndex: 1
            }
        });
        self.drawingManager.setMap(self.map);
    };
    UpdatePlantation.prototype.ngOnInit = function () {
        var _this = this;
        this.permService.getPerms().subscribe(function (data) {
            _this.dozvole = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        this.idPlant = this.localStorageService.get("idPlantaze");
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            alert("usao");
            if (_this.user.success === undefined) {
                _this.vidljivost = true;
                _this.popuniPolja();
                _this.nadjiTip(_this.user.id);
                _this.initMap();
                alert("dole!");
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation.prototype.popuniPolja = function () {
        var _this = this;
        var i;
        this.http.get("users/prikaziPodatkeOPlant/" + this.idPlant + "/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.vrste = data;
            _this.imePlant = _this.vrste[0].name;
            _this.imePS = _this.vrste[0].namep;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation.prototype.promeniPodatke = function () {
        var _this = this;
        var novo;
        /*${this.imeTip}*/
        this.http.get("users/promeniPlantaze/" + this.idPlant + "/" + this.user.id + "/" + this.imePlant + "/" + this.nazivTip + "/" + this.imePodT + "/" + this.imePS)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            novo = data;
            if (novo.success) {
                _this.uspesnoPromenjeniPodaci = true;
                setTimeout(function () {
                    _this.uspesnoPromenjeniPodaci = false;
                }, 3000);
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation.prototype.nadjiTip = function (value) {
        var _this = this;
        this.http.get("users/vratiTipove/" + value)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.tipovi = data;
            _this.popuniPodtip(_this.tipovi[0].id);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation.prototype.popuniPodtip = function (value) {
        var _this = this;
        this.http.get("users/prikaziPodtip/" + value)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.podtipovi = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation.prototype.popuniProducer = function (value) {
        var _this = this;
        var imePS1;
        this.http.get("users/prikaziProizvodjaca/" + value)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            imePS1 = data;
            _this.imePS = imePS1[0].name;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdatePlantation = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-update-plantation',
            template: __webpack_require__(729),
            styles: [__webpack_require__(707)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__["a" /* PermService */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _c) || Object, (typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === 'function' && _d) || Object])
    ], UpdatePlantation);
    return UpdatePlantation;
    var _a, _b, _c, _d;
}());
//# sourceMappingURL=update-plantation.component.js.map

/***/ }),

/***/ 350:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdateUser; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var UpdateUser = (function () {
    function UpdateUser(http, localStorageService, router) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.vidljivost = false;
        this.meniVidljiv = false;
        this.promeniSifruVidljivo = true;
        this.promeniOstalePodatkeVidljivo = false;
        this.promeniSlikuVidljivo = false;
        this.imaNeko = false;
        this.pogresnaSifra = false;
        this.country_array = new Array("Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Barbuda", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Trty.", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Caicos Islands", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Futuna Islands", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard", "Herzegovina", "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Jan Mayen Islands", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea", "Korea (Democratic)", "Kuwait", "Kyrgyzstan", "Lao", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "McDonald Islands", "Mexico", "Micronesia", "Miquelon", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "Nevis", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Principe", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts", "Saint Lucia", "Saint Martin (French part)", "Saint Pierre", "Saint Vincent", "Samoa", "San Marino", "Sao Tome", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia", "South Sandwich Islands", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "The Grenadines", "Timor-Leste", "Tobago", "Togo", "Tokelau", "Tonga", "Trinidad", "Tunisia", "Turkey", "Turkmenistan", "Turks Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "US Minor Outlying Islands", "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (US)", "Wallis", "Western Sahara", "Yemen", "Zambia", "Zimbabwe");
        this.uspesno = false;
        this.uspesnoPromenjenaSifra = false;
        this.neuspesno = false;
    }
    UpdateUser.prototype.promeniTab = function (vidljivo) {
        switch (vidljivo) {
            case 'sifra':
                this.promeniSifruVidljivo = true;
                this.promeniOstalePodatkeVidljivo = this.promeniSlikuVidljivo = false;
                break;
            case 'podaci':
                this.promeniOstalePodatkeVidljivo = true;
                this.promeniSifruVidljivo = this.promeniSlikuVidljivo = false;
                break;
            default:
                this.promeniSlikuVidljivo = true;
                this.promeniOstalePodatkeVidljivo = this.promeniSifruVidljivo = false;
                break;
        }
    };
    UpdateUser.prototype.logout = function () {
        var _this = this;
        this.http.get("sessions/logout")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.localStorageService.set("logged", false);
            _this.router.navigate(['./login']);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateUser.prototype.meniToggle = function () {
        this.meniVidljiv = !this.meniVidljiv;
    };
    UpdateUser.prototype.callType = function (value) {
        this.drzava = value;
    };
    UpdateUser.prototype.ngOnInit = function () {
        this.ucitajPodatkeOKorisniku();
    };
    UpdateUser.prototype.ucitajPodatkeOKorisniku = function () {
        var _this = this;
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            if (_this.user.success === undefined) {
                _this.vidljivost = true;
                _this.id = _this.user.id;
                _this.ime = _this.user.name;
                _this.prezime = _this.user.surname;
                _this.drzava = _this.user.country;
                _this.sifraa = _this.localStorageService.get("password");
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateUser.prototype.promeniPodatke = function () {
        var _this = this;
        var pom2;
        this.http.get("users/promenipodatke/" + this.ime + "/" + this.prezime + "/" + this.drzava + "/" + this.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom2 = data;
            if (pom2.success) {
                _this.uspesno = true;
                setTimeout(function () {
                    _this.uspesno = false;
                }, 3000);
                _this.pogresnaSifra = false;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateUser.prototype.promeniSliku = function () {
        var _this = this;
        this.http.get("users/osveziPodatke")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.ucitajPodatkeOKorisniku();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateUser.prototype.promeniSifru = function () {
        var _this = this;
        if (this.pass1 != this.pass2 || this.pass1 == null || this.pass2 == null) {
            this.neuspesno = true;
            setTimeout(function () {
                _this.neuspesno = false;
            }, 3000);
        }
        else {
            var pom;
            this.http.get("users/proveriSifru2/" + this.staraSifra + "/" + this.id)
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                pom = data;
                if (pom.success) {
                    _this.http.get("users/proveriSifru/" + _this.pass1)
                        .map(function (res) { return res.json(); })
                        .subscribe(function (data) {
                        pom = data;
                        if (pom.success) {
                            _this.http.get("users/promeniSifru/" + _this.pass1 + "/" + _this.id)
                                .map(function (res) { return res.json(); })
                                .subscribe(function (data) {
                                _this.userSifra = data;
                                if (_this.userSifra.success) {
                                    _this.uspesnoPromenjenaSifra = true;
                                    setTimeout(function () {
                                        _this.uspesnoPromenjenaSifra = false;
                                    }, 3000);
                                    _this.neuspesno = false;
                                    _this.imaNeko = false;
                                    _this.pogresnaSifra = false;
                                }
                            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
                        }
                    }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
                }
                else {
                    window.alert("tu sam!");
                    _this.imaNeko = false;
                    _this.uspesnoPromenjenaSifra = false;
                    _this.neuspesno = false;
                    _this.pogresnaSifra = true;
                }
            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        }
    };
    UpdateUser = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-update-user',
            template: __webpack_require__(730),
            styles: [__webpack_require__(708)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === 'function' && _c) || Object])
    ], UpdateUser);
    return UpdateUser;
    var _a, _b, _c;
}());
//# sourceMappingURL=update-user.component.js.map

/***/ }),

/***/ 351:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Rx__ = __webpack_require__(750);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_rxjs_Rx___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_rxjs_Rx__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_map__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_6_rxjs_add_operator_map__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UserPage; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};







var UserPage = (function () {
    function UserPage(cdr, http, localStorageService, router, permService) {
        this.cdr = cdr;
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.permService = permService;
        this.month = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
        this.pieChartType = 'pie';
        this.parcelaVidljiva = false;
        this.plantazaVidljiva = true;
        this.INF = 99999;
        this.gleda = false;
        this.sideBarVidljiv = false;
        this.vidljivost = false;
        this.meniVidljiv = false;
        /*private options: any = {
          legend: { position: 'left' , labels: {boxWidth: 10, fontSize: 10}}
        };*/
        this.mapProp = null;
        this.map = null;
        this.drawingManager = null;
        this.prikaz = true;
        this.trenutni = -1;
    }
    UserPage.prototype.logout = function () {
        var _this = this;
        this.http.get("sessions/logout")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.localStorageService.set("logged", false);
            _this.router.navigate(['./login']);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.promeniTab = function () {
        this.parcelaVidljiva = !this.parcelaVidljiva;
        this.plantazaVidljiva = !this.plantazaVidljiva;
    };
    UserPage.prototype.posalji = function () {
        var pom3;
        window.alert(this.ime + " " + this.naslov + " " + this.email + " " + this.poruka);
        this.http.get("users/posaljiMail2/" + this.ime + "/" + this.naslov + "/" + this.email + "/" + this.poruka)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom3 = data;
            if (pom3.success) {
                window.alert("Poslato!");
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.duz = function (tacka1, tacka2) {
        return Math.sqrt(Math.pow(tacka1[1] - tacka2[1], 2) + Math.pow(tacka1[0] - tacka2[0], 2));
    };
    UserPage.prototype.heronovObrazac = function (tacka1, tacka2, tacka3) {
        var duz1, duz2, duz3;
        duz1 = this.duz(tacka1, tacka2);
        duz2 = this.duz(tacka1, tacka3);
        duz3 = this.duz(tacka2, tacka3);
        var s = (duz1 + duz2 + duz3) / 2;
        return Math.sqrt(s * (s - duz1) * (s - duz2) * (s - duz3));
    };
    UserPage.prototype.nadjiCentar = function (nizKord) {
        var lat = 0, lng = 0;
        for (var i = 0; i < nizKord.length - 1; i++) {
            lat += nizKord[i][0];
            lng += nizKord[i][1];
            alert(lat + " -- " + lng);
        }
        lat = lat / (nizKord.length - 1);
        lng = lng / (nizKord.length - 1);
        return new google.maps.LatLng(lng, lat);
    };
    UserPage.prototype.namestiZum = function (nizKord) {
        var najLevo = 200, najDesno = -200, najGore = -200, najDole = 200;
        var najRazlika;
        for (var i = 0; i < nizKord.length; i++) {
            // alert("kord: " + nizKord[i][0] + ":" + nizKord[i][1]);
            if (najLevo > nizKord[i][1])
                najLevo = nizKord[i][1];
            if (najDesno < nizKord[i][1])
                najDesno = nizKord[i][1];
            if (najGore < nizKord[i][0])
                najGore = nizKord[i][0];
            if (najDole > nizKord[i][0])
                najDole = nizKord[i][0];
        }
        if (najGore - najDole > najDesno - najLevo) {
            najRazlika = najGore - najDole;
        }
        else {
            najRazlika = najDesno - najLevo;
        }
        //alert(najRazlika);
        var niz = {
            20: 1128.497220,
            19: 2256.994440,
            18: 4513.988880,
            17: 9027.977761,
            16: 18055.955520,
            15: 36111.911040,
            14: 72223.822090,
            13: 144447.644200,
            12: 288895.288400,
            11: 577790.576700,
            10: 1155581.153000,
            9: 2311162.307000,
            8: 4622324.614000,
            7: 9244649.227000,
            6: 18489298.450000,
            5: 36978596.910000,
            4: 73957193.820000,
            3: 147914387.600000,
            2: 295828775.300000,
            1: 591657550.500000,
        };
        for (var i = 1; i <= 20; i++) {
            //alert("ovde si: "+niz[i])
            if (niz[i] < najRazlika * 100)
                return i;
        }
        return 10;
    };
    UserPage.prototype.initMap = function (coords) {
        var self = this;
        var nizPoligona = [];
        var poligon = [];
        var zoom = 2;
        var centar; // da se dogovorimo dal crtamo 1 ili vise?
        var povrsina = 0;
        for (var i = 0; i < coords[0].coordinates.length; i++) {
            for (var j = 0; j < coords[0].coordinates[i].length - 1; j++) {
                poligon.push(new google.maps.LatLng(coords[0].coordinates[0][j][1], coords[0].coordinates[0][j][0]));
            }
            nizPoligona.push(poligon);
        }
        for (var i = 0; i < coords[0].coordinates.length; i++) {
            for (var j = 1; j < coords[0].coordinates[i].length - 2; j++) {
                povrsina += this.heronovObrazac(coords[0].coordinates[0][0], coords[0].coordinates[0][j], coords[0].coordinates[0][j + 1]);
            }
        }
        centar = this.nadjiCentar(coords[0].coordinates[0]);
        zoom = this.namestiZum(coords[0].coordinates[0]);
        alert(zoom);
        alert(centar);
        self.map = new google.maps.Map(document.getElementById('googleMap'), {
            center: centar,
            zoom: zoom
        });
        var polygons = new google.maps.Polygon({
            paths: nizPoligona,
            strokeColor: '#FF0000',
            strokeOpacity: 0.8,
            strokeWeight: 2,
            fillColor: '#FF0000',
            fillOpacity: 0.35
        });
        polygons.setMap(self.map);
    };
    UserPage.prototype.nazadNaPrikaz = function () {
        this.sideBarVidljiv = false;
    };
    UserPage.prototype.prikaziPlantazu = function (value) {
        var _this = this;
        var coords;
        this.sideBarVidljiv = true;
        this.izabranaPlantaza = this.vrste.find(function (x) { return x.id == value; });
        //alert(value);
        this.http.get("/plantations/userPlantation/" + value)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            coords = data;
            console.log("stiglo: " + coords[0].coordinates);
            console.log("Stiglo realno: " + coords + "\n " + JSON.stringify(coords));
            var coordinates = coords[0].coordinates;
            if (_this.trenutni == -1 || _this.trenutni == value) {
                if (_this.prikaz) {
                    document.getElementById('mapID').innerHTML = "<div class='col-md-9'><div id='googleMap' style='width: 100%; height: 700px'></div></div>";
                    _this.initMap(coords);
                }
                else {
                    document.getElementById('mapID').innerHTML = "";
                }
                _this.trenutni = value;
                _this.prikaz = !_this.prikaz;
            }
            else {
                document.getElementById('mapID').innerHTML = "<div class='col-md-9'><div id='googleMap' style='width: 100%; height: 700px'></div></div>";
                _this.initMap(coords);
                _this.trenutni = value;
                _this.prikaz = false;
            }
            var xmin = _this.INF, xmax = -_this.INF, ymin = _this.INF, ymax = -_this.INF;
            for (var i = 0; i < coordinates[0].length; i++) {
                if (xmin > coordinates[0][i][0])
                    xmin = coordinates[0][i][0];
                if (xmax < coordinates[0][i][0])
                    xmax = coordinates[0][i][0];
                if (ymin > coordinates[0][i][1])
                    ymin = coordinates[0][i][1];
                if (ymax < coordinates[0][i][1])
                    ymax = coordinates[0][i][1];
            }
            _this.centerX = xmin + ((xmax - xmin) / 2);
            _this.centerY = ymin + ((ymax - ymin) / 2);
            console.log("X: " + _this.centerX + " Y: " + _this.centerY);
            _this.uzmiPodatkeOTemperaturi();
            _this.uzmiNutriPodatke();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.uzmiNutriPodatke = function () {
        var _this = this;
        this.http.get("/stats/current")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.pieChartData = data.data;
            _this.pieChartLabels = data.labels;
            _this.vlaznostZemljista = data.vlaznost;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.uzmiPodatkeOTemperaturi = function () {
        var _this = this;
        this.http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + this.centerY + "&lon=" + this.centerX + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.temperatura = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.kelvinToCelsius = function (temp) {
        return Math.round((temp - 273.15) * 100) / 100;
    };
    UserPage.prototype.meniToggle = function () {
        this.meniVidljiv = !this.meniVidljiv;
    };
    UserPage.prototype.ngOnInit = function () {
        var _this = this;
        this.d = new Date();
        this.date = this.d.getDate();
        this.mon = this.month[this.d.getMonth()];
        this.localStorageService.remove("guest");
        this.permService.getPerms().subscribe(function (data) {
            _this.dozvole = data;
            if (_this.dozvole.guest != undefined)
                _this.localStorageService.set("guest", _this.dozvole.guest);
            _this.http.get("sessions/LogovaniKorisnik")
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                _this.user = data;
                if (_this.user.success === undefined) {
                    _this.vidljivost = true;
                    _this.popuniTabelu();
                    _this.popuniTabelu1();
                }
            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
        });
    };
    /*
      preuzmiStatistiku() {
        this.http.get(`stats/stats`)
          .map(res => res.json())
          .subscribe(data => {
            this.stats = data;
    
    
          },
          err => console.log(err),
          () => console.log('Completed'));
    
    
      }*/
    UserPage.prototype.popuniTabelu = function () {
        var _this = this;
        // window.alert("tu sam!");
        var i;
        this.http.get("users/prikaziPlantaze/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.vrste = data;
            for (var i = 0; i < _this.vrste.length; i++) {
                _this.vrste[i].dozvole = _this.dozvole.plantaze.find(function (x) { return x.id == _this.vrste[i].id; }).dozvole;
            }
            // window.alert(this.vrste[0].name);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.popuniTabelu1 = function () {
        var _this = this;
        var i;
        this.http.get("users/prikaziImanje/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.imanja = data;
            for (var i = 0; i < _this.vrste.length; i++) {
                _this.vrste[i].dozvole = _this.dozvole.plantaze.find(function (x) { return x.id == _this.vrste[i].id; }).dozvole;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UserPage.prototype.Obrisi1 = function (value) {
        var _this = this;
        var podatak;
        this.http.get("users/obrisiImanje/" + value)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            podatak = data;
            if (podatak.success) {
                _this.popuniTabelu1();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Brise plantazu'); });
    };
    UserPage.prototype.smeDaGleda = function (id) {
        return true;
    };
    UserPage.prototype.Obrisi = function (value) {
        var _this = this;
        var idPlant = value;
        var podatak;
        this.http.get("users/obrisiPlantazu/" + idPlant)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            podatak = data;
            if (podatak.success) {
                if (_this.trenutni == value) {
                    document.getElementById('mapID').innerHTML = "";
                    _this.prikaz = false;
                }
                _this.popuniTabelu();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Brise plantazu'); });
    };
    UserPage.prototype.AzurirajParcelu = function (value) {
        this.localStorageService.set("idParcele", value);
        this.router.navigate(['./updateparcel']);
        this.http.get("sessions/LogovaniKorisnik");
    };
    UserPage.prototype.AzurirajPlant = function (value) {
        var idPlant = value;
        this.localStorageService.set("idPlantaze", value);
        this.router.navigate(['./updateplantation']);
        this.http.get("sessions/LogovaniKorisnik");
    };
    //chart
    // events
    UserPage.prototype.chartClicked = function (e) {
        console.log(e);
    };
    UserPage.prototype.chartHovered = function (e) {
        console.log(e);
    };
    UserPage = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(731),
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["ChangeDetectorRef"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_0__angular_core__["ChangeDetectorRef"]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _c) || Object, (typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === 'function' && _d) || Object, (typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_4__services_perm_service_service__["a" /* PermService */]) === 'function' && _e) || Object])
    ], UserPage);
    return UserPage;
    var _a, _b, _c, _d, _e;
}());
//# sourceMappingURL=user-page.component.js.map

/***/ }),

/***/ 352:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_take__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_take___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_take__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AdminAuthGuard; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var AdminAuthGuard = (function () {
    function AdminAuthGuard(http, localStorageService) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.canAccess = false;
    }
    AdminAuthGuard.prototype.canActivate = function () {
        console.log(this.localStorageService.get("admin"));
        return this.localStorageService.get("admin");
    };
    AdminAuthGuard.prototype.ngOnInit = function () {
    };
    AdminAuthGuard = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object])
    ], AdminAuthGuard);
    return AdminAuthGuard;
    var _a, _b;
}());
//# sourceMappingURL=admin-auth-guard-service.js.map

/***/ }),

/***/ 353:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AdminPageComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AdminPageComponent = (function () {
    function AdminPageComponent(http, router) {
        this.http = http;
        this.router = router;
        this.vidljivost = false;
        this.prikaziUsere = false;
        this.prikaziZahtev = false;
        this.uspesno = false;
    }
    AdminPageComponent.prototype.ngOnInit = function () {
    };
    AdminPageComponent.prototype.prikaziSve = function () {
        var _this = this;
        this.http.get("users/prikaziKorisnike")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.sviKorisnici = data;
            _this.prikaziUsere = true;
            _this.prikaziZahtev = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AdminPageComponent.prototype.prikaziZahteve = function () {
        var _this = this;
        this.http.get("users/prikaziSveZahteve")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.sviZahtevi = data;
            _this.prikaziZahtev = true;
            _this.prikaziUsere = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AdminPageComponent.prototype.Dozvoli = function (value) {
        var _this = this;
        var id = value;
        var pom1;
        var pom2;
        this.http.get("users/dozvolaZaVlasnika/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom1 = data;
            if (pom1.success == true) {
                _this.http.get("users/dozvolaZaVlasnika1/" + id)
                    .map(function (res) { return res.json(); })
                    .subscribe(function (data) {
                    pom2 = data;
                    if (pom2.success == true) {
                        _this.uspesno = true;
                        _this.prikaziZahteve();
                    }
                }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AdminPageComponent.prototype.Ignorisi = function (value) {
        var _this = this;
        var pom3;
        this.http.get("users/obrisiZahtev/" + value)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom3 = data;
            if (pom3.success == true) {
                _this.uspesno = true;
                _this.prikaziZahteve();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    AdminPageComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-admin-page',
            template: __webpack_require__(733),
            styles: [__webpack_require__(709)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */]) === 'function' && _b) || Object])
    ], AdminPageComponent);
    return AdminPageComponent;
    var _a, _b;
}());
//# sourceMappingURL=admin-page.component.js.map

/***/ }),

/***/ 354:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_take__ = __webpack_require__(244);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_take___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_take__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AuthGuard; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var AuthGuard = (function () {
    function AuthGuard(http, localStorageService) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.canAccess = false;
    }
    AuthGuard.prototype.canActivate = function () {
        console.log(this.localStorageService.get("logged"));
        return this.localStorageService.get("logged");
    };
    AuthGuard.prototype.ngOnInit = function () {
    };
    AuthGuard = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object])
    ], AuthGuard);
    return AuthGuard;
    var _a, _b;
}());
//# sourceMappingURL=auth-guard-service.js.map

/***/ }),

/***/ 355:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ImageUploadComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ImageUploadComponent = (function () {
    function ImageUploadComponent(http) {
        this.http = http;
    }
    ImageUploadComponent.prototype.ngOnInit = function () {
    };
    ImageUploadComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-image-upload',
            template: __webpack_require__(735),
            styles: [__webpack_require__(710)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object])
    ], ImageUploadComponent);
    return ImageUploadComponent;
    var _a;
}());
//# sourceMappingURL=image-upload.component.js.map

/***/ }),

/***/ 356:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InboxComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var InboxComponent = (function () {
    function InboxComponent(http, localStorageService, router) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.primljenePoruke = [];
    }
    InboxComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            if (_this.user.success === undefined) {
                _this.getMessages();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    InboxComponent.prototype.getMessages = function () {
        var _this = this;
        this.http.get('messages/getMessages')
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.primljenePoruke = data;
            _this.brojPrimljenih();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    InboxComponent.prototype.brojPrimljenih = function () {
        var poruke = this.primljenePoruke.filter(function (x) { return x.read == 1; });
        this.brojPoruka = poruke.length;
        console.log(poruke.length);
    };
    InboxComponent.prototype.goToMessage = function (poruka) {
        this.selectedMessage = { id: poruka.id };
        this.router.navigate(['./msg', this.selectedMessage]);
    };
    InboxComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-inbox',
            template: __webpack_require__(736),
            styles: [__webpack_require__(711)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === 'function' && _c) || Object])
    ], InboxComponent);
    return InboxComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=inbox.component.js.map

/***/ }),

/***/ 357:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4_ng2_datepicker__ = __webpack_require__(488);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_5_angular_2_local_storage__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return LoginComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






//import {DatePicker} from "../DatePicker/datapicker-component";
var LoginComponent = (function () {
    function LoginComponent(http, router, localStorageService) {
        this.http = http;
        this.router = router;
        this.localStorageService = localStorageService;
        this.pogresniPodaci = false;
        this.country_array = new Array("Afghanistan", "Aland Islands", "Albania", "Algeria", "American Samoa", "Andorra", "Angola", "Anguilla", "Antarctica", "Antigua", "Argentina", "Armenia", "Aruba", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Barbuda", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia", "Botswana", "Bouvet Island", "Brazil", "British Indian Ocean Trty.", "Brunei Darussalam", "Bulgaria", "Burkina Faso", "Burundi", "Caicos Islands", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Cayman Islands", "Central African Republic", "Chad", "Chile", "China", "Christmas Island", "Cocos (Keeling) Islands", "Colombia", "Comoros", "Congo", "Congo, Democratic Republic of the", "Cook Islands", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Falkland Islands (Malvinas)", "Faroe Islands", "Fiji", "Finland", "France", "French Guiana", "French Polynesia", "French Southern Territories", "Futuna Islands", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Gibraltar", "Greece", "Greenland", "Grenada", "Guadeloupe", "Guam", "Guatemala", "Guernsey", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Heard", "Herzegovina", "Holy See", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran (Islamic Republic of)", "Iraq", "Ireland", "Isle of Man", "Israel", "Italy", "Jamaica", "Jan Mayen Islands", "Japan", "Jersey", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea", "Korea (Democratic)", "Kuwait", "Kyrgyzstan", "Lao", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libyan Arab Jamahiriya", "Liechtenstein", "Lithuania", "Luxembourg", "Macao", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Martinique", "Mauritania", "Mauritius", "Mayotte", "McDonald Islands", "Mexico", "Micronesia", "Miquelon", "Moldova", "Monaco", "Mongolia", "Montenegro", "Montserrat", "Morocco", "Mozambique", "Myanmar", "Namibia", "Nauru", "Nepal", "Netherlands", "Netherlands Antilles", "Nevis", "New Caledonia", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Niue", "Norfolk Island", "Northern Mariana Islands", "Norway", "Oman", "Pakistan", "Palau", "Palestinian Territory, Occupied", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Pitcairn", "Poland", "Portugal", "Principe", "Puerto Rico", "Qatar", "Reunion", "Romania", "Russian Federation", "Rwanda", "Saint Barthelemy", "Saint Helena", "Saint Kitts", "Saint Lucia", "Saint Martin (French part)", "Saint Pierre", "Saint Vincent", "Samoa", "San Marino", "Sao Tome", "Saudi Arabia", "Senegal", "Serbia", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "South Georgia", "South Sandwich Islands", "Spain", "Sri Lanka", "Sudan", "Suriname", "Svalbard", "Swaziland", "Sweden", "Switzerland", "Syrian Arab Republic", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "The Grenadines", "Timor-Leste", "Tobago", "Togo", "Tokelau", "Tonga", "Trinidad", "Tunisia", "Turkey", "Turkmenistan", "Turks Islands", "Tuvalu", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "US Minor Outlying Islands", "Uzbekistan", "Vanuatu", "Vatican City State", "Venezuela", "Vietnam", "Virgin Islands (British)", "Virgin Islands (US)", "Wallis", "Western Sahara", "Yemen", "Zambia", "Zimbabwe");
        this.pogresniPodaciReg = false;
        this.praznaPolja = false;
        this.uspesnaRegistracija = false;
        this.calendarOptions = {
            format: "DD-MM-YYYY",
        };
        this.nePostoji = false;
        this.poslato = false;
        this.options = new __WEBPACK_IMPORTED_MODULE_4_ng2_datepicker__["b" /* DatePickerOptions */]();
        this.drzava = this.country_array[0];
    }
    LoginComponent.prototype.ngOnInit = function () {
        this.localStorageService.set("logged", false);
    };
    LoginComponent.prototype.povratiSifru = function () {
        var _this = this;
        var pom1;
        this.http.get("users/proveriUser/" + this.user1)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom1 = data;
            if (pom1.success) {
                _this.http.get("users/vratiEmail/" + _this.user1)
                    .map(function (res) { return res.json(); })
                    .subscribe(function (data) {
                    _this.pomm = data;
                    _this.http.get("users/probaSifre")
                        .map(function (res) { return res.json(); })
                        .subscribe(function (data) {
                        _this.pom2 = data;
                        _this.nePostoji = false;
                        _this.posaljiNaMail();
                    }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
                }, function (err) { return console.log(err); }, function () { return console.log('Completed reg'); });
            }
            else {
                window.alert("Aaa");
                _this.nePostoji = true;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    LoginComponent.prototype.resetuj = function () {
        this.pogresniPodaci = false;
        this.pogresniPodaciReg = false;
        this.praznaPolja = false;
        this.uspesnaRegistracija = false;
    };
    LoginComponent.prototype.posaljiNaMail = function () {
        var _this = this;
        var pom3;
        var email = this.pomm;
        var sifra = this.pom2;
        this.http.get("users/posaljiMail/" + email + "/" + sifra)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom3 = data;
            if (pom3.success) {
                _this.http.get("users/promeniSifru2/" + _this.user1 + "/" + sifra)
                    .map(function (res) { return res.json(); })
                    .subscribe(function (data) {
                    var pom4;
                    pom4 = data;
                    if (pom4.success) {
                        _this.poslato = true;
                    }
                }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    LoginComponent.prototype.callType = function (value) {
        this.drzava = value;
    };
    LoginComponent.prototype.Login = function () {
        var _this = this;
        var pom;
        //window.alert(this.username+" "+this.password);
        this.http.get("users/users/" + this.username + "/" + this.password)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.data = data;
            if (_this.data.success) {
                _this.localStorageService.set("logged", true);
                _this.localStorageService.set("password", _this.password);
                _this.http.get("users/proveriAdmina/" + _this.username + "/" + _this.password)
                    .map(function (res) { return res.json(); })
                    .subscribe(function (data) {
                    pom = data;
                    if (pom.success) {
                        _this.localStorageService.set("admin", true);
                        _this.router.navigate(['./admin']);
                    }
                    else {
                        _this.localStorageService.set("admin", false);
                        _this.router.navigate(['./user']);
                    }
                }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            }
            else {
                _this.pogresniPodaci = true;
                setTimeout(function () {
                    _this.pogresniPodaci = false;
                }, 3000);
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    LoginComponent.prototype.RegistrujSe = function () {
        var _this = this;
        /*  window.alert(this.date.formatted);*/
        if (this.imeReg == null || this.prezimeReg == null || this.usernameReg == null || this.passwordReg == null || this.emailReg == null) {
            this.praznaPolja = true;
            setTimeout(function () {
                _this.praznaPolja = false;
            }, 3000);
        }
        else if (this.imeReg != null && this.prezimeReg != null && this.usernameReg != null && this.passwordReg != null && this.emailReg != null) {
            this.praznaPolja = false;
            this.http.get("users/register/" + this.usernameReg + "/" + this.passwordReg + "/" + this.emailReg)
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                _this.data = data;
                if (_this.data.success) {
                    /*   this.uspesnaRegistracija=true;*/
                    _this.popuniBazu();
                }
                else {
                    _this.pogresniPodaciReg = true;
                    setTimeout(function () {
                        _this.pogresniPodaciReg = false;
                    }, 3000);
                }
            }, function (err) { return console.log(err); }, function () { return console.log('Completed provera'); });
        }
    };
    LoginComponent.prototype.popuniBazu = function () {
        var _this = this;
        console.log(this.drzava);
        this.http.get("users/dodajUBazu/" + this.usernameReg + "/" + this.passwordReg + "/" + this.emailReg + "/" + this.imeReg + "/" + this.prezimeReg + "/" + this.drzava + "/" + this.date.formatted)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.dataa = data;
            console.log(_this.dataa.success);
            if (_this.dataa.success) {
                _this.uspesnaRegistracija = true;
                setTimeout(function () {
                    _this.uspesnaRegistracija = false;
                }, 3000);
                _this.pogresniPodaciReg = false;
            }
            else {
                _this.uspesnaRegistracija = false;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed reg'); });
    };
    LoginComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app',
            template: __webpack_require__(737)
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_5_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_5_angular_2_local_storage__["LocalStorageService"]) === 'function' && _c) || Object])
    ], LoginComponent);
    return LoginComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=login.component.js.map

/***/ }),

/***/ 358:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MapaComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var MapaComponent = (function () {
    function MapaComponent() {
    }
    MapaComponent.prototype.ngOnInit = function () {
        var mapProp = {
            center: new google.maps.LatLng(51.508742, -0.120850),
            zoom: 5,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };
        var map = new google.maps.Map(document.getElementById('googleMap'), {
            center: { lat: -34.397, lng: 150.644 },
            zoom: 8
        });
        var drawingManager = new google.maps.drawing.DrawingManager({
            drawingMode: google.maps.drawing.OverlayType.MARKER,
            drawingControl: true,
            drawingControlOptions: {
                position: google.maps.ControlPosition.TOP_CENTER,
                drawingModes: ['polygon']
            },
            markerOptions: { icon: 'https://developers.google.com/maps/documentation/javascript/examples/full/images/beachflag.png' },
            circleOptions: {
                fillColor: '#ffff00',
                fillOpacity: 1,
                strokeWeight: 5,
                clickable: false,
                editable: true,
                zIndex: 1
            }
        });
        google.maps.event.addListener(drawingManager, 'overlaycomplete', function (event) {
            var arrayLatLng = event.overlay.getPath().getArray();
            alert(arrayLatLng);
        });
        drawingManager.setMap(map);
    };
    MapaComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app',
            template: __webpack_require__(738),
            styles: [__webpack_require__(712)]
        }), 
        __metadata('design:paramtypes', [])
    ], MapaComponent);
    return MapaComponent;
}());
//# sourceMappingURL=mapa.component.js.map

/***/ }),

/***/ 359:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_switchMap__ = __webpack_require__(492);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_switchMap___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_switchMap__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(10);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MsgComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var MsgComponent = (function () {
    function MsgComponent(http, route, redRouter) {
        this.http = http;
        this.route = route;
        this.redRouter = redRouter;
        this.comm = '';
        this.obrisano = false;
        this.porukaPoslata = false;
        this.procitano = false;
        this.selectedMessage = [];
    }
    MsgComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data.id;
        });
        this.route.params
            .subscribe(function (params) {
            _this.mess = params['id'];
        });
        this.getMessage(this.mess);
        console.log(this.mess);
    };
    MsgComponent.prototype.getMessage = function (id) {
        var _this = this;
        console.log(id);
        this.http.get("messages/getMessage/" + id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            console.log(data[0].idReceiver + " msg komp poruka");
            _this.selectedMessage = data;
            if (data[0].idReceiver == _this.user)
                _this.markAsRead(data[0].id);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MsgComponent.prototype.brzOdgovor = function (username) {
        var _this = this;
        console.log(username + " " + this.comm);
        this.comm;
        this.http.get("messages/sendMessage/" + username + "/" + this.comm)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (data.success) {
                _this.porukaPoslata = true;
                _this.comm = '';
            }
            else
                _this.porukaPoslata = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MsgComponent.prototype.obrisiPoruku = function (porukeZaBrisanje, idSender) {
        var _this = this;
        console.log(this.user + " == " + idSender + " obrisi poruku");
        if (this.user == idSender) {
            this.http.get("messages/deleteSenderMessages/" + porukeZaBrisanje)
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                if (data.success)
                    _this.obrisano = true;
                else
                    _this.obrisano = false;
            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            this.redRouter.navigate(['/inbox']);
        }
        else {
            this.http.get("messages/deleteReceiverMessages/" + porukeZaBrisanje)
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                if (data.success)
                    _this.obrisano = true;
                else
                    _this.obrisano = false;
            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            this.redRouter.navigate(['/inbox']);
        }
    };
    MsgComponent.prototype.markAsRead = function (procitanePoruke) {
        var _this = this;
        this.http.get("messages/markAsRead/" + procitanePoruke)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (data.success)
                _this.procitano = true;
            else
                _this.procitano = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MsgComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-msg',
            template: __webpack_require__(740),
            styles: [__webpack_require__(714)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_3__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* ActivatedRoute */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["c" /* ActivatedRoute */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === 'function' && _c) || Object])
    ], MsgComponent);
    return MsgComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=msg.component.js.map

/***/ }),

/***/ 360:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NewMsgComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var NewMsgComponent = (function () {
    function NewMsgComponent(http) {
        this.http = http;
        this.porukaPoslata = false;
        this.username = '';
        this.poruka = '';
    }
    NewMsgComponent.prototype.ngOnInit = function () {
    };
    NewMsgComponent.prototype.sendMessage = function () {
        var _this = this;
        this.http.get("messages/sendMessage/" + this.username + "/" + this.poruka)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (data.success) {
                _this.porukaPoslata = true;
                _this.username = '';
                _this.poruka = '';
            }
            else
                _this.porukaPoslata = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    NewMsgComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-new-msg',
            template: __webpack_require__(741),
            styles: [__webpack_require__(715)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object])
    ], NewMsgComponent);
    return NewMsgComponent;
    var _a;
}());
//# sourceMappingURL=new-msg.component.js.map

/***/ }),

/***/ 361:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_perm_service_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return NotificationsComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var NotificationsComponent = (function () {
    function NotificationsComponent(permService, http, localStorageService, router) {
        this.permService = permService;
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.obavestenjaVidljiva = false;
        this.obavestenjaStigla = false;
        this.obavestenjaNone = false;
        console.log(this.router.url);
    }
    NotificationsComponent.prototype.ngOnInit = function () {
        this.uzmiObavestenja();
    };
    NotificationsComponent.prototype.odgovori = function (owner, worker, role, accepted) {
        var _this = this;
        this.http.get("users/dodajRadnika/" + owner + "/" + worker + "/" + role + "/" + accepted)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.uzmiObavestenja();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    NotificationsComponent.prototype.uzmiObavestenja = function () {
        var _this = this;
        this.http.get("users/dohvatiObavestenja")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.obavestenja = data;
            if (_this.obavestenja == 0)
                _this.obavestenjaNone = true;
            console.log(_this.obavestenja);
            _this.obavestenjaStigla = true;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    NotificationsComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-notifications',
            template: __webpack_require__(742),
            styles: [__webpack_require__(716)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_3__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__services_perm_service_service__["a" /* PermService */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _c) || Object, (typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]) === 'function' && _d) || Object])
    ], NotificationsComponent);
    return NotificationsComponent;
    var _a, _b, _c, _d;
}());
//# sourceMappingURL=notifications.component.js.map

/***/ }),

/***/ 362:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PageNotFoundComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var PageNotFoundComponent = (function () {
    function PageNotFoundComponent(router) {
        this.router = router;
    }
    PageNotFoundComponent.prototype.ngOnInit = function () {
    };
    PageNotFoundComponent.prototype.vratiNaPrikaz = function () {
        this.router.navigate(['./user']);
    };
    PageNotFoundComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-page-not-found',
            template: __webpack_require__(744),
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === 'function' && _a) || Object])
    ], PageNotFoundComponent);
    return PageNotFoundComponent;
    var _a;
}());
//# sourceMappingURL=page-not-found.component.js.map

/***/ }),

/***/ 363:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return RequestOwnershipPageComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var RequestOwnershipPageComponent = (function () {
    function RequestOwnershipPageComponent(http, localStorageService, router) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.vidljivost = false;
        this.poslatZahtev = false;
        this.postojiUBazi = false;
    }
    RequestOwnershipPageComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            if (_this.user.success === undefined) {
                _this.vidljivost = true;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    RequestOwnershipPageComponent.prototype.proveriZahtev = function () {
        var _this = this;
        var pom1;
        this.http.get("users/proveriZahtevv/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom1 = data;
            if (pom1.success) {
                _this.postojiUBazi = true;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    RequestOwnershipPageComponent.prototype.posaljiZahtev = function () {
        /*  this.proveriZahtev();
       window.alert(this.postojiUBazi);
          if (this.postojiUBazi == false) {
            var pom: any;
            this.http.get(`users/posaljiZahtevAdminu/${this.user.id}`)
              .map(res => res.json())
              .subscribe(data => {
                pom = data;
                if (pom.success) {
                  this.poslatZahtev = true;
                }
      
              },
              err => console.log(err),
              () => console.log('Completed'));
      
          }*/
        var _this = this;
        var pom1;
        this.http.get("users/proveriZahtevv/" + this.user.id)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom1 = data;
            if (pom1.success) {
                var pom;
                _this.http.get("users/posaljiZahtevAdminu/" + _this.user.id)
                    .map(function (res) { return res.json(); })
                    .subscribe(function (data) {
                    pom = data;
                    if (pom.success) {
                        _this.poslatZahtev = true;
                        _this.postojiUBazi = false;
                    }
                }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            }
            else {
                _this.postojiUBazi = true;
                _this.poslatZahtev = false;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    RequestOwnershipPageComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-request-ownership-page',
            template: __webpack_require__(745),
            styles: [__webpack_require__(717)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === 'function' && _c) || Object])
    ], RequestOwnershipPageComponent);
    return RequestOwnershipPageComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=request-ownership-page.component.js.map

/***/ }),

/***/ 364:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SentComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var SentComponent = (function () {
    function SentComponent(http, localStorageService, router) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.poslatePoruke = [];
    }
    SentComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.user = data;
            if (_this.user.success === undefined) {
                _this.getMessages();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    SentComponent.prototype.getMessages = function () {
        var _this = this;
        this.http.get('messages/getSentMessages')
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.poslatePoruke = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    SentComponent.prototype.goToMessage = function (poruka) {
        this.selectedMessage = { id: poruka.id };
        this.router.navigate(['./msg', this.selectedMessage]);
    };
    SentComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-sent',
            template: __webpack_require__(746),
            styles: [__webpack_require__(718)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === 'function' && _c) || Object])
    ], SentComponent);
    return SentComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=sent.component.js.map

/***/ }),

/***/ 365:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return UpdateParcelComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var UpdateParcelComponent = (function () {
    function UpdateParcelComponent(http, localStorageService, router) {
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.vidljivost = false;
        this.uspesnoPromenjeniPodaci = false;
    }
    UpdateParcelComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.idParcele = this.localStorageService.get("idParcele");
        this.http.get("sessions/LogovaniKorisnik")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.podaci = data;
            if (_this.podaci.success === undefined) {
                _this.vidljivost = true;
                _this.popuniPolja();
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateParcelComponent.prototype.popuniPolja = function () {
        var _this = this;
        var i;
        var imanje;
        this.http.get("users/prikaziPodatkeOImanju/" + this.idParcele)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            imanje = data;
            _this.imeParcele = imanje[0].name;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateParcelComponent.prototype.promeniPodatke = function () {
        var _this = this;
        var novo;
        this.http.get("users/promeniParcelu/" + this.imeParcele + "/" + this.idParcele)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            novo = data;
            if (novo.success) {
                _this.uspesnoPromenjeniPodaci = true;
                setTimeout(function () {
                    _this.uspesnoPromenjeniPodaci = false;
                }, 3000);
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    UpdateParcelComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-update-parcel',
            template: __webpack_require__(748),
            styles: [__webpack_require__(719)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* Router */]) === 'function' && _c) || Object])
    ], UpdateParcelComponent);
    return UpdateParcelComponent;
    var _a, _b, _c;
}());
//# sourceMappingURL=update-parcel.component.js.map

/***/ }),

/***/ 42:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PermService; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var PermService = (function () {
    function PermService(http) {
        this.http = http;
    }
    PermService.prototype.getPerms = function () {
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["c" /* Headers */]();
        headers.append('Content-Type', 'application/json');
        return this.http.get("permisions/permisions", { headers: headers })
            .map(function (res) { return res.json(); });
    };
    PermService = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Injectable"])(), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object])
    ], PermService);
    return PermService;
    var _a;
}());
//# sourceMappingURL=perm-service.service.js.map

/***/ }),

/***/ 519:
/***/ (function(module, exports) {

function webpackEmptyContext(req) {
	throw new Error("Cannot find module '" + req + "'.");
}
webpackEmptyContext.keys = function() { return []; };
webpackEmptyContext.resolve = webpackEmptyContext;
module.exports = webpackEmptyContext;
webpackEmptyContext.id = 519;


/***/ }),

/***/ 520:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__(606);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__(642);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment__ = __webpack_require__(648);




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment__["a" /* environment */].production) {
    __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["enableProdMode"])();
}
__webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 638:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__tab__ = __webpack_require__(346);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Tabs; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var Tabs = (function () {
    function Tabs() {
    }
    // contentChildren are set
    Tabs.prototype.ngAfterContentInit = function () {
        // get all active tabs
        var activeTabs = this.tabs.filter(function (tab) { return tab.active; });
        // if there is no active tab set, activate the first
        if (activeTabs.length === 0) {
            this.selectTab(this.tabs.first);
        }
    };
    Tabs.prototype.selectTab = function (tab) {
        // deactivate all tabs
        this.tabs.toArray().forEach(function (tab) { return tab.active = false; });
        // activate the tab the user has clicked on.
        tab.active = true;
    };
    __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["ContentChildren"])(__WEBPACK_IMPORTED_MODULE_1__tab__["a" /* Tab */]), 
        __metadata('design:type', (typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["QueryList"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_0__angular_core__["QueryList"]) === 'function' && _a) || Object)
    ], Tabs.prototype, "tabs", void 0);
    Tabs = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'tabs',
            template: "\n    <ul class=\"nav nav-tabs\">\n      <li *ngFor=\"let tab of tabs\" (click)=\"selectTab(tab)\" [class.active]=\"tab.active\" style=\"cursor:pointer;\">\n        <a>{{tab.title}}</a>\n      </li>\n    </ul>\n    <ng-content></ng-content>\n  "
        }), 
        __metadata('design:paramtypes', [])
    ], Tabs);
    return Tabs;
    var _a;
}());
//# sourceMappingURL=tabs.js.map

/***/ }),

/***/ 639:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__another_weather_files_map_js__ = __webpack_require__(1008);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__another_weather_files_map_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__another_weather_files_map_js__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return WeatherMapComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var WeatherMapComponent = (function () {
    function WeatherMapComponent() {
    }
    WeatherMapComponent.prototype.ngAfterViewInit = function () {
        this.initMap();
    };
    WeatherMapComponent.prototype.initMap = function () {
        exp.func();
    };
    WeatherMapComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'weather-map',
            template: __webpack_require__(732),
        }), 
        __metadata('design:paramtypes', [])
    ], WeatherMapComponent);
    return WeatherMapComponent;
}());
//# sourceMappingURL=weather-map.component.js.map

/***/ }),

/***/ 640:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__auth_guard_service__ = __webpack_require__(354);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__admin_auth_guard_service__ = __webpack_require__(352);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__(16);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__UserPage_user_page_component__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__login_login_component__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__AddPlantation_addplantation_page_component__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__AddWorker_addworker_page_component__ = __webpack_require__(347);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__Statistics_statistics_page_component__ = __webpack_require__(348);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__UpdateUser_update_user_component__ = __webpack_require__(350);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__mapa_mapa_component__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__UpdatePlantation_update_plantation_component__ = __webpack_require__(349);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__admin_page_admin_page_component__ = __webpack_require__(353);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__AddTypes_addTypes__ = __webpack_require__(345);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__request_ownership_page_request_ownership_page_component__ = __webpack_require__(363);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__inbox_inbox_component__ = __webpack_require__(356);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__msg_msg_component__ = __webpack_require__(359);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__new_msg_new_msg_component__ = __webpack_require__(360);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__sent_sent_component__ = __webpack_require__(364);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__image_upload_image_upload_component__ = __webpack_require__(355);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__page_not_found_page_not_found_component__ = __webpack_require__(362);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__notifications_notifications_component__ = __webpack_require__(361);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__update_parcel_update_parcel_component__ = __webpack_require__(365);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppRoutingModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};























var routes = [
    { path: 'updateuser', component: __WEBPACK_IMPORTED_MODULE_9__UpdateUser_update_user_component__["a" /* UpdateUser */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'user', component: __WEBPACK_IMPORTED_MODULE_4__UserPage_user_page_component__["a" /* UserPage */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: '', redirectTo: '/login', pathMatch: 'full' },
    { path: 'login', component: __WEBPACK_IMPORTED_MODULE_5__login_login_component__["a" /* LoginComponent */] },
    { path: 'statistics', component: __WEBPACK_IMPORTED_MODULE_8__Statistics_statistics_page_component__["a" /* StatisticsPage */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'addworker', component: __WEBPACK_IMPORTED_MODULE_7__AddWorker_addworker_page_component__["a" /* AddWorker */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'addplantation', component: __WEBPACK_IMPORTED_MODULE_6__AddPlantation_addplantation_page_component__["a" /* AddPlantation */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'mapa', component: __WEBPACK_IMPORTED_MODULE_10__mapa_mapa_component__["a" /* MapaComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'mapa', component: __WEBPACK_IMPORTED_MODULE_10__mapa_mapa_component__["a" /* MapaComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'updateplantation', component: __WEBPACK_IMPORTED_MODULE_11__UpdatePlantation_update_plantation_component__["a" /* UpdatePlantation */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'admin', component: __WEBPACK_IMPORTED_MODULE_12__admin_page_admin_page_component__["a" /* AdminPageComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_2__admin_auth_guard_service__["a" /* AdminAuthGuard */]] },
    { path: 'reqownership', component: __WEBPACK_IMPORTED_MODULE_14__request_ownership_page_request_ownership_page_component__["a" /* RequestOwnershipPageComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'updateplantation', component: __WEBPACK_IMPORTED_MODULE_11__UpdatePlantation_update_plantation_component__["a" /* UpdatePlantation */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'msg', component: __WEBPACK_IMPORTED_MODULE_16__msg_msg_component__["a" /* MsgComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'newmsg', component: __WEBPACK_IMPORTED_MODULE_17__new_msg_new_msg_component__["a" /* NewMsgComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'sent', component: __WEBPACK_IMPORTED_MODULE_18__sent_sent_component__["a" /* SentComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'inbox', component: __WEBPACK_IMPORTED_MODULE_15__inbox_inbox_component__["a" /* InboxComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'addtypes', component: __WEBPACK_IMPORTED_MODULE_13__AddTypes_addTypes__["a" /* AddTypes */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'upload', component: __WEBPACK_IMPORTED_MODULE_19__image_upload_image_upload_component__["a" /* ImageUploadComponent */] },
    { path: 'updateparcel', component: __WEBPACK_IMPORTED_MODULE_22__update_parcel_update_parcel_component__["a" /* UpdateParcelComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: 'notifications', component: __WEBPACK_IMPORTED_MODULE_21__notifications_notifications_component__["a" /* NotificationsComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] },
    { path: '**', component: __WEBPACK_IMPORTED_MODULE_20__page_not_found_page_not_found_component__["a" /* PageNotFoundComponent */], canActivate: [__WEBPACK_IMPORTED_MODULE_1__auth_guard_service__["a" /* AuthGuard */]] }
];
var AppRoutingModule = (function () {
    function AppRoutingModule() {
    }
    AppRoutingModule = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["NgModule"])({
            imports: [__WEBPACK_IMPORTED_MODULE_3__angular_router__["a" /* RouterModule */].forRoot(routes)],
            exports: [__WEBPACK_IMPORTED_MODULE_3__angular_router__["a" /* RouterModule */]]
        }), 
        __metadata('design:paramtypes', [])
    ], AppRoutingModule);
    return AppRoutingModule;
}());
//# sourceMappingURL=app-routing.module.js.map

/***/ }),

/***/ 641:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map__ = __webpack_require__(70);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_rxjs_add_operator_map__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AppComponent = (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-root',
            template: '<router-outlet></router-outlet>',
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ 642:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__(153);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__(96);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__app_component__ = __webpack_require__(641);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__login_login_component__ = __webpack_require__(357);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_common__ = __webpack_require__(60);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__WeatherMap_weather_map_component__ = __webpack_require__(639);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__app_routing_module__ = __webpack_require__(640);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__UserPage_user_page_component__ = __webpack_require__(351);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__AddPlantation_addplantation_page_component__ = __webpack_require__(343);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__AddWorker_addworker_page_component__ = __webpack_require__(347);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__Statistics_statistics_page_component__ = __webpack_require__(348);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__chart_component_chart_component__ = __webpack_require__(643);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14_ng2_charts__ = __webpack_require__(722);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14_ng2_charts___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_14_ng2_charts__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__auth_guard_service__ = __webpack_require__(354);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__admin_auth_guard_service__ = __webpack_require__(352);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17_ng2_datepicker__ = __webpack_require__(488);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__UpdateUser_update_user_component__ = __webpack_require__(350);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__AddPlantation_plantation_service__ = __webpack_require__(225);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__services_perm_service_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__AddTypes_tabs_tabs__ = __webpack_require__(638);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_22__AddTypes_tabs_tab__ = __webpack_require__(346);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_23__AddTypes_addTypes__ = __webpack_require__(345);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_24_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_24_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_25__mapa_mapa_component__ = __webpack_require__(358);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_26__UpdatePlantation_update_plantation_component__ = __webpack_require__(349);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_27__meni_meni_component__ = __webpack_require__(645);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_28__admin_page_admin_page_component__ = __webpack_require__(353);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_29__request_ownership_page_request_ownership_page_component__ = __webpack_require__(363);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_30__inbox_inbox_component__ = __webpack_require__(356);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_31__sent_sent_component__ = __webpack_require__(364);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_32__msg_msg_component__ = __webpack_require__(359);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_33__new_msg_new_msg_component__ = __webpack_require__(360);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_34__filter_pipe__ = __webpack_require__(644);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_35__image_upload_image_upload_component__ = __webpack_require__(355);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_36_angular2_image_upload__ = __webpack_require__(650);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_36_angular2_image_upload___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_36_angular2_image_upload__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_37__page_not_found_page_not_found_component__ = __webpack_require__(362);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_38__page_not_found_d_page_not_found_d_component__ = __webpack_require__(646);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_39__notifications_notifications_component__ = __webpack_require__(361);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_40__statsWidgets_stats_widgets__ = __webpack_require__(647);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_41__update_parcel_update_parcel_component__ = __webpack_require__(365);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};











































var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_1__angular_core__["NgModule"])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_5__login_login_component__["a" /* LoginComponent */],
                __WEBPACK_IMPORTED_MODULE_7__WeatherMap_weather_map_component__["a" /* WeatherMapComponent */],
                __WEBPACK_IMPORTED_MODULE_9__UserPage_user_page_component__["a" /* UserPage */],
                __WEBPACK_IMPORTED_MODULE_12__Statistics_statistics_page_component__["a" /* StatisticsPage */],
                __WEBPACK_IMPORTED_MODULE_11__AddWorker_addworker_page_component__["a" /* AddWorker */],
                __WEBPACK_IMPORTED_MODULE_10__AddPlantation_addplantation_page_component__["a" /* AddPlantation */],
                __WEBPACK_IMPORTED_MODULE_13__chart_component_chart_component__["a" /* ChartComponent */],
                __WEBPACK_IMPORTED_MODULE_18__UpdateUser_update_user_component__["a" /* UpdateUser */],
                __WEBPACK_IMPORTED_MODULE_25__mapa_mapa_component__["a" /* MapaComponent */],
                __WEBPACK_IMPORTED_MODULE_26__UpdatePlantation_update_plantation_component__["a" /* UpdatePlantation */],
                __WEBPACK_IMPORTED_MODULE_27__meni_meni_component__["a" /* MeniComponent */],
                __WEBPACK_IMPORTED_MODULE_28__admin_page_admin_page_component__["a" /* AdminPageComponent */],
                __WEBPACK_IMPORTED_MODULE_29__request_ownership_page_request_ownership_page_component__["a" /* RequestOwnershipPageComponent */],
                __WEBPACK_IMPORTED_MODULE_21__AddTypes_tabs_tabs__["a" /* Tabs */],
                __WEBPACK_IMPORTED_MODULE_22__AddTypes_tabs_tab__["a" /* Tab */],
                __WEBPACK_IMPORTED_MODULE_23__AddTypes_addTypes__["a" /* AddTypes */],
                __WEBPACK_IMPORTED_MODULE_30__inbox_inbox_component__["a" /* InboxComponent */],
                __WEBPACK_IMPORTED_MODULE_31__sent_sent_component__["a" /* SentComponent */],
                __WEBPACK_IMPORTED_MODULE_32__msg_msg_component__["a" /* MsgComponent */],
                __WEBPACK_IMPORTED_MODULE_33__new_msg_new_msg_component__["a" /* NewMsgComponent */],
                __WEBPACK_IMPORTED_MODULE_34__filter_pipe__["a" /* FilterPipe */],
                __WEBPACK_IMPORTED_MODULE_35__image_upload_image_upload_component__["a" /* ImageUploadComponent */],
                __WEBPACK_IMPORTED_MODULE_37__page_not_found_page_not_found_component__["a" /* PageNotFoundComponent */],
                __WEBPACK_IMPORTED_MODULE_38__page_not_found_d_page_not_found_d_component__["a" /* PageNotFoundDComponent */],
                __WEBPACK_IMPORTED_MODULE_39__notifications_notifications_component__["a" /* NotificationsComponent */],
                __WEBPACK_IMPORTED_MODULE_40__statsWidgets_stats_widgets__["a" /* StatsWidgets */],
                __WEBPACK_IMPORTED_MODULE_41__update_parcel_update_parcel_component__["a" /* UpdateParcelComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_3__angular_http__["a" /* JsonpModule */],
                __WEBPACK_IMPORTED_MODULE_36_angular2_image_upload__["ImageUploadModule"].forRoot(),
                __WEBPACK_IMPORTED_MODULE_24_angular_2_local_storage__["LocalStorageModule"].withConfig({
                    prefix: 'my-app',
                    storageType: 'localStorage'
                }),
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["a" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_3__angular_http__["b" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_8__app_routing_module__["a" /* AppRoutingModule */],
                __WEBPACK_IMPORTED_MODULE_14_ng2_charts__["ChartsModule"],
                __WEBPACK_IMPORTED_MODULE_17_ng2_datepicker__["a" /* DatePickerModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["b" /* ReactiveFormsModule */],
            ],
            providers: [{ provide: __WEBPACK_IMPORTED_MODULE_6__angular_common__["LocationStrategy"], useClass: __WEBPACK_IMPORTED_MODULE_6__angular_common__["HashLocationStrategy"] }, __WEBPACK_IMPORTED_MODULE_15__auth_guard_service__["a" /* AuthGuard */], __WEBPACK_IMPORTED_MODULE_16__admin_auth_guard_service__["a" /* AdminAuthGuard */], __WEBPACK_IMPORTED_MODULE_19__AddPlantation_plantation_service__["a" /* PlantationService */], __WEBPACK_IMPORTED_MODULE_20__services_perm_service_service__["a" /* PermService */]],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_4__app_component__["a" /* AppComponent */]]
        }), 
        __metadata('design:paramtypes', [])
    ], AppModule);
    return AppModule;
}());
//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ 643:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChartComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var ChartComponent = (function () {
    function ChartComponent(http) {
        this.http = http;
        this.lineChartOptions = {
            responsive: true
        };
        this.lineChartColors = [
            {
                backgroundColor: 'rgba(148,159,177,0.2)',
                borderColor: 'rgba(148,159,177,1)',
                pointBackgroundColor: 'rgba(148,159,177,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            },
            {
                backgroundColor: 'rgba(77,83,96,0.2)',
                borderColor: 'rgba(77,83,96,1)',
                pointBackgroundColor: 'rgba(77,83,96,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(77,83,96,1)'
            },
            {
                backgroundColor: 'rgba(148,159,177,0.2)',
                borderColor: 'rgba(148,159,177,1)',
                pointBackgroundColor: 'rgba(148,159,177,1)',
                pointBorderColor: '#fff',
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: 'rgba(148,159,177,0.8)'
            }
        ];
        this.lineChartLegend = true;
        this.lineChartType = 'line';
    }
    ChartComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.http.get("stats/data")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.lineChartData = data.data;
            _this.lineChartLabels = data.labels;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    // events
    ChartComponent.prototype.chartClicked = function (e) {
        console.log(e);
    };
    ChartComponent.prototype.chartHovered = function (e) {
        console.log(e);
    };
    ChartComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'chart',
            template: __webpack_require__(734)
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object])
    ], ChartComponent);
    return ChartComponent;
    var _a;
}());
//# sourceMappingURL=chart-component.js.map

/***/ }),

/***/ 644:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return FilterPipe; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var FilterPipe = (function () {
    function FilterPipe() {
    }
    FilterPipe.prototype.transform = function (vrste, term) {
        if (term === undefined)
            return vrste;
        return vrste.filter(function (vrsta) {
            if (vrsta.name && vrsta.surname)
                return (vrsta.name.toLowerCase().includes(term.toLowerCase()) || vrsta.surname.toLowerCase().includes(term.toLowerCase()));
            else
                return vrsta.name.toLowerCase().includes(term.toLowerCase());
        });
    };
    FilterPipe = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Pipe"])({
            name: 'filter'
        }), 
        __metadata('design:paramtypes', [])
    ], FilterPipe);
    return FilterPipe;
}());
//# sourceMappingURL=filter.pipe.js.map

/***/ }),

/***/ 645:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__ = __webpack_require__(24);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_perm_service_service__ = __webpack_require__(42);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MeniComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





var MeniComponent = (function () {
    function MeniComponent(permService, http, localStorageService, router) {
        this.permService = permService;
        this.http = http;
        this.localStorageService = localStorageService;
        this.router = router;
        this.vidljivost = false;
        this.meniVidljiv = false;
        this.prvihPet = [];
        this.poslatePoruke = [];
        this.primljenePoruke = [];
        this.porukaPoslata = false;
        this.obavestenjaVidljiva = false;
        this.obavestenjaStigla = false;
        this.procitano = false;
        this.obrisano = false;
        this.porukeVidljive = false;
        this.showMess = false;
        console.log(this.router.url);
    }
    MeniComponent.prototype.logout = function () {
        var _this = this;
        this.http.get("sessions/logout")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.localStorageService.set("logged", false);
            _this.router.navigate(['./login']);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.odgovori = function (owner, worker, role, accepted) {
        var _this = this;
        this.http.get("users/dodajRadnika/" + owner + "/" + worker + "/" + role + "/" + accepted)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.uzmiObavestenja();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.goToMessage = function (poruka) {
        this.selectedMessage = { id: poruka.id };
        this.router.navigate(['./msg', this.selectedMessage]);
    };
    MeniComponent.prototype.prikaziPlantazu = function () {
        alert("prikazi je legendo!");
    };
    MeniComponent.prototype.meniToggle = function () {
        this.obavestenjaVidljiva = false;
        this.porukeVidljive = false;
        this.showMess = false;
        this.meniVidljiv = !this.meniVidljiv;
    };
    MeniComponent.prototype.obavestenjaToggle = function () {
        this.meniVidljiv = false;
        this.porukeVidljive = false;
        this.showMess = false;
        this.obavestenjaVidljiva = !this.obavestenjaVidljiva;
    };
    MeniComponent.prototype.porukeToggle = function () {
        this.meniVidljiv = false;
        this.obavestenjaVidljiva = false;
        this.showMess = !this.showMess;
        this.porukeVidljive = !this.porukeVidljive;
    };
    MeniComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.permService.getPerms().subscribe(function (dat) {
            _this.dozvoleMeni = dat;
            console.log("dozvole");
            console.log(_this.dozvoleMeni.guest);
            if (_this.dozvoleMeni.guest != undefined)
                _this.localStorageService.set("guest", _this.dozvoleMeni.guest);
            _this.http.get("sessions/LogovaniKorisnik")
                .map(function (res) { return res.json(); })
                .subscribe(function (data) {
                _this.user = data;
                if (_this.user.success === undefined) {
                    _this.vidljivost = true;
                }
            }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
            _this.uzmiObavestenja();
            _this.getMessages();
            _this.getSentMessages();
        });
    };
    MeniComponent.prototype.uzmiObavestenja = function () {
        var _this = this;
        this.http.get("users/dohvatiObavestenja")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.obavestenja = data;
            if (_this.obavestenja !== undefined) {
                console.log("stiglo");
                for (var i = 0; i < 5; i++)
                    if (_this.obavestenja[i] !== undefined)
                        _this.prvihPet.push(_this.obavestenja[i]);
                    else
                        break;
                _this.obavestenjaStigla = true;
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.getMessages = function () {
        var _this = this;
        this.http.get('messages/getMessages')
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.primljenePoruke = data;
            _this.brojPrimljenih();
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.getSentMessages = function () {
        var _this = this;
        this.http.get('messages/getSentMessages')
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.poslatePoruke = data;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.brojPrimljenih = function () {
        var poruke = this.primljenePoruke.filter(function (x) { return x.read == 1; });
        this.brojPoruka = poruke.length;
        console.log(poruke.length);
    };
    MeniComponent.prototype.sendMessage = function (username, text) {
        var _this = this;
        this.http.get("messages/sendMessage/" + username + "/" + text)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (data.success)
                _this.porukaPoslata = true;
            else
                _this.porukaPoslata = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.markAsRead = function (procitanePoruke) {
        var _this = this;
        this.http.get("messages/markAsRead/" + procitanePoruke)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (data.success)
                _this.procitano = true;
            else
                _this.procitano = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.deleteMessages = function (porukeZaBrisanje) {
        var _this = this;
        this.http.get("messages/deleteMessages/" + porukeZaBrisanje)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            if (data.success)
                _this.obrisano = true;
            else
                _this.obrisano = false;
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent.prototype.posalji = function () {
        var pom3;
        this.http.get("users/posaljiMail2/" + this.ime + "/" + this.naslov + "/" + this.email + "/" + this.poruka)
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            pom3 = data;
            if (pom3.success) {
            }
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    MeniComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-meni',
            template: __webpack_require__(739),
            styles: [__webpack_require__(713)]
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_3__services_perm_service_service__["a" /* PermService */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_3__services_perm_service_service__["a" /* PermService */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _b) || Object, (typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2_angular_2_local_storage__["LocalStorageService"]) === 'function' && _c) || Object, (typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_4__angular_router__["b" /* Router */]) === 'function' && _d) || Object])
    ], MeniComponent);
    return MeniComponent;
    var _a, _b, _c, _d;
}());
//# sourceMappingURL=meni.component.js.map

/***/ }),

/***/ 646:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return PageNotFoundDComponent; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var PageNotFoundDComponent = (function () {
    function PageNotFoundDComponent(router) {
        this.router = router;
    }
    PageNotFoundDComponent.prototype.ngOnInit = function () {
    };
    PageNotFoundDComponent.prototype.vratiNaPrikaz = function () {
        this.router.navigate(['./user']);
    };
    PageNotFoundDComponent = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-page-not-found-d',
            template: __webpack_require__(743),
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_router__["b" /* Router */]) === 'function' && _a) || Object])
    ], PageNotFoundDComponent);
    return PageNotFoundDComponent;
    var _a;
}());
//# sourceMappingURL=page-not-found-d.component.js.map

/***/ }),

/***/ 647:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__(10);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_router__ = __webpack_require__(16);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StatsWidgets; });
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var StatsWidgets = (function () {
    function StatsWidgets(http, router) {
        this.http = http;
        this.router = router;
    }
    StatsWidgets.prototype.ngOnInit = function () {
        this.preuzmiStatistiku();
    };
    StatsWidgets.prototype.preuzmiStatistiku = function () {
        var _this = this;
        this.http.get("stats/stats")
            .map(function (res) { return res.json(); })
            .subscribe(function (data) {
            _this.stats = data;
            console.log(data);
        }, function (err) { return console.log(err); }, function () { return console.log('Completed'); });
    };
    StatsWidgets.prototype.promeniStranu = function (br) {
        if (br == 1)
            this.router.navigate(['./user']);
        else if (br == 2)
            this.router.navigate(['./addworker']);
        else if (br == 3)
            this.router.navigate(['./addworker']);
        else if (br == 4)
            this.router.navigate(['./notifications']);
    };
    StatsWidgets = __decorate([
        __webpack_require__.i(__WEBPACK_IMPORTED_MODULE_0__angular_core__["Component"])({
            selector: 'app-widgets',
            template: __webpack_require__(747)
        }), 
        __metadata('design:paramtypes', [(typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_1__angular_http__["d" /* Http */]) === 'function' && _a) || Object, (typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */] !== 'undefined' && __WEBPACK_IMPORTED_MODULE_2__angular_router__["b" /* Router */]) === 'function' && _b) || Object])
    ], StatsWidgets);
    return StatsWidgets;
    var _a, _b;
}());
//# sourceMappingURL=stats-widgets.js.map

/***/ }),

/***/ 648:
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
var environment = {
    production: false
};
//# sourceMappingURL=environment.js.map

/***/ }),

/***/ 707:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 708:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 709:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 710:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 711:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 712:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 713:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 714:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 715:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 716:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 717:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 718:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 719:
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(23)();
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ 720:
/***/ (function(module, exports, __webpack_require__) {

var map = {
	"./af": 379,
	"./af.js": 379,
	"./ar": 385,
	"./ar-dz": 380,
	"./ar-dz.js": 380,
	"./ar-ly": 381,
	"./ar-ly.js": 381,
	"./ar-ma": 382,
	"./ar-ma.js": 382,
	"./ar-sa": 383,
	"./ar-sa.js": 383,
	"./ar-tn": 384,
	"./ar-tn.js": 384,
	"./ar.js": 385,
	"./az": 386,
	"./az.js": 386,
	"./be": 387,
	"./be.js": 387,
	"./bg": 388,
	"./bg.js": 388,
	"./bn": 389,
	"./bn.js": 389,
	"./bo": 390,
	"./bo.js": 390,
	"./br": 391,
	"./br.js": 391,
	"./bs": 392,
	"./bs.js": 392,
	"./ca": 393,
	"./ca.js": 393,
	"./cs": 394,
	"./cs.js": 394,
	"./cv": 395,
	"./cv.js": 395,
	"./cy": 396,
	"./cy.js": 396,
	"./da": 397,
	"./da.js": 397,
	"./de": 399,
	"./de-at": 398,
	"./de-at.js": 398,
	"./de.js": 399,
	"./dv": 400,
	"./dv.js": 400,
	"./el": 401,
	"./el.js": 401,
	"./en-au": 402,
	"./en-au.js": 402,
	"./en-ca": 403,
	"./en-ca.js": 403,
	"./en-gb": 404,
	"./en-gb.js": 404,
	"./en-ie": 405,
	"./en-ie.js": 405,
	"./en-nz": 406,
	"./en-nz.js": 406,
	"./eo": 407,
	"./eo.js": 407,
	"./es": 409,
	"./es-do": 408,
	"./es-do.js": 408,
	"./es.js": 409,
	"./et": 410,
	"./et.js": 410,
	"./eu": 411,
	"./eu.js": 411,
	"./fa": 412,
	"./fa.js": 412,
	"./fi": 413,
	"./fi.js": 413,
	"./fo": 414,
	"./fo.js": 414,
	"./fr": 417,
	"./fr-ca": 415,
	"./fr-ca.js": 415,
	"./fr-ch": 416,
	"./fr-ch.js": 416,
	"./fr.js": 417,
	"./fy": 418,
	"./fy.js": 418,
	"./gd": 419,
	"./gd.js": 419,
	"./gl": 420,
	"./gl.js": 420,
	"./he": 421,
	"./he.js": 421,
	"./hi": 422,
	"./hi.js": 422,
	"./hr": 423,
	"./hr.js": 423,
	"./hu": 424,
	"./hu.js": 424,
	"./hy-am": 425,
	"./hy-am.js": 425,
	"./id": 426,
	"./id.js": 426,
	"./is": 427,
	"./is.js": 427,
	"./it": 428,
	"./it.js": 428,
	"./ja": 429,
	"./ja.js": 429,
	"./jv": 430,
	"./jv.js": 430,
	"./ka": 431,
	"./ka.js": 431,
	"./kk": 432,
	"./kk.js": 432,
	"./km": 433,
	"./km.js": 433,
	"./ko": 434,
	"./ko.js": 434,
	"./ky": 435,
	"./ky.js": 435,
	"./lb": 436,
	"./lb.js": 436,
	"./lo": 437,
	"./lo.js": 437,
	"./lt": 438,
	"./lt.js": 438,
	"./lv": 439,
	"./lv.js": 439,
	"./me": 440,
	"./me.js": 440,
	"./mi": 441,
	"./mi.js": 441,
	"./mk": 442,
	"./mk.js": 442,
	"./ml": 443,
	"./ml.js": 443,
	"./mr": 444,
	"./mr.js": 444,
	"./ms": 446,
	"./ms-my": 445,
	"./ms-my.js": 445,
	"./ms.js": 446,
	"./my": 447,
	"./my.js": 447,
	"./nb": 448,
	"./nb.js": 448,
	"./ne": 449,
	"./ne.js": 449,
	"./nl": 451,
	"./nl-be": 450,
	"./nl-be.js": 450,
	"./nl.js": 451,
	"./nn": 452,
	"./nn.js": 452,
	"./pa-in": 453,
	"./pa-in.js": 453,
	"./pl": 454,
	"./pl.js": 454,
	"./pt": 456,
	"./pt-br": 455,
	"./pt-br.js": 455,
	"./pt.js": 456,
	"./ro": 457,
	"./ro.js": 457,
	"./ru": 458,
	"./ru.js": 458,
	"./se": 459,
	"./se.js": 459,
	"./si": 460,
	"./si.js": 460,
	"./sk": 461,
	"./sk.js": 461,
	"./sl": 462,
	"./sl.js": 462,
	"./sq": 463,
	"./sq.js": 463,
	"./sr": 465,
	"./sr-cyrl": 464,
	"./sr-cyrl.js": 464,
	"./sr.js": 465,
	"./ss": 466,
	"./ss.js": 466,
	"./sv": 467,
	"./sv.js": 467,
	"./sw": 468,
	"./sw.js": 468,
	"./ta": 469,
	"./ta.js": 469,
	"./te": 470,
	"./te.js": 470,
	"./tet": 471,
	"./tet.js": 471,
	"./th": 472,
	"./th.js": 472,
	"./tl-ph": 473,
	"./tl-ph.js": 473,
	"./tlh": 474,
	"./tlh.js": 474,
	"./tr": 475,
	"./tr.js": 475,
	"./tzl": 476,
	"./tzl.js": 476,
	"./tzm": 478,
	"./tzm-latn": 477,
	"./tzm-latn.js": 477,
	"./tzm.js": 478,
	"./uk": 479,
	"./uk.js": 479,
	"./uz": 480,
	"./uz.js": 480,
	"./vi": 481,
	"./vi.js": 481,
	"./x-pseudo": 482,
	"./x-pseudo.js": 482,
	"./yo": 483,
	"./yo.js": 483,
	"./zh-cn": 484,
	"./zh-cn.js": 484,
	"./zh-hk": 485,
	"./zh-hk.js": 485,
	"./zh-tw": 486,
	"./zh-tw.js": 486
};
function webpackContext(req) {
	return __webpack_require__(webpackContextResolve(req));
};
function webpackContextResolve(req) {
	var id = map[req];
	if(!(id + 1)) // check for number
		throw new Error("Cannot find module '" + req + "'.");
	return id;
};
webpackContext.keys = function webpackContextKeys() {
	return Object.keys(map);
};
webpackContext.resolve = webpackContextResolve;
module.exports = webpackContext;
webpackContext.id = 720;


/***/ }),

/***/ 725:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n\n\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div [hidden]=\"(dozvole!==undefined&&dozvole.guest==true)||(smeDaPise==false&&isOwner==false)\" id=\"page-wrapper\">\n            <app-widgets></app-widgets>\n<!--\n            <div class=\"container-fluid\">\n                <div class=\"col-md-12 \" style=\"text-align:center;margin-top: 10px\">\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-success widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-globe\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.plantaze}}</div>\n                                <div class=\"widget-title\">registrovanih plantaza</div>\n                            </div>\n                        </div>\n\n                    </div>\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-primary widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-users\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.radnici}}</div>\n                                <div class=\"widget-title\">registrovana radnka</div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-info widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-book\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.eksperti}}</div>\n                                <div class=\"widget-title\">registrovanih experata</div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"col-md-3 \">\n                        <div class=\"widget widget-warning widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-warning\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.obavestenja}}</div>\n                                <div class=\"widget-title\">obavestenja</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n-->\n            <div class=\"container-fluid\">\n                <!-- ODABIR PARCELA -->\n                <div class=\"col-md-12 \" style=\"text-align:center\">\n                    <div class=\"col-md-12  \" style=\"text-align:center;\">\n                        <div id=\"togglable-tabs\" id=\"opcije\">\n                            <!-- meni za podesavanja  -->\n                            <ul id=\"myTab\" class=\"nav nav-tabs nav-justified\" role=\"tablist\">\n\n                                <li class=\"{{plantazaVidljiva ? 'profileTab active' : ''}}\"><a (click)=\"promeniTab()\" id=\"sifra-tab\" role=\"tab\" data-toggle=\"tab\" aria-expanded=\"true\">Dodaj plantazu</a>\n                                </li>\n                                <li class=\"{{ imanjeVidljivo? 'profileTab active' : ''}}\"><a (click)=\"promeniTab()\" role=\"tab\" id=\"podaci-tab\" data-toggle=\"tab\" aria-expanded=\"false\">Dodaj imanje</a>\n                                </li>\n\n\n\n\n                            </ul>\n\n                            <form [formGroup]=\"plantForm\" (ngSubmit)=\"onSubmit(plantForm.value)\" [hidden]=\"!plantazaVidljiva\">\n\n                                <div class=\"panel panel-primary\">\n                                    <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Unos podataka o novoj plantazi</div>\n                                    <div class=\"panel-body \" style=\"height:100% \">\n                                        <div class=\"col-md-12 \" style=\"text-align:center;\">\n                                            <div class=\"col-md-3 \" style=\"text-align:center;\">\n                                                <label class=\"col-md-5 \" style=\"padding-top: 5px\">Ime plantaze</label>\n                                                <div class=\"input-group col-md-7\">\n                                                    <input class=\"form-control\" formControlName=\"name\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-tag\"></i></span>\n                                                </div>\n\n                                            </div>\n                                            <div class=\"col-md-3 \" style=\"text-align:center;\">\n                                                <label class=\"col-md-5 \" style=\"padding-top: 5px\">Izaberite vrstu</label>\n                                                <div class=\"col-md-7 \">\n                                                    <select class=\"form-control btn-primary\" (change)=\"onSelect($event.target.value)\" formControlName=\"vrsta\">\n                                                         <option *ngFor=\"let tip of tipovi\" [value]=\"tip.id\">{{tip.name}}</option>\n                                                    </select>\n                                                </div>\n\n                                            </div>\n\n                                            <div class=\"col-md-3 \" *ngIf=\"ddVisible\" style=\"text-align:center;\">\n                                                <label class=\"col-md-5 \">Izaberite podvrstu</label>\n                                                <div class=\"col-md-7 \">\n                                                    <select class=\"form-control btn-primary\" formControlName=\"podvrsta\">\n                                                        <option *ngFor=\"let podtip of podtipovi\" [value]=\"podtip.id\">{{podtip.name}}</option>\n                                                    </select>\n                                                </div>\n\n\n                                            </div>\n                                            <div class=\"col-md-3 \">\n                                                <label class=\"col-md-5 \">Izaberite proizvodjaca semena</label>\n                                                <div class=\"col-md-7 \">\n                                                    <select class=\"form-control btn-primary\" formControlName=\"proizvodjacSemena\">\n                                                        <option *ngFor=\"let pr of proizvodjaci\" [value]=\"pr.id\">{{pr.name}}</option>\n                                                    </select>\n                                                </div>\n\n                                            </div>\n                                            <div class=\"col-md-3 \" *ngIf=\"!isOwner||dozvoleKodGazde.length!=0\">\n                                                <label class=\"col-md-5 \">Izaberite vlasnika plantaze</label>\n                                                <div class=\"col-md-7 \">\n                                                    <select class=\"form-control btn-primary\" formControlName=\"vlasnikPlantaze\">\n                                                        <option *ngFor=\"let ow of komeMozeDaDoda\" [value]=\"ow.id\">{{ow.name}} {{ow.surname}}</option>\n                                                    </select>\n                                                </div>\n\n                                            </div>\n                                            <div class=\"col-md-3 \" *ngIf=\"imanja!==undefined\">\n                                                <label class=\"col-md-5 \">Izaberite imanje</label>\n                                                <div class=\"col-md-7 \">\n                                                    <select class=\"form-control btn-primary\" id='imanje'>\n                                                        <option *ngFor=\"let im of imanja\" value=\"{{im.idparc}}\">{{im.name}}</option>\n                                                    </select>\n                                                </div>\n\n                                            </div>\n\n\n\n\n                                        </div>\n\n                                    </div>\n\n                                    <div class=\"panel-footer \" style=\"height:100%;width:100%\">\n                                        <button *ngIf=\"dozvole!==undefined&&dozvole.guest==false&&(smeDaPise||isOwner)\" type=\"submit\" class=\"btn btn-success\">Sacuvaj</button>\n                                        <div style=\"height: 100%; width: 100%\">\n                                            <div id=\"googleMap\" style=\"width:100%; height: 700px\"></div>\n                                        </div>\n                                    </div>\n\n\n\n                                </div>\n                            </form>\n\n\n                            <form [hidden]=\"!imanjeVidljivo\">\n                                <div class=\"panel panel-primary\">\n                                    <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Unos podataka o novom imanju</div>\n                                    <div class=\"panel-body \" style=\"height:100% \">\n                                        <div class=\"col-md-12 \" style=\"text-align:center;\">\n                                            <div class=\"col-md-3 \" style=\"text-align:center;\">\n                                                <label class=\"col-md-5 \" style=\"padding-top: 5px\">Ime imanja</label>\n                                                <div class=\"input-group col-md-7\">\n                                                    <input class=\"form-control\" type=\"text\" name=\"imanjeIme\" [(ngModel)]=\"imanjeIme\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-tag\"></i></span>\n                                                </div>\n\n                                            </div>\n                                        </div>\n                                        <div class=\"col-md-3 \" *ngIf=\"!isOwner||dozvoleKodGazde.length!=0\">\n                                            <label class=\"col-md-5 \">Izaberite vlasnika imanja</label>\n                                            <div class=\"col-md-7 \">\n                                                <select class=\"form-control btn-primary\" id='vlasnik'>\n                                                        <option *ngFor=\"let ow of komeMozeDaDoda\" value=\"ow.id\">{{ow.name}} {{ow.surname}}</option>\n                                                    </select>\n                                            </div>\n\n                                        </div>\n                                        <div style=\"clear:both\"></div>\n                                        <div *ngIf=\"dodatoImanje\" role=\"alert\" class=\"alert alert-success alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                            <button aria-label=\"Close\" (click)='close()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                            Imanje dodato\n                                        </div>\n                                    </div>\n\n                                    <div class=\"panel-footer \" style=\"height:100%;width:100%\">\n                                        <button (click)=\"dodajImanje()\" *ngIf=\"dozvole!==undefined&&dozvole.guest==false&&(smeDaPise||isOwner)\" type=\"submit\" class=\"btn btn-success\">Sacuvaj</button>\n                                        <div style=\"height: 100%; width: 100%\">\n                                            <div id=\"googleMap\" style=\"width:100%; height: 700px\"></div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </form>\n\n\n\n\n                        </div>\n\n                    </div>\n                    <!--END ODABIR PARCELA -->\n\n\n\n                </div>\n\n                <!-- CONTACT MODAL -->\n                <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\">\n                        <div class=\"modal-content\">\n                            <div class=\"modal-header\">\n                                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                                <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                            </div>\n                            <div class=\"modal-body\">\n                                <form class=\"form-horizontal col-sm-12\">\n                                    <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                            data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                            type=\"text\"></div>\n                                    <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                            data-trigger=\"manual\"></textarea></div>\n                                    <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                            data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                            type=\"text\"></div>\n                                    <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                        <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                    </div>\n                                </form>\n                            </div>\n                            <div class=\"modal-footer\">\n                                <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END CONTACT MODAL -->\n\n                <!-- ABOUT MODAL -->\n                <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\">\n                        <div class=\"modal-content\">\n                            <div class=\"modal-header\">\n                                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                                <h3 id=\"myModalLabel\">O nama</h3>\n                            </div>\n                            <div class=\"modal-body\">\n                                <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                    i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za\n                                    poljoprivredu\n                                </p>\n                            </div>\n                            <div class=\"modal-footer\">\n                                <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END ABOUT MODAL -->\n                <!-- SETINGS MODAL -->\n                <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\">\n                        <div class=\"modal-content\">\n                            <div class=\"modal-header\">\n                                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                                <h3 id=\"myModalLabel\">Podesavanja</h3>\n                            </div>\n                            <div class=\"modal-body\">\n                                <div class=\"panel panel-primary\">\n\n                                    <div class=\"panel-body\">\n                                        <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                            <div class=\"form-group\">\n                                                <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                                <div class=\"col-md-3\">\n                                                    <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                                </div>\n                                                <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                                <div class=\"col-md-3\">\n                                                    <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                                </div>\n\n                                            </div>\n\n\n\n\n                                        </form>\n                                    </div>\n                                </div>\n                            </div>\n                            <div class=\"modal-footer\">\n                                <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END SETINGS MODAL -->\n\n\n\n            </div>\n            <!-- end glavni deo -->\n        </div>\n        <div id=\"page-wrapper\" *ngIf=\"(dozvole!==undefined&&dozvole.guest==true)||(smeDaPise==false&&isOwner==false)\">\n            <div class=\"container-fluid\">\n                nemate dozvole za pristup stranici\n            </div>\n        </div>\n\n    </div>\n\n\n    <!-- full screen -->\n    <script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyCqbPWLQuyiljUeKZ4f8KTsAHmCFnSAMJs&libraries=drawing\"\n        defer>\n\n        </script>\n    <script>\n        function initMap() {\n            var mapProp = {\n                center: new google.maps.LatLng(51.508742, -0.120850),\n                zoom: 5,\n                mapTypeId: google.maps.MapTypeId.ROADMAP\n            };\n            var map = new google.maps.Map(document.getElementById(\"googleMap\"), mapProp);\n        }\n        google.maps.event.addDomListener(window, 'load', initialize);\n    </script>\n\n</body>\n\n</html>"

/***/ }),

/***/ 726:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\r\n\r\n<html>\r\n\r\n<head>\r\n    <title>PlanTech</title>\r\n    <meta charset=\"UTF-8\">\r\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\r\n    <meta name=\"author\" content=\"HighFive\" />\r\n\r\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\r\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\r\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\r\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\r\n    <script src=\"https://unpkg.com/zone.js/dist/zone.js\"></script>\r\n    <script src=\"https://unpkg.com/zone.js/dist/long-stack-trace-zone.js\"></script>\r\n    <script src=\"https://unpkg.com/reflect-metadata@0.1.3/Reflect.js\"></script>\r\n    <script src=\"https://unpkg.com/systemjs@0.19.31/dist/system.js\"></script>\r\n    <link data-require=\"bootstrap-css@*\" data-semver=\"3.3.1\" rel=\"stylesheet\" href=\"//maxcdn.bootstrapcdn.com/bootstrap/3.3.1/css/bootstrap.min.css\"\r\n    />\r\n    <!-- full screen -->\r\n    <style>\r\n        #exampleImage {\r\n            cursor: zoom-in;\r\n        }\r\n        \r\n        #exampleImage:-webkit-full-screen {\r\n            cursor: zoom-out;\r\n        }\r\n        \r\n        #exampleImage:-moz-full-screen {\r\n            cursor: zoom-out;\r\n        }\r\n        \r\n        #exampleImage:-ms-fullscreen {\r\n            cursor: zoom-out;\r\n        }\r\n        \r\n        #exampleImage:fullscreen {\r\n            cursor: zoom-out;\r\n        }\r\n    </style>\r\n    <script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyCqbPWLQuyiljUeKZ4f8KTsAHmCFnSAMJs&libraries=drawing\"\r\n        defer>\r\n\r\n        </script>\r\n    <script>\r\n        function initMap() {\r\n            var mapProp = {\r\n                center: new google.maps.LatLng(51.508742, -0.120850),\r\n                zoom: 5,\r\n                mapTypeId: google.maps.MapTypeId.ROADMAP\r\n            };\r\n            var map = new google.maps.Map(document.getElementById(\"googleMap\"), mapProp);\r\n        }\r\n        google.maps.event.addDomListener(window, 'load', initialize);\r\n    </script>\r\n\r\n</head>\r\n\r\n<body>\r\n\r\n    <div id=\"wrapper\">\r\n\r\n        <app-meni></app-meni>\r\n\r\n        <!-- glavni deo -->\r\n        <div id=\"page-wrapper\" *ngIf=\"(dozvole!==undefined&&dozvole.guest==false)&&(isOwner||smeDaDodaje)\">\r\n\r\n            <app-widgets></app-widgets>\r\n\r\n            <div class=\"container-fluid\">\r\n                <!-- ODABIR PARCELA -->\r\n                <!--ADD PRODUCER MODAL -->\r\n <div class=\" col-md-3\"> </div>\r\n                <tabs class=\" col-md-6 addTypeTab\">\r\n                    <tab [tabTitle]=\"'Dodaj prozivodjaca'\" class=\"\">\r\n                        <form class=\"form-horizontal col-md-12\" [formGroup]=\"producerForm\">\r\n                            <div class=\"form-group\">\r\n                                <label>Ime</label>\r\n                                <input class=\"form-control required\" formControlName=\"producerName\">\r\n                            </div>\r\n\r\n                            <div class=\"form-group col-md-12 align-elements\"><button type=\"button\" class=\"btn btn-highFive \" (click)=\"addProducer(producerForm.value)\"\r\n                                    data-dismiss=\"modal\">Sacuvaj</button>\r\n                                <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\r\n                            </div>\r\n                        </form>\r\n                        <div style=\"clear:both\"></div>\r\n                        <div *ngIf=\"dodatProizvodjac\" role=\"alert\" class=\"alert alert-success alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\r\n                            <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                            Uspesno ste dodali novog proizvodjaca\r\n                        </div>\r\n                    </tab>\r\n\r\n                    <!--END PRODUCER MODAL -->\r\n                    <!--ADD TYPE MODAL -->\r\n\r\n                    <tab [tabTitle]=\"'Dodaj kulturu'\">\r\n                        <form class=\"form-horizontal col-md-12 \" [formGroup]=\"typeForm\">\r\n                            <div class=\"col-md-8\">\r\n                                <div class=\"form-group\">\r\n                                    <label>Ime</label>\r\n                                    <input class=\"form-control required\" formControlName=\"typeName\">\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"col-md-4 checkBoxAddType\" >\r\n                                <div class=\"form-group\">\r\n                                \r\n                                    <input type=\"checkbox\" class=\"required\" formControlName=\"isVisible\" id=\"box-3\">\r\n                                        <label for=\"box-3\">Vidljivost proizvoda</label>\r\n                                </div>\r\n                            </div>\r\n                            <div class=\"col-md-3 \" *ngIf=\"!isOwner||dozvoleKodGazde.length!=0\">\r\n                                            <label class=\"col-md-5 \">Izaberite vlasnika plantaze</label>\r\n                                            <div class=\"col-md-7 \">\r\n                                                <select class=\"form-control btn-primary\" formControlName=\"vlasnikPlantaze\">\r\n                                                        <option *ngFor=\"let ow of komeMozeDaDoda\" [value]=\"ow.id\">{{ow.name}} {{ow.surname}}</option>\r\n                                                    </select>\r\n                                            </div>\r\n\r\n                                        </div>\r\n                           \r\n\r\n                            <div class=\"form-group col-md-12 align-elements\"><button type=\"button\" class=\"btn btn-highFive \" (click)=\"addType(typeForm.value)\" data-dismiss=\"modal\">Sacuvaj</button>\r\n                                <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\r\n                            </div>\r\n                        </form>\r\n                        <div style=\"clear:both\"></div>\r\n                        <div *ngIf=\"dodatTip\" role=\"alert\" class=\"alert alert-success alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\r\n                            <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                            Uspesno ste dodali novu kulturu\r\n                        </div>\r\n                    </tab>\r\n                    <!--END TYPE MODAL -->\r\n                    <!--ADD SUBTYPE MODAL -->\r\n\r\n                    <tab [tabTitle]=\"'Dodaj podkulturu'\">\r\n                        <form class=\"form-horizontal col-md-12\" [formGroup]=\"subtypeForm\">\r\n\r\n                            <div class=\"form-group\">\r\n                                <label class=\"center-block\">Tip kulture\r\n                                            <select class=\"form-control\"  formControlName=\"vrsta\">\r\n                                                <option *ngFor=\"let tip of tipovi\" [value]=\"tip.id\">{{tip.name}}</option>\r\n                                            </select>\r\n                                        </label>\r\n                            </div>\r\n\r\n\r\n                            <div class=\"form-group\"><label>Ime</label><input class=\"form-control\" formControlName=\"subtypeName\"></div>\r\n                            <div class=\"form-group col-md-12 align-elements\"><button type=\"button\" class=\"btn btn-highFive \" (click)=\"addSubtype(subtypeForm.value)\"\r\n                                    data-dismiss=\"modal\">Sacuvaj</button>\r\n                                <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\r\n                            </div>\r\n                        </form>\r\n                        <div style=\"clear:both\"></div>\r\n                        <div *ngIf=\"dodatPodtip\" role=\"alert\" class=\"alert alert-success alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\r\n                            <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                            Uspesno ste dodali novu podkulturu\r\n                        </div>\r\n                    </tab>\r\n                </tabs>\r\n                <!--END SUBTYPE MODAL -->\r\n\r\n\r\n                <!--END ODABIR PARCELA -->\r\n\r\n\r\n\r\n            </div>\r\n\r\n            <!-- CONTACT MODAL -->\r\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\r\n                <div class=\"modal-dialog\">\r\n                    <div class=\"modal-content\">\r\n                        <div class=\"modal-header\">\r\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\r\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\r\n                        </div>\r\n                        <div class=\"modal-body\">\r\n                            <form class=\"form-horizontal col-sm-12\">\r\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\r\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\r\n                                        type=\"text\"></div>\r\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\r\n                                        data-trigger=\"manual\"></textarea></div>\r\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\r\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\r\n                                        type=\"text\"></div>\r\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\r\n                                    <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\r\n                                </div>\r\n                            </form>\r\n                        </div>\r\n                        <div class=\"modal-footer\">\r\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <!--END CONTACT MODAL -->\r\n\r\n            <!-- ABOUT MODAL -->\r\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\r\n                <div class=\"modal-dialog\">\r\n                    <div class=\"modal-content\">\r\n                        <div class=\"modal-header\">\r\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\r\n                            <h3 id=\"myModalLabel\">O nama</h3>\r\n                        </div>\r\n                        <div class=\"modal-body\">\r\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\r\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\r\n                            </p>\r\n                        </div>\r\n                        <div class=\"modal-footer\">\r\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <!--END ABOUT MODAL -->\r\n            <!-- SETINGS MODAL -->\r\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\r\n                <div class=\"modal-dialog\">\r\n                    <div class=\"modal-content\">\r\n                        <div class=\"modal-header\">\r\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\r\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\r\n                        </div>\r\n                        <div class=\"modal-body\">\r\n                            <div class=\"panel panel-primary\">\r\n\r\n                                <div class=\"panel-body\">\r\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\r\n                                        <div class=\"form-group\">\r\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\r\n                                            <div class=\"col-md-3\">\r\n                                                <label class=\"switch\">\r\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\r\n                                                    <span></span>\r\n                                                </label>\r\n                                            </div>\r\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\r\n                                            <div class=\"col-md-3\">\r\n                                                <label class=\"switch\">\r\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\r\n                                                    <span></span>\r\n                                                </label>\r\n                                            </div>\r\n\r\n                                        </div>\r\n\r\n\r\n\r\n\r\n                                    </form>\r\n                                </div>\r\n                            </div>\r\n                        </div>\r\n                        <div class=\"modal-footer\">\r\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n            </div>\r\n            <!--END SETINGS MODAL -->\r\n\r\n\r\n\r\n        </div>\r\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&(dozvole.guest==true || (!isOwner&&!smeDaDodaje))\">\r\n            <div class=\"container-fluid\">\r\n                nemate dozvole za pristup stranici\r\n            </div>\r\n        </div>\r\n        <!-- end glavni deo -->\r\n    </div>\r\n\r\n\r\n\r\n\r\n\r\n    <!-- full screen -->\r\n\r\n</body>\r\n\r\n</html>"

/***/ }),

/***/ 727:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==false\">\n\n            <app-widgets></app-widgets>\n\n            <div class=\"container-fluid\">\n                <!-- ODABIR PARCELA -->\n                <div class=\"col-md-12 \" style=\"text-align:center\">\n                    <div class=\"col-md-2\"></div>\n                    <div class=\"col-md-8  \" style=\"text-align:center;\">\n                        <div class=\"panel panel-primary\">\n                            <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Odabir novih radnika</div>\n                            <div *ngIf=\"uspesnoDodatRadnik\" role=\"alert\" class=\"alert alert-success alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                Poslat je zahtev radniku\n                            </div>\n                                           <div *ngIf=\"radnikVecZaposlen\" class=\"panel-footer \" style=\"height:100% \">  \n                                    <div  role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                            <button aria-label=\"Close\"  data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                         \n                                        Izabrani radnik je vec zaposlen kod vas\n                                    </div>\n                            </div>\n                              <div *ngIf=\"radnikNepostoji\" class=\"panel-footer \" style=\"height:100% \">  \n                                    <div  role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" >\n                                            <button aria-label=\"Close\"  data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                         \n                                        Izabrani radnik nije registrovan\n                                    </div>\n                            </div>\n                                 <div *ngIf=\"radnikJeVlasnik\" class=\"panel-footer \" style=\"height:100% \">  \n                                    <div  role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" >\n                                            <button aria-label=\"Close\"  data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                         \n                                        Izabrani radnik je vlasnik neke druge parcele \n                                    </div>\n                            </div>\n                           <div class=\"panel-body \" style=\"height:100% \">   \n                                        <div class=\"col-md-12 \" style=\"text-align:center;\" >\n                                             <div class=\"col-md-6 \" style=\"text-align:center;padding-top: 26px\" >\n                                               \n                                            <label class=\"col-md-5 \" style=\"padding-top: 5px\">Username radnika</label>\n                                            <div  class=\"input-group col-md-7\">\n                                                <input [(ngModel)]=\"username\" class=\"form-control \" formcontrolname=\"name\" ng-reflect-name=\"name\">\n                                                <span class=\"input-group-addon\"><i  class=\"fa fa-user\"></i></span>\n                                            </div>\n\n                                       \n                                               \n                                                \n                                            </div>\n                                             <div class=\"col-md-6 \" style=\"text-align:center;padding-left: 40px\" >\n                                                  <label >Uloga</label>\n                                                    <select class=\"form-control btn-primary\" (ngModelChange)=\"onChangeR($event) \" [ngModel]=\"selectedRole\" >\n                                                         \n                                                      <option *ngFor=\"let r of roles\"   [ngValue]=\"r.id\" >{{ r.name }}</option>\n                                                    </select>\n                                            </div>\n                                        </div>\n                                           \n                                            \n                                                              \n                                     </div>\n                            <div class=\"panel-footer \" style=\"height:100% \">\n                                <div *ngIf=\"selektovan\" role=\"alert\" class=\"alert alert-info alert-dismissible fade in\">\n                                    <label>Omogucena prava:  </label>\n                                    <label *ngIf=\"binary[0] == 1\">gledanja plantaza, </label>\n                                    <label *ngIf=\"binary[1] == 1\">menjanja plantaza,</label>\n                                    <label *ngIf=\"binary[2] == 1\">dodavanja plantaza,</label>\n                                    <label *ngIf=\"binary[3] == 1\">brisanja plantaza</label>\n                                </div>\n\n                                <button class=\"btn btn-success \" (click)=\"dodajRadnika()\">Sacuvaj</button>\n                            </div>\n                        </div>\n                    </div>\n\n                </div>\n                <!--END ODABIR PARCELA -->\n                <!--LISTA RADNIKA -->\n                 <div class=\"col-md-12 \" style=\"text-align:center\">\n                    <div class=\"col-md-4 col-centered \" style=\"text-align:center;\">\n<div class=\"panel panel-primary\">\n                            <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Odabir mojih zaposlenih</div>\n                            <div class=\"panel-body \" style=\"max-height: 65px\">\n                                <div class=\"input-group block center\">\n                                              <span class=\"input-group-btn\" style=\"width: 0;text-align: initial;\">\n                                                  \n                                                <span class=\"input-group-addon\">  <input type=\"text\" name=\"term\" [(ngModel)]=\"term\"/> <i class=\"glyphicon glyphicon-search\"></i></span>\n                                           \n                                            </span>\n                                </div>\n                            </div>\n                        </div>\n\n            </div></div>\n\n\n                <div class=\"col-md-12 row\" style=\"text-align:center\">\n                    <div class=\"panel panel-primary\">\n                        <div class=\"panel-heading\" style=\"background-color:  #8f2846\">Lista mojih ljudi\n                        </div>\n                        <div *ngIf=\"uspesnoIzbrisanRadnik\" class=\"panel-footer \" style=\"height:100% \">\n                            <div role=\"alert\" class=\"alert alert-success alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                <button aria-label=\"Close\" data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                Uspesno ste izbrisali radnika\n                            </div>\n                        </div>\n\n                        <div *ngIf=\"updatedRole\" class=\"panel-footer \" style=\"height:100% \">\n                            <div role=\"alert\" class=\"alert alert-success alert-dismissible fade in\">\n                                <button aria-label=\"Close\" data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                Uspesno ste izabrali novu ulogu\n                            </div>\n                        </div>\n                        <div class=\"panel-body \">\n                            <div class=\"table-responsive\">\n                                <table class=\"table table-bordered\">\n                                    <thead>\n                                        <tr>\n\n                                            <th style=\"text-align: center\">Ime</th>\n                                            <th style=\"text-align: center\">Prezime</th>\n                                            <th style=\"text-align: center\">Uloga/Promena uloge</th>\n\n                                            <th style=\"text-align: center\">Ukloni</th>\n\n                                        </tr>\n                                    </thead>\n                                    <tbody>\n\n                                        <tr *ngFor=\"let uw of usersWorkers | filter:term\">\n\n                                            <td>{{ uw.name }}</td>\n                                            <td> {{ uw.surname }}</td>\n                                            <td>\n                                                <select class=\"form-control btn-primary\" #t (change)=\"onChangeRoleUpdate(t.value,uw.UserConID)\">\n                                                         \n                                                      <option *ngFor=\"let r of roles\"   [value]=\"r.id\" [selected]=\"r.id ==uw.roleID ? true: null\">{{ r.name}}</option>\n                                                    </select>\n                                            </td>\n\n                                            <td><button class=\"btn btn-danger btn-sm\" (click)=\"delete(uw.UserConID)\">Izbrisi</button></td>\n\n                                        </tr>\n\n\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END LISTA PARCELA -->\n\n            </div>\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\"\n                                        id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n        </div>\n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 728:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <!-- Meni -->\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==false\">\n\n            <app-widgets></app-widgets>\n\n            <!-- end widgeti -->\n            <div class=\"col-md-12 \" style=\"text-align:center\" *ngIf=\"!vidljivostchart\">\n                <div class=\"col-md-4 col-centered \" style=\"text-align:center;\">\n                    <div class=\"panel panel-primary\">\n                        <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Odabir statistike</div>\n                        <div class=\"panel-body \" style=\"max-height: 65px\">\n                            <div class=\"input-group block center\">\n                                <span class=\"input-group-btn\" style=\"width: 0;text-align: initial;\">                                                 \n                                                <span class=\"input-group-addon\">  <input type=\"text\" name=\"term\" [(ngModel)]=\"term\"/> <i class=\"glyphicon glyphicon-search\"></i></span>\n                                </span>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"container-fluid\">\n                <!--LISTA PARCELA -->\n                <div class=\"col-md-12 row\" style=\"text-align:center\" *ngIf=\"!vidljivostchart\">\n                    <div class=\"panel panel-primary\">\n                        <div class=\"panel-heading\" style=\"background-color:  #8f2846\">Lista mojih plantaza</div>\n                        <div class=\"panel-body \">\n                            <div class=\"table-responsive\">\n                                <table class=\"table table-bordered\">\n                                    <thead>\n                                        <tr>\n                                            <!--    <th>#</th>-->\n                                            <th style=\"text-align: center\">Ime plantaze</th>\n\n                                            <th style=\"text-align: center\">Opcije</th>\n\n                                        </tr>\n                                    </thead>\n                                    <tbody id=\"idTabele\">\n                                        <tr *ngFor=\"let vrsta of vrste | filter:term\">\n                                            <td>{{vrsta.name}}</td>\n\n                                            <td><button (click)=\"prikaziStatistiku(vrsta.id)\" class=\"btn btn-success\">prikazi statistiku</button></td>\n                                        </tr>\n\n                                    </tbody>\n                                </table>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END LISTA PARCELA -->\n                <!-- CHART 1-->\n                <div class=\"row\" *ngIf=\"vidljivostchart&&imaPodataka\" style=\"text-align: center \">\n\n                    <button (click)=\"vratiNaPrikaz()\" class=\"btn btn-primary btn-lg \" style=\"float: left\"><span class=\"fa fa-arrow-left\"></span> nazad na prikaz </button>\n                    <div class=\"col-md-12 row\">\n                        <div class=\"col-md-2 \"> </div>\n                        <div class=\"col-md-8\">\n                            <h3 class=\"row\">Grafik nutricionostickih vrednosti</h3>\n                            <div style=\"display: block;\">\n                                <canvas baseChart width=\"33%\" height=\"20%\" [datasets]=\"lineChartData\" [labels]=\"lineChartLabels\" [options]=\"lineChartOptions\"\n                                    [colors]=\"lineChartColors\" [legend]=\"lineChartLegend\" [chartType]=\"lineChartType\" (chartHover)=\"chartHovered($event)\"\n                                    (chartClick)=\"chartClicked($event)\"></canvas>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!-- KRAJ 1. CHARTA -->\n                <!-- CHART 2-->\n                <div class=\"row\" *ngIf=\"vidljivostchartBar&&imaPodataka\">\n                    <div class=\"col-md-2\"> </div>\n                    <div class=\"col-md-8\" style=\"text-align: center \">\n                        <h3 class=\"row\">Grafik vlaznosti zemljista</h3>\n                        <div style=\"display: block;\">\n                            <canvas baseChart [datasets]=\"barChartData\" [colors]=\"lineChartColors\" [labels]=\"barChartLabels\" [options]=\"barChartOptions\"\n                                [legend]=\"barChartLegend\" [chartType]=\"barChartType\" (chartHover)=\"chartbarHovered($event)\" (chartClick)=\"chartbarClicked($event)\"></canvas>\n                        </div>\n                    </div>\n\n                </div>\n                <!-- KRAJ 2. CHARTA -->\n\n                <!-- CHART 3-->\n                <div class=\"row\" *ngIf=\" vidljivostRadar&&imaPodataka\">\n                    <div class=\"col-md-12\">\n                        <div class=\"col-md-2\"> </div>\n                        <div class=\"col-md-8\" style=\"text-align: center \">\n                            <h3 class=\"row\">Grafik temperature</h3>\n                            <div style=\"display: block;\">\n                                <canvas baseChart [datasets]=\"radarChartData\" [colors]=\"lineChartColors\" [labels]=\"radarChartLabels\" [chartType]=\"radarChartType\"\n                                    (chartHover)=\"chartradarHovered($event)\" (chartClick)=\"chartradarClicked($event)\"></canvas>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"col-md-3\">\n                        <button (click)=\"vratiNaPrikaz()\" class=\"btn btn-primary btn-lg \" style=\"float: left\"><span class=\"fa fa-arrow-left\"></span> nazad na prikaz </button>\n\n                    </div>\n\n                </div>\n\n\n                <!-- KRAJ 3. CHARTA -->\n\n\n            </div>\n            <div *ngIf=\"!imaPodataka&&podaciTrazeni\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                <button aria-label=\"Close\" (click)=\"skloniPoruku()\" data-dismiss=\"alert\" class=\"close\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                &nbsp;&nbsp;O trazenoj parceli trenutno nema statistickih podataka. Podaci se dobijaju svakoh dana u 23:30\n                i 11:30.\n            </div>\n\n\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n        </div>\n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 729:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyCqbPWLQuyiljUeKZ4f8KTsAHmCFnSAMJs&libraries=drawing\"\n        defer>\n\n        </script>\n    <script>\n        function initMap() {\n            var mapProp = {\n                center: new google.maps.LatLng(51.508742, -0.120850),\n                zoom: 5,\n                mapTypeId: google.maps.MapTypeId.ROADMAP\n            };\n            var map = new google.maps.Map(document.getElementById(\"googleMap\"), mapProp);\n        }\n        google.maps.event.addDomListener(window, 'load', initialize);\n    </script>\n</head>\n\n<body>\n    <div id=\"wrapper\">\n\n        <!-- Meni -->\n        <app-meni></app-meni>\n        <!-- Meni -->\n        <div id=\"page-wrapper>\" *ngIf=\"dozvole!==undefined&&dozvole.guest==false\">\n\n            <!-- end Meni -->\n\n            <!-- glavni deo -->\n            <div id=\"page-wrapper\" style=\"min-height: 100vh\">\n\n                <div class=\"container-fluid\">\n                    <div class=\"col-md-12 \" style=\"text-align:center\">\n\n                        <div class=\"panel panel-primary\">\n                            <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 100%\">\n                                <h1>Azuriranje mojih plantaza</h1>\n                            </div>\n\n                        </div>\n\n\n                        <form id=\"loginform\" class=\"form-horizontal\" role=\"form\" novalidate method=\"post\">\n                            <div *ngIf=\"uspesnoPromenjeniPodaci\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>Podaci\n                                o Vasoj plantazi su azurirani.\n                            </div>\n\n                            <div class=\"col-md-12\">\n                                <div class=\"col-md-6 \">\n\n                                    <label class=\"col-md-5 \" style=\"padding-top: 5px\">Ime plantaze</label>\n                                    <div class=\"input-group col-md-7\">\n                                        <input class=\"form-control \" name=\"sername\" *ngIf=\"vidljivost\" value=\"{{imePlant}}\" [(ngModel)]=\"imePlant\">\n                                        <span class=\"input-group-addon\"><i  class=\"fa fa-tag\"></i></span>\n                                    </div>\n                                </div>\n                                <div class=\"col-md-6 \">\n                                    <label class=\"col-md-5 \">Tip</label>\n                                    <div class=\"input-group col-md-7\">\n                                        <select class=\"form-control btn-primary\" #t (change)=\"callType(t.value)\">\n\n                                          <option *ngFor = \"let tip of tipovi\" [ngValue]='tip'> {{tip.name}} </option>\n                                        </select>\n                                    </div>\n                                </div>\n\n                            </div>\n                            <!--    <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></span>\n                                                    <input type=\"text\" class=\"form-control\" name=\"sername1\" *ngIf=\"vidljivost\" value=\"{{imeTip}}\" [(ngModel)]=\"imeTip\">\n\n                                                </div>-->\n\n\n                            <!--<div style=\"margin-top: 25px\" class=\"input-group\">\n                            <span class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></span>\n                            <input type=\"text\" class=\"form-control\" name=\"sername2\" *ngIf=\"vidljivost\" value=\"{{imePodT}}\" [(ngModel)]=\"imePodT\">\n\n                        </div>-->\n\n                            <div class=\"col-md-12 \" style=\"margin-top:10px\">\n                                <div class=\"col-md-6 \">\n                                    <label class=\"col-md-5 \">Podtip</label>\n                                    <div class=\"input-group col-md-7\">\n                                        <select class=\"form-control btn-primary\" #podT (change)=\"callType2(podT.value)\">\n\n                                                            <option *ngFor = \"let podTip of podtipovi\" [ngValue]='podTip'> {{podTip.name}} </option>\n\n\n                                                </select>\n                                    </div>\n                                </div>\n\n                                <div class=\"col-md-6 \">\n\n                                    <label class=\"col-md-5 \" style=\"padding-top: 5px\">Proizvodjac semena</label>\n                                    <div class=\"input-group col-md-7\">\n                                        <input type=\"text\" class=\"form-control\" name=\"sername3\" *ngIf=\"vidljivost\" value=\"{{imePS}}\" [(ngModel)]=\"imePS\">\n                                        <span class=\"input-group-addon\"><i class=\"fa fa-map-o\" aria-hidden=\"true\"></i></span>\n                                    </div>\n                                </div>\n\n                            </div>\n\n\n\n                            <div class=\"form-group col-md-12\" style=\"text-align: center;align-items: center;margin-top:2%\">\n                                <!-- Button -->\n\n                                <button class=\"btn btn-highFive\" type=\"submit\" (click)=\"promeniPodatke()\"> Promeni podatke </button>\n\n                            </div>\n                        </form>\n                    </div>\n                    <div style=\"height: 100%; width: 100%\">\n                        <div id=\"googleMap\" style=\"width:100%; height: 700px\"></div>\n                    </div>\n                </div>\n            </div>\n\n\n            <!--end tab za proemnu sifre  -->\n\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n\n            <!-- end glavni deo -->\n\n        </div>\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n\n    </div>\n\n    <script src='js/jquery-3.1.1.min.js'></script>\n    <script src='js/bootstrap.min.js'></script>\n    <script src='js/bootstrap-select.min.js'></script>\n\n    <!-- full screen -->\n\n</body>\n\n</html>"

/***/ }),

/***/ 730:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" style=\"min-height: 100vh\">\n\n            <div class=\"container-fluid\">\n                <div class=\"col-md-12 \" style=\"text-align:center\">\n\n                    <div class=\"panel panel-primary\">\n                        <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 100%\">\n                            <h1>Podesavanja mog profila</h1>\n                        </div>\n\n                    </div>\n                    <div data-example-id=\"togglable-tabs\" id=\"opcije\">\n                        <!-- meni za podesavanja  -->\n                        <ul id=\"myTab\" class=\"nav nav-tabs nav-justified\" role=\"tablist\">\n\n                            <li class=\"{{promeniSifruVidljivo ? 'profileTab active' : ''}}\"><a (click)=\"promeniTab('sifra')\" id=\"sifra-tab\" role=\"tab\" data-toggle=\"tab\" aria-expanded=\"true\">Promeni Sifru</a>\n                            </li>\n                            <li class=\"{{promeniOstalePodatkeVidljivo ? 'profileTab active' : ''}}\"><a (click)=\"promeniTab('podaci')\" role=\"tab\" id=\"podaci-tab\" data-toggle=\"tab\" aria-expanded=\"false\">Promena mojih podataka</a>\n                            </li>\n                            <li class=\"{{promeniSlikuVidljivo ? 'profileTab active' : ''}}\"><a (click)=\"promeniTab('slika')\" role=\"tab\" id=\"slika-tab\" data-toggle=\"tab\" aria-expanded=\"false\">Promena slike</a>\n                            </li>\n\n\n                        </ul>\n                        <!--end meni za podesavanja  -->\n                        <div id=\"myTabContent\" class=\"tab-content\">\n                            <!-- tab za proemnu sifre  -->\n                            <div role=\"tabpanel\" class=\"tab-pane fade active in\" aria-labelledby=\"sifra-tab\">\n\n                                <!-- start edit pass -->\n                                <div class=\"col-md-3 \" style=\"margin-top: 15px\"></div>\n                                <div class=\"panel panel-primary col-md-6 \" style=\"margin-top: 15px\">\n\n                                    <div class=\"panel-body \">\n                                        <div style=\"padding-bottom:30px; \" class=\"panel-body\">\n\n                                            <form [hidden]=\"!promeniSifruVidljivo\" id=\"loginform\" class=\"form-horizontal\" role=\"form\" novalidate method=\"post\">\n                                                <div *ngIf=\"uspesnoPromenjenaSifra\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                                    <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                                    Uspesno ste promenili sifru.\n                                                </div>\n                                                <div *ngIf=\"imaNeko\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                                                    <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                                    Takva sifra vec postoji.\n                                                </div>\n                                                <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></span>\n                                                    <input placeholder=\"Stara sifra\" required pattern=\"[A-Z]{1}[a-z]{1,10}\" type=\"text\" class=\"form-control\" name=\"sername\" *ngIf=\"vidljivost\"\n                                                        value=\"\" [(ngModel)]=\"staraSifra\" ngModel>\n                                                </div>\n                                                <div *ngIf=\"pogresnaSifra\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                                                    <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                                    Uneli ste pogresnu sifru.\n                                                </div>\n\n\n                                                <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></span>\n                                                    <input type=\"password\" [(ngModel)]=\"pass1\" #pass=\"ngModel\" required pattern=\"(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}\" class=\"form-control\"\n                                                        name=\"pass11\" value=\"\" placeholder=\"Nova sifra\" ngModel>\n                                                </div>\n                                                <div *ngIf=\"pass.errors && (pass.dirty || pass.touched)\" class=\"alert alert-danger\">\n                                                    <div [hidden]=\"!pass.errors.required\">\n                                                        Unesite šifru.\n                                                    </div>\n                                                    <div [hidden]=\"!pass.errors.pattern\">\n                                                        Šifra mora da sadrži 8 ili vise karaktera od kojih je bar jedan broj i veliko i malo slovo.\n                                                    </div>\n                                                </div>\n\n                                                <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-lock\"></i></span>\n                                                    <input type=\"password\" [(ngModel)]=\"pass2\" #passs=\"ngModel\" required pattern=\"(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}\" class=\"form-control\"\n                                                        name=\"pass12\" value=\"\" placeholder=\"Ponovi novu sifru\" ngModel>\n                                                </div>\n                                                <div *ngIf=\"neuspesno\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                                                    <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                                    Prva i druga sifra moraju biti iste.\n                                                </div>\n                                                <div *ngIf=\"passs.errors && (passs.dirty || passs.touched)\" class=\"alert alert-danger\">\n                                                    <div [hidden]=\"!passs.errors.required\">\n                                                        Unesite šifru.\n                                                    </div>\n                                                    <div [hidden]=\"!passs.errors.pattern\">\n                                                        Šifra mora da sadrži 8 ili vise karaktera od kojih je bar jedan broj i veliko i malo slovo.\n                                                    </div>\n                                                </div>\n                                                <div style=\"margin-top:10px\" class=\"form-group\">\n                                                    <!-- Button -->\n                                                    <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n                                                        <button class=\"btn btn-primary\" type=\"submit\" (click)=\"promeniSifru()\">Prmeni sifru</button>\n                                                    </div>\n                                                </div>\n                                            </form>\n                                            <form [hidden]=\"!promeniOstalePodatkeVidljivo\" id=\"loginform\" class=\"form-horizontal\" role=\"form\" novalidate method=\"post\">\n                                                <div *ngIf=\"uspesno\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                                    <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                                    Vasi podaci su azurirani.\n                                                </div>\n                                                <div class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-user\"></i></span>\n                                                    <input id=\"reg-ime\" type=\"text\" required pattern=\"[A-Z]{1}[a-z]{1,8}\" class=\"form-control\" name=\"user\" *ngIf=\"vidljivost\"\n                                                        value={{user.name}} [(ngModel)]=\"ime\">\n                                                </div>\n                                                <!--[(ngModel)]=\"ime\" ngModel-->\n\n\n                                                <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-user\"></i></span>\n                                                    <input id=\"reg-prezime\" required pattern=\"[A-Z]{1}[a-z]{1,10}\" type=\"text\" class=\"form-control\" name=\"prezime\" *ngIf=\"vidljivost\"\n                                                        value=\"{{user.surname}}\" placeholder=\"\" [(ngModel)]=\"prezime\">\n                                                    <!--[(ngModel)]=\"prezime\" ngModel-->\n                                                </div>\n\n                                                <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-envelope\"></i></span>\n                                                    <input id=\"reg-email\" type=\"email\" required pattern=\"[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$\" class=\"form-control\" name=\"email\"\n                                                        *ngIf=\"vidljivost\" value=\"{{user.email}}\" disabled>\n                                                </div>\n\n\n                                                <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                    <span class=\"input-group-addon\"><i class=\"fa fa-user-secret\"></i></span>\n                                                    <input required id=\"reg-username\" type=\"text\" class=\"form-control\" name=\"reg-username\" *ngIf=\"vidljivost\" value=\"{{user.username}}\"\n                                                        disabled>\n                                                </div>\n\n\n                                                <div class=\"form-group\" style=\"margin-top: 25px\">\n                                                    <label class=\"col-md-3 control-label\">Drzava</label>\n                                                    <div class=\"col-md-9\">\n                                                        <select class=\"form-control\" #t (change)=\"callType(t.value)\" data-style=\"btn-success\">\n                                                     \n                                                     <option *ngFor = \"let country of country_array\" [ngValue]='country'> {{country}} </option>\n                                                    \n                                        \n                                                    </select>\n\n\n\n                                                    </div>\n                                                </div>\n\n                                                <div style=\"margin-top:10px\" class=\"form-group\">\n                                                    <!-- Button -->\n                                                    <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n                                                        <button class=\"btn btn-primary\" type=\"submit\" (click)=\"promeniPodatke()\"> Promeni podatke </button>\n                                                    </div>\n                                                </div>\n\n\n                                            </form>\n                                            <form [hidden]='!promeniSlikuVidljivo'>\n                                                <div *ngIf='user!=undefined' class=\"form-group\"><label>Trenutna slika: </label>\n                                                    <div class=\"row\">\n\n                                                        <div class=\"col-md-10\">\n                                                            <img style=\" width: inherit; max-width: inherit;max-height: inherit;height: inherit; \" alt='slika nije pronadjena' src='{{user.profilePic}}'><img></div>\n                                                    </div>\n                                                </div>\n                                                <app-image-upload>\n                                                </app-image-upload>\n                                                <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n                                                    <button class=\"btn btn-primary\" type=\"submit\" (click)=\"promeniSliku()\">Potvrdite promenu</button>\n                                                </div>\n\n                                            </form>\n                                        </div>\n                                    </div>\n                                </div>\n\n                            </div>\n                            <!--end tab za proemnu sifre  -->\n\n                            <!--end tab za proemnu podataka  -->\n\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n        </div>\n        <!-- end glavni deo -->\n    </div>\n\n\n\n\n    <script src='js/jquery-3.1.1.min.js'></script>\n    <script src='js/bootstrap.min.js'></script>\n    <script src='js/bootstrap-select.min.js'></script>\n\n    <!-- full screen -->\n    <script>\n        function toggleFullscreen(elem) {\n            elem = elem || document.documentElement;\n            if (!document.fullscreenElement && !document.mozFullScreenElement &&\n                !document.webkitFullscreenElement && !document.msFullscreenElement) {\n                if (elem.requestFullscreen) {\n                    elem.requestFullscreen();\n                } else if (elem.msRequestFullscreen) {\n                    elem.msRequestFullscreen();\n                } else if (elem.mozRequestFullScreen) {\n                    elem.mozRequestFullScreen();\n                } else if (elem.webkitRequestFullscreen) {\n                    elem.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);\n                }\n            } else {\n                if (document.exitFullscreen) {\n                    document.exitFullscreen();\n                } else if (document.msExitFullscreen) {\n                    document.msExitFullscreen();\n                } else if (document.mozCancelFullScreen) {\n                    document.mozCancelFullScreen();\n                } else if (document.webkitExitFullscreen) {\n                    document.webkitExitFullscreen();\n                }\n            }\n        }\n\n        document.getElementById('btnFullscreen').addEventListener('click', function () {\n            toggleFullscreen();\n        });\n\n        document.getElementById('exampleImage').addEventListener('click', function () {\n            toggleFullscreen(this);\n        });\n    </script>\n</body>\n\n</html>"

/***/ }),

/***/ 731:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link rel=\"stylesheet\" href=\"css/infoTabStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/weather-icons.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n\n\n    <script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyCqbPWLQuyiljUeKZ4f8KTsAHmCFnSAMJs&libraries=drawing\"\n        defer>\n\n        </script>\n\n\n\n    <script>\n        function initMap() {\n            var mapProp = {\n                center: new google.maps.LatLng(51.508742, -0.120850),\n                zoom: 5,\n                mapTypeId: google.maps.MapTypeId.ROADMAP\n            };\n            var map = new google.maps.Map(document.getElementById(\"googleMap\"), mapProp);\n        }\n        google.maps.event.addDomListener(window, 'load', initialize);\n    </script>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n\n        <app-meni></app-meni>\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==false\">\n                <app-widgets></app-widgets>\n    <!-- widgeti         <div class=\"container-fluid\">\n                \n                <div class=\"col-md-12 \" style=\"text-align:center;margin-top: 10px\">\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-success widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-globe\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.plantaze}}</div>\n                                <div class=\"widget-title\">registrovanih plantaza</div>\n                            </div>\n                        </div>\n\n                    </div>\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-primary widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-users\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.radnici}}</div>\n                                <div class=\"widget-title\">registrovana radnka</div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-info widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-book\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.eksperti}}</div>\n                                <div class=\"widget-title\">registrovanih experata</div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"col-md-3 \">\n                        <div class=\"widget widget-warning widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-warning\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.obavestenja}}</div>\n                                <div class=\"widget-title\">obavestenja</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n             end widgeti -->\n\n            <div class=\"container-fluid\">\n                <!-- ODABIR PARCELA -->\n                <form id=\"filter\">\n                <!--    <div class=\"col-md-12 \" style=\"text-align:center\" *ngIf=\"!sideBarVidljiv\">\n                        <div class=\"col-md-4 col-centered \" style=\"text-align:center;\">\n                            <div class=\"panel panel-primary\">\n                                <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Odabir mojih parcela</div>\n                                <div class=\"panel-body \" style=\"max-height: 65px\">\n                                    <div class=\"input-group block center\">\n                                        <span class=\"input-group-btn\" style=\"width: 0;text-align: initial;\">\n                                                  \n                                                <span class=\"input-group-addon\">  <input type=\"text\" name=\"term\" [(ngModel)]=\"term\"/> <i class=\"glyphicon glyphicon-search\"></i></span>\n                                        </span>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>-->\n                    <!--END ODABIR PARCELA -->\n                    <!--LISTA PARCELA -->\n                    <div class=\"col-md-12 row\" style=\"text-align:center\">\n                        <div class=\"panel panel-primary\">\n                            <div id=\"togglable-tabs\" id=\"opcije\">\n                                <ul id=\"myTab\" class=\"nav nav-tabs nav-justified\" role=\"tablist\">\n\n                                    <li class=\"{{plantazaVidljiva ? 'profileTab active' : ''}}\"><a (click)=\"promeniTab()\" id=\"sifra-tab\" role=\"tab\" data-toggle=\"tab\" aria-expanded=\"true\">Moje plantaze</a>\n                                    </li>\n                                    <li class=\"{{parcelaVidljiva ? 'profileTab active' : ''}}\"><a (click)=\"promeniTab()\" role=\"tab\" id=\"podaci-tab\" data-toggle=\"tab\" aria-expanded=\"false\">Moja imanja</a>\n                                    </li>\n                                </ul>\n  <div class=\"col-md-12 \" style=\"text-align:center\" *ngIf=\"!sideBarVidljiv&&plantazaVidljiva\">\n                        <div class=\"col-md-4 col-centered \" style=\"text-align:center;\">\n                            <div class=\"panel panel-primary\">\n                                <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 42px\">Odabir mojih plantaza</div>\n                                <div class=\"panel-body \" style=\"max-height: 65px\">\n                                    <div class=\"input-group block center\">\n                                        <span class=\"input-group-btn\" style=\"width: 0;text-align: initial;\">\n                                                  \n                                                <span class=\"input-group-addon\">  <input type=\"text\" name=\"term\" [(ngModel)]=\"term\"/> <i class=\"glyphicon glyphicon-search\"></i></span>\n                                        </span>\n                                    </div>\n                                </div>\n                            </div>\n                        </div>\n                    </div>\n                                <div *ngIf=\"!sideBarVidljiv&&plantazaVidljiva\" class=\"panel-heading\" style=\"background-color:  #8f2846\">Lista mojih plantaza</div>\n                                <div *ngIf=\"!sideBarVidljiv&&plantazaVidljiva\" class=\"panel-body \">\n                                    <div class=\"table-responsive\">\n                                        <table *ngIf=\"!sideBarVidljiv&&plantazaVidljiva\" class=\"table table-bordered\">\n                                            <thead>\n                                                <tr>\n                                                    <!--    <th>#</th>-->\n                                                    <th style=\"text-align: center\">Naziv plantaze</th>\n                                                    <th style=\"text-align: center\">Tip</th>\n                                                    <th style=\"text-align: center\">Podtip</th>\n                                                    <th style=\"text-align: center\">Proizvodjac semena</th>\n                                                    <th style=\"text-align: center\">Username vlasnika plantaze</th>\n                                                    <th style=\"text-align: center\">Obrisi plantazu</th>\n                                                    <th style=\"text-align: center\">Azuriraj plantazu</th>\n                                                    <th style=\"text-align: center\">Prikazi plantazu</th>\n                                                </tr>\n                                            </thead>\n                                            <tbody id=\"idTabele\">\n                                                <tr *ngFor=\"let i=index; let vrsta of vrste | filter:term\">\n\n                                                    <td><span *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.gledanjePlantaza\">{{vrsta.name}}</span></td>\n                                                    <td><span *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.gledanjePlantaza\">{{vrsta.namet}}</span></td>\n                                                    <td><span *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.gledanjePlantaza\">{{vrsta.names}}</span></td>\n                                                    <td><span *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.gledanjePlantaza\">{{vrsta.namep}}</span></td>\n                                                    <td><span *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.gledanjePlantaza\"><button type=\"text\" style=\"display:none\"></button>{{vrsta.username}}</span></td>\n                                                    <td><button *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.plantCRUD\" (click)=\"Obrisi(b.value)\"\n                                                            #b id=\"btn-login\" class=\"btn btn logButton\" value=\"{{vrsta.id}}\"\n                                                            style=\"background-color: #31b0d5; color:white\">Obrisi </button></td>\n                                                    <td><button *ngIf=\"dozvole!==undefined&&vrste[i].dozvole.plantCRUD\" id=\"btn-login\"\n                                                            (click)=\"AzurirajPlant(a.value)\" #a class=\"btn btn logButton\" value=\"{{vrsta.id}}\"\n                                                            style=\"background-color:#337ab7; color:white\">Azuriraj</button></td>\n                                                    <td><button id=\"btn-login\" (click)=\" prikaziPlantazu(a.value)\" #a class=\"btn btn logButton\"\n                                                            value=\"{{vrsta.id}}\" style=\"background-color:#337ab7; color:white\">Prikazi</button></td>\n                                                </tr>\n\n                                            </tbody>\n                                        </table>\n                                    </div>\n                                </div>\n<div class=\"col-md-12 \" style=\"text-align:center\" *ngIf=\"!sideBarVidljiv&&parcelaVidljiva\">\n                     <!--   <div class=\"col-md-4 col-centered \" style=\"text-align:center;\">\n                            <div class=\"panel panel-primary\">\n                                <div class=\"panel-body \" style=\"max-height: 65px\">-->\n                                                                    \n    <!--                                                   <div class=\"field\">\n\n  <input type=\"text\" placeholder=\"What?\" name=\"term\" [(ngModel)]=\"term\"/>\n</div>-->\n<form method=\"get\" action=\"/search\" id=\"search\">\n  <input name=\"q\" type=\"text\" size=\"40\" placeholder=\"Pretraga imanja\" name=\"term\" [(ngModel)]=\"term\" />\n</form>\n                                    \n                                \n                   <!--             </div>\n                            </div>\n                        </div>-->\n                    </div>\n\n\n\n<div *ngIf=\"!sideBarVidljiv&&parcelaVidljiva\" class=\"panel-heading\" style=\"background-color:  #8f2846\">Lista mojih imanja</div>\n                                <div *ngIf=\"!sideBarVidljiv&&parcelaVidljiva\" class=\"panel-body \">\n                                    <div class=\"table-responsive\">\n                                        <table *ngIf=\"!sideBarVidljiv&&parcelaVidljiva\" class=\"table table-bordered\">\n                                            <thead>\n                                                <tr>\n                                                    <!--    <th>#</th>-->\n                                                    <th style=\"text-align: center\">Naziv imanja</th>\n                                                    <th style=\"text-align: center\">Obrisi imanje</th><th  style=\"text-align: center\">Izmeni imanje</th>\n                                                                                              \n                                                </tr>\n                                            </thead>\n                                            <tbody id=\"idTabele\">\n                                                <tr *ngFor=\"let i=index; let imanje of imanja | filter:term\">\n\n                                                    <td><span *ngIf=\"dozvole!==undefined\">{{imanje.name}}</span></td>\n                                            \n                                                    <td><button *ngIf=\"dozvole!==undefined\" (click)=\"Obrisi1(b1.value)\"\n                                                            #b1 id=\"btn-login\" class=\"btn btn logButton\" value=\"{{imanje.id}}\"\n                                                            style=\"background-color: #31b0d5; color:white\">Obrisi </button></td>\n                                                    <td><button *ngIf=\"dozvole!==undefined\" id=\"btn-login\"\n                                                            (click)=\"AzurirajParcelu(a1.value)\" #a1 class=\"btn btn logButton\" value=\"{{imanje.id}}\"\n                                                            style=\"background-color:#337ab7; color:white\">Izmeni</button></td>                               \n                                                </tr>\n\n                                            </tbody>\n                                        </table>\n                                    </div>\n                                </div>\n\n\n\n\n\n\n\n\n\n                            </div>\n                        </div>\n                        </div>\n                </form>\n                <!--END LISTA PARCELA -->\n\n                <div [hidden]=\"!sideBarVidljiv\" id=\"mapID\" style=\"height: 100%; width: 100%\">\n\n\n                </div>\n                <button *ngIf=\"sideBarVidljiv\" (click)=\"nazadNaPrikaz()\" class=\"btn backToPrikaz col-md-3\">nazad na spisak plantaza</button>\n                <div class=\"col-md-3 infoTab\" *ngIf=\"sideBarVidljiv\">\n\n\t\t\t\t\t<div class=\"row text-center\">\n\t\t\t\t\t\t<div class=\"col-md-12\"><h2 id=\"day1\" class=\"day\">{{izabranaPlantaza.name}}</h2></div>\n\t\t\t\t  </div>\n\n                    <div class=\"row text-center\">\n                        <div *ngIf=\"temperatura!==undefined\" class=\"col-md-12\" style=\"width:100%;font-size:100px;color:white;\"><img class=\"weatherIcon\" src=\"http://openweathermap.org/img/w/{{temperatura.weather[0].icon}}.png\"\n                            /></div>\n                    </div>\n\n\n                    <div class=\"row text-center\">\n                        <div *ngIf=\"temperatura!==undefined\" class=\"col-md-12\">\n                            <p id=\"temp1\" class=\"temp\">{{temperatura.main.temp}}°C</p>\n                        </div>\n                    </div>\n                    <div class=\"row text-center\">\n                        <div *ngIf=\"temperatura!==undefined\" class=\"col-md-6 col-xs-6\">\n                            <p id=\"main1\">Vreme: {{temperatura.weather[0].main}}</p>\n                            <p id=\"humidity1\">Vlaznost vazduha: {{temperatura.main.humidity}}</p>\n                            <p *ngIf=\"vlaznostZemljista!==undefined\" id=\"humidity1\">Vlaznost zemljista: {{vlaznostZemljista}}</p>\n\n                        </div>\n                        <div *ngIf=\"d!==undefined&&date!==undefined&&mon!==undefined\" class=\"col-md-6 col-xs-6\">\n                            <p id=\"dayNum1\" class=\"dayNum\">{{date}}.</p>\n                            <p id=\"month1\" class=\"month\">{{mon}}</p>\n                        </div>\n                        <div style=\"display: block\" *ngIf=\"pieChartLabels!==undefined&&pieChartData!==undefined\">\n                            <canvas baseChart [data]=\"pieChartData\" [legend]=\"false\" [labels]=\"pieChartLabels\" [chartType]=\"pieChartType\" (chartHover)=\"chartHovered($event)\"\n                                (chartClick)=\"chartClicked($event)\">\n                            </canvas>\n                        </div>\n\n                    </div>\n\n                </div>\n                </div>\n\n\n                <!-- CONTACT MODAL -->\n                <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\">\n                        <div class=\"modal-content\">\n                            <div class=\"modal-header\">\n                                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                                <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                            </div>\n                            <div class=\"modal-body\">\n                                <form class=\"form-horizontal col-sm-12\">\n                                    <div class=\"form-group\"><label>Ime</label><input name=\"ime\" class=\"form-control required\" placeholder=\"Vase ime\"\n                                            data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                            type=\"text\" [(ngModel)]=\"ime\"></div>\n                                    <div class=\"form-group\"><label>Naslov</label><input name=\"naslov\" class=\"form-control required\" placeholder=\"Naslov poruke\"\n                                            data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                            type=\"text\" [(ngModel)]=\"naslov\"></div>\n                                    <div class=\"form-group\"><label>E-Mail</label><input name=\"email\" class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                            data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                            type=\"text\" [(ngModel)]=\"email\"></div>\n                                    <div class=\"form-group\"><label>Poruka</label><textarea name=\"poruka\" class=\"form-control\" placeholder=\"Vasa poruka...\"\n                                            data-placement=\"top\" data-trigger=\"manual\" [(ngModel)]=\"poruka\"></textarea></div>\n\n                                    <div class=\"form-group\"><button (click)=\"posalji()\" type=\"submit\" class=\"btn btn-send pull-right\">Posalji!</button>\n                                        <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                    </div>\n                                </form>\n                            </div>\n                            <div class=\"modal-footer\">\n                                <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END CONTACT MODAL -->\n\n                <!-- ABOUT MODAL -->\n                <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                    <div class=\"modal-dialog\">\n                        <div class=\"modal-content\">\n                            <div class=\"modal-header\">\n                                <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                                <h3 id=\"myModalLabel\">O nama</h3>\n                            </div>\n                            <div class=\"modal-body\">\n                                <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                    i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za\n                                    poljoprivredu\n                                </p>\n                            </div>\n                            <div class=\"modal-footer\">\n                                <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n                <!--END ABOUT MODAL -->\n            </div>\n        </div>\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input name=\"ime\" class=\"form-control required\" placeholder=\"Vase ime\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\" [(ngModel)]=\"ime\"></div>\n                                <div class=\"form-group\"><label>Naslov</label><input name=\"naslov\" class=\"form-control required\" placeholder=\"Naslov poruke\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\" [(ngModel)]=\"naslov\"></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input name=\"email\" class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\" [(ngModel)]=\"email\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea name=\"poruka\" class=\"form-control\" placeholder=\"Vasa poruka...\"\n                                        data-placement=\"top\" data-trigger=\"manual\" [(ngModel)]=\"poruka\"></textarea></div>\n\n                                <div class=\"form-group\"><button (click)=\"posalji()\" type=\"submit\" class=\"btn btn-send pull-right\">Posalji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 732:
/***/ (function(module, exports) {

module.exports = "\r\n    <!--\r\n    <link rel=\"stylesheet\" type=\"text/css\" href=\"app/WeatherMap/another.weather/leaflet/leaflet.css\" />\r\n\t<link rel=\"stylesheet\" type=\"text/css\" href=\"app/WeatherMap/another.weather/leaflet-openweathermap.css\" />\r\n\t<link rel=\"stylesheet\" type=\"text/css\" href=\"app/WeatherMap/another.weather/files/map.css\" />\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet/leaflet.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet/Permalink.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet/Permalink.Layer.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet/Permalink.Overlay.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet/leaflet-flattrbutton.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet-openweathermap.js\"></script>\r\n\t<link rel=\"stylesheet\" type=\"text/css\" href=\"leaflet/leaflet-languageselector.css\" />\r\n\t<script src=\"app/WeatherMap/another.weather/leaflet/leaflet-languageselector.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/files/map_i18n.js\"></script>\r\n\t<script src=\"app/WeatherMap/another.weather/files/map.js\"></script>\r\n  \r\n  <link rel=\"stylesheet\" type=\"text/css\" href=\"leaflet/leaflet.css\" />\r\n\t<link rel=\"stylesheet\" type=\"text/css\" href=\"./leaflet-openweathermap.css\" />\r\n\t<link rel=\"stylesheet\" type=\"text/css\" href=\"files/map.css\" />\r\n\t<script src=\"leaflet/leaflet.js\"></script>\r\n\t<script src=\"leaflet/Permalink.js\"></script>\r\n\t<script src=\"leaflet/Permalink.Layer.js\"></script>\r\n\t<script src=\"leaflet/Permalink.Overlay.js\"></script>\r\n\t<script src=\"leaflet/leaflet-flattrbutton.js\"></script>\r\n\t<script src=\"./leaflet-openweathermap.js\"></script>\r\n\t<link rel=\"stylesheet\" type=\"text/css\" href=\"leaflet/leaflet-languageselector.css\" />\r\n\t<script src=\"leaflet/leaflet-languageselector.js\"></script>\r\n\t<script src=\"files/map_i18n.js\"></script>\r\n\t<script src=\"files/map.js\"></script>\r\n-->\r\n<!--\r\n<iframe src=\"https://www.ventusky.com/\" width=\"100%\" height =\"100%\"></iframe>\r\n-->\r\n<div id=\"map\"></div>"

/***/ }),

/***/ 733:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n  <title>PlanTech</title>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"author\" content=\"HighFive\" />\n\n  <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n  <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n  <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n  <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n  <!-- full screen -->\n  <style>\n    #exampleImage {\n      cursor: zoom-in;\n    }\n    \n    #exampleImage:-webkit-full-screen {\n      cursor: zoom-out;\n    }\n    \n    #exampleImage:-moz-full-screen {\n      cursor: zoom-out;\n    }\n    \n    #exampleImage:-ms-fullscreen {\n      cursor: zoom-out;\n    }\n    \n    #exampleImage:fullscreen {\n      cursor: zoom-out;\n    }\n  </style>\n</head>\n\n<body>\n  <div id=\"wrapper\">\n\n\n    <app-meni></app-meni>\n    <!-- glavni deo -->\n    <div id=\"page-wrapper\">\n \n  <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n    <button class=\"btn btn-primary\" type=\"submit\" (click)=\"prikaziSve()\">Lista korisnika</button>\n     <button class=\"btn btn-primary\" type=\"submit\" (click)=\"prikaziZahteve()\"> Lista zahteva</button>\n     <br><br>\n  </div>\n   \n \n\n\n <div *ngIf=\"prikaziUsere\" class=\"col-md-12 row\" style=\"text-align:center\" >\n                    <div class=\"panel panel-primary\">\n                        <div class=\"panel-heading\" style=\"background-color:  #8f2846\">Lista svih korisnika servisa</div>\n                             <div class=\"panel-body \">  \n                                 <div class=\"table-responsive\">          \n                                        <table class=\"table table-bordered\">\n                                            <thead >\n                                            <tr >\n                                          <!--    <th>#</th>-->\n                                              <th style=\"text-align: center\">Name</th>\n                                              <th style=\"text-align: center\">Surname</th>\n                                              <th style=\"text-align: center\">E-mail</th>\n                                              <th style=\"text-align: center\">Date of birth</th>\n                                               <th style=\"text-align: center\">Country</th>\n                                           \n                                            </tr>\n                                          </thead>\n                                          <tbody id=\"idTabele\">\n                                            <tr *ngFor=\"let korisnik of sviKorisnici\">\n                                              <td>{{korisnik.name}}</td>\n                                              <td>{{korisnik.surname}}</td>  \n                                              <td>{{korisnik.email}}</td> \n                                              <td>{{korisnik.birth}}</td>  \n                                              <td>{{korisnik.country}}</td>                               \n                                          </tr>\n                                            \n                                          </tbody>\n                                        </table>\n                                    </div>\n                                </div>\n                            </div>        \n                        </div>\n\n\n <div *ngIf=\"prikaziZahtev\" class=\"col-md-12 row\" style=\"text-align:center\" >\n                    <div class=\"panel panel-primary\">\n                        <div class=\"panel-heading\" style=\"background-color:  #8f2846\">Lista svih zahteva za koriscenje servisa</div>\n                             <div class=\"panel-body \">  \n                                 <div class=\"table-responsive\">          \n                                        <table class=\"table table-bordered\">\n                                            <thead >\n                                            <tr >\n                                          <!--    <th>#</th>-->\n                                              <th style=\"text-align: center\">Ime</th>\n                                              <th style=\"text-align: center\">Prezime</th>\n                                              <th style=\"text-align: center\">E-mail</th>\n                                              <th style=\"text-align: center\">Datum rodjenja</th>\n                                             <th style=\"text-align: center\">Drzava</th>\n                                              <th style=\"text-align: center\">Dozvoli</th>\n                                                <th style=\"text-align: center\">Ignorisi</th>\n                                            </tr>\n                                          </thead>\n                                          <tbody id=\"idTabele\">\n                                            <tr *ngFor=\"let zahtev of sviZahtevi\">\n                                              <td>{{zahtev.name}}</td>\n                                              <td>{{zahtev.surname}}</td>  \n                                              <td>{{zahtev.email}}</td> \n                                              <td>{{zahtev.birth}}</td>  \n                                              <td>{{zahtev.country}}</td>   \n                                              <td><button id=\"btn-login\" (click)=\"Dozvoli(pom.value)\" #pom class=\"btn btn logButton\"value=\"{{zahtev.id}}\" value=\"\" style=\"background-color: #31b0d5; color:white\" type=\"submit\">Dozvoli</button></td>                            \n                                              <td><button id=\"btn-login\" (click)=\"Ignorisi(pom1.value)\"  class=\"btn btn logButton\" #pom1 value=\"{{zahtev.id}}\" style=\"background-color:#337ab7; color:white\" type=\"submit\">Ignorisi</button></td>\n                                          </tr>                                           \n                                          </tbody>\n                                        </table>\n                                    </div>\n                                </div>\n                            </div>        \n                        </div>\n\n\n    </div>\n  </div>\n</body>\n</html>"

/***/ }),

/***/ 734:
/***/ (function(module, exports) {

module.exports = "<div class=\"row\" *ngIf=\"lineChartData!=undefined&&lineChartLabels!=undefined\">\n  <div class=\"col-md-6\">\n    <div style=\"display: block;\">\n    <canvas baseChart width=\"400\" height=\"400\"\n                [datasets]=\"lineChartData\"\n                [labels]=\"lineChartLabels\"\n                [options]=\"lineChartOptions\"\n                [colors]=\"lineChartColors\"\n                [legend]=\"lineChartLegend\"\n                [chartType]=\"lineChartType\"\n                (chartHover)=\"chartHovered($event)\"\n                (chartClick)=\"chartClicked($event)\"></canvas>\n    </div>\n  </div>\n \n</div>"

/***/ }),

/***/ 735:
/***/ (function(module, exports) {

module.exports = "<image-upload\n  [max] ='200'\n  [url]=\"'uploads/upload'\"\n  [headers]=\"[\n    {name: 'image'}\n  ]\"\n  [preview]=\"false\"\n  [buttonCaption]=\"'Izbaerite sliku!'\"\n  [dropBoxMessage]=\"'Prevucite slike ovde!'\"\n \n></image-upload>"

/***/ }),

/***/ 736:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" >\n\n            <app-widgets></app-widgets>\n\n            \n            <div class=\"container-fluid\">\n                 <div class=\"col-md-12 no-left-padding\">                                    \n                    <!-- Naslov -->\n                    <div class=\"col-md-12\">                        \n                        <div class=\"page-title\">                    \n                            <h2><span class=\"fa fa-inbox\"></span> Inbox <small>({{brojPoruka}})</small></h2>\n                        </div>                                                                                \n                                   \n                    </div>\n                    <!-- END  Naslov -->\n                   <div class=\"col-md-12 no-left-padding\">  \n                    <!-- Meni za poruke -->\n                    <div class=\"col-md-2 no-left-padding\" >\n                      \n                            <a  routerLink=\"/newmsg\" class=\"btn btn-highFive btn-block btn-lg\" ><span class=\"fa fa-edit\"></span> Nova poruka</a>\n                       \n                            <div class=\"block\" style=\"margin-top: 5px\">\n                            <div class=\"list-group border-bottom\">\n                                <a routerLink=\"/inbox\" class=\"list-group-item active\"><span class=\"fa fa-inbox\"></span> Inbox <span class=\"badge badge-primary notification\">{{brojPoruka}}</span></a>\n                                <a routerLink=\"/sent\" class=\"list-group-item\"><span class=\"fa fa-rocket\"></span>  Poslate</a>\n                            </div>                        \n                        </div>\n                              <div class=\"block\">\n                            <h4>Oznake</h4>\n                            <div class=\"list-group list-group-simple\">                                \n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-success\"></span> Radnik</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-warning\"></span> Expert</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-danger\"></span> Sef</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-info\"></span> Gazda</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-primary\"></span> Sin</a>\n                            </div>\n                        </div>\n                        \n                    </div>\n                    <!-- END Meni za poruke -->\n                    \n                    <!-- INBoX -->\n                    <div class=\"col-md-10\">\n                            <div class=\"mail\">\n                                <div *ngIf=\"primljenePoruke.length>0\">\n                                    <div *ngFor=\"let poruka of primljenePoruke\" [ngClass]=\"{'mail-item':true, 'mail-unread':poruka.read,'mail-info':true}\">\n                                        <div class=\"mail-user\">{{poruka.username}}</div>\n                                        <a (click)=\"goToMessage(poruka)\" class=\"mail-text\">{{poruka.text}}</a>\n                                        <div class=\"mail-date\">{{ poruka.time | date:'medium' }}</div>\n                                    </div>\n                                </div>\n                                <div *ngIf=\"primljenePoruke.length==0\">\n                                    <h2>Nemate primljenih poruka</h2>\n                                </div>\n                                <!-- \n                                <div class=\"mail-item mail-unread mail-info\"  >\n                                    <div class=\"mail-user\">Djole Junior</div>                                    \n                                    <a routerLink=\"/msg\" class=\"mail-text\">Task 1</a>                                    \n                                    <div class=\"mail-date\">Danas, 10:36</div>\n                                </div>\n                                <div class=\"mail-item mail-unread mail-danger\" > \n                                    <div class=\"mail-user\">Djole Senior</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 2</a>                                    \n                                    <div class=\"mail-date\">Danas, 10:36</div>\n                                </div>\n                                \n                                <div class=\"mail-item mail-success\">\n                                    <div class=\"mail-user\">Jovan</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 3</a>                                    \n                                    <div class=\"mail-date\">Danas, 20:19</div>\n                                </div>\n                                \n                                <div class=\"mail-item mail-warning\">\n                                    <div class=\"mail-user\">Jovana</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 4</a>                                    \n                                    <div class=\"mail-date\">Danas, 21:19</div>\n                                </div>\n                                \n                                <div class=\"mail-item mail-info\">\n                                    <div class=\"mail-user\">Bojan</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 5</a>                                    \n                                    <div class=\"mail-date\">Juce 20:22</div>\n                                   \n                                </div>\n                                \n                            \n                                \n                                <div class=\"mail-item mail-primary\">\n                                    <div class=\"mail-user\">Darth Vader</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Where are the drawings of the new spaceship?</a>\n                                    <div class=\"mail-date\">Juce 10:36</div>\n                                </div>                                \n                                -->\n                            </div>\n                        \n                            <div class=\"panel-footer\" style=\"height: 100%\">  \n                                <ul class=\"pagination pagination-sm pull-right\">\n                                    <li class=\"disabled\"><a href=\"#\">«</a></li>\n                                    <li class=\"active\"><a href=\"#\">1</a></li>\n                                    <li><a href=\"#\">2</a></li>\n                                    <li><a href=\"#\">3</a></li>\n                                    <li><a href=\"#\">4</a></li>                                    \n                                    <li><a href=\"#\">»</a></li>\n                                </ul>\n                            </div>                 \n                        \n                        \n                    </div>\n                    </div>\n                    <!-- ENDINBoX  -->\n                </div>\n             \n            </div>\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\"\n                                        id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n        </div>\n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 737:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n<!--\nTo change this license header, choose License Headers in Project Properties.\nTo change this template file, choose Tools | Templates\nand open the template in the editor.\n-->\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n    <link rel=\"stylesheet\" href=\"css/bootstrap.min.css\">\n    <link rel=\"stylesheet\" href=\"css/style.css\">\n\n\n</head>\n\n<body>\n<div>{{datum}}</div>\n    <div class=\"container-fluid\" style=\"padding: 0 0 0 0\">\n        <div class=\"col-md-12\" style=\"padding: 0 0 0 0\">\n            <!-- Levi deo ekrana, klasa hiden sakriva za mobilne uredjaje  -->\n            <div class=\"col-md-9 hidden-sm hidden-xs\" style=\"margin-top: 5px;height:  100vh;padding: 0 0 0 0; \">\n                <!-- MAPA  -->\n                <weather-map id=\"world-map\" style=\"width: 100%; height:  100vh\"></weather-map>\n            </div>\n            <!-- Levi deo ekrana -->\n\n            <!-- desni deo za login i registraiju -->\n            <div class=\"col-md-3 pull-left-sm pull-left-md\" style=\"padding: 0 0 0 0\">\n                <div class=\"panel panel logPanel\" style=\"min-height: 100vh;max-height:100%\">\n                    <div role=\"tabpanel\">\n                        <!-- MENI  -->\n                        <ul class=\"nav nav-tabs nav-justified\" role=\"tablist\" style=\"margin-top: 0px\">\n                            <li role=\"presentation\" class=\"active\"><a href=\"#tab1\" (click)=\"resetuj()\" role=\"tab\" data-toggle=\"tab\" aria-expanded=\"false\">Login</a></li>\n                            <li role=\"presentation\" class=\"\"><a href=\"#tab2\" (click)=\"resetuj()\" role=\"tab\" data-toggle=\"tab\" aria-expanded=\"true\">Registracija</a></li>\n                        </ul>\n                        <div class=\"tab-content\" style=\"  padding-left: 10px;padding-right: 10px\">\n                            <!-- LOGIN  -->\n                            <div role=\"tabpanel\" class=\"tab-pane active\" id=\"tab1\">\n                                <div class=\"login-box animated fadeInDown\">\n                                    <h1 style=\"text-align: center;\">PlanTech</h1>\n\n                                    <div class=\"panel-heading logHeading\" style=\" \">\n                                        <div class=\"panel-title\" style=\"color:white\">Ulogujte se\n                                        </div>\n                                        <div class=\"forgotenPass\"> <a href=\"#tab3\" role=\"tab\" data-toggle=\"tab\" style=\"color:white; \">Zaboravili ste šifru? </a></div>\n                                    </div>\n                                    <!-- ALERT WRONG LOGIN  -->\n                                    <div *ngIf=\"pogresniPodaci\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" timeout:3200>\n                                        <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" type=\"button\"><span aria-hidden=\"true\">×</span>\n                                    </button> Pogrešan username ili šifra\n                                    </div>\n                            \n\n                                    <!-- END ALERT WRONG LOGIN  -->\n\n                                    <div style=\"padding-bottom:30px; \" class=\"panel-body\">\n\n                                        <div style=\"display:none\" id=\"login-alert\" class=\"alert alert-danger col-sm-12\"></div>\n\n                                        <form id=\"loginform\" class=\"form-horizontal\" role=\"form\"  method=\"post\">\n\n                                            <div style=\"margin-bottom: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span>\n                                                <input [(ngModel)]=\"username\" id=\"login-username\" type=\"text\" class=\"form-control\" name=\"user\" value=\"\" placeholder=\"username\"\n                                                    style=\"\">\n                                            </div>\n\n                                            <div style=\"margin-bottom: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-lock\"></i></span>\n                                                <input [(ngModel)]=\"password\" id=\"login-password\" type=\"password\" class=\"form-control\" name=\"pass\" placeholder=\"šifra\">\n                                            </div>\n\n                                            <div style=\"margin-top:10px\" class=\"form-group\">\n                                                <!-- Button -->\n\n                                                <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n                                                    <button (click)=\"Login()\" id=\"btn-login\" class=\"btn btn logButton\" style=\"\" type=\"submit\">Loguj se  </button>\n\n\n                                                </div>\n                                            </div>\n\n\n                                            <div class=\"form-group\">\n                                                <div class=\"col-md-12 control\">\n                                                    <div class=\"logNewReg\" style=\" \">\n                                                        Nemate nalog!\n\n                                                        <a href=\"#tab2\" role=\"tab\" data-toggle=\"tab\" (click)=\"resetuj()\"> Registrujte se ovde</a>\n                                                    </div>\n                                                </div>\n                                            </div>\n                                        </form>\n\n\n                                        <div class=\"login-footer\" style=\"margin-top: 15px\">\n                                            <div class=\"pull-left\">\n                                                &copy; 2017 HighFive\n                                            </div>\n                                            <div class=\"pull-right\">\n                                                <a href=\"#\">O nama</a> |\n\n                                                <a href=\"#\">Kontakt</a>\n                                            </div>\n                                        </div>\n                                    </div>\n\n                                </div>\n\n                            </div>\n                            <!-- LOGIN END -->\n                            <!-- REGISDTRACIJA-->\n                            <div role=\"tabpanel\" class=\"tab-pane \" id=\"tab2\">\n                                <div class=\"login-box animated fadeInDown\">\n                                    <h1 style=\"text-align: center;\">PlanTech</h1>\n\n                                    <div class=\"panel-heading logHeading\" style=\" \">\n                                        <div class=\"panel-title\" style=\"color:white\">Registracija\n                                        </div>\n                                       \n                                    </div>\n                                      <div *ngIf=\"pogresniPodaciReg\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                                           <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                         Korisnik sa takvim podacima vec postoji.\n                                    </div>\n                                     <div *ngIf=\"praznaPolja\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                                           <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                         Sva polja moraju biti popunjena.\n                                    </div>\n\n                                         <div *ngIf=\"uspesnaRegistracija\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                           <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                          Uspesno ste se registrovali.\n                                          Sada mozete da se prijavite <a  role=\"tab\" onclick=\"window.location.reload();\">ovde</a>.\n                                    </div>\n\n\n                                    <div style=\"padding-bottom:30px; \" class=\"panel-body\">\n\n                                        <div style=\"display:none\" id=\"login-alert\" class=\"alert alert-danger col-sm-12\"></div>\n\n                                        <form id=\"loginform\" #userForm=\"ngForm\" class=\"form-horizontal\" role=\"form\" novalidate method=\"post\">\n\n                                            <div  class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span>\n                                                <input [(ngModel)]=\"imeReg\"  id=\"reg-ime\" type=\"text\" #imeRegg=\"ngModel\" required pattern=\"[A-Z]{1}[a-z]{1,8}\" class=\"form-control\" name=\"user\"\n                                                    value=\"\" placeholder=\"Ime\" ngModel>\n                                            </div>\n                                            <div *ngIf=\"imeRegg.errors && (imeRegg.dirty || imeRegg.touched)\" class=\"alert alert-danger\">\n                                                <div [hidden]=\"!imeRegg.errors.required\">\n                                                    Unesite ime.\n                                                </div>\n                                                <div [hidden]=\"!imeRegg.errors.pattern\" >\n                                                    Ime mora da počne velikim slovom.\n                                                </div>\n                                            </div>\n\n                                            <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span>\n                                                <input [(ngModel)]=\"prezimeReg\" id=\"reg-prezime\" #prezimeRegg=\"ngModel\" required pattern=\"[A-Z]{1}[a-z]{1,10}\" type=\"text\" class=\"form-control\" name=\"prezime\"\n                                                    value=\"\" placeholder=\"Prezime\" ngModel>\n\n                                            </div>\n                                            <div *ngIf=\"prezimeRegg.errors && (prezimeRegg.dirty || prezimeRegg.touched)\" class=\"alert alert-danger\">\n                                                <div [hidden]=\"!prezimeRegg.errors.required\">\n                                                    Unesite prezime.\n                                                </div>\n                                                <div [hidden]=\"!prezimeRegg.errors.pattern\">\n                                                    Prezime mora da počne velikim slovom.\n                                                </div>\n                                            </div>\n                                            <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-envelope\"></i></span>\n                                                <input [(ngModel)]=\"emailReg\" id=\"reg-email\" type=\"email\" #email=\"ngModel\" required pattern=\"[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,3}$\" class=\"form-control\"\n                                                    name=\"email\" value=\"\" placeholder=\"email\" ngModel>\n                                            </div>\n                                            <div *ngIf=\"email.errors && (email.dirty || email.touched)\" class=\"alert alert-danger\">\n                                                <div [hidden]=\"!email.errors.required\">\n                                                    Unesite e-mail.\n                                                </div>\n                                                <div [hidden]=\"!email.errors.pattern\">\n                                                    E-mail nije validan.\n                                                </div>\n                                            </div>\n                                            <div class=\"form-group\" style=\"margin-top: 25px\">\n                                             <label class=\"col-md-3 control-label\">Datum rodjenja</label>\n                                                <div class=\"col-md-9\">\n\t\t\t\t\t\t\t\t\t\t\t\t\n\t\t\t\t\t\t\t\t\t\t\t\t\t<ng2-datepicker   [options]=\"calendarOptions\" [(ngModel)]=\"date\" name=\"date\"></ng2-datepicker>\n\t\t\t\t\t\t\t\t\t\t\t\t</div>\n                                            </div>\n\n                                            <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span>\n                                                <input [(ngModel)]=\"usernameReg\" #user=\"ngModel\" required minlength=\"4\" id=\"reg-username\" type=\"text\" class=\"form-control\" name=\"reg-username\" value=\"\" placeholder=\"username\" ngModel>                                                    \n                                            </div>\n                                            <div *ngIf=\"user.errors && (user.dirty || user.touched)\" class=\"alert alert-danger\">\n                                                <div [hidden]=\"!user.errors.required\">\n                                                    Unesite username.\n                                                </div>\n                                                <div [hidden]=\"!user.errors.minlength\">\n                                                    Username mora imati minimum 5 karaktera.\n                                                </div>\n                                            </div>\n\n                                            <div style=\"margin-top: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-lock\"></i></span>\n                                                <input [(ngModel)]=\"passwordReg\" #pass=\"ngModel\" required pattern=\"(?=.*\\d)(?=.*[a-z])(?=.*[A-Z]).{8,}\" id=\"reg-password\" type=\"password\" class=\"form-control\" name=\"reg-pass\" placeholder=\"šifra\" ngModel>\n                                            </div>\n                                             <div *ngIf=\"pass.errors && (pass.dirty || pass.touched)\" class=\"alert alert-danger\">\n                                                <div [hidden]=\"!pass.errors.required\">\n                                                    Unesite šifru.\n                                                </div>\n                                                <div [hidden]=\"!pass.errors.pattern\">\n                                                    Šifra mora da sadrži 8 ili vise karaktera od kojih je bar jedan broj i veliko i malo slovo.\n                                                </div>\n                                            </div>\n                                            <div class=\"form-group\" style=\"margin-top: 25px\">\n                                                <label class=\"col-md-3 control-label\">Drzava</label>\n                                                <div class=\"col-md-9\">\n                                                    <select class=\"form-control\" #t (change)=\"callType(t.value)\" data-style=\"btn-success\">\n                                                     \n                                                     <option *ngFor = \"let country of country_array\" [ngValue]='country'> {{country}} </option>\n                                                    \n                                        \n                                                    </select>\n                                    \n                                    \n                                    \n                                     </div>\n                                            </div>\n\n\n\n\n\n                                            <div style=\"margin-top:10px\" class=\"form-group\">\n                                                <!-- Button -->\n                                                <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n                                                    <button id=\"btn-registracija \" (click)=\"RegistrujSe()\"  class=\"btn btn logButton\" type=\"submit\">Registruj me  </button>\n                                                </div>\n                                            </div>\n\n                                            <div class=\"form-group\">\n                                                <div class=\"col-md-12 control\">\n                                                    <div class=\"logNewReg\">\n                                                        Imate nalog!\n\n                                                        <a href=\"#tab1\" role=\"tab\" data-toggle=\"tab\" (click)=\"resetuj()\"> Logujte se ovde</a>\n                                                    </div>\n                                                </div>\n                                            </div>\n                                        </form>\n\n\n                                        <div class=\"login-footer\" style=\"margin-top: 15px\">\n                                            <div class=\"pull-left\">\n                                                &copy; 2017 HighFive\n                                            </div>\n                                            <div class=\"pull-right\">\n                                                <a href=\"#\">O nama</a> |\n\n                                                <a href=\"#\">Kontakt</a>\n                                            </div>\n                                        </div>\n                                    </div>\n\n                                </div>\n                            </div>\n                            <!-- REGISDTRACIJA END-->\n\n\n                            <!--LOST PASS-->\n                            <div role=\"tabpanel\" class=\"tab-pane \" id=\"tab3\">\n                                <div class=\"login-box animated fadeInDown\">\n                                    <h1 style=\"text-align: center;\">PlanTech</h1>\n\n                                    <div class=\"panel-heading logHeading\" style=\"\">\n                                        <div class=\"panel-title\" style=\"color:white\">Povrati sifru\n                                        </div>\n                                    </div>\n\n\n\n                                    <div style=\"padding-top:30px; \" class=\"panel-body\">\n\n                                        <div style=\"display:none\" id=\"login-alert\" class=\"alert alert-danger col-sm-12\"></div>\n\n                                        <form id=\"loginform\" class=\"form-horizontal\" role=\"form\"  method=\"post\">\n                                                 <div *ngIf=\"nePostoji\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\">\n                                           <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                         Pogresan username.\n                                    </div> \n                                      <div *ngIf=\"poslato\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\" timeout:3000;>\n                                           <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                          Sifra vam je poslata na mail.\n                                    </div>\n                                            <div style=\"margin-bottom: 25px\" class=\"input-group\">\n                                                <span class=\"input-group-addon\"><i class=\"glyphicon glyphicon-user\"></i></span>\n                                                <input id=\"lost-email\" type=\"text\" class=\"form-control\" [(ngModel)]=\"user1\" name=\"emailForgoten\" value=\"\" placeholder=\"username\" style=\"\" ngModel>\n                                            </div>\n\n\n                                            <div style=\"margin-top:10px\" class=\"form-group\">\n                                                <!-- Button -->\n\n                                                <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n                                                    <button id=\"btn-login\" (click)=\"povratiSifru()\" class=\"btn btn  logButton\" type=\"submit\">Povrati sifru </button>\n\n\n                                                </div>\n                                            </div>\n\n                                        </form>\n\n\n                                        <div class=\"login-footer\" style=\"margin-top: 15px\">\n                                            <div class=\"pull-left\">\n                                                &copy; 2017 HighFive\n                                            </div>\n                                            <div class=\"pull-right\">\n                                                <a href=\"#\">O nama</a> |\n\n                                                <a href=\"#\">Kontakt</a>\n                                            </div>\n                                        </div>\n                                    </div>\n\n                                </div>\n                            </div>\n                            <!--LOST PASS END-->\n                        </div>\n\n\n                    </div>\n\n\n                </div>\n            </div>\n            <!-- desni deo za login i registraiju -->\n        </div>\n    </div>\n    <!-- START PLUGINS -->\n    <script src=\"js/jquery-3.1.1.min.js\"></script>\n    <script src=\"js/bootstrap.min.js\"></script>\n    <script type=\"text/javascript\" src=\"js/plugins/bootstrap/bootstrap-datepicker.js\"></script>\n<script src=\"http://cdn.leafletjs.com/leaflet/v0.7.7/leaflet.js\"></script>\n\n    <!-- END PLUGINS -->\n\n    <!-- vector map -->\n\n    <!-- end vector map -->\n\n</body>\n\n</html>"

/***/ }),

/***/ 738:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n<html>\n<head>\n<script type=\"text/javascript\" src=\"https://maps.googleapis.com/maps/api/js?key=AIzaSyCqbPWLQuyiljUeKZ4f8KTsAHmCFnSAMJs&libraries=drawing\"\n         defer>\n        </script>\n<script>\nfunction initMap() {\n  var mapProp = {\n    center:new google.maps.LatLng(51.508742,-0.120850),\n    zoom:5,\n    mapTypeId:google.maps.MapTypeId.ROADMAP\n  };\n  var map=new google.maps.Map(document.getElementById(\"googleMap\"),mapProp);\n}\ngoogle.maps.event.addDomListener(window, 'load', initialize);\n</script>\n</head>\n\n<body>\n<div id=\"googleMap\" style=\"width:100%;height:100%;\"></div>\n</body>\n\n</html> "

/***/ }),

/***/ 739:
/***/ (function(module, exports) {

module.exports = "     \n        <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n        <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n\t\t <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n          <link rel=\"stylesheet\" href=\"css/w3.css\">\n        <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n          <div id=\"wrapper\">\n     <!-- Meni -->\n        <nav class=\"navbar navbar-inverse navbar-fixed-top\" role=\"navigation\">\n        \n            <!-- Header colapse -->\n            <div class=\"navbar-header\">\n                <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".navbar-ex1-collapse\">\n                    <span class=\"sr-only\">Toggle navigation</span>\n                    <span class=\"icon-bar\"></span>\n                    <span class=\"icon-bar\"></span>\n                    <span class=\"icon-bar\"></span>\n                </button>\n                <a class=\"navbar-brand\"  routerLink=\"/user\" style=\"padding: 0 5px 0 20%;\">   <img class=\"img-responsive\" src=\"logo.png\" style=\"height: 50px\" /></a>\n            </div>\n             <!--End Heder colapse -->\n             \n            <!-- Top Menu  -->\n            <ul class=\"nav navbar-right top-nav \">\n                <li class=\"hidden-sm hidden-xs\">\t\t\n                    <a (click)=\"toggleFullscreen()\"  ><i class=\"fa fa-expand\"></i></a>\n                </li>\n                 <!--poruke -->\n                <li [ngClass]=\"{'dropdown': true, 'open':showMess}\">\n                    <a (click)=\"porukeToggle()\"  style=\"cursor:pointer; cursor:hand\"><i class=\"fa fa-envelope\"></i> <b class=\"caret\"></b>\n                        <span *ngIf=\"primljenePoruke!==undefined&&brojPoruka>0\"  class=\"badge badge-success pull-right notification\" style=\"\">{{ brojPoruka }}</span>\n                    </a>\n                 \n                    <ul  class=\"dropdown-menu w3-animate-zoom\">\n                     <div *ngIf=\"primljenePoruke&&porukeVidljive&&brojPoruka>0\">\n                        <li *ngFor=\"let poruka of primljenePoruke\" class=\"message-preview \"  >\n                            <div  *ngIf=\"poruka.read==1\">\n                                    <a (click)=\"goToMessage(poruka)\"  class=\"msgHover\" >\n                                        <div class=\"media notificationMsg col-md-12  bottom-line \">\n                                            <div class=\" col-md-3 no-right-padding no-left-padding \" style=\"padding-top: 10%\">\n                                                <img class=\"img-responsive\" src=\"{{poruka.profilePic}}\"  alt=\"profile pic\">\n                                            </div>\n                                            <div class=\" col-md-9\">\n                                                <h5 class=\"media-heading\"><strong>{{poruka.username}}</strong>\n                                                </h5>\n                                                <p class=\"small text-muted\"><i class=\"fa fa-clock-o\"></i> {{ poruka.time | date:'medium' }}</p>\n                                                <p style=\"margin-bottom: 0px\">{{poruka.text}}</p>\n                                            </div>\n                                        </div>\n                                    </a>\n                              </div>\n                        </li>\n                     </div>\n                     \n                        <li  *ngIf=\"brojPoruka==0\" class=\"message-preview align-elements\">\n                            <div class=\"alert alert-danger\">Nemate novih poruka</div>\n                        </li>\n                        <li class=\"message-footer\">\n                            <a routerLink=\"/inbox\" class=\"btn btn-highFive\">Inbox</a>\n                        </li>\n                    </ul>\n                </li>\n                  <!--end poruke -->\n                  \n                  \n                  <!--alerts -->\n                <li class=\"dropdown open \">\n                    <a (click)=\"obavestenjaToggle()\"><i class=\"fa fa-bell\" style=\" cursor: pointer; cursor: hand;\"></i> <b class=\"caret\"></b>\n                      <span *ngIf=\"obavestenja!==undefined&&obavestenja.length>0\" class=\"badge badge-success pull-right notification\" style=\"\">{{obavestenja.length}}</span>\n                    </a>\n                    <ul  *ngIf=\"obavestenjaVidljiva&&obavestenjaStigla\" class=\"dropdown-menu w3-animate-zoom\">\n                       <li *ngFor=\"let obavestenje of prvihPet\" class=\"message-preview\">\n                         \n                                    <div class=\"media notificationMsg col-md-12  bottom-line \">\n                                            <div class=\" col-md-3 no-right-padding no-left-padding \" style=\"padding-top: 10%\">\n                                                <img class=\"img-responsive\" src=\"{{obavestenje.profilePic}}\"  alt=\"profile pic\">\n                                            </div>\n                                            <div class=\" col-md-9\">\n                                                <h5 class=\"media-heading\"><strong>Ponuda za posao <p class=\"small text-muted\"><i class=\"fa fa-clock-o\"></i> {{obavestenje.date}}</p></strong>\n                                                </h5>\n                                              \n                                                <p style=\"margin-bottom: 0px\">{{\"Vlasnik \"+obavestenje.ownername+\" \"+obavestenje.ownerlastname+\" zeli da Vam da ulogu: \"+obavestenje.role}}</p>\n                                            </div>\n                                             <div class=\" col-md-12 row align-elements\" style=\"margin-top: 5%\" >\n                                                  <div class=\" col-md-6\"  >\n                                                         <button (click)=\"odgovori(obavestenje.idowner,obavestenje.idworker,obavestenje.idrole,true)\" type=\"button\" class=\"btn btn-success btn-xs\"  style=\"width: 100%;border-radius: 0px;\">Prihvati</button>\n                                                    </div>\n                                                   <div class=\" col-md-6\" >\n                                                        <button (click)=\"odgovori(obavestenje.idowner,obavestenje.idworker,obavestenje.idrole,false)\" type=\"button\" class=\"btn btn-danger btn-xs\"  style=\"width: 100%;border-radius: 0px;\">Odbij</button>\n                                                   </div>\n                                             </div>\n                                        </div>\n\n                                   \n\n                                    \n\n                                  \n\n                           \n                            \n                        \n                            \n                         \n                       </li>\n                         <li class=\"message-footer\">\n                            <a routerLink=\"/notifications\" class=\"btn btn-highFive\" >Pogledaj sve</a>\n                        </li>\n                    </ul>\n                </li>\n                <!--end alerts -->\n                \n                <!--profil meni -->\n                <li class=\"dropdown open\">\n                    <a   (click)=\"meniToggle()\" style=\" cursor: pointer; cursor: hand;\"><i class=\"fa fa-user\"></i><span *ngIf=\"vidljivost\"> {{user.username}}</span> <b class=\"caret\"></b></a>\n                    <ul *ngIf=\"meniVidljiv\" class=\"dropdown-menu w3-animate-zoom\">\n                        <li>\n                            <a routerLink=\"/updateuser\"><i class=\"fa fa-fw fa-user\"></i> Profil</a>\n                        </li>\n                       \n                        <li>\n                            <a routerLink=\"/page-not-found\"><i class=\"fa fa-fw fa-gear\"></i> Podešavanja</a>\n                        </li>\n                        <li class=\"divider\"></li>\n                        <li>\n                            <a (click)=\"logout()\"><i class=\"fa fa-fw fa-power-off\"></i> Izloguj se</a>\n                        </li>\n                    </ul>\n                </li>\n                <!--end profil meni -->\n            </ul>\n            <!--End Top Menu  -->\n            \n             <!-- desni meni  -->\n               \n            <!-- end desni meni  -->\n        </nav>\n        <!-- end Meni -->\n<div class=\"collapse navbar-collapse navbar-ex1-collapse\">\n                <ul class=\"nav navbar-nav side-nav\">\n                      <!-- PROFILE -->\n                      <li class=\"xn-profile\" style=\"width: 100%\">\n                        <div class=\"profile\">\n                            \n                            <div class=\"profile-image\"  >\n                                <img *ngIf=\"user!==undefined\" src=\"{{user.profilePic}}\" class=\"img-responsive w3-circle\" alt=\"John Doe\">\n                            </div>\n                            <div class=\"profile-data\">\n                                <div class=\"profile-data-name\"> <span *ngIf=\"vidljivost\">{{user.username}}</span></div>\n                                <div class=\"profile-data-title\"><span *ngIf=\"vidljivost\">{{user.country}}</span></div>\n                            </div>\n                           \n                        </div>                                                                        \n                    </li>\n                       <!-- END PROFILE -->\n                    <li *ngIf=\"(dozvoleMeni!==undefined&&dozvoleMeni.guest==false)||localStorageService.get('guest')==false\" class=\"{{router.url=='/user'? 'active': ''}}\">\n                        <a routerLink=\"/user\"><i class=\"fa fa-fw  fa-map-marker\"></i> Moje plantaze</a>\n                    </li>\n                    <li *ngIf=\"(dozvoleMeni!==undefined&&dozvoleMeni.guest==false)||localStorageService.get('guest')==false\" class=\"{{router.url=='/addplantation'? 'active': ''}}\">\n                        <a routerLink=\"/addplantation\"><i class=\"fa fa-fw fa-plus\"></i>Dodaj plantazu</a>\n                    </li>\n                   \n                    <li *ngIf=\"(dozvoleMeni!==undefined&&dozvoleMeni.guest==false)||localStorageService.get('guest')==false\"  class=\"{{router.url=='/addworker'? 'active': ''}}\">\n                        <a routerLink=\"/addworker\"><i class=\"fa fa-fw fa-users\"></i> Moji ljudi</a>\n                    </li>\n                    <li *ngIf=\"(dozvoleMeni!==undefined&&dozvoleMeni.guest==false)||localStorageService.get('guest')==false\"  class=\"{{router.url=='/statistics'? 'active': ''}}\">\n                        <a routerLink=\"/statistics\"><i class=\"fa fa-fw fa-users\"></i> Statistika</a>\n                    </li>\n                    <li *ngIf=\"(dozvoleMeni!==undefined&&dozvoleMeni.guest==false)||localStorageService.get('guest')==false\"  class=\"{{router.url=='/addtypes'? 'active': ''}}\">\n                        <a routerLink=\"/addtypes\"><i class=\"fa fa-fw fa-users\"></i> Dodaj tip</a>\n                    </li>\n\t\t\t\t\t <li *ngIf=\"(dozvoleMeni!==undefined&&dozvoleMeni.guest==true)\"  class=\"{{router.url=='/reqownership'? 'active': ''}}\">\n                        <a routerLink=\"/reqownership\"><i class=\"fa fa-fw fa-users\"></i> Trazi vlasnistvo</a>\n                    </li>\n                    \n                    <li class=\"hidden-lg hidden-md\">\n                         <div class=\"col-md-12\" style=\"padding: 0 0 0 0\">\n                        <div class=\"col-md-6\" style=\"padding: 0 0 0 0\">\n                              <a  href=\"#AboutModal\" class=\"btn btn-info\" data-toggle=\"modal\" style=\"width: 100%;border-radius: 0px;\">O nama</a>\n                        </div>     \n                        <div class=\"col-md-6\" style=\"padding: 0 0 0 0\">\n                               <a  href=\"#ContactModal\" class=\"btn btn-primary\" data-toggle=\"modal\" style=\"width: 100%;border-radius: 0px;\">Kontakt</a>\n                          \n                        </div>\n                        </div>\n                    </li>\n                    <li class=\"hidden-sm hidden-xs\" style=\"position:fixed; bottom: 0; height:60px; width: 225px;float: left\">\n                   \n                         <div class=\" col-md-12\" style=\"padding: 0 0 0 0;color: white;text-align: center\">\n                               &copy; 2017 HighFive\n                         </div>\n                                         \n                        <div class=\"col-md-12\" style=\"padding: 0 0 0 0\">\n                        <div class=\"col-md-6\" style=\"padding: 0 0 0 0\">\n                              <a  href=\"#AboutModal\" class=\"btn about-btn \" data-toggle=\"modal\" style=\"width: 100%;border-radius: 0px;\">O nama</a>\n                          \n                        </div>     \n                        <div class=\"col-md-6\" style=\"padding: 0 0 0 0\">\n                              <a  href=\"#ContactModal\" class=\"btn contact-btn\" data-toggle=\"modal\" style=\"width: 100%;border-radius: 0px;\">Kontakt</a>\n                        </div>\n                            \n                        </div>\n                       \n                       \n                </li> \n                    \n                </ul>\n              \n               \n            </div>\n  <div id=\"ContactModal\"  class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\" style=\"background-color: white;\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input name=\"ime\" class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\" [(ngModel)]=\"ime\"></div>\n                                <div class=\"form-group\"><label>Naslov</label><input name=\"naslov\" class=\"form-control required\" placeholder=\"Naslov poruke\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\" [(ngModel)]=\"naslov\"></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input name=\"email\" class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\" [(ngModel)]=\"email\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea name=\"poruka\"class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\" [(ngModel)]=\"poruka\"></textarea></div>\n\n                                <div class=\"form-group\"><button (click)=\"posalji()\" type=\"submit\" class=\"btn btn-send pull-right\">Posalji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\" id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                         <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                    </div>\n                </div>\n\n\n <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n</div>\n\n           \n"

/***/ }),

/***/ 740:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n      <link rel=\"stylesheet\" href=\"css/w3.css\">\n  \n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" >\n\n            <div class=\"container-fluid\">\n                <div class=\"col-md-12 \" style=\"text-align:center;margin-top: 10px\">\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-success widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-globe\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.plantaze}}</div>\n                                <div class=\"widget-title\">registrovanih plantaza</div>\n                            </div>\n                        </div>\n\n                    </div>\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-primary widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-users\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.radnici}}</div>\n                                <div class=\"widget-title\">registrovana radnka</div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-info widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-book\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.eksperti}}</div>\n                                <div class=\"widget-title\">registrovanih experata</div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"col-md-3 \">\n                        <div class=\"widget widget-warning widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-warning\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.obavestenja}}</div>\n                                <div class=\"widget-title\">obavestenja</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"container-fluid\">\n                <div class=\"col-md-12 no-left-padding no-right-padding\" >                                    \n                    <!-- naslov -->\n                    <div class=\"col-md-12\">                        \n                       <div class=\"page-title col-md-4\">                    \n                            <h2><span class=\"fa fa-file-text\"></span> Poruka</h2>\n                        </div>                                                                                \n                        \n                                                                                                                   \n                                   \n                    </div>\n                    <!-- END naslov -->\n                    \n                   <div class=\"col-md-12 no-left-padding no-right-padding\"  >  \n                    <!-- Meni za poruke-->\n                    <div class=\"col-md-2 no-left-padding\" >\n                      \n                        <a  routerLink=\"/newmsg\" class=\"btn btn-highFive btn-block btn-lg\" ><span class=\"fa fa-edit\"></span> Nova poruka</a>\n                       \n                            <div class=\"block\" style=\"margin-top: 5px\">\n                            <div class=\"list-group border-bottom\">\n                                <a routerLink=\"/inbox\" class=\"list-group-item \"><span class=\"fa fa-inbox\"></span> Inbox <span class=\"badge badge-primary notification\"></span></a>\n                                <a routerLink=\"/sent\" class=\"list-group-item\"><span class=\"fa fa-rocket\"></span>  Poslate</a>\n                            </div>                        \n                        </div>\n                              <div class=\"block\">\n                            <h4>Oznake</h4>\n                            <div class=\"list-group list-group-simple\">                                \n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-success\"></span> Radnik</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-warning\"></span> Expert</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-danger\"></span> Sef</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-info\"></span> Gazda</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-primary\"></span> Sin</a>\n                            </div>\n                        </div>\n                        \n                    </div>\n                    <!-- ENDMeni za poruke -->\n                    \n                    <!-- msg -->\n                    <div class=\"col-md-10 no-right-padding\">\n                        \n                        <div *ngIf=\"selectedMessage.length>0\" class=\"compose form-horizontal\"  style=\"height: 100%\">\n                                \n                            <div *ngFor=\"let por of selectedMessage\" class=\"panel panel-info\" style=\"background-color: white\">\n                            <div class=\"panel-heading msgPanel-head\" >\n                            <div class=\"row\">\n                                   <!-- Za desktop -->\n                                 <div class=\" col-md-2 no-right-padding hidden-sm hidden-xs\" style=\"padding: 1%\">\n                                                <img class=\"msgPic\" src=\"{{por.profilePic}}\"  alt=\"profile pic\" />\n                                </div>\n                               <div class=\" col-md-2 no-right-padding hidden-md hidden-lg align-elements\" >\n                                                <img class=\"msgPic\" src=\"{{por.profilePic}}\"  alt=\"profile pic\" />\n                                </div>\n                                <div class=\"col-md-10 hidden-sm hidden-xs\" >\n                                  <div class=\"col-md-12 row\" >\n                                    <h2 class=\"panel-title \">{{por.name}} {{por.surname}} - {{por.username}} </h2>\n                                    \n                               \n                                   <!--end ze dekstop -->\n\n                                      <!--za mob -->\n                                 \n                               <div class=\"col-md-10 hidden-md hidden-lg align-elements\" >\n                                  \n                                    <h2 class=\"\">{{por.name}} {{por.surname}} - {{por.username}} </h2>\n                                    \n                                </div>\n                                 <!--enb za mob -->\n                             </div>\n                               \n                              <div class=\"col-md-12 row\" >\n                                 <!--za desktop -->\n                            <div class=\" hidden-sm hidden-xs\" style=\"min-height: 50px\">\n                                  \n                                     <small class=\" text-muted \"><span class=\"fa fa-clock-o\"></span>  {{por.time | date:'medium' }}</small>\n                                  \n                              <div class=\" pull-right\" >\n                                    <button class=\"btn btn-highFive\"><span class=\"fa fa-mail-reply\"></span></button>\n                                  \n                                    <button (click)=\"obrisiPoruku(por.id,por.idSender)\" class=\"btn btn-highFive\"><span class=\"fa fa-trash-o\"></span></button>    \n                                    <button class=\"btn btn-highFive\"><span class=\"fa fa-print\"></span> Print</button>\n                         \n                                </div>\n                            </div> \n                             </div> \n                            \n                            </div>\n                            </div>\n                                               <!--za mob -->\n                            <div class=\"row  hidden-md hidden-lg align-elements\" style=\"min-height: 50px\">\n                                  \n                                     <small class=\" text-muted \"><span class=\"fa fa-clock-o\"></span>  {{por.time | date:'medium' }}</small>\n                                  \n                             \n                            \n                             <div class=\" row    hidden-md hidden-lg align-elements\" >\n                                    <button class=\"btn btn-highFive\"><span class=\"fa fa-mail-reply\"></span></button>\n                                  \n                                    <button (click)=\"obrisiPoruku(por.id,por.idSender)\" class=\"btn btn-highFive\"><span class=\"fa fa-trash-o\"></span></button>    \n                                    <button class=\"btn btn-highFive\"><span class=\"fa fa-print\"></span> Print</button>\n                         \n                                </div>\n                            </div>\n                                   <!--enb za mob -->\n                        </div>\n                              <!--end ze dekstop -->\n\n                   \n                            <div class=\"panel-body\">\n                             \n                                {{por.text}}    \n                              \n                            </div>\n                            <div class=\"panel-footer\" style=\"height: 250px\">\n                                  <div  *ngIf=\"user!=por.idSender\">\n                                    <div  class=\"form-group \" style=\"padding: 10px\">\n                                        <label>Brz odgovor</label>\n                                        <textarea class=\"form-control\" rows=\"5\" id=\"comment\" [(ngModel)]=\"comm\"></textarea>    \n                                    </div>\n                                    <button (click)=\"brzOdgovor(por.username)\" class=\"btn btn-highFive pull-right\"><span class=\"fa fa-mail-reply\"></span> Posalji odgovor</button>\n                                  </div>\n                            </div>\n                        </div>\n             \n                        </div>\n                        \n                    </div>\n                  \n                    <!-- END msg -->\n                </div>               \n              \n\n                </div>\n             \n            </div>\n\n     \n        </div>\n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 741:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" >\n\n            <div class=\"container-fluid\">\n                <div class=\"col-md-12 \" style=\"text-align:center;margin-top: 10px\">\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-success widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-globe\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.plantaze}}</div>\n                                <div class=\"widget-title\">registrovanih plantaza</div>\n                            </div>\n                        </div>\n\n                    </div>\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-primary widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-users\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.radnici}}</div>\n                                <div class=\"widget-title\">registrovana radnka</div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-info widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-book\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.eksperti}}</div>\n                                <div class=\"widget-title\">registrovanih experata</div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"col-md-3 \">\n                        <div class=\"widget widget-warning widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-warning\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.obavestenja}}</div>\n                                <div class=\"widget-title\">obavestenja</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"container-fluid\">\n                    <div class=\"col-md-12 no-left-padding no-right-padding\">                                    \n                    <!-- naslov -->\n                    <div class=\"col-md-12\">                        \n                        <div class=\"page-title\">                    \n                            <h2><span class=\"fa fa-inbox\"></span> Posalji poruku</h2>\n                        </div>                                                                                \n                                   \n                    </div>\n                    <!-- END naslov -->\n                   <div class=\"col-md-12 no-left-padding no-right-padding\">  \n                    <!-- START  Meni za poruke -->\n                    <div class=\"col-md-2 no-left-padding\" >\n                      \n                          <a  routerLink=\"/newmsg\" class=\"btn btn-highFive btn-block btn-lg\" ><span class=\"fa fa-edit\"></span> Nova poruka</a>\n                       \n                            <div class=\"block\" style=\"margin-top: 5px\">\n                            <div class=\"list-group border-bottom\">\n                                <a routerLink=\"/inbox\" class=\"list-group-item\"><span class=\"fa fa-inbox\"></span> Inbox <span class=\"badge badge-primary notification\"></span></a>\n                                <a routerLink=\"/sent\" class=\"list-group-item\"><span class=\"fa fa-rocket\"></span>  Poslate</a>\n                            </div>                        \n                        </div>\n                              <div class=\"block\">\n                            <h4>Oznake</h4>\n                            <div class=\"list-group list-group-simple\">                                \n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-success\"></span> Radnik</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-warning\"></span> Expert</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-danger\"></span> Sef</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-info\"></span> Gazda</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-primary\"></span> Sin</a>\n                            </div>\n                        </div>\n                        \n                    </div>\n                    <!-- END  Meni za poruke -->\n                    \n                    <!-- Salnje -->\n                    <div class=\"col-md-10 no-right-padding\">\n                        \n                        <div class=\"compose form-horizontal\"  style=\"height: 100%\">\n                   <div class=\"compose-body\"  >\n                            <div class=\"form-group\">\n                                <div class=\"col-md-12 \">\n                                   \n                                    <div class=\"pull-right\">\n                                        <button (click)=\"sendMessage()\" class=\"btn btn-highFive\"><span class=\"fa fa-envelope\"></span> Posalji</button>\n                                    </div>                                    \n                                </div>\n                            </div>\n                                                \n                            <div class=\"form-group\">\n                                <label class=\"col-md-2 control-label\">Za:</label>\n                                <div class=\"col-md-10\">                                        \n                                    <input type=\"text\" class=\"form-control\" [(ngModel)]=\"username\" placeholder=\"uername\" />                                 \n                                </div>\n                              \n                            </div>\n                         \n                            \n                         \n                         <div class=\"form-group\">\n                            <label class=\"col-md-2 control-label\">Poruka:</label>\n                            <div class=\"col-md-10\">                                        \n                                   <textarea class=\"form-control\" rows=\"5\" [(ngModel)]=\"poruka\" id=\"comment\"></textarea>                            \n                                </div> \n                           \n                          </div>\n                            <div class=\"form-group\">\n                                <div class=\"col-md-12\">\n                                  \n                                    <div class=\"pull-right\">\n                                        <button (click)=\"sendMessage()\" class=\"btn btn-highFive\"><span class=\"fa fa-envelope\"></span>  Posalji</button>\n                                    </div>                                    \n                                </div>\n                            </div>\n                            </div>   \n                        </div>\n                        \n                    </div>\n                   \n                    <!-- END slanje -->\n                </div>        \n              \n\n                </div>\n             \n            </div>\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\"\n                                        id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n        </div>\n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 742:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n \n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" >\n\n       \n\n          \n           \n             \n          <div class=\"container-fluid\">    \n                  <div class=\"col-md-12 no-left-padding\">  \n                 \n                    \n                    <!-- Notifikacije -->\n                 \n                            <div class=\"mail\" *ngIf=\"!obavestenjaNone\">\n                               \n                                <div class=\"mail-item  mail-info\" *ngFor=\"let obavestenje of  obavestenja\">\n                                  \n                                        <div class=\"mail-user-pic\">  <img class=\"notifyPic\" src=\"{{obavestenje.profilePic}}\"  alt=\"profile pic\"></div>\n                                        <div class=\"mail-user\"> {{obavestenje.date}}</div>\n                                        <div class=\"mail-user\">{{\"Vlasnik \"+obavestenje.ownername+\" \"+obavestenje.ownerlastname}}</div>\n                                        <div  class=\"mail-text\">zeli da Vam da ulogu:<b>{{obavestenje.role}}</b></div>\n                                        <div class=\"mail-date\">  <button (click)=\"odgovori(obavestenje.idowner,obavestenje.idworker,obavestenje.idrole,true)\" type=\"button\" class=\"btn btn-success\">Prihvati</button>\n                                            <button (click)=\"odgovori(obavestenje.idowner,obavestenje.idworker,obavestenje.idrole,false)\" type=\"button\" class=\"btn btn-danger\">Odbij</button></div>\n                                   \n                                </div>\n                            \n                            </div>\n                        \n                                  <div *ngIf=\"obavestenjaNone\">\n                                      <h2 class=\"alert alert-danger\">Nemate nova obavestenja</h2>\n                                </div> \n                        \n                    </div>\n                    <!-- END Notifikacije  -->\n             \n            </div>\n            \n           \n            \n            \n            \n            \n            \n            \n            \n            \n            \n            \n            \n            \n         \n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\"\n                                        id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n        \n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n    </div>\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 743:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/page-not-found-d.component.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n</head>\n<body>\n  <button (click)=\"vratiNaPrikaz()\" class=\"btn btn-primary btn-lg \" style=\"float: left\"><span class=\"fa fa-arrow-left\"></span> nazad na prikaz </button>\n</body>\n</html>\n"

/***/ }),

/***/ 744:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/page-not-found.component.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n</head>\n<body>\n  <button (click)=\"vratiNaPrikaz()\" class=\"btn btn-primary btn-lg \" style=\"float: left\"><span class=\"fa fa-arrow-left\"></span> nazad na prikaz </button>\n</body>\n</html>\n"

/***/ }),

/***/ 745:
/***/ (function(module, exports) {

module.exports = "<html>\n  <head>\n       <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n  </head>\n  <body>\n<div style=\"margin-top:10px\" class=\"form-group\">\n    <div id=\"wrapper\">\n\n   \n         <app-meni></app-meni>\n           <div id=\"page-wrapper\">\n             <app-widgets></app-widgets>\n               <div *ngIf=\"poslatZahtev\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                                           <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>\n                                          Vas zahtev je poslat adminu.\n                                        \n                                    </div>\n <div *ngIf=\"postojiUBazi\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"\">\n                                                    <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black\" type=\"button\"><span aria-hidden=\"true\">×</span></button>                                                    Vas zahtev je vec poslat adminu.\n  </div>\n  <!-- Button -->\n  <div class=\"col-sm-12 controls\" style=\"text-align: center;align-items: center\">\n    <button class=\"btn btn-primary\" type=\"submit\" (click)=\"posaljiZahtev()\"> Posalji zahtev</button>\n  </div>\n</div>\n</div>\n</div>\n</body>\n</html>"

/***/ }),

/***/ 746:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n    <title>PlanTech</title>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <meta name=\"author\" content=\"HighFive\" />\n\n    <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n    <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n    <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n    <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n    <!-- full screen -->\n    <style>\n        #exampleImage {\n            cursor: zoom-in;\n        }\n        \n        #exampleImage:-webkit-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-moz-full-screen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:-ms-fullscreen {\n            cursor: zoom-out;\n        }\n        \n        #exampleImage:fullscreen {\n            cursor: zoom-out;\n        }\n    </style>\n</head>\n\n<body>\n\n    <div id=\"wrapper\">\n\n        <app-meni></app-meni>\n\n        <!-- glavni deo -->\n        <div id=\"page-wrapper\" >\n\n            <div class=\"container-fluid\">\n                <div class=\"col-md-12 \" style=\"text-align:center;margin-top: 10px\">\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-success widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-globe\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.plantaze}}</div>\n                                <div class=\"widget-title\">registrovanih plantaza</div>\n                            </div>\n                        </div>\n\n                    </div>\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-primary widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-users\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.radnici}}</div>\n                                <div class=\"widget-title\">registrovana radnka</div>\n                            </div>\n                        </div>\n                    </div>\n\n                    <div class=\"col-md-3\">\n                        <div class=\"widget widget-info widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-book\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.eksperti}}</div>\n                                <div class=\"widget-title\">registrovanih experata</div>\n                            </div>\n                        </div>\n                    </div>\n                    <div class=\"col-md-3 \">\n                        <div class=\"widget widget-warning widget-item-icon\">\n                            <div class=\"widget-item-left\">\n                                <span class=\"fa fa-warning\"></span>\n                            </div>\n                            <div class=\"widget-data\">\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.obavestenja}}</div>\n                                <div class=\"widget-title\">obavestenja</div>\n                            </div>\n                        </div>\n                    </div>\n                </div>\n            </div>\n\n            <div class=\"container-fluid\">\n                 <div class=\"col-md-12 no-left-padding\">                                    \n                    <!-- Naslov -->\n                    <div class=\"col-md-12\">                        \n                        <div class=\"page-title\">                    \n                            <h2><span class=\"fa fa-inbox\"></span> Inbox <small></small></h2>\n                        </div>                                                                                \n                                   \n                    </div>\n                    <!-- END  Naslov -->\n                   <div class=\"col-md-12 no-left-padding\">  \n                    <!-- Meni za poruke -->\n                    <div class=\"col-md-2 no-left-padding\" >\n                      \n                         <a  routerLink=\"/newmsg\" class=\"btn btn-highFive btn-block btn-lg\" ><span class=\"fa fa-edit\"></span> Nova poruka</a>\n                       \n                            <div class=\"block\" style=\"margin-top: 5px\">\n                            <div class=\"list-group border-bottom\">\n                                <a routerLink=\"/inbox\" class=\"list-group-item\"><span class=\"fa fa-inbox\"></span> Inbox <span class=\"badge badge-primary notification\"></span></a>\n                                <a routerLink=\"/sent\" class=\"list-group-item  active\"><span class=\"fa fa-rocket\"></span>  Poslate</a>\n                            </div>                        \n                        </div>\n                              <div class=\"block\">\n                            <h4>Oznake</h4>\n                            <div class=\"list-group list-group-simple\">                                \n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-success\"></span> Radnik</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-warning\"></span> Expert</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-danger\"></span> Sef</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-info\"></span> Gazda</a>\n                                <a href=\"#\" class=\"list-group-item\"><span class=\"fa fa-circle text-primary\"></span> Sin</a>\n                            </div>\n                        </div>\n                        \n                    </div>\n                    <!-- END Meni za poruke -->\n                    \n                    <!-- INBoX -->\n                    <div class=\"col-md-10\">\n                            <div class=\"mail\">\n                                 <div *ngIf=\"poslatePoruke.length>0\">\n                                    <div *ngFor=\"let poruka of poslatePoruke\" class=\"mail-item mail-info\">\n                                        <div class=\"mail-user\">{{poruka.username}}</div>\n                                        <a (click)=\"goToMessage(poruka)\" class=\"mail-text\">{{poruka.text}}</a>\n                                        <div class=\"mail-date\">{{ poruka.time | date:'medium' }}</div>\n                                    </div>\n                                </div>\n                                <div *ngIf=\"poslatePoruke.length==0\">\n                                    <h2>Nemate poslatih poruka</h2>\n                                </div>\n                                 <!-- msg\n                                <div class=\"mail-item mail-unread mail-info\"  >\n                                    <div class=\"mail-user\">Djole Junior</div>                                    \n                                    <a routerLink=\"/msg\" class=\"mail-text\">Task 1</a>                                    \n                                    <div class=\"mail-date\">Danas, 10:36</div>\n                                </div>\n                                  \n                                <div class=\"mail-item mail-unread mail-danger\" > \n                                    <div class=\"mail-user\">Djole Senior</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 2</a>                                    \n                                    <div class=\"mail-date\">Danas, 10:36</div>\n                                </div>\n                                \n                                <div class=\"mail-item mail-success\">\n                                    <div class=\"mail-user\">Jovan</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 3</a>                                    \n                                    <div class=\"mail-date\">Danas, 20:19</div>\n                                </div>\n                                \n                                <div class=\"mail-item mail-warning\">\n                                    <div class=\"mail-user\">Jovana</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 4</a>                                    \n                                    <div class=\"mail-date\">Danas, 21:19</div>\n                                </div>\n                                \n                                <div class=\"mail-item mail-info\">\n                                    <div class=\"mail-user\">Bojan</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Task 5</a>                                    \n                                    <div class=\"mail-date\">Juce 20:22</div>\n                                   \n                                </div>\n                                \n                            \n                                \n                                <div class=\"mail-item mail-primary\">\n                                    <div class=\"mail-user\">Darth Vader</div>                                    \n                                    <a routerLink=\"/msg\"  class=\"mail-text\">Where are the drawings of the new spaceship?</a>\n                                    <div class=\"mail-date\">Juce 10:36</div>\n                                </div>                                \n                                -->\n                            </div>\n                        \n                            <div class=\"panel-footer\" style=\"height: 100%\">  \n                                <ul class=\"pagination pagination-sm pull-right\">\n                                    <li class=\"disabled\"><a href=\"#\">«</a></li>\n                                    <li class=\"active\"><a href=\"#\">1</a></li>\n                                    <li><a href=\"#\">2</a></li>\n                                    <li><a href=\"#\">3</a></li>\n                                    <li><a href=\"#\">4</a></li>                                    \n                                    <li><a href=\"#\">»</a></li>\n                                </ul>\n                            </div>                 \n                        \n                        \n                    </div>\n                    </div>\n                    <!-- ENDINBoX  -->\n                </div>\n             \n            </div>\n\n            <!-- CONTACT MODAL -->\n            <div id=\"ContactModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Kontaktrijate nas</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <form class=\"form-horizontal col-sm-12\">\n                                <div class=\"form-group\"><label>Ime</label><input class=\"form-control required\" placeholder=\"Vase ime\" data-placement=\"top\"\n                                        data-trigger=\"manual\" data-content=\"Must be at least 3 characters long, and must only contain letters.\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><label>Poruka</label><textarea class=\"form-control\" placeholder=\"Vasa poruka...\" data-placement=\"top\"\n                                        data-trigger=\"manual\"></textarea></div>\n                                <div class=\"form-group\"><label>E-Mail</label><input class=\"form-control email\" placeholder=\"email@you.com (kako bi smo mogli da vam odgovrimo)\"\n                                        data-placement=\"top\" data-trigger=\"manual\" data-content=\"Must be a valid e-mail address (user@gmail.com)\"\n                                        type=\"text\"></div>\n                                <div class=\"form-group\"><button type=\"submit\" class=\"btn btn-send pull-right\">Poslaji!</button>\n                                    <p class=\"help-block pull-left text-danger hide\"\n                                        id=\"form-error\">  The form is not valid. </p>\n                                </div>\n                            </form>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END CONTACT MODAL -->\n\n            <!-- ABOUT MODAL -->\n            <div id=\"AboutModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">O nama</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <p>Uz pomoc mladog i entuzijazticnog tima sastavljenog od dva Djoleta, jednog Jovana,jedne Jovane\n                                i jednog Bojana kreirana je aplikacija koja ce zadovoljiti sve vase potrebe vezane za poljoprivredu\n                            </p>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END ABOUT MODAL -->\n            <!-- SETINGS MODAL -->\n            <div id=\"SettingsModal\" class=\"modal fade\" tabindex=\"-1\" role=\"dialog\" aria-labelledby=\"myModalLabel\" aria-hidden=\"true\">\n                <div class=\"modal-dialog\">\n                    <div class=\"modal-content\">\n                        <div class=\"modal-header\">\n                            <button type=\"button\" class=\"close\" data-dismiss=\"modal\" aria-hidden=\"true\">×</button>\n                            <h3 id=\"myModalLabel\">Podesavanja</h3>\n                        </div>\n                        <div class=\"modal-body\">\n                            <div class=\"panel panel-primary\">\n\n                                <div class=\"panel-body\">\n                                    <form action=\"#\" role=\"form\" class=\"form-horizontal\">\n                                        <div class=\"form-group\">\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Obavestenja putem email-a</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"1\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n                                            <label class=\"col-md-3 control-label text-left\" style=\"padding-top: 0px;\">Uzmi moju lokaciju</label>\n                                            <div class=\"col-md-3\">\n                                                <label class=\"switch\">\n                                                    <input class=\"switch\" value=\"0\" checked=\"\" type=\"checkbox\">\n                                                    <span></span>\n                                                </label>\n                                            </div>\n\n                                        </div>\n\n\n\n\n                                    </form>\n                                </div>\n                            </div>\n                        </div>\n                        <div class=\"modal-footer\">\n                            <button class=\"btn btn-primary\" data-dismiss=\"modal\" aria-hidden=\"true\">Izadji</button>\n                        </div>\n                    </div>\n                </div>\n            </div>\n            <!--END SETINGS MODAL -->\n        </div>\n        <!-- end glavni deo -->\n        <div id=\"page-wrapper\" *ngIf=\"dozvole!==undefined&&dozvole.guest==true\">\n            <div class=\"container-fluid\">\n                ovde ide neki content za guesta\n            </div>\n        </div>\n    </div>\n\n\n\n\n\n</body>\n\n</html>"

/***/ }),

/***/ 747:
/***/ (function(module, exports) {

module.exports = "  <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\r\n        <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\r\n\t\t <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\r\n          <link rel=\"stylesheet\" href=\"css/w3.css\">\r\n        <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\r\n\r\n\r\n<div class=\"container-fluid\">\r\n                <!-- widgeti -->\r\n                <div class=\"col-md-12 \" style=\"text-align:center;margin-top: 10px\">\r\n                    <div class=\"col-md-3\" (click)=\"promeniStranu(1)\" style=\"cursor:pointer\">\r\n                        <div class=\"widget widget-success widget-item-icon\">\r\n                            <div class=\"widget-item-left\">\r\n                                <span class=\"fa fa-globe\"></span>\r\n                            </div>\r\n                            <div class=\"widget-data\">\r\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.plantaze}}</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.plantaze>=5\" class=\"widget-title\">registrovanih plantaza</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.plantaze<5&&stats.plantaze>0\" class=\"widget-title\">registrovane plantaze</div>\r\n                                <div *ngIf=\"stats===undefined||stats.plantaze==0\" class=\"widget-title\">nemate registrovanih plantaza</div>\r\n                                \r\n                            </div>\r\n                        </div>\r\n\r\n                    </div>\r\n                    <div class=\"col-md-3\" (click)=\"promeniStranu(2)\" style=\"cursor:pointer\">\r\n                        <div class=\"widget widget-primary widget-item-icon\">\r\n                            <div class=\"widget-item-left\">\r\n                                <span class=\"fa fa-users\"></span>\r\n                            </div>\r\n                            <div class=\"widget-data\">\r\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.radnici}}</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.radnici==1\" class=\"widget-title\">registrovan radnik</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.radnici<5&&stats.radnici>1\"class=\"widget-title\">registrovana radnika</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.radnici>5\" class=\"widget-title\">registrovanih radnika</div>\r\n                                <div *ngIf=\"stats===undefined||stats.radnici==0\" class=\"widget-title\">nemate registrovanih radnika</div> \r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n\r\n                    <div class=\"col-md-3\" (click)=\"promeniStranu(3)\" style=\"cursor:pointer\">\r\n                        <div class=\"widget widget-info widget-item-icon\">\r\n                            <div class=\"widget-item-left\">\r\n                                <span class=\"fa fa-book\"></span>\r\n                            </div>\r\n                            <div class=\"widget-data\">\r\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.eksperti}}</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.eksperti==1\" class=\"widget-title\">registrovan ekspert</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.eksperti>1&&stats.eksperti<5\" class=\"widget-title\">registrovana eksperta</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.eksperti>5\" class=\"widget-title\">registrovanih eksperata</div>\r\n                                <div *ngIf=\"stats===undefined||stats.eksperti==0\" class=\"widget-title\">nemate registrovanih eksperata</div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                    <div class=\"col-md-3 \" (click)=\"promeniStranu(4)\" style=\"cursor:pointer\">\r\n                        <div class=\"widget widget-warning widget-item-icon\">\r\n                            <div class=\"widget-item-left\">\r\n                                <span class=\"fa fa-warning\"></span>\r\n                            </div>\r\n                            <div class=\"widget-data\">\r\n                                <div *ngIf=\"stats!==undefined\" class=\"widget-int num-count\">{{stats.obavestenja}}</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.obavestenja==1\" class=\"widget-title\">obavestenje</div>\r\n                                <div *ngIf=\"stats!==undefined&&stats.obavestenja>1\" class=\"widget-title\">obavestenja</div>\r\n                                <div *ngIf=\"stats===undefined||stats.obavestenja==0\" class=\"widget-title\">nemate obavestenja</div>\r\n                            </div>\r\n                        </div>\r\n                    </div>\r\n                </div>\r\n</div>"

/***/ }),

/***/ 748:
/***/ (function(module, exports) {

module.exports = "<!DOCTYPE html>\n\n<html>\n\n<head>\n  <title>PlanTech</title>\n  <meta charset=\"UTF-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <meta name=\"author\" content=\"HighFive\" />\n\n  <link rel='stylesheet prefetch' href='css/bootstrap.min.css'>\n  <link rel=\"stylesheet\" href=\"css/mainStyle.css\">\n  <link rel=\"stylesheet\" href=\"css/bootstrap-select.min.css\">\n  <link href=\"fontawesome/css/font-awesome.min.css\" rel=\"stylesheet\" type=\"text/css\">\n  <!-- full screen -->\n\n</head>\n\n<body>\n  <div id=\"wrapper\">\n    <app-meni></app-meni>\n    <div id=\"page-wrapper>\">\n\n      <!-- end Meni -->\n\n      <!-- glavni deo -->\n      <div id=\"page-wrapper\" style=\"min-height: 100vh\">\n\n        <div class=\"container-fluid\">\n          <div class=\"col-md-12 \" style=\"text-align:center\">\n            <div class=\"panel panel-primary\">\n              <div class=\"panel-heading\" style=\"background-color:  #8f2846;max-height: 100%\">\n                <h1>Azuriranje mojih imanja</h1>\n              </div>\n            </div>\n            <form id=\"loginform\" class=\"form-horizontal\" role=\"form\" novalidate method=\"post\">\n              <div *ngIf=\"uspesnoPromenjeniPodaci\" role=\"alert\" class=\"alert alert-danger alert-dismissible fade in\" style=\"color: #4F8A10;background-color: #DFF2BF;\">\n                <button aria-label=\"Close\" (click)='resetuj()' data-dismiss=\"alert\" class=\"close\" style=\"color:black;\" type=\"button\"><span aria-hidden=\"true\">×</span></button>Podaci\n                o Vasem imanju su azurirani.\n              </div>\n              <div class=\"col-md-12\">\n                <div class=\"col-md-6 \">\n\n                  <label class=\"col-md-5 \" style=\"padding-top: 5px\">Naziv imanja:</label>\n                  <div class=\"input-group col-md-7\">\n                    <input class=\"form-control \" name=\"sername\" *ngIf=\"vidljivost\" value=\"{{imeParcele}}\" [(ngModel)]=\"imeParcele\">\n                    <span class=\"input-group-addon\"><i  class=\"fa fa-tag\"></i></span>\n                  </div>\n                </div>\n              </div>\n                 \n                        <div  class=\"form-group col-md-12\"  style=\"text-align: center;align-items: center;margin-top:2%\">\n                            <!-- Button -->\n                         \n                                <button class=\"btn btn-highFive\" type=\"submit\" (click)=\"promeniPodatke()\"> Promeni podatke </button>\n                          \n                        </div>\n            </form>\n          </div>\n        </div>\n      </div>\n    </div>\n  </div>\n</body>\n\n</html>"

/***/ })

},[1012]);
//# sourceMappingURL=main.bundle.js.map