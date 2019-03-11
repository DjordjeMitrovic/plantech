import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, Directive, Output, HostListener, EventEmitter } from '@angular/core';
import { Headers, Http } from '@angular/http';
import { LocalStorageService } from 'angular-2-local-storage';
import { PermService } from "../services/perm-service.service"
import { RouterModule, Routes, Router } from '@angular/router';
declare var google: any;
import * as jQuery from 'jquery';
@Component({
    moduleId: module.id,
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
@Directive({ selector: '[mouseWheel]' })
export class HomeComponent implements OnInit, AfterViewInit {
 ime: any;
  naslov: any;
  email: any;
  poruka: any;
    poslato=false;
    loginForm=false; 
    Active="loginActive";
    constructor(private permService: PermService, private http: Http, private localStorageService: LocalStorageService, private router: Router) {
    console.log(this.router.url);
  }
 @ViewChild('selectElem') el: ElementRef;

 onScroll(newValue) {
        
    }
  @HostListener("window:scroll", [])
  ngAfterViewInit() {


 jQuery('#loginBtn').click(function(){
    jQuery('#main').addClass('loginActive');
    jQuery('#main').removeClass('singUpActive');
});
 jQuery('#signUpBtn').click(function(){
      jQuery('#main').addClass('singUpActive');
    jQuery('#main').removeClass('loginActive');

});
    jQuery('.circle-container').find('a').click(function(event) {
        event.preventDefault();
      });
  jQuery('.circle-container').find('li').hover(function() {
        jQuery('.circle-container').find('li').removeClass('active');
        jQuery(this).addClass('active');

    if(jQuery(this).data('id')==0)
          jQuery('.circle-container').attr('data-content','Dostupno na svakom uredjaju');
    else	if(jQuery(this).data('id')==1)
        jQuery('.circle-container').attr('data-content','Brzo i lako korišćenje');
    else if(jQuery(this).data('id')==2)
        jQuery('.circle-container').attr('data-content','Lak pregled plantaža na mapi');
    else if(jQuery(this).data('id')==3)
        jQuery('.circle-container').attr('data-content','Statistika svih plantaža');
    else if(jQuery(this).data('id')==4)
        jQuery('.circle-container').attr('data-content','Vremenska prognoza');
    else if(jQuery(this).data('id')==5)
        jQuery('.circle-container').attr('data-content','Kontakt sa svim radnicima');
    else if(jQuery(this).data('id')==6)
        jQuery('.circle-container').attr('data-content','Brza pretraga plantaža i radnika');
    else if(jQuery(this).data('id')==7)
        jQuery('.circle-container').attr('data-content','Pametan sistem');

  });
        jQuery(".twitter").hover(function () {jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-twitter")});
        jQuery(".facebook").hover(function () {jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-facebook")});
        jQuery(".googleplus").hover(function () {jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-googleplus")});
        jQuery(".pinterest").hover(function () {jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-pinterest")});
        jQuery(".dribbble").hover(function () {jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-dribbble")});
        jQuery(".instagram").hover(function () { jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-instagram") });
        jQuery(".codepen").hover(function () { jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-codepen") });
        jQuery(".envelope").hover(function () { jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-envelope") });
        jQuery(".linkedin").hover(function () { jQuery(".skw-page-5 .skw-page__half--right .skw-page__content").toggleClass("color-linkedin") });
		 jQuery(".envelope").click(function () { jQuery("#social").addClass("not-visible") });
		  jQuery(".envelope").click(function () { jQuery("#contact").removeClass("not-visible") });
		  
		    jQuery("#backToSocial").click(function () { jQuery("#contact").addClass("not-visible") });
			 jQuery("#backToSocial").click(function () { jQuery("#social").removeClass("not-visible") });
  jQuery('#proba').click(function(){
  
  });
jQuery(document).ready(function() {

jQuery('#loginBtn').click(function(){
      jQuery('#main').addClass('loginActive');
    jQuery('#main').removeClass('singUpActive');
});
 jQuery('#signUpBtn').click(function(){
    jQuery('#main').addClass('singUpActive');
    jQuery('#main').removeClass('loginActive');

});

jQuery('.one').click(function(){
	scrolling = true;

    jQuery(pgPrefix + 1).addClass("active");

    jQuery(pgPrefix + 2).removeClass("active");
 jQuery(pgPrefix + 3).removeClass("active");
  jQuery(pgPrefix + 4).removeClass("active");
   jQuery(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
    jQuery('.two').click(function(){
	scrolling = true;

    jQuery(pgPrefix + 2).addClass("active");

    jQuery(pgPrefix + 1).removeClass("active");
 jQuery(pgPrefix + 3).removeClass("active");
  jQuery(pgPrefix + 4).removeClass("active");
   jQuery(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
    jQuery('.three').click(function(){
	scrolling = true;

    jQuery(pgPrefix + 3).addClass("active");

    jQuery(pgPrefix + 1).removeClass("active");
 jQuery(pgPrefix + 2).removeClass("active");
  jQuery(pgPrefix + 4).removeClass("active");
   jQuery(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
      jQuery('.four').click(function(){
	
  	scrolling = true;

    jQuery(pgPrefix + 4).addClass("active");

    jQuery(pgPrefix + 1).removeClass("active");
 jQuery(pgPrefix + 2).removeClass("active");
  jQuery(pgPrefix + 3).removeClass("active");
   jQuery(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
      jQuery('.five').click(function(){
	
  
  	scrolling = true;

    jQuery(pgPrefix + 5).addClass("active");

    jQuery(pgPrefix + 1).removeClass("active");
 jQuery(pgPrefix + 2).removeClass("active");
  jQuery(pgPrefix + 4).removeClass("active");
   jQuery(pgPrefix + 3).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
  var curPage = 1;
  var numOfPages = jQuery(".skw-page").length;
  var animTime = 1000;
  var scrolling = false;
  var pgPrefix = ".skw-page-";

  function pagination() {
    scrolling = true;

    jQuery(pgPrefix + curPage).removeClass("inactive").addClass("active");
    jQuery(pgPrefix + (curPage - 1)).addClass("inactive");
    jQuery(pgPrefix + (curPage + 1)).removeClass("active");

    setTimeout(function() {
      scrolling = false;
    }, animTime);
  };

  function navigateUp() {
    if (curPage === 1) return;
    curPage--;
    pagination();
  };

  function navigateDown() {
    if (curPage === numOfPages) return;
    curPage++;
    pagination();
  };

  //Firefox
    $('.skw-pages').bind('DOMMouseScroll', function (e:any) {
      if (e.originalEvent.detail > 0) {
        navigateDown();
        console.log('Down');
      } else {
        navigateUp();
        console.log('Up');
      }

      //prevent page fom scrolling
      return false;
    });

    //IE, Opera, Safari
    $('.skw-pages').bind('mousewheel', function (e:any) {
      if (e.originalEvent.wheelDelta < 0) {
       navigateDown();
        console.log('Down');
      } else {
       navigateUp();
        console.log('Up');
      }

      //prevent page fom scrolling
      return false;
    });

 

  jQuery(document).on("keydown", function(e) {
    if (scrolling) return;
    if (e.which === 38) {
      navigateUp();
    } else if (e.which === 40) {
      navigateDown();
    }
  });

});
  }
  ngOnInit() {

  }
  loginuj()
  {
     console.log("loginuj")
    this.loginForm=true;
  }
  signUpBtn()
  {
     this.Active="singUpActive";
  }
   loginBtn()
  {
     this.Active="loginActive";
  }
    meni()
  {
    this.loginForm=false;
  }
   posalji() {
    var pom3: any;
    this.http.get(`users/posaljiMail2/${this.ime}/${this.naslov}/${this.email}/${this.poruka}`)
      .map(res => res.json())
      .subscribe(data => {
        pom3 = data;
        if (pom3.success) {
            this.poslato=true;
             setTimeout(() => {
                        this.poslato = false;
                    }, 3000);
            this.ime="";
             this.naslov="";
              this.email="";
              this.poruka="";
        }
      },
      err => console.log(err),
      () => console.log('Completed'));
  }


}