import { Component, OnInit } from '@angular/core';

import { Headers, Http } from '@angular/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { PermService } from "../services/perm-service.service"
import { RouterModule, Routes, Router } from '@angular/router';
declare var document: any;
@Component({
  selector: 'app-meni',
  templateUrl: './meni.component.html',
  styleUrls: ['./meni.component.css']
})
export class MeniComponent implements OnInit {



  vidljivost = false;
  meniVidljiv = false;
  dozvoleMeni: any;
  user: any;
  vrste: any;
  prvihPet: any = [];
  poslatePoruke: any = [];
  primljenePoruke: any = [];
  porukaPoslata: boolean = false;
  brojPoruka: any;
  obavestenjaVidljiva: boolean = false;
  obavestenjaStigla: boolean = false;
  tip: string[];
  obavestenja: any;
  procitano: boolean = false;
  obrisano: boolean = false;
  ime: any;
  naslov: any;
  email: any;
  poruka: any;
  selectedMessage: any;
  porukeVidljive: boolean = false;
  showMess: boolean = false;
  constructor(private permService: PermService, private http: Http, private localStorageService: LocalStorageService, private router: Router) {
    console.log(this.router.url);
  }
  toggleFullscreen() {
     var isInFullScreen = (document.fullscreenElement && document.fullscreenElement !== null) ||
        (document.webkitFullscreenElement && document.webkitFullscreenElement !== null) ||
        (document.mozFullScreenElement && document.mozFullScreenElement !== null) ||
        (document.msFullscreenElement && document.msFullscreenElement !== null);

    var docElm = document.documentElement;
    if (!isInFullScreen) {
        if (docElm.requestFullscreen) {
            docElm.requestFullscreen();
        } else if (docElm.mozRequestFullScreen) {
            docElm.mozRequestFullScreen();
        } else if (docElm.webkitRequestFullScreen) {
            docElm.webkitRequestFullScreen();
        } else if (docElm.msRequestFullscreen) {
            docElm.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
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
  odgovori(owner, worker, role, accepted) {

    this.http.get(`users/dodajRadnika/${owner}/${worker}/${role}/${accepted}`)
      .map(res => res.json())
      .subscribe(data => {
        this.uzmiObavestenja();

      },
      err => console.log(err),
      () => console.log('Completed'));
  }
  goToMessage(poruka: any) {
    this.selectedMessage = { id: poruka.id };
    this.router.navigate(['./msg', this.selectedMessage]);
  }
  prikaziPlantazu() {

    alert("prikazi je legendo!");

  }



  meniToggle() {
    this.obavestenjaVidljiva = false;
    this.porukeVidljive = false;
    this.showMess = false;
    this.meniVidljiv = !this.meniVidljiv;

  }
  obavestenjaToggle() {

    this.meniVidljiv = false;
    this.porukeVidljive = false;
    this.showMess = false;
    this.obavestenjaVidljiva = !this.obavestenjaVidljiva;

  }
  porukeToggle() {
    this.meniVidljiv = false;
    this.obavestenjaVidljiva = false;
    this.showMess = !this.showMess;
    this.porukeVidljive = !this.porukeVidljive;
  }


  ngOnInit() {
    this.permService.getPerms().subscribe(dat => {
      this.dozvoleMeni = dat;
      console.log("dozvole");
      console.log(this.dozvoleMeni.guest);
      if (this.dozvoleMeni.guest != undefined) this.localStorageService.set("guest", this.dozvoleMeni.guest);
      this.http.get(`sessions/LogovaniKorisnik`)
        .map(res => res.json())
        .subscribe(data => {
          this.user = data;
          if (this.user.success === undefined) {
            this.vidljivost = true;

          }

        },
        err => console.log(err),
        () => console.log('Completed'));
      this.uzmiObavestenja();
      this.getMessages();
      this.getSentMessages();
    });

  }
  uzmiObavestenja() {
    this.http.get(`users/dohvatiObavestenja`)
      .map(res => res.json())
      .subscribe(data => {
        this.obavestenja = data;
        if (this.obavestenja !== undefined) {
          console.log("stiglo");
          for (var i = 0; i < 5; i++)
            if (this.obavestenja[i] !== undefined) this.prvihPet.push(this.obavestenja[i]);
            else break;
          this.obavestenjaStigla = true;
        }

      },
      err => console.log(err),
      () => console.log('Completed'));

  }

  getMessages() {
    this.http.get('messages/getMessages')
      .map(res => res.json())
      .subscribe(data => {
        this.primljenePoruke = data;
        this.brojPrimljenih();
      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  getSentMessages() {
    this.http.get('messages/getSentMessages')
      .map(res => res.json())
      .subscribe(data => {
        this.poslatePoruke = data;
      },
      err => console.log(err),
      () => console.log('Completed'));

  }

  brojPrimljenih() {
    var poruke = this.primljenePoruke.filter(x => x.read == 1);
    this.brojPoruka = poruke.length;
    console.log(poruke.length);
  }
  sendMessage(username, text) {
    this.http.get(`messages/sendMessage/${username}/${text}`)
      .map(res => res.json())
      .subscribe(data => {
        if (data.success)
          this.porukaPoslata = true;
        else
          this.porukaPoslata = false;
      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  markAsRead(procitanePoruke) {
    this.http.get(`messages/markAsRead/${procitanePoruke}`)
      .map(res => res.json())
      .subscribe(data => {
        if (data.success)
          this.procitano = true;
        else
          this.procitano = false;
      },
      err => console.log(err),
      () => console.log('Completed'));

  }
  deleteMessages(porukeZaBrisanje) {
    this.http.get(`messages/deleteMessages/${porukeZaBrisanje}`)
      .map(res => res.json())
      .subscribe(data => {
        if (data.success)
          this.obrisano = true;
        else
          this.obrisano = false;
      },
      err => console.log(err),
      () => console.log('Completed'));

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

}