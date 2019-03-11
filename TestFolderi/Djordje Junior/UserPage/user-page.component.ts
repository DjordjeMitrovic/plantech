import { Component, OnInit, ChangeDetectorRef } from '@angular/core';

import { Headers, Http } from '@angular/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { RouterModule, Routes, Router } from '@angular/router';
import { MeniComponent } from "../meni/meni.component";
import { PermService } from "../services/perm-service.service";
import { FilterPipe } from '../filter.pipe';
import { ChartComponent } from "../chart-component/chart-component"
import 'rxjs/Rx';

import 'rxjs/add/operator/map';

declare var google: any;
@Component({
  moduleId: module.id,
  selector: 'app-root',
  templateUrl: "./index.html",

})
export class UserPage implements OnInit {
  month = ['Januar', 'Februar', 'Mart', 'April', 'Maj', 'Jun', 'Jul', 'Avgust', 'Septembar', 'Oktobar', 'Novembar', 'Decembar'];
  centerX;
  centerY;
  d;
  date;
  mon;
  public pieChartLabels: string[];
  public pieChartData: number[];
  public pieChartType: string = 'pie';
  vlaznostZemljista;
  private INF = 99999;
  gleda = false;
  sideBarVidljiv = false;
  dozvole: any;
  vidljivost = false;
  meniVidljiv = false;
  stats: any;
  user: any;
  obavestenja: any;
  vrste: any;
  tip: string[];
  ime: any;
  temperatura: any;
  naslov: any;
  email: any;
  poruka: any;
  mapProp = null;
  map = null;
  drawingManager = null;
  prikaz = true;
  trenutni = -1;
  izabranaPlantaza;
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

  posalji() {
    var pom3: any;
    window.alert(this.ime + " " + this.naslov + " " + this.email + " " + this.poruka);
    this.http.get(`users/posaljiMail2/${this.ime}/${this.naslov}/${this.email}/${this.poruka}`)
      .map(res => res.json())
      .subscribe(data => {
        pom3 = data;
        if (pom3.success) {
          window.alert("Poslato!");
        }
      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  initMap(coords) {


    let self = this;
    var nizPoligona = [];
    var poligon = [];
    console.log("A1  " + coords);

    for (var i = 0; i < coords[0].coordinates.length; i++) {
      for (var j = 0; j < coords[0].coordinates[i].length - 1; j++) {
        poligon.push(new google.maps.LatLng(coords[0].coordinates[0][j][1], coords[0].coordinates[0][j][0]));
      }
      nizPoligona.push(poligon);
    }
    console.log("TREBA:  " + JSON.stringify(nizPoligona[0]));
    self.map = new google.maps.Map(document.getElementById('googleMap'), {
      center: nizPoligona[0][0],
      zoom: 7
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

  }

  nazadNaPrikaz() {
    this.sideBarVidljiv = false;
  }
  prikaziPlantazu(value) {
    var coords;
    this.sideBarVidljiv = true;
    this.izabranaPlantaza = this.vrste.find(x => x.id == value);

    this.http.get(`/plantations/userPlantation/${value}`)
      .map(res => res.json())
      .subscribe(data => {

        coords = data;
        console.log("stiglo: " + coords[0].coordinates);
        console.log("Stiglo realno: " + coords + "\n " + JSON.stringify(coords));
        var coordinates = coords[0].coordinates;
        if (this.trenutni == -1 || this.trenutni == value) {
          if (this.prikaz) {

            document.getElementById('mapID').innerHTML = "<div class='col-md-9'><div id='googleMap' style='width: 100%; height: 700px'></div></div>";
            this.initMap(coords);

          } else {
            document.getElementById('mapID').innerHTML = "";
          }
          this.trenutni = value;
          this.prikaz = !this.prikaz;

        } else {
          document.getElementById('mapID').innerHTML = "<div class='col-md-9'><div id='googleMap' style='width: 100%; height: 700px'></div></div>";
          this.initMap(coords);
          this.trenutni = value;
          this.prikaz = false;
        }
        var xmin = this.INF, xmax = -this.INF, ymin = this.INF, ymax = -this.INF;
        for (var i = 0; i < coordinates[0].length; i++) {

          if (xmin > coordinates[0][i][0]) xmin = coordinates[0][i][0];
          if (xmax < coordinates[0][i][0]) xmax = coordinates[0][i][0];
          if (ymin > coordinates[0][i][1]) ymin = coordinates[0][i][1];
          if (ymax < coordinates[0][i][1]) ymax = coordinates[0][i][1];
        }
        this.centerX = xmin + ((xmax - xmin) / 2);
        this.centerY = ymin + ((ymax - ymin) / 2);
        console.log("X: " + this.centerX + " Y: " + this.centerY);
        this.uzmiPodatkeOTemperaturi();
        this.uzmiNutriPodatke();


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

  uzmiPodatkeOTemperaturi() {

    this.http.get("http://api.openweathermap.org/data/2.5/weather?lat=" + this.centerY + "&lon=" + this.centerX + "&units=metric&appid=0d009ab575deb18aa53e1930f40234c7")
      .map(res => res.json())
      .subscribe(data => {

        this.temperatura = data;





      },
      err => console.log(err),
      () => console.log('Completed'));


  }

  kelvinToCelsius(temp: number) {
    return Math.round((temp - 273.15) * 100) / 100;
  }

  meniToggle() {
    this.meniVidljiv = !this.meniVidljiv;
  }
  ngOnInit() {
    this.d = new Date();
    this.date = this.d.getDate();
    this.mon = this.month[this.d.getMonth()];
    this.localStorageService.remove("guest");
    this.permService.getPerms().subscribe(data => {
      this.dozvole = data;
      if (this.dozvole.guest != undefined) this.localStorageService.set("guest", this.dozvole.guest);
      this.http.get(`sessions/LogovaniKorisnik`)
        .map(res => res.json())
        .subscribe(data => {
          this.user = data;
          if (this.user.success === undefined) {
            this.vidljivost = true;
            this.popuniTabelu();
            this.preuzmiStatistiku();

          }

        },
        err => console.log(err),
        () => console.log('Completed'));

    });

  }


  preuzmiStatistiku() {
    this.http.get(`stats/stats`)
      .map(res => res.json())
      .subscribe(data => {
        this.stats = data;


      },
      err => console.log(err),
      () => console.log('Completed'));


  }

  popuniTabelu() {
    var i: number;
    this.http.get(`users/prikaziPlantaze/${this.user.id}`)
      .map(res => res.json())
      .subscribe(data => {
        this.vrste = data;
        for (var i = 0; i < this.vrste.length; i++) {
          this.vrste[i].dozvole = this.dozvole.plantaze.find(x => x.id == this.vrste[i].id).dozvole;
        }
      },
      err => console.log(err),
      () => console.log('Completed'));
  }
  smeDaGleda(id) {

    return true;

  }

  Obrisi(value) {
    window.alert(value + " aaaa");
    var idPlant = value;
    var podatak: any;
    this.http.get(`users/obrisiPlantazu/${idPlant}`)
      .map(res => res.json())
      .subscribe(data => {
        podatak = data;
        if (podatak.success) {
          if (this.trenutni == value) {
            document.getElementById('mapID').innerHTML = "";
            this.prikaz = false;
          }

          this.popuniTabelu();
        }

      },
      err => console.log(err),
      () => console.log('Brise plantazu'));

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

}

interface koord {
  lat,
  lng
}