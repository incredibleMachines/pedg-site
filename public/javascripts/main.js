
var nav, featured
var aspect=16/9
var myPlayer

function init(){
  nav = document.getElementById('header')
  featured = document.getElementById('featured')
  //console.log(nav.offsetHeight)
  //console.log(window.innerHeight)
  window.onscroll = navCheck;
  window.onresize = function(){
                      pageResize() //setfeaturedHeight(window.innerHeight)
                      setfeaturedHeight(window.innerHeight)
                      userResize()
  }
  setfeaturedHeight(window.innerHeight)

  //setupScroll

  smoothScroll.init({
    speed: 1750, // Integer. How fast to complete the scroll in milliseconds
    easing: 'easeOutCubic', // Easing pattern to use
    updateURL: false, // Boolean. Whether or not to update the URL with the anchor hash on scroll
    offset: nav.offsetHeight, // Integer. How far to offset the scrolling anchor location in pixels
    callbackBefore: beforeScroll/*, // Function to run before scrolling
    callbackAfter: function ( toggle, anchor ) {} // Function to run after scrolling */
  });

  $('#testimonials').slidesjs({
    height:240,
    navigation: {active:true,effect:'slide'},
    pagination: {active:false}
  })
  $('#process .slideshow').slidesjs({
    width: 960,
    height: 485,
    navigation: {active:true,effect:'slide'},
    pagination: {active:false}
  })


  //VIDEO PLAYER
  $('.video-js').css('position','absolute')
  videojs("video-1",{width:window.innerWidth, height: window.innerHeight}).ready(function(){
	  myPlayer = this
  	sH = window.innerHeight,
	  sW = window.innerWidth
    myPlayer.src([
	  		{ type: "video/mp4", src: "http://player.vimeo.com/external/77705083.hd.mp4?s=8b1c0a07e267f56b853cd1496e5b6a02" },
	 		 // { type: "video/ogg", src: "/videos/homepage/"+videoPlay[videoIndex].ogv }
		])
    myPlayer.volume(0)
    userResize();
    myPlayer.controls(false);
  })

  //window.addEventListener('resize', userResize, false);
}

/* Front-End Modifications */
function navCheck () {
 //check when scroll changes for nav
 if(window.pageYOffset>( window.innerHeight- nav.offsetHeight )){
   //alert('flip')
   nav.style.top="0px"
   nav.style.marginTop="0px"
   nav.style.position='fixed'
 }else{
   nav.style.top="100%"
   nav.style.marginTop=(nav.offsetHeight*-1)+"px"
   nav.style.position='absolute'
 }
}

function pageResize(){
  setfeaturedHeight(window.innerHeight)
}

function setfeaturedHeight(_height){
  featured.style.height=_height+"px";
}

function beforeScroll(toggle,anchor){
  //console.log(toggle)
  //console.log(toggle.className)
  //console.log(anchor)
  //check if we are scrolling to a page or project
  if(hasClass(toggle,'project')){
    var slug = toggle.getAttribute('data-slug')
    var clss = toggle.className
    console.log(" CLASS NAME: "+clss)
    console.log(" SlUG: "+slug)
    //make ajax request and populate page

    $.ajax({
            type:"POST",
            url:"/portfolio/"+slug,

    }).done(function(json){
        console.log(JSON.stringify(json))
        $(".active").show()
        $("#project-desc .desc p").html(json.description)
        $("#project-desc .details .event p").html(json.title)
        $("#project-desc .details .role p").html(json.role)
        $("#project-desc .details .location p").html(json.location)
        $("#project-desc .details .dates p").html(json.dates)
        console.log(json.images)
        var div = $('<div>').addClass(slug).addClass('slideshow')
        $("#project-featured").html(div)

        //$('div').addClass(slug).appendTo("#project-featured")
        //$("#project-featured").add('div')

        $.each(json.images,function(index,img){
          console.log(img)

          $("<img>").attr('src',img).appendTo("#project-featured ."+slug)
        })
        $('#project-featured .'+slug).slidesjs({
          width: 960,
          height: 516,
          navigation: {active:true,effect:'slide'}
        })
        $('#project-featured .'+slug+" ")
    })

  }else{
    //history.pushState
  }
}

$('.active .close').click(function(e){
  $('.active').hide();
})
function hasClass(element,cls){
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}


//VIDEO
function userResize(){
	if(window.innerHeight<window.innerWidth*(1/aspect)){
    myPlayer.dimensions(window.innerWidth,window.innerHeight)
  	$('#video-1').css("left",0);
  	$('#video-1').css("top",(window.innerHeight-myPlayer.height())/2);
	}
	else{
   myPlayer.dimensions(window.innerWidth*aspect,window.innerHeight);
	 $('#video-1').css("top",0);
	 $('#video-1').css("left",(window.innerWidth-myPlayer.width())/2);
	}

	$('.intro-vid').css("height",myPlayer.height()+parseInt($('#intro-video-1').css('top')));
	$('.intro-vid').css("width",window.innerWidth);
	sH = window.innerHeight;
	sW = window.innerWidth;
}
