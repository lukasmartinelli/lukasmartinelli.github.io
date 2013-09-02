window.onload = function () {
	var sidebar_visible = true;

	document.getElementById('nav-control-toggle').onclick = function(event){ 		
		sidebar_visible = !sidebar_visible;
		document.getElementById('sidebar').style.display = sidebar_visible ? 'block' : 'none';
		event.preventDefault();
	};
};