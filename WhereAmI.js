
/* GLOBAL VARS */
var startAddress;  // DOM element
var destAddress;  // DOM element
var currentTxtAddress;  // input selected
var selectMsg;  // DOM element
var spanResult;  // DOM element
var divResults;  // DOM element




/* FUNCTIONS */
window.onload = function()
{
	window.startAddress = document.getElementById( "startAddress" );
	window.destAddress = document.getElementById( "destAddress" );
	window.currentTxtAddress = startAddress;
	window.selectMsg = document.getElementById( "selectMsg" );
	window.spanResult = document.getElementById( "spanResult" );
	window.divResults = document.getElementById( "divResults" );
	
	selectInput( window.currentTxtAddress );
}


function displayLocation( position )
{
	var latitude = position.coords.latitude;
	var longitude = position.coords.longitude;
	
	proccessAjaxXML( latitude + "," + longitude, position );
}


function errorLocation( error )
{
	var errorTypes = {
		0: "Unknow error",
		1: "Permission denied by user",
		2: "Position is not available",
		3: "Request timed out"
	};
	
	var errormsg = errorTypes[ error.code ];
	
	if ( error.code == 0 || error.code == 2 )  // additional error info
		errormsg += ": " + error.message;

	alert( "Geolocation error: " + errormsg );
}


function proccessAjaxXML( address, ownPosition )
{
	var ajaxObject = new XMLHttpRequest();

	if ( ajaxObject == null || address.length == 0 )
		return false;
	
	ajaxObject.onreadystatechange = function()
	{
		if ( ajaxObject.readyState == 4 )
		{
			var resultXML = ajaxObject.responseXML;

			// add result message			
			divResults.innerHTML = "<hr/><div class='msg' id='selectMsg'>Select result:</div>";

			// add exact own position to result if available
			if ( ownPosition != null )
				divResults.innerHTML += "<table class='result' onclick='resultClickHandler(event)'>" 
					+ "<tr>" + "<th>Address</th>" + "<td><i>Stimated own position</i></td>" + "</tr>"
					+ "<tr>" + "<th>Latitude</th>" + "<td class='data'>" + ownPosition.coords.latitude + "</td>" + "</tr>"
					+ "<tr>" + "<th>Longitude</th>" + "<td class='data'>" + ownPosition.coords.longitude + "</td>" + "</tr>"
					+ "<tr>" + "<th>accuracy</th>" + "<td>" + ownPosition.coords.accuracy + "</td>" + "</tr>"
					+ "<tr>" + "<th>altitude</th>" + "<td>" + ownPosition.coords.altitude + "</td>" + "</tr>"
					+ "<tr>" + "<th>altitudeAccuracy</th>" + "<td>" + ownPosition.coords.altitudeAccuracy + "</td>" + "</tr>"
					+ "<tr>" + "<th>heading</th>" + "<td>" + ownPosition.coords.heading + "</td>" + "</tr>"
					+ "<tr>" + "<th>speed</th>" + "<td>" + ownPosition.coords.speed + "</td>" + "</tr>"
					+ "<tr>" + "<th>timestamp</th>" + "<td>" + new Date( ownPosition.timestamp ) + "</td>" + "</tr>"
					+ "</table><hr/>";

			// add google results
			var result = resultXML.getElementsByTagName( "result" );
			for ( i = 0; i < result.length; i++ )
			{
				var formatted_address = result[i].getElementsByTagName( "formatted_address" )[0].firstChild.data;
				var lat = result[i].getElementsByTagName( "lat" )[0].firstChild.data;
				var lng = result[i].getElementsByTagName( "lng" )[0].firstChild.data;
				
				divResults.innerHTML += "<table class='result' onclick='resultClickHandler(event)'>" 
					+ "<tr>" + "<th>Address</th>" + "<td>" + formatted_address + "</td>" + "</tr>"
					+ "<tr>" + "<th>Latitude</th>" + "<td class='data'>" + lat + "</td>" + "</tr>"
					+ "<tr>" + "<th>Longitude</th>" + "<td class='data'>" + lng + "</td>" + "</tr>"
					+ "</table><hr/>";
			}
		}
		else
			divResults.innerHTML = "<img src='ajax-loader.gif' width='32' height='32'/>";
	}
	
	var url = encodeURI( "https://maps.googleapis.com/maps/api/geocode/xml?" + "address=" + address + "&sensor=false" );
	ajaxObject.open( "GET", url, true );
	ajaxObject.send( null );
}


function introKeyHolder( event )
{
	if ( event.which == 13 )
		proccessAjaxXML( event.currentTarget.value, null );
}


/*
* Sets the current textfield to set addresses
*/
function focusHandler( element )
{
	// Set the current textfield
	window.currentTxtAddress = element;
	
	// sets color for textfield selected and textfield unselected
	selectInput( element );
}


function ownPositionHandler()
{
	if ( navigator.geolocation )
		navigator.geolocation.getCurrentPosition( displayLocation, errorLocation );
	else
		alert( "Browser with no geolocation." );
}


function distanceHandler()
{
	var distance;
	var start = getCoordsFromString( startAddress.value );
	var dest = getCoordsFromString( destAddress.value );

	if ( start != null && dest != null )
	{
		distance = distanceHaversine( start, dest );	
		spanResult.innerHTML = "<p><strong>" + distance.toFixed( 6 ) + "</strong><i> km</i>"
			+ "<br/><strong>" + ( distance * 1000 ).toFixed( 3 ) + "</strong><i> m</i></p>";
	}
	else
		spanResult.innerHTML = "<strong>---</strong><i> km</i>";
}


function resultClickHandler( event )
{
	var element = event.currentTarget;
	var lat = parseFloat( element.getElementsByClassName( "data" )[0].innerHTML );
	var lng = parseFloat( element.getElementsByClassName( "data" )[1].innerHTML );
	window.currentTxtAddress.value = lat + ", " + lng;
}


function resetHandler()
{
	window.startAddress.value = window.destAddress.value = "";
	window.divResults.innerHTML = window.spanResult.innerHTML = "";
}


function antipodesHandler()
{
	var point = getCoordsFromString( window.currentTxtAddress.value );
	
	if ( point == null )
	{
		alert( "Put address in numeric 'lat,long' format" );
		return;
	}

	window.currentTxtAddress.value = -point.latitude + "," + ( point.longitude < 0 ? point.longitude + 180 : point.longitude - 180 );
}


function goToGoogleHandler( input )
{
	window.open( "http://maps.google.com/maps?q=" + encodeURIComponent( input.value ) );
}


function selectInput( input )
{
	input.style.boxShadow = "0 0 10px blue";	
	if ( input == startAddress )
		window.destAddress.style.boxShadow = "none";
	else
		window.startAddress.style.boxShadow = "none";
}


function distanceHaversine( start, dest )
{
	var startLat = degreesToRadians( start.latitude );
	var startLong = degreesToRadians( start.longitude );
	var destLat = degreesToRadians( dest.latitude );
	var destLong = degreesToRadians( dest.longitude );
	
	const Radius = 6371.0; // Earth main radius
	
	return Math.acos( Math.sin( startLat ) * Math.sin( destLat )
				+ Math.cos( startLat ) * Math.cos( destLat )
				* Math.cos( startLong - destLong )
			) * Radius;
}


function degreesToRadians( degrees )
{
	return degrees * Math.PI / 180.0;
}


function getCoordsFromString( sCoords )
{
	var coords = sCoords.split( "," );

	if ( coords.length != 2 )
		return null;

	var lat = parseFloat( coords[0] );
	if ( isNaN( lat ) )
		return null;

	var long = parseFloat( coords[1] );
	if ( isNaN( long ) )
		return null;

	return { latitude: lat, longitude: long };
}
