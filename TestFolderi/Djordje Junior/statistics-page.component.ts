import { Component, OnInit } from '@angular/core';

import { Headers, Http } from '@angular/http';
import {ChartComponent} from "../chart-component/chart-component"




@Component({
  moduleId: module.id,
  selector: 'app-root',
  template: `<div style='background-color:white'>
  
  <div>STRANICA ZA PRIKAZ STATISTIKE(D3)</div>
  <input type='number' [(ngModel)]='x'>
  
  <input type='number' [(ngModel)]='y'>
  <button (click)='weatherByCoords()'>prikaz vremena</button>
  <div *ngIf='data'>{{'vreme '+  kelvinToCelsius(data.main.temp)}}</div>
  <chart></chart>
  </div>
  `,


})
export class StatisticsPage implements OnInit {
  data;
  x: number = 44.0174724;
  y: number = 20.8367925;
  constructor(private http: Http) {

  }
  ngOnInit() {
   this.weatherByCoords();

  }

  weatherByCoords(){
 this.http.get("http://openweathermap.org/data/2.5/weather?lat="+this.x+"&lon="+this.y+"&appid=0d009ab575deb18aa53e1930f40234c7")
      .map(res => res.json())
      .subscribe(data => {
        this.data = data;

      },
      err => console.log(err),
      () => console.log('Completed'));
  }

  kelvinToCelsius(temp: number) {
    return Math.round((temp - 273.15) * 100) / 100;
  }
}