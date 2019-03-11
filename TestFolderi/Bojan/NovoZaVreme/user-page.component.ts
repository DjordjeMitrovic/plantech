import { Component, OnInit, ChangeDetectorRef, ViewContainerRef } from '@angular/core';
import { } from "../meni/meni.component";
import { Headers, Http } from '@angular/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { RouterModule, Routes, Router } from '@angular/router';
import { MeniComponent } from "../meni/meni.component";
import { PermService } from "../services/perm-service.service";
import { FilterPipe } from '../filter.pipe';
import { ChartComponent } from "../chart-component/chart-component"
import 'rxjs/Rx';
import { StatsWidgets } from '../statsWidgets/stats-widgets';
import { NgxPaginationModule } from 'ngx-pagination';
import { DataTableModule } from "angular2-datatable";

import 'rxjs/add/operator/map';

declare var google: any;

@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: "./index.html",
  styleUrls: ['./weather.css'],

})
export class UserPage implements OnInit {
  sortBy = "name";
  month = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
  centerX;
  centerY;
  d;
  date;
  data: any;
  imaPodataka: boolean = false;

  stats: any;
  isOwner: boolean = false;
  coordinates: any;
  vrste: any;
  podaciTrazeni: boolean = false;
  user: any;
  statistika: boolean = false;

  temperaturaStat: any;
  chartdata: any;
  //isOwner: boolean = false;
  barData: any;
  temperatura: any;
  dozvole: any;
  vidljivost: boolean = false;
  vidljivostchart: boolean = false;
  vidljivostchartBar: boolean = false
  vidljivostRadar: boolean = false;
  mon;
  infoWindow;
  public pieChartLabels: string[];
  public pieChartData: number[];
  public pieChartType: string = 'pie';
  parcelaVidljiva = false;
  plantazaVidljiva = true;
  vlaznostZemljista;
  private INF = 99999;
  gleda = false;
  sideBarVidljiv = false;
  sideBarImanje = false;
  prikazImanja = false;
  dozvoleKodVlasnika: any;
  mojePlantazeVidljiv = true;
  mojaImanjaVidljiv = false;
  prognozaVidljiva = false;
  meniVidljiv = false;
  imanjeZaBrisanje;
  imanja: any;
  //stats: any;
  bojePoligona = [];
  obavestenja: any;

  tip: string[];
  ime: any;

  naslov: any;
  email: any;
  poruka: any;

  plantazaZaBrisanje;
  postojiUBazi = false;
  poslatZahtev = false;

  /*private options: any = {
    legend: { position: 'left' , labels: {boxWidth: 10, fontSize: 10}}
  };*/
  mapProp = null;
  map = null;
  drawingManager = null;
  prikaz = true;
  trenutni = -1;
  trenutnoImanje = -1;
  izabranaPlantaza;
  opisImanja;
  temperaturaProg: any;
  prognozaDan1min: any;
  prognozaDan1max: any;
  prognozaDan2min: any;
  prognozaDan2max: any;
  prognozaDan3min: any;
  prognozaDan3max: any;
  prognozaDan4min: any;
  prognozaDan4max: any;
  prognozaDan1: any;
  prognozaDan2: any;
  prognozaDan3: any;
  prognozaDan4: any;
  izabranoImanje;
  day: any;
  color: any;
  newestColor: any;
  cssStyle: any;
  cssStyleH: any;
  cssStyleT: any;
  cssStyleTab: any;
  newCss = false;
  lang = "srb";
  selectedLangInOpt: any;
  selectedLang: any;
  lokacija: any;
  meniMultiLang = {
    "srb": [
      { "num": "0", "text": "Moje Plantaze" },
      { "num": "1", "text": " Moja imanja" },
      { "num": "2", "text": "Lista mojih plantaza" },
      { "num": "3", "text": "Naziv plantaze" },
      { "num": "4", "text": "Vlasnik" },
      { "num": "5", "text": "Opcije" },
      { "num": "6", "text": "Lista mojih imanja" },
      { "num": "7", "text": "Naziv imanja" },
      { "num": "8", "text": "Opcije" },
      { "num": "9", "text": "Statistika" },
      { "num": "10", "text": "Azuriranje" },
      { "num": "11", "text": "Brisanje plantaze" },
      { "num": "12", "text": "Prethodna" },
      { "num": "13", "text": "Sledeca" },
      { "num": "14", "text": "Prikaz imanja" },
      { "num": "15", "text": "Azuriranje imanja" },
      { "num": "16", "text": "Brisanje imanja" },
      { "num": "17", "text": "nazad na spisak imanja" },
      { "num": "18", "text": "Nazad na spisak plantaza" },
      { "num": "19", "text": "Grafik nutricionistickih vrednosti" },
      { "num": "20", "text": "Grafik vlaznosti zemljista" },
      { "num": "21", "text": "Grafik temperature" },
      { "num": "22", "text": "trazenoj parceli trenutno nema statistickih podataka. Podaci se dobijaju svakoh dana u 23:30  i 11:30. Da bi dobili podatke morate povezati vasu plantazu sa meracem." },
      { "num": "23", "text": "Da li ste sigurni da zelite da obrisete plantazu?" },
      { "num": "24", "text": "Potvrdi" },
      { "num": "25", "text": "Da li ste sigurni da zelite da obrisete imanje?" },
      { "num": "26", "text": " Trenutno pristupate kao gost." },
      { "num": "27", "text": " Veliki deo aplikacije vam je onemogućen. Kako bi imali pristup svim funkcionalnostima morate se pretplatiti" },
      { "num": "28", "text": "kao vlasnik ili kontaktirati Vašeg vlasnika. Za više informacija obratite se administratoru sistema." },
      { "num": "29", "text": " Vas zahtev je poslat adminu." },
      { "num": "30", "text": " Vas zahtev je vec poslat adminu." },
      { "num": "31", "text": "Posalji zahtev" },
      { "num": "32", "text": "Vlaznost vazduha" },
      { "num": "33", "text": "Posejana vrsta" },
      { "num": "34", "text": "Podvrsta" },
      { "num": "35", "text": "Proizvodjac" },
      { "num": "36", "text": "Pretraga Imanja" },
      { "num": "37", "text": "Plantaze na imanju:" },
      { "num": "38", "text": "Naziv plantaze" },
      { "num": "39", "text": "Boja" },
      { "num": "40", "text": "Vreme" },
      { "num": "41", "text": "Vlaznost vazduha" },
      { "num": "42", "text": "Vlaznost zemljista" },
       { "num": "43", "text": "Posalji zahtev za vlasnistvo" },

    ],
    "eng": [
      { "num": "0", "text": "My plantation" },
      { "num": "1", "text": "My Properties" },
      { "num": "2", "text": "List of my plantations" },
      { "num": "3", "text": "Plantation name" },
      { "num": "4", "text": "Username of plantation owner" },
      { "num": "5", "text": "Options" },
      { "num": "6", "text": "List of my properties" },
      { "num": "7", "text": "Property name" },
      { "num": "8", "text": "Options" },
      { "num": "9", "text": "Statistics" },
      { "num": "10", "text": "Update plantation" },
      { "num": "11", "text": "Delete plantation" },
      { "num": "12", "text": "Back" },
      { "num": "13", "text": "Next" },
      { "num": "14", "text": "Show property" },
      { "num": "15", "text": "Update property" },
      { "num": "16", "text": "Delete property" },
      { "num": "17", "text": "Back to list of my properties" },
      { "num": "18", "text": "Back to list of my plantations" },
      { "num": "19", "text": "Chart of nutritional values" },
      { "num": "20", "text": "Chart of soil moisture" },
      { "num": "21", "text": "Temperature chart" },
      { "num": "22", "text": "Required plantation currently has no statistical data. Data is received each day between 23:30 and 11:30. To get the information you need to connect your plantation to a sensor." },
      { "num": "23", "text": "Are you sure you want to delete plantation?" },
      { "num": "24", "text": "Confirm" },
      { "num": "25", "text": "Are you sure you want to delete property?" },
      { "num": "26", "text": "You are currently logged as guest." },
      { "num": "27", "text": "Much of the applications is disabled to you. To get access to all functionalities you must subscribe" },
      { "num": "28", "text": "As the owner or contact another owner. For more information, contact your system administrator." },
      { "num": "29", "text": "Your request has been sent" },
      { "num": "30", "text": "Your request has already been sent" },
      { "num": "31", "text": "Send request" },
      { "num": "32", "text": "Air humidity" },
      { "num": "33", "text": "Type" },
      { "num": "34", "text": "Subtype" },
      { "num": "35", "text": "Manufacturer" },
      { "num": "36", "text": "Search properties" },
      { "num": "37", "text": "Plantations on property" },
      { "num": "38", "text": "Plantation name" },
      { "num": "39", "text": "Color" },
      { "num": "40", "text": "Weather" },
      { "num": "41", "text": "Air humidity" },
      { "num": "42", "text": "soil moisture" },
       { "num": "43", "text": "Send request for ownership" },
    ]


  };
  constructor(private cdr: ChangeDetectorRef, private http: Http, private localStorageService: LocalStorageService, private router: Router, private permService: PermService) {

  }
  logout() {

    this.http.get(`sessions/logout`)
      .map(res => res.json())
      .subscribe(data => {
        this.localStorageService.set("logged", false);
        this.router.navigate(['./login']);

      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  postaviIzabranuPlant(value) {
    this.plantazaZaBrisanje = value;
  }
  postaviIzabranoImanje(value) {
    this.imanjeZaBrisanje = value;
  }

  posaljiZahtev() {
    this.router.navigate(['./reqownership']);
    this.http.get(`sessions/LogovaniKorisnik`);
  }


  promeniTab() {
    this.prikazImanja = false;
    this.plantazaVidljiva = true;
    this.parcelaVidljiva = false;
    this.sideBarImanje = false;
    this.sideBarVidljiv = false;
    this.vidljivostchart = false;
    this.vidljivostchartBar = false;
    this.vidljivostRadar = false;
    this.podaciTrazeni = false;
    this.imaPodataka = false;
    this.prognozaVidljiva = false;
  }

  promeniTab1() {
    this.prikazImanja = false;
    this.plantazaVidljiva = false;
    this.parcelaVidljiva = true;
    this.sideBarVidljiv = false;
    this.sideBarVidljiv = false;
    this.vidljivostchart = false;
    this.vidljivostchartBar = false;
    this.vidljivostRadar = false;
    this.podaciTrazeni = false;
    this.imaPodataka = false;
    this.prognozaVidljiva = false;
  }

  posalji() {
    var pom3: any;
    this.http.get(`users/posaljiMail2/${this.ime}/${this.naslov}/${this.email}/${this.poruka}`)
      .map(res => res.json())
      .subscribe(data => {
        pom3 = data;
        if (pom3.success) {

        }
      },
      err => console.log(err),
      () => console.log('Completed'));
  }
  duz(tacka1, tacka2) {
    return Math.sqrt(Math.pow(tacka1[1] - tacka2[1], 2) + Math.pow(tacka1[0] - tacka2[0], 2));
  }

  heronovObrazac(tacka1, tacka2, tacka3) {
    var duz1, duz2, duz3;
    duz1 = this.duz(tacka1, tacka2);
    duz2 = this.duz(tacka1, tacka3);
    duz3 = this.duz(tacka2, tacka3);
    var s = (duz1 + duz2 + duz3) / 2;
    return Math.sqrt(s * (s - duz1) * (s - duz2) * (s - duz3));
  }

  nadjiCentar(nizKord) {
    var lat = 0, lng = 0;

    for (var i = 0; i < nizKord.length - 1; i++) {
      lat += nizKord[i][0];
      lng += nizKord[i][1];
      //  alert(lat + " -- " + lng);
    }
    lat = lat / (nizKord.length - 1);
    lng = lng / (nizKord.length - 1);
    return new google.maps.LatLng(lng, lat);
  }

  getRandomColor() {
    var letters = '02468ACEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 9)];
    }
    return color;
  }

  dodajListener(poli) {
    let self = this;
    google.maps.event.addListener(poli, 'click', function (event) {

      if (this.infoWindow) {
        this.infoWindow.close();
      }
      this.infoWindow = new google.maps.InfoWindow;
      this.infoWindow.setContent("<h3>O plantazi:</h3> <br> " + poli.opis);
      this.infoWindow.setPosition(event.latLng);
      this.infoWindow.open(self.map);


      var niz = poli.getPath().getArray();
      var bounds = new google.maps.LatLngBounds();
      for (var j = 0; j < niz.length; j++) {
        bounds.extend(niz[j]);
      }
      self.map.fitBounds(bounds);

    });
  }
  infoOPlantazi = [];
  nizPoligona1 = [];
  initImanje(plantaze) {
    var coords = [];

    var nizKord = [];
    for (var k = 0; k < plantaze.length; k++) {
      coords = [];
      for (var i = 0; i < plantaze[k].coordinates.length; i++) {
        var poligon = [];
        for (var j = 0; j < plantaze[k].coordinates[i].length; j++) {
          poligon.push(new google.maps.LatLng(plantaze[k].coordinates[i][j][1], plantaze[k].coordinates[i][j][0]));
        }
        nizKord.push(poligon);
        coords.push(poligon);
      }

      this.nizPoligona1.push(new google.maps.Polygon({
        paths: coords,
        clickable: true,
        zIndex: 1,
        strokeColor: '#FFFFFF',
        strokeOpacity: 0.8,
        strokeWeight: 2,
        fillColor: this.bojePoligona[k],
        fillOpacity: 0.45,
        indexID: k,
        opis: this.infoOPlantazi[k]
      }));


      this.dodajListener(this.nizPoligona1[k]);
    }
    this.crtajSad(nizKord, this.nizPoligona1);
  }

  ubaciUBounds1(nizpoligona) {

    var bounds = new google.maps.LatLngBounds();

    for (var i = 0; i < nizpoligona.length; i++) {
      for (var j = 0; j < nizpoligona[i].length; j++) {

        bounds.extend(nizpoligona[i][j]);
      }
    }
    return bounds;
  }

  crtajSad(nizKord, nizPoligona) {

    var bounds = this.ubaciUBounds1(nizKord);
    let self = this;

    self.map = new google.maps.Map(document.getElementById('googleMap1'), {
      mapTypeId: 'hybrid'
    });
    /*
    google.maps.event.addListener(self.map, 'click', function (event) {
      alert("Latitude: " + event.latLng.lat() + " " + ", longitude: " + event.latLng.lng());
    });
    */
    self.map.fitBounds(bounds);

    for (var i = 0; i < nizPoligona.length; i++) {
      nizPoligona[i].setMap(self.map);
    }
    setTimeout(() => {
      google.maps.event.trigger(self.map, 'resize');
    }, 100);

  }

  plantazeSaImanja = [];
  dajRadnomRazliciteBoje(n) {
    for (var i = 0; i < n; i++) {
      this.bojePoligona[i] = this.getRandomColor();
      for (var j = 0; j < i; j++) {
        while (this.bojePoligona[i] == this.bojePoligona[j]) {
          this.bojePoligona[i] = this.getRandomColor();
        }
      }
    }
  }

  popuniSideBar(imanje) {
    this.opisImanja = "bravo!";

    this.http.get(`users/plantationNames/${imanje}`)
      .map(res => res.json())
      .subscribe(data => {
        this.plantazeSaImanja = data;
        this.dajRadnomRazliciteBoje(this.plantazeSaImanja.length);
        for (var i = 0; i < this.plantazeSaImanja.length; i++) {
          this.infoOPlantazi[i] = "Plantaza <b>" + this.plantazeSaImanja[i].ime + "</b><br> Tip: " + this.plantazeSaImanja[i].tip + "<br>Podtip: " + this.plantazeSaImanja[i].podtip + "<br> Proizvodjac: " + this.plantazeSaImanja[i].producer + "<br> Vlasnik: <b>" + this.plantazeSaImanja[i].username;
        }
      },
      err => console.log(err),
      () => console.log('Completed a'));
  }

  fuja(value) {
    let self = this;
    var niz = this.nizPoligona1[value].getPath().getArray();
    var bounds = this.ubaciUBounds2(niz);

    self.map.fitBounds(bounds);
  }

  ubaciUBounds2(niz) {
    var bounds = new google.maps.LatLngBounds();
    for (var j = 0; j < niz.length; j++) {
      console.log(JSON.stringify(niz[j]));
      bounds.extend(niz[j]);
    }
    return bounds;
  }



  prikaziImanje(value) {
    //alert(value);
    this.prikazImanja = true;
    this.sideBarImanje = true;
    var plantazeIzImanja: any;
    var idPlantaza = [];
    document.getElementById('mapIDimanje').innerHTML = "<div class='col-md-9'><div id='googleMap1' style='width: 100%; height: 700px'></div></div>";

    this.http.get(`users/plantsInParcel/${value}`)
      .map(res => res.json())
      .subscribe(data => {
        plantazeIzImanja = data;
        this.initImanje(plantazeIzImanja);

      },
      err => console.log(err),
      () => console.log('Completed a'));
  }

  typeOf(obj) {
    return {}.toString.call(obj).split(' ')[1].slice(0, -1).toLowerCase();
  }

  ubaciUBounds(niz) {
    var bounds = new google.maps.LatLngBounds();
    for (var j = 0; j < niz.length; j++) {
      for (var i = 0; i < niz[j].length; i++) {
        var marker = new google.maps.LatLng(niz[j][i][1], niz[j][i][0]);
        bounds.extend(marker);
      }
    }
    return bounds;
  }

  initMap(coords) {
    let self = this;
    var nizPoligona = [];
    var poligon = [];
    var zoom = 2;
    var centar; // da se dogovorimo dal crtamo 1 ili vise?
    var povrsina = 0;
    // console.log("coords[0].coordinates.length: " + coords[0].coordinates.length);
    for (var i = 0; i < coords[0].coordinates.length; i++) {
      // console.log("coords[0].coordinates[i].length: " + coords[0].coordinates[i].length);
      for (var j = 0; j < coords[0].coordinates[i].length; j++) {
        poligon[poligon.length] = new google.maps.LatLng(coords[0].coordinates[i][j][1], coords[0].coordinates[i][j][0]);
        // console.log("piligon[" + j + "] - " + poligon[j]);
      }
      nizPoligona.push(poligon);
      poligon = [];
      //console.log("nizpoligona[" + i + "] - " + nizPoligona[i]);
    }

    centar = this.nadjiCentar(coords[0].coordinates[0]);
    var bounds = this.ubaciUBounds(coords[0].coordinates);
    // alert(bounds);


    self.map = new google.maps.Map(document.getElementById('googleMap'), {
      center: centar,
      zoom: zoom,
      mapTypeId: 'hybrid'
    });
    self.map.fitBounds(bounds);

    var polygons = new google.maps.Polygon({
      paths: nizPoligona,
      clickable: true,
      zIndex: 1,
      strokeColor: '#FFFFFF',
      strokeOpacity: 0.8,
      strokeWeight: 2,
      fillColor: this.getRandomColor(),
      fillOpacity: 0.35
    });
    polygons.setMap(self.map);

    setTimeout(() => {
      google.maps.event.trigger(self.map, 'resize');
    }, 100);
  }

  nazadNaPrikaz() {
    this.sideBarVidljiv = false;
    this.vidljivostchart = false;
    this.vidljivostchartBar = false;
    this.vidljivostRadar = false;
    this.podaciTrazeni = false;
    this.imaPodataka = false;
    this.prognozaVidljiva = false;

  }
  nazadNaPrikazImanja() {
    for(var i=0;i<this.nizPoligona1.length;i++){
      this.nizPoligona1[i] = null;
    }
    this.map = null;
    this.sideBarImanje = false;
    this.prikazImanja = false;
  }

  prikaziPlantazu(value) {
    var coords;
    this.sideBarVidljiv = true;
    this.izabranaPlantaza = this.vrste.find(x => x.id == value);
    // alert("plantaza " + value);
    this.http.get(`/plantations/userPlantation/${value}`)
      .map(res => res.json())
      .subscribe(data => {

        coords = data;
        // console.log("1");
        var coordinates = coords[0].coordinates;
        document.getElementById('mapID').innerHTML = "<div class='col-md-9'><div id='googleMap' style='width: 100%; height: 700px'></div></div>";
        this.initMap(coords);


        var xmin = this.INF, xmax = -this.INF, ymin = this.INF, ymax = -this.INF;
        for (var i = 0; i < coordinates[0].length; i++) {
          //console.log("2");
          if (xmin > coordinates[0][i][0]) xmin = coordinates[0][i][0];
          if (xmax < coordinates[0][i][0]) xmax = coordinates[0][i][0];
          if (ymin > coordinates[0][i][1]) ymin = coordinates[0][i][1];
          if (ymax < coordinates[0][i][1]) ymax = coordinates[0][i][1];
        }
        this.centerX = xmin + ((xmax - xmin) / 2);
        this.centerY = ymin + ((ymax - ymin) / 2);
        //console.log("X: " + this.centerX + " Y: " + this.centerY);


        this.uzmiPodatkeOTemperaturi();
        this.uzmiNutriPodatke();


      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  prikaziPrognozu(value) {
    var coords;
    this.prognozaVidljiva = true;
    this.izabranaPlantaza = this.vrste.find(x => x.id == value);
    // alert("plantaza " + value);
    this.http.get(`/plantations/userPlantation/${value}`)
      .map(res => res.json())
      .subscribe(data => {

        coords = data;
        console.log(coords);
        var coordinates = coords[0].coordinates;


        var xmin = this.INF, xmax = -this.INF, ymin = this.INF, ymax = -this.INF;
        for (var i = 0; i < coordinates[0].length; i++) {
          //console.log("2");
          if (xmin > coordinates[0][i][0]) xmin = coordinates[0][i][0];
          if (xmax < coordinates[0][i][0]) xmax = coordinates[0][i][0];
          if (ymin > coordinates[0][i][1]) ymin = coordinates[0][i][1];
          if (ymax < coordinates[0][i][1]) ymax = coordinates[0][i][1];
        }
        this.centerX = xmin + ((xmax - xmin) / 2);
        this.centerY = ymin + ((ymax - ymin) / 2);
        //console.log("X: " + this.centerX + " Y: " + this.centerY);

        this.uzmiPodatkeOPrognozi();
        this.uzmiPodatkeOTemperaturi();



      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  uzmiNutriPodatke() {

    this.http.get(`/stats/current`)
      .map(res => res.json())
      .subscribe(data => {
        this.pieChartData = data.data;
        this.pieChartLabels = data.labels;
        this.vlaznostZemljista = data.vlaznost;
      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  //prognoza
  uzmiPodatkeOPrognozi() {
    var dayName;
    console.log(this.centerY + " : " + this.centerX);
    this.http.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + this.centerY + "&lon=" + this.centerX + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7")
      .map(res => res.json())
      .subscribe(data => {
        for (var i = 0; i < 4; i++) {
          this.day++;
          if (this.day == 7)
            dayName = "Ned";
          if (this.day == 1 || this.day == 8)
            dayName = "Pon";
          if (this.day == 2 || this.day == 9)
            dayName = "Uto";
          if (this.day == 3 || this.day == 10)
            dayName = "Sre";
          if (this.day == 4 || this.day == 11)
            dayName = "Cet";
          if (this.day == 5)
            dayName = "Pet";
          if (this.day == 6)
            dayName = "Sub";

          if (i == 0)
            this.prognozaDan1 = dayName;
          if (i == 1)
            this.prognozaDan2 = dayName;
          if (i == 2)
            this.prognozaDan3 = dayName;
          if (i == 3)
            this.prognozaDan4 = dayName;

          console.log(dayName);
          console.log(this.day);


        }





        this.temperaturaProg = data["list"];
        this.prognozaDan1min = this.temperaturaProg[2];
        this.prognozaDan1max = this.temperaturaProg[5];
        this.prognozaDan2min = this.temperaturaProg[10];
        this.prognozaDan2max = this.temperaturaProg[13];
        this.prognozaDan3min = this.temperaturaProg[18];
        this.prognozaDan3max = this.temperaturaProg[21];
        this.prognozaDan4min = this.temperaturaProg[26];
        this.prognozaDan4max = this.temperaturaProg[29];
        console.log(this.prognozaDan1min);
        this.promeniIkonePrognoza();

      },
      err => console.log(err),
      () => console.log('Completed'));


  }
  uzmiPodatkeOPrognoziGost() {
    var dayName;


    this.http.get("http://api.openweathermap.org/data/2.5/forecast?lat=" + this.lokacija["latitude"] + "&lon=" + this.lokacija["longitude"] + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7")
      .map(res => res.json())
      .subscribe(data => {
        for (var i = 0; i < 4; i++) {
          this.day++;
          if (this.day == 7)
            dayName = "Ned";
          if (this.day == 1 || this.day == 8)
            dayName = "Pon";
          if (this.day == 2 || this.day == 9)
            dayName = "Uto";
          if (this.day == 3 || this.day == 10)
            dayName = "Sre";
          if (this.day == 4 || this.day == 11)
            dayName = "Cet";
          if (this.day == 5)
            dayName = "Pet";
          if (this.day == 6)
            dayName = "Sub";

          if (i == 0)
            this.prognozaDan1 = dayName;
          if (i == 1)
            this.prognozaDan2 = dayName;
          if (i == 2)
            this.prognozaDan3 = dayName;
          if (i == 3)
            this.prognozaDan4 = dayName;

          console.log(dayName);
          console.log(this.day);


        }





        this.temperaturaProg = data["list"];
        this.prognozaDan1min = this.temperaturaProg[2];
        this.prognozaDan1max = this.temperaturaProg[5];
        this.prognozaDan2min = this.temperaturaProg[10];
        this.prognozaDan2max = this.temperaturaProg[13];
        this.prognozaDan3min = this.temperaturaProg[18];
        this.prognozaDan3max = this.temperaturaProg[21];
        this.prognozaDan4min = this.temperaturaProg[26];
        this.prognozaDan4max = this.temperaturaProg[29];
        console.log(this.prognozaDan1min);
        this.promeniIkonePrognoza();

      },
      err => console.log(err),
      () => console.log('Completed'));


  }
  uzmiPodatkeOTemperaturi() {

    this.http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + this.centerY + "&lon=" + this.centerX + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7&lang=hr")
      .map(res => res.json())
      .subscribe(data => {
        this.temperatura = data;
        console.log(this.temperatura);
        this.promeniIkone();
        this.http.get(`/stats/ubaciTemp/${this.izabranaPlantaza.id}/${this.temperatura.main.temp}`).map(res => res.json()).subscribe(dat => {
          if (this.statistika) {
            this.statistika = false;
            this.uzmiPodatkeOTemperaturiStat();
          }


        });
      },
      err => console.log(err),
      () => console.log('Completed'));
  }
  uzmiPodatkeOTemperaturiGost() {




    this.http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + this.lokacija["latitude"] + "&lon=" + this.lokacija["longitude"] + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7&lang=hr")
      .map(res => res.json())
      .subscribe(data => {
        this.temperatura = data;
        console.log(this.temperatura);
        this.promeniIkone();

      },
      err => console.log(err),
      () => console.log('Completed'));
  }
  promeniIkone() {
    if (this.temperatura.weather[0].icon == "01d")
      this.temperatura.weather[0].icon = "wi-day-sunny";
    if (this.temperatura.weather[0].icon == "01n")
      this.temperatura.weather[0].icon = "wi-night-clear";

    if (this.temperatura.weather[0].icon == "02d")
      this.temperatura.weather[0].icon = "wi-day-cloudy";
    if (this.temperatura.weather[0].icon == "02n")
      this.temperatura.weather[0].icon = "wi-night-alt-cloudy";

    if (this.temperatura.weather[0].icon == "03d")
      this.temperatura.weather[0].icon = "wi-cloud";
    if (this.temperatura.weather[0].icon == "03n")
      this.temperatura.weather[0].icon = "wi-cloud";

    if (this.temperatura.weather[0].icon == "04d")
      this.temperatura.weather[0].icon = "wi-cloudy";
    if (this.temperatura.weather[0].icon == "04n")
      this.temperatura.weather[0].icon = "wi-cloudy";

    if (this.temperatura.weather[0].icon == "09d")
      this.temperatura.weather[0].icon = "wi-day-showers";
    if (this.temperatura.weather[0].icon == "09n")
      this.temperatura.weather[0].icon = "wi-night-showers";

    if (this.temperatura.weather[0].icon == "10d")
      this.temperatura.weather[0].icon = "wi-day-rain";
    if (this.temperatura.weather[0].icon == "10n")
      this.temperatura.weather[0].icon = "wi-night-alt-rain";

    if (this.temperatura.weather[0].icon == "11d")
      this.temperatura.weather[0].icon = "wi-day-thunderstorm";
    if (this.temperatura.weather[0].icon == "11n")
      this.temperatura.weather[0].icon = "wi-night-alt-thunderstorm";

    if (this.temperatura.weather[0].icon == "13d")
      this.temperatura.weather[0].icon = "wi-day-snow";
    if (this.temperatura.weather[0].icon == "13n")
      this.temperatura.weather[0].icon = "wi-night-alt-snow";

    if (this.temperatura.weather[0].icon == "50d")
      this.temperatura.weather[0].icon = "wi-day-fog";
    if (this.temperatura.weather[0].icon == "50n")
      this.temperatura.weather[0].icon = "wi-night-fog";

  }
  promeniIkonePrognoza() {
    if (this.prognozaDan1min.weather[0].icon == "01d")
      this.prognozaDan1min.weather[0].icon = "wi-day-sunny";
    if (this.prognozaDan1min.weather[0].icon == "01n")
      this.prognozaDan1min.weather[0].icon = "wi-night-clear";

    if (this.prognozaDan1min.weather[0].icon == "02d")
      this.prognozaDan1min.weather[0].icon = "wi-day-cloudy";
    if (this.prognozaDan1min.weather[0].icon == "02n")
      this.prognozaDan1min.weather[0].icon = "wi-night-alt-cloudy";

    if (this.prognozaDan1min.weather[0].icon == "03d")
      this.prognozaDan1min.weather[0].icon = "wi-cloud";
    if (this.prognozaDan1min.weather[0].icon == "03n")
      this.prognozaDan1min.weather[0].icon = "wi-cloud";

    if (this.prognozaDan1min.weather[0].icon == "04d")
      this.prognozaDan1min.weather[0].icon = "wi-cloudy";
    if (this.prognozaDan1min.weather[0].icon == "04n")
      this.prognozaDan1min.weather[0].icon = "wi-cloudy";

    if (this.prognozaDan1min.weather[0].icon == "09d")
      this.prognozaDan1min.weather[0].icon = "wi-day-showers";
    if (this.prognozaDan1min.weather[0].icon == "09n")
      this.prognozaDan1min.weather[0].icon = "wi-night-showers";

    if (this.prognozaDan1min.weather[0].icon == "10d")
      this.prognozaDan1min.weather[0].icon = "wi-day-rain";
    if (this.prognozaDan1min.weather[0].icon == "10n")
      this.prognozaDan1min.weather[0].icon = "wi-night-alt-rain";

    if (this.prognozaDan1min.weather[0].icon == "11d")
      this.prognozaDan1min.weather[0].icon = "wi-day-thunderstorm";
    if (this.prognozaDan1min.weather[0].icon == "11n")
      this.prognozaDan1min.weather[0].icon = "wi-night-alt-thunderstorm";

    if (this.prognozaDan1min.weather[0].icon == "13d")
      this.prognozaDan1min.weather[0].icon = "wi-day-snow";
    if (this.prognozaDan1min.weather[0].icon == "13n")
      this.prognozaDan1min.weather[0].icon = "wi-night-alt-snow";

    if (this.prognozaDan1min.weather[0].icon == "50d")
      this.prognozaDan1min.weather[0].icon = "wi-day-fog";
    if (this.prognozaDan1min.weather[0].icon == "50n")
      this.prognozaDan1min.weather[0].icon = "wi-night-fog";


    if (this.prognozaDan2min.weather[0].icon == "01d")
      this.prognozaDan2min.weather[0].icon = "wi-day-sunny";
    if (this.prognozaDan2min.weather[0].icon == "01n")
      this.prognozaDan2min.weather[0].icon = "wi-night-clear";

    if (this.prognozaDan2min.weather[0].icon == "02d")
      this.prognozaDan2min.weather[0].icon = "wi-day-cloudy";
    if (this.prognozaDan2min.weather[0].icon == "02n")
      this.prognozaDan2min.weather[0].icon = "wi-night-alt-cloudy";

    if (this.prognozaDan2min.weather[0].icon == "03d")
      this.prognozaDan2min.weather[0].icon = "wi-cloud";
    if (this.prognozaDan2min.weather[0].icon == "03n")
      this.prognozaDan2min.weather[0].icon = "wi-cloud";

    if (this.prognozaDan2min.weather[0].icon == "04d")
      this.prognozaDan2min.weather[0].icon = "wi-cloudy";
    if (this.prognozaDan2min.weather[0].icon == "04n")
      this.prognozaDan2min.weather[0].icon = "wi-cloudy";

    if (this.prognozaDan2min.weather[0].icon == "09d")
      this.prognozaDan2min.weather[0].icon = "wi-day-showers";
    if (this.prognozaDan2min.weather[0].icon == "09n")
      this.prognozaDan2min.weather[0].icon = "wi-night-showers";

    if (this.prognozaDan2min.weather[0].icon == "10d")
      this.prognozaDan2min.weather[0].icon = "wi-day-rain";
    if (this.prognozaDan2min.weather[0].icon == "10n")
      this.prognozaDan2min.weather[0].icon = "wi-night-alt-rain";

    if (this.prognozaDan2min.weather[0].icon == "11d")
      this.prognozaDan2min.weather[0].icon = "wi-day-thunderstorm";
    if (this.prognozaDan2min.weather[0].icon == "11n")
      this.prognozaDan2min.weather[0].icon = "wi-night-alt-thunderstorm";

    if (this.prognozaDan2min.weather[0].icon == "13d")
      this.prognozaDan2min.weather[0].icon = "wi-day-snow";
    if (this.prognozaDan2min.weather[0].icon == "13n")
      this.prognozaDan2min.weather[0].icon = "wi-night-alt-snow";

    if (this.prognozaDan2min.weather[0].icon == "50d")
      this.prognozaDan2min.weather[0].icon = "wi-day-fog";
    if (this.prognozaDan2min.weather[0].icon == "50n")
      this.prognozaDan2min.weather[0].icon = "wi-night-fog";

    if (this.prognozaDan3min.weather[0].icon == "01d")
      this.prognozaDan3min.weather[0].icon = "wi-day-sunny";
    if (this.prognozaDan3min.weather[0].icon == "01n")
      this.prognozaDan3min.weather[0].icon = "wi-night-clear";

    if (this.prognozaDan3min.weather[0].icon == "02d")
      this.prognozaDan3min.weather[0].icon = "wi-day-cloudy";
    if (this.prognozaDan3min.weather[0].icon == "02n")
      this.prognozaDan3min.weather[0].icon = "wi-night-alt-cloudy";

    if (this.prognozaDan3min.weather[0].icon == "03d")
      this.prognozaDan3min.weather[0].icon = "wi-cloud";
    if (this.prognozaDan3min.weather[0].icon == "03n")
      this.prognozaDan3min.weather[0].icon = "wi-cloud";

    if (this.prognozaDan3min.weather[0].icon == "04d")
      this.prognozaDan3min.weather[0].icon = "wi-cloudy";
    if (this.prognozaDan3min.weather[0].icon == "04n")
      this.prognozaDan3min.weather[0].icon = "wi-cloudy";

    if (this.prognozaDan3min.weather[0].icon == "09d")
      this.prognozaDan3min.weather[0].icon = "wi-day-showers";
    if (this.prognozaDan3min.weather[0].icon == "09n")
      this.prognozaDan3min.weather[0].icon = "wi-night-showers";

    if (this.prognozaDan3min.weather[0].icon == "10d")
      this.prognozaDan3min.weather[0].icon = "wi-day-rain";
    if (this.prognozaDan3min.weather[0].icon == "10n")
      this.prognozaDan3min.weather[0].icon = "wi-night-alt-rain";

    if (this.prognozaDan3min.weather[0].icon == "11d")
      this.prognozaDan3min.weather[0].icon = "wi-day-thunderstorm";
    if (this.prognozaDan3min.weather[0].icon == "11n")
      this.prognozaDan3min.weather[0].icon = "wi-night-alt-thunderstorm";

    if (this.prognozaDan3min.weather[0].icon == "13d")
      this.prognozaDan3min.weather[0].icon = "wi-day-snow";
    if (this.prognozaDan3min.weather[0].icon == "13n")
      this.prognozaDan3min.weather[0].icon = "wi-night-alt-snow";

    if (this.prognozaDan3min.weather[0].icon == "50d")
      this.prognozaDan3min.weather[0].icon = "wi-day-fog";
    if (this.prognozaDan3min.weather[0].icon == "50n")
      this.prognozaDan3min.weather[0].icon = "wi-night-fog";


    if (this.prognozaDan4min.weather[0].icon == "01d")
      this.prognozaDan4min.weather[0].icon = "wi-day-sunny";
    if (this.prognozaDan4min.weather[0].icon == "01n")
      this.prognozaDan4min.weather[0].icon = "wi-night-clear";

    if (this.prognozaDan4min.weather[0].icon == "02d")
      this.prognozaDan4min.weather[0].icon = "wi-day-cloudy";
    if (this.prognozaDan4min.weather[0].icon == "02n")
      this.prognozaDan4min.weather[0].icon = "wi-night-alt-cloudy";

    if (this.prognozaDan4min.weather[0].icon == "03d")
      this.prognozaDan4min.weather[0].icon = "wi-cloud";
    if (this.prognozaDan4min.weather[0].icon == "03n")
      this.prognozaDan4min.weather[0].icon = "wi-cloud";

    if (this.prognozaDan4min.weather[0].icon == "04d")
      this.prognozaDan4min.weather[0].icon = "wi-cloudy";
    if (this.prognozaDan4min.weather[0].icon == "04n")
      this.prognozaDan4min.weather[0].icon = "wi-cloudy";

    if (this.prognozaDan4min.weather[0].icon == "09d")
      this.prognozaDan4min.weather[0].icon = "wi-day-showers";
    if (this.prognozaDan4min.weather[0].icon == "09n")
      this.prognozaDan4min.weather[0].icon = "wi-night-showers";

    if (this.prognozaDan4min.weather[0].icon == "10d")
      this.prognozaDan4min.weather[0].icon = "wi-day-rain";
    if (this.prognozaDan4min.weather[0].icon == "10n")
      this.prognozaDan4min.weather[0].icon = "wi-night-alt-rain";

    if (this.prognozaDan4min.weather[0].icon == "11d")
      this.prognozaDan4min.weather[0].icon = "wi-day-thunderstorm";
    if (this.prognozaDan4min.weather[0].icon == "11n")
      this.prognozaDan4min.weather[0].icon = "wi-night-alt-thunderstorm";

    if (this.prognozaDan4min.weather[0].icon == "13d")
      this.prognozaDan4min.weather[0].icon = "wi-day-snow";
    if (this.prognozaDan4min.weather[0].icon == "13n")
      this.prognozaDan4min.weather[0].icon = "wi-night-alt-snow";

    if (this.prognozaDan4min.weather[0].icon == "50d")
      this.prognozaDan4min.weather[0].icon = "wi-day-fog";
    if (this.prognozaDan4min.weather[0].icon == "50n")
      this.prognozaDan4min.weather[0].icon = "wi-night-fog";





  }
  kelvinToCelsius(temp: number) {
    return Math.round((temp - 273.15) * 100) / 100;
  }

  meniToggle() {
    this.meniVidljiv = !this.meniVidljiv;
  }
  skloniPoruku() {
    this.podaciTrazeni = false;
  }
  prikaziStatistiku(id: number) {
    this.statistika = true;
    this.izabranaPlantaza = {};
    this.izabranaPlantaza.id = id;
    this.http.get(`users/informacijeOZemljistu/${id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.chartdata = data;
        if (data.success) {
          this.imaPodataka = true;
          this.vidljivostchart = true;
          this.lineChartData = this.chartdata.data;
          this.lineChartLabels = this.chartdata.labels;

        }
        else {
          this.imaPodataka = false;
          this.podaciTrazeni = true;
          setTimeout(() => {
            this.podaciTrazeni = false;
          }, 5000);
          return;

        }

      },
      err => console.log(err),
      () => console.log('Completed'));

    this.http.get(`users/moisture/${id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.barData = data;

        if (this.barData.success) {
          this.vidljivostchartBar = true;
          this.barChartData = this.barData.data;
          this.barChartLabels = this.barData.labels;

        }

      },
      err => console.log(err),
      () => console.log('Completed'));


    this.http.get(`plantations/userPlantation/${id}`)
      .map(res => res.json())
      .subscribe(data => {
        var coords = data;
        this.coordinates = coords[0].coordinates;
        var xmin = this.INF, xmax = -this.INF, ymin = this.INF, ymax = -this.INF;
        console.log(this.coordinates);
        for (var i = 0; i < this.coordinates[0].length; i++) {

          if (xmin > this.coordinates[0][i][0]) xmin = this.coordinates[0][i][0];
          if (xmax < this.coordinates[0][i][0]) xmax = this.coordinates[0][i][0];
          if (ymin > this.coordinates[0][i][1]) ymin = this.coordinates[0][i][1];
          if (ymax < this.coordinates[0][i][1]) ymax = this.coordinates[0][i][1];
        }
        this.centerX = xmin + ((xmax - xmin) / 2);
        this.centerY = ymin + ((ymax - ymin) / 2);
        this.uzmiPodatkeOTemperaturi();


      },
      err => console.log(err),
      () => console.log('Completed'));


  }

  uzmiPodatkeOTemperaturiStat() {

    console.log(this.centerY + " : " + this.centerX);
    this.http.get(`stats/tempStat/${this.izabranaPlantaza.id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.temperaturaStat = data;
        var datac = [];
        var labels = [];
        if (data == false) return;
        console.log("!");
        console.log(this.temperaturaStat);
        for (var i = 0; i < this.temperaturaStat.length; i++) {

          datac.push(this.temperaturaStat[i].value);
          labels.push(this.temperaturaStat[i].date);
        }
        this.radarChartLabels = labels;

        this.radarChartData = [{ data: datac, label: "temperatura" }];
        this.vidljivostRadar = true;

      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  vratiNaPrikaz() {
    this.sideBarVidljiv = false;
    this.vidljivostchart = false;
    this.vidljivostchartBar = false;
    this.vidljivostRadar = false;
    this.podaciTrazeni = false;
    this.imaPodataka = false;

  }
  ngOnInit() {
    this.selectedLang = this.meniMultiLang[this.lang];

    this.d = new Date();
    this.date = this.d.getDate();
    this.day = this.d.getDay();

    this.mon = this.month[this.d.getMonth()];
    this.localStorageService.remove("guest");
    this.permService.getPerms().subscribe(data => {
      this.dozvole = data;
      if (this.dozvole.guest != undefined) this.localStorageService.set("guest", this.dozvole.guest);
      if (this.dozvole.guest == true) {
        /*  $.getJSON('//freegeoip.net/json/?callback=?', function(data) {
         this.lokacija=data;
         console.log(  this.lokacija["latitude"]);
         
       });*/
        this.http.get('//freegeoip.net/json/?callback')
          .map(res => res.json())
          .subscribe(data => {
            this.lokacija = data;
            console.log(this.lokacija);
            this.uzmiPodatkeOTemperaturiGost();
            this.uzmiPodatkeOPrognoziGost();
          },
          err => console.log(err),
          () => console.log('Completed'));

      }
      this.http.get(`permisions/userIsOwner`)
        .map(res => res.json())
        .subscribe(data => {
          this.isOwner = data.owner;
        },
        err => console.log(err),
        () => console.log('Completed'));
      this.http.get(`sessions/LogovaniKorisnik`)
        .map(res => res.json())
        .subscribe(data => {
          this.user = data;
          this.uzmiBoje();
          this.uzmiLang();
          if (this.user.success === undefined) {
            this.vidljivost = true;
            this.popuniTabelu();
            this.popuniTabelu1();

            //this.preuzmiStatistiku();
          }

        },
        err => console.log(err),
        () => console.log('Completed'));

    });

  }

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

  popuniTabelu() {
    // window.alert("tu sam!");
    var i: number;
    this.http.get(`users/prikaziPlantaze/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.vrste = data;

        for (var i = 0; i < this.vrste.length; i++) {
          this.vrste[i].dozvole = this.dozvole.plantaze.find(x => x.id == this.vrste[i].id).dozvole;
        }
        // window.alert(this.vrste[0].name);
      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  popuniTabelu1() {

    var i: number;
    this.http.get(`users/prikaziImanje/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.imanja = data;
        this.uzmiDozvoleKodVlasnika();

      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  uzmiDozvoleKodVlasnika() {
    this.http.get(`permisions/dozvoleKodVlasnika`)
      .map(res => res.json())
      .subscribe(data => {
        this.dozvoleKodVlasnika = data;
        if (this.imanja === undefined || this.dozvoleKodVlasnika === undefined || this.dozvoleKodVlasnika.dozvole === undefined) return;
        for (var i = 0; i < this.imanja.length; i++) {
          this.imanja[i].dozvole = this.dozvoleKodVlasnika.dozvole.find(x => x.vlasnik == this.imanja[i].idOwner);
        }

      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  Obrisi1() {
    var podatak: any;
    var value = this.imanjeZaBrisanje;
    this.http.get(`users/obrisiImanje/${value}`)
      .map(res => res.json())
      .subscribe(data => {
        podatak = data;
        if (podatak.success) {
          this.popuniTabelu1();
          this.popuniTabelu();
        }

      },
      err => console.log(err),
      () => console.log('Brise plantazu'));

  }


  smeDaGleda(id) {

    return true;

  }

  Obrisi() {

    var idPlant = this.plantazaZaBrisanje;
    var podatak: any;
    this.http.get(`users/obrisiPlantazu/${idPlant}`)
      .map(res => res.json())
      .subscribe(data => {
        podatak = data;
        if (podatak.success) {
          if (this.trenutni == idPlant) {
            document.getElementById('mapID').innerHTML = "";
            this.prikaz = false;
          }

          this.popuniTabelu();
        }

      },
      err => console.log(err),
      () => console.log('Brise plantazu'));

  }

  AzurirajParcelu(value) {
    this.localStorageService.set("idParcele", value);
    this.router.navigate(['./updateparcel']);
    this.http.get(`sessions/LogovaniKorisnik`)
  }

  AzurirajPlant(value) {
    var idPlant = value;
    this.localStorageService.set("idPlantaze", value);
    this.router.navigate(['./updateplantation']);
    this.http.get(`sessions/LogovaniKorisnik`)
  }
  //chart


  // events
  public chartClicked(e: any): void {
    console.log(e);
  }

  public chartHovered(e: any): void {
    console.log(e);
  }
  public lineChartData: Array<any>;
  public lineChartLabels: Array<any>;
  public lineChartOptions: any = {
    responsive: true
  };
  public lineChartColors: Array<any> = [
    { // dark blue
      backgroundColor: 'rgba(12, 16, 127,0.2)',
      borderColor: 'rgba(12, 16, 127,1)',
      pointBackgroundColor: 'rgba(12, 16, 127,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(12, 16, 127,1)'
    },
    { // grey
      backgroundColor: 'rgba(148,159,177,0.2)',
      borderColor: 'rgba(148,159,177,1)',
      pointBackgroundColor: 'rgba(148,159,177,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(148,159,177,0.8)'
    },
    { // dark grey
      backgroundColor: 'rgba(77,83,96,0.2)',
      borderColor: 'rgba(77,83,96,1)',
      pointBackgroundColor: 'rgba(77,83,96,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(77,83,96,1)'
    },
    { // light grey
      backgroundColor: 'rgba(35,42,50,0.2)',
      borderColor: 'rgba(35,42,50,1)',
      pointBackgroundColor: 'rgba(35,42,50,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(35,42,50,0.8)'
    },
    { // dark red
      backgroundColor: 'rgba(158, 0, 0,0.2)',
      borderColor: 'rgba(158, 0, 0,1)',
      pointBackgroundColor: 'rgba(158, 0, 0,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(158, 0, 0,1)'
    },
    { // red
      backgroundColor: 'rgba(224, 15, 15,0.2)',
      borderColor: 'rgba(224, 15, 15,1)',
      pointBackgroundColor: 'rgba(224, 15, 15,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(224, 15, 15,1)'
    },
    { // light red
      backgroundColor: 'rgba(247, 91, 91,0.2)',
      borderColor: 'rgba(247, 91, 91,1)',
      pointBackgroundColor: 'rgba(247, 91, 91,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(247, 91, 91,1)'
    },

    { //  blue
      backgroundColor: 'rgba(12, 16, 127,0.2)',
      borderColor: 'rgba(12, 16, 127,1)',
      pointBackgroundColor: 'rgba(12, 16, 127,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(12, 16, 127,1)'
    },
    { // light blue
      backgroundColor: 'rgba(98, 178, 247,0.2)',
      borderColor: 'rgba(98, 178, 247,1)',
      pointBackgroundColor: 'rgba(98, 178, 247,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(98, 178, 247,1)'
    },
    { //  green
      backgroundColor: 'rgba((3, 61, 155,0.2)',
      borderColor: 'rgba((3, 61, 155,1)',
      pointBackgroundColor: 'rgba(3, 61, 155,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(3, 61, 155,1)'
    },
    { // light green
      backgroundColor: 'rgba(67, 153, 168,0.2)',
      borderColor: 'rgba(67, 153, 168,1)',
      pointBackgroundColor: 'rgba(67, 153, 168,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(67, 153, 168,1)'
    },
    { // dark green
      backgroundColor: 'rgba(1, 33, 86,0.2)',
      borderColor: 'rgba(1, 33, 86,1)',
      pointBackgroundColor: 'rgba(1, 33, 86,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(1, 33, 86,1)'
    },
    { // dark grey
      backgroundColor: 'rgba(1, 9, 22,0.2)',
      borderColor: 'rgba(1, 9, 22,1)',
      pointBackgroundColor: 'rgba(1, 9, 22,1)',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: 'rgba(1, 9, 22,1)'
    }
  ];
  public lineChartLegend: boolean = true;
  public lineChartType: string = 'line';





  public barChartOptions: any = {
    scaleShowVerticalLines: false,
    responsive: true
  };
  public barChartLabels: any[];
  public barChartType: string = 'bar';
  public barChartLegend: boolean = true;

  public barChartData: any[];

  // events
  public chartbarClicked(e: any): void {
    console.log(e);
  }

  public chartbarHovered(e: any): void {
    console.log(e);
  }

  ///////////////////////////////////////////////////////////////


  public radarChartLabels: any = [];

  public radarChartData: any = [];
  public radarChartType: string = 'bar';

  // events
  public chartradarClicked(e: any): void {
    console.log(e);
  }

  public chartradarHovered(e: any): void {
    console.log(e);
  }
  proveriZahtev() {
    var pom1: any;
    this.http.get(`users/proveriZahtevv/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        pom1 = data;
        if (pom1.success) {
          this.postojiUBazi = true;

        }

      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  uzmiBoje() {

    this.http.get(`users/getUserColor/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.color = data;
        console.log(this.color);
        if (this.color[0].colorOne == "default")
          this.cssStyle = "";
        else {
          this.cssStyle = this.color[0].colorOne;
          this.cssStyleH = this.color[0].colorOne + "Header";
          this.cssStyleT = this.color[0].colorOne + "Tab";


        }


      },
      err => console.log(err),
      () => console.log('Completed'));

  }


  uzmiLang() {

    this.http.get(`users/getUserLang/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.lang = data;

        this.selectedLang = this.meniMultiLang[this.lang[0]["lang"]];

      },
      err => console.log(err),
      () => console.log('Completed'));

  }


posaljiZahtev1() {
 

    var pom1: any;
    this.http.get(`users/proveriZahtevv/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        pom1 = data;
        if (pom1.success) {
          var pom: any;
          this.http.get(`users/posaljiZahtevAdminu/${this.user.id}`)
            .map(res => res.json())
            .subscribe(data => {
              pom = data;
              if (pom.success) {
                this.poslatZahtev = true;
                this.postojiUBazi = false;
              }
            },
            err => console.log(err),
            () => console.log('Completed'));
        }
        else {
          this.postojiUBazi = true;
          this.poslatZahtev = false;
        }
      },
      err => console.log(err),
      () => console.log('Completed'));


  }


}

interface koord {
  lat,
  lng
}