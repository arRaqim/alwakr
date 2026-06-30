function fancyOpen(){
    $('.zero-directorscut').animate({opacity: 1}, 100, 'linear', function() {
        $.fancybox.open($('.zero-directorscut'));
        $('.zero-directorscut').addClass('on');
    });
}

$(document).ready( function(){
    fancyOpen();
});


if ((navigator.userAgent.indexOf('iPhone') > 0 && navigator.userAgent.indexOf('iPad') == -1) || navigator.userAgent.indexOf('iPod') > 0 || navigator.userAgent.indexOf('Android') > 0) {
	location.href = 'sp/';
}
<!-- analytics -->
 var _gaq = _gaq || [];
 _gaq.push(['_setAccount', 'UA-2544992-1']);
 _gaq.push(['_trackPageview']);

(function() {
 var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
 ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
 var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();
<!-- end analytics -->
var $wrapper, $main, $bg;
var imgW, imgH;

var newContents = ['NEWS'];
var newContentsMini = [];

$(document).ready(function(e) {
	$wrapper = $("#wrapper"),
	$main = $("#main");
  $("#bg").css({backgroundSize: "cover"});
	
	$("#nav #menu a").each(function(index, element) {
		var $cMenu = $(this);
		var cAlt = $cMenu.children("img").attr("alt");
		for (var i=0; i < newContents.length; i++){
			if(newContents[i] == cAlt) {
				$cMenu.append('<span class="new">NEW</span>');
				return true;
			}
		}
		for (var i=0; i < newContentsMini.length; i++){
			if(newContentsMini[i] == cAlt) {
				$cMenu.append('<span class="new mini">NEW</span>');
				return true;
			}
		}
	});
	
	$(window).resize(function(){
		if($wrapper.height() >= 945) $wrapper.addClass("gt-945");
		else $wrapper.removeClass("gt-945");
		if($wrapper.height() <= 880) $wrapper.addClass("lt-800");
		else $wrapper.removeClass("lt-800");
		$(".logo-mini img").height($wrapper.height()*0.213);
	})
	$(window).resize();
	
	$(".oc-button").on("click", function(){
		$(window).scrollTop(0);
		$("#overcontent .current").removeClass("current");
		$("#overcontent " + $(this).attr("href")).addClass("current");
		$("#overcontent").addClass("visible");
		return false;
	})
	
	$("#overcontent #btn-close").on("click", function(){
		$("#overcontent").removeClass("visible");
	})
	
	if($(".fancybox").length > 0){
		$(".fancybox").fancybox({
			padding:'0px',
			openEffect	: 'elastic',
			closeEffect	: 'elastic'
		});
	}

	$('#banner-close').click(function() {
		$('.bannerArea').fadeOut();
	});

});
