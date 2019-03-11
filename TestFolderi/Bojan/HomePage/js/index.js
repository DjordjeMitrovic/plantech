$(document).ready(function() {

  var curPage = 1;
  var numOfPages = $(".skw-page").length;
  var animTime = 1000;
  var scrolling = false;
  var pgPrefix = ".skw-page-";
  $('.one').click(function(){
	scrolling = true;

    $(pgPrefix + 1).addClass("active");

    $(pgPrefix + 2).removeClass("active");
 $(pgPrefix + 3).removeClass("active");
  $(pgPrefix + 4).removeClass("active");
   $(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
$('.two').click(function(){
		scrolling = true;

		$(pgPrefix + 2).addClass("active");

		$(pgPrefix + 1).removeClass("active");
	 $(pgPrefix + 3).removeClass("active");
	  $(pgPrefix + 4).removeClass("active");
	   $(pgPrefix + 5).removeClass("active");
		setTimeout(function() {
		  scrolling = false;
		}, animTime);
});
    $('.three').click(function(){
	scrolling = true;

    $(pgPrefix + 3).addClass("active");

    $(pgPrefix + 1).removeClass("active");
 $(pgPrefix + 2).removeClass("active");
  $(pgPrefix + 4).removeClass("active");
   $(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
      $('.four').click(function(){
	
  	scrolling = true;

    $(pgPrefix + 4).addClass("active");

    $(pgPrefix + 1).removeClass("active");
 $(pgPrefix + 2).removeClass("active");
  $(pgPrefix + 3).removeClass("active");
   $(pgPrefix + 5).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
      $('.five').click(function(){
	
  
  	scrolling = true;

    $(pgPrefix + 5).addClass("active");

    $(pgPrefix + 1).removeClass("active");
 $(pgPrefix + 2).removeClass("active");
  $(pgPrefix + 4).removeClass("active");
   $(pgPrefix + 3).removeClass("active");
    setTimeout(function() {
      scrolling = false;
    }, animTime);
  });
  function pagination() {
    scrolling = true;

    $(pgPrefix + curPage).removeClass("inactive").addClass("active");
    $(pgPrefix + (curPage - 1)).addClass("inactive");
    $(pgPrefix + (curPage + 1)).removeClass("active");

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

  $(document).on("mousewheel DOMMouseScroll", function(e) {
    if (scrolling) return;
    if (e.originalEvent.wheelDelta > 0 || e.originalEvent.detail < 0) {
      navigateUp();
    } else { 
      navigateDown();
    }
  });

  $(document).on("keydown", function(e) {
    if (scrolling) return;
    if (e.which === 38) {
      navigateUp();
    } else if (e.which === 40) {
      navigateDown();
    }
  });

});