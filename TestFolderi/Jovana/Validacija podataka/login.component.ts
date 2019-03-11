import { Component, OnInit } from '@angular/core';

import { Headers, Http } from '@angular/http';
import 'rxjs/add/operator/map';
import * as CryptoJS from 'crypto-js';
import {WeatherMapComponent} from '../WeatherMap/weather-map.component'


@Component({
  moduleId: module.id,
  selector: 'app',
  templateUrl: './login.html',
  styles:[ `input.ng-invalid{border-left:5px solid red;}
  input.ng-valid{border-left:5px solid green;}`]
 
})
export class LoginComponent   {

users;
username: string;
password: string;
email:string;
ispis="Aaaaa";
 constructor(private http: Http) {
       
    }
    ngOnInit(){
this.http.get('users/users')
                .map(res => res.json())
        .subscribe(data => this.users = data,
                    err => console.log(err),
                    () => console.log('Completed'));

       
    }
    Login(){
     
      var password =this.stringify(CryptoJS.SHA1(this.password));
 
if(this.find(this.users,this.username,password)!=0) console.log("ok");
else console.log("nije ok");
    }
 stringify(wordArray) {
       
        var words = wordArray.words;
        var sigBytes = wordArray.sigBytes;

      
        var hexChars = [];
        for (var i = 0; i < sigBytes; i++) {
            var bite = (words[i >>> 2] >>> (24 - (i % 4) * 8)) & 0xff;
            hexChars.push((bite >>> 4).toString(16));
            hexChars.push((bite & 0x0f).toString(16));
        }

        return hexChars.join('');
    }
    find(array,username,password){
      for(var i=0;i<array.length;i++) if(array[i].username==username && array[i].password==password) return 1;
      return 0;
    }

    onSubmit(value:any) {
        console.log(value);
    }
 
}