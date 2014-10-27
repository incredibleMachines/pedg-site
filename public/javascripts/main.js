
var nav, featured
var aspect=16/9, videoIndex=0
var myPlayer

//var videoPlay=["http://player.vimeo.com/external/77705083.hd.mp4?s=8b1c0a07e267f56b853cd1496e5b6a02","http://player.vimeo.com/external/74880182.hd.mp4?s=9f183b81821170e8fd279c89f55cf021","http://player.vimeo.com/external/77457100.hd.mp4?s=8ccf2b3c4d0af1c04ca48ea87335f154"]

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
    callbackBefore: beforeScroll,/*, // Function to run before scrolling*/
    callbackAfter: function ( toggle, anchor ) {
      //console.log(anchor)
    } // Function to run after scrolling */
  });
  $('#testimonials').slidesjs({
    height:240,
    navigation: {active:true,effect:'slide'},
    pagination: {active:false}
  })
  $('#process .slideshow').slidesjs({
    width: 960,
    height:485,
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
	  		{ type: "video/mp4", src: videoPlay[videoIndex] },
	 		 // { type: "video/ogg", src: "/videos/homepage/"+videoPlay[videoIndex].ogv }
		])
    myPlayer.volume(0)
    userResize();
    myPlayer.controls(false);
    myPlayer.on('ended',playNext);
    $('#featured #text').fadeOut('slow',function(){
      $('#featured #text').html(videoText[videoIndex])
      $('#featured #text').fadeIn('slow')
    })

    //once video loads handle page navigation
    if(project != null){
      populateProject(project,function(){
        //smoothScroll.destroy();
        smoothScroll.animateScroll( null, '#portfolio',{offset: nav.offsetHeight,updateURL:false,easing:'easeOutCubic',speed:1750} );
      })
    }
    if(page != null){
      smoothScroll.animateScroll( null, page,{offset: nav.offsetHeight,updateURL:false,easing:'easeOutCubic',speed:1750} );
    }

  })

  //window.addEventListener('resize', userResize, false);

  //check for nav clicks

  $('#featured ul li a').click(function(){
    var $this = $(this)
    if(!$this.hasClass('active')){
      playSelected($this.attr('class'))
    }
    //alert($(this).attr('class'))
  })
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
    if(window.history.pushState){
      //console.log(anchor)
      var val = anchor.replace('#','')
      window.history.pushState('/'+val+'/'+slug,'/'+val+'/'+slug,'/'+val+'/'+slug)
    }
    $.ajax({
            type:"POST",
            url:"/portfolio/"+slug,

    }).done(function(json){
        //console.log(JSON.stringify(json))
        populateProject(json,function(){})
    })

  }else{
    //history.pushState
    if(window.history.pushState){
      //console.log(anchor)
      var val = anchor.replace('#','')
      //console.log(val)
      if(val == 'featured') val =''
      window.history.pushState('/'+val,'/'+val,'/'+val)
    }
  }
}

$('.active .close-active').click(function(e){
  $('.active').hide();
  if(window.history.pushState){
    window.history.pushState('/portfolio','portfolio','/portfolio')
  }
})

$('#featured #nav-left').click(function(e){
  playPrev()
})

$('#featured #nav-right').click(function(e){
  playNext()
})

$('#header ul li').click(function(e){
  if($('#mobile-expand').hasClass('active')){
    $('#mobile-expand').removeClass('active')
    $('#header li').css('display','none')
    $('#header').height(150)
  }
}
)

$('#mobile-expand').click(function(e){
  if($('#mobile-expand').hasClass('active')){
    $('#mobile-expand').removeClass('active')
    $('#header li').css('display','none')
    $('#header').height(150)
  }
  else{
    $('#mobile-expand').addClass('active')
    $('#header ul li').css('display','block')
    $('#branding').css('display',"none")
    $('#header').height(550)
  }
})

function hasClass(element,cls){
  return (' ' + element.className + ' ').indexOf(' ' + cls + ' ') > -1;
}


//VIDEO
function userResize(){
  var width=window.innerWidth
  var height=window.innerHeight-$('#header').height()
  $('#featured').css({
    width:width,
    height:height,
    overflow:'hidden'
  })
  $('#about').css({
    'margin-top':window.innerHeight
  })
	 if(height<width*(1/aspect)){
	  	myPlayer.dimensions(width,width*(1/aspect))
	  	$('#video-1').css("left",0)
	  	$('#video-1').css("top",(height-myPlayer.height())/2)
	}
	else{
	   myPlayer.dimensions(height*aspect,height);
	   $('#video-1').css("top",0);
	   $('#video-1').css("left",(width-myPlayer.width())/2);
	}
  if(width<1200){
    $('#testimonials img.background').css('margin-left',-(1200-width)/2)
  }
  else{
    $('#testimonials img.background').css('margin-left',0)
  }

  $('#portfolio .active #project-desc').height($('#portfolio .active #project-desc .details').outerHeight())
}

function playNext(){
  $('#video-1').fadeOut('slow', function(){
    $('li a.'+videoIndex+'.active').removeClass('active')
  	videoIndex++;
  	if(videoIndex>videoPlay.length-1){
  		videoIndex=0;
  	}
    $('li a.'+videoIndex).addClass('active')
  	myPlayer.src([
      { type: "video/mp4", src: videoPlay[videoIndex] },
    ])
    $('#featured #text').fadeOut('slow',function(){
      $('#featured #text').html(videoText[videoIndex])
      $('#featured #text').fadeIn('slow')
    })
    $('#video-1').fadeIn('slow',function(){})
 })
}

function playPrev(){

$('#video-1').fadeOut('slow', function(){
  $('li a.'+videoIndex+'.active').removeClass('active')
  videoIndex--;
  if(videoIndex<0){
    videoIndex=videoPlay.length-1;
  }
  $('li a.'+videoIndex).addClass('active')
  myPlayer.src([
    { type: "video/mp4", src: videoPlay[videoIndex] },
  ])
  $('#featured #text').fadeOut('slow',function(){
    $('#featured #text').html(videoText[videoIndex])
    $('#featured #text').fadeIn('slow')
  })

  $('#video-1').fadeIn('slow',function(){})
})
}

function playSelected(newIndex){
  $('li a.'+videoIndex+'.active').removeClass('active')
  videoIndex = newIndex
  $('li a.'+videoIndex).addClass('active')
  myPlayer.src([
    { type: "video/mp4", src: videoPlay[videoIndex] },
  ])
  $('#featured #text').fadeOut('slow',function(){
    $('#featured #text').html(videoText[videoIndex])
    $('#featured #text').fadeIn('slow')
  })

  $('#video-1').fadeIn('slow',function(){})

}

function populateProject(json,cb){
  console.log(json)
  $(".active").show()
  $('#project-featured .slideshow').remove()
  $("#project-desc .desc p").html(json.description)
  $("#project-desc .details .event p").html(json.title)
  $("#project-desc .details .role p").html(json.role)
  $("#project-desc .details .location p").html(json.location)
  $("#project-desc .details .dates p").html(json.dates)
  console.log(json.images)
  var div = $('<div>').addClass(json.slug).addClass('slideshow')
  $("#project-featured").prepend(div)

  //$('div').addClass(slug).appendTo("#project-featured")
  //$("#project-featured").add('div')

  $.each(json.images,function(index,img){
    console.log(img)

    $("<img>").attr('src',img).appendTo("#project-featured ."+json.slug)
  })
  $('#project-featured .'+json.slug).slidesjs({
    width: 960,
    height: 515,
    navigation: {active:true,effect:'slide'}
  })
  $('#project-featured .'+json.slug+" ")
  $('#portfolio .active #project-desc').height($('#portfolio .active #project-desc .details').outerHeight())
  cb()
}
