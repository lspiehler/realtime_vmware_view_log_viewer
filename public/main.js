var containerdiv = document.getElementById('container');
var realtimebtn = document.getElementById('realtimebtn');
var historicalbtn = document.getElementById('historicalbtn');
var searchfiltervalue = document.getElementById('searchfiltervalue');
var searchfilterselect = document.getElementById('searchfilterselect');
var previous = document.getElementById('previous');
var next = document.getElementById('next');
var previousbottom = document.getElementById('previousbottom');
var nextbottom = document.getElementById('nextbottom');
var received = document.getElementById('received');
var filtered = document.getElementById('filtered');
var filteraction = document.getElementById('filteraction');
var rtstat = document.getElementById('rtstat');
var stats = document.getElementById('stats');
var skip = 0;
var maxlogs = 25;
$('.filter-dropdown li > a').click(function(e){
    $('.status').text(this.innerHTML);
});

var viewlog = new viewLog({
	'container': containerdiv,
	'searchFilterValue': searchfiltervalue,
	'searchFilterSelect': searchfilterselect,
	'maxLogs': maxlogs,
	'realTime': true,
	'receivedElem': received,
	'filteredElem': filtered,
	'rtStat': rtstat,
	'filterAction': filteraction
});

function processFilter() {
	if(searchfilterselect.value=="0") {
		searchfiltervalue.setAttribute('placeholder',searchfilterselect[searchfilterselect.selectedIndex].innerText)
		searchfiltervalue.readOnly = true
	} else {
		searchfiltervalue.setAttribute('placeholder',searchfilterselect[searchfilterselect.selectedIndex].innerText)
		searchfiltervalue.readOnly = false;
	}
}

function inValidateResults() {
	var results = containerdiv.childNodes
	for(var i = 0; i<= results.length - 1; i++) {
		try {
			results[i].style.color = 'gray';
		} catch(e) {
			
		}
	}
}

function hideStats() {
	stats.style.display = 'none';
	filtered.innerText = 0;
	received.innerText = 0;
}

function showStats() {
	stats.style.display = 'block';
}

searchfiltervalue.addEventListener("keydown", function(){
	inValidateResults();
	//processFilter();
});

searchfilterselect.addEventListener("change", function(){
	inValidateResults();
	processFilter();
});

function toggleRealtime() {
	if (viewlog.realtimeOn()) {
		viewlog.stopRealtime();
		realtimebtn.setAttribute("class", "btn btn-success btn-lg")
		realtimebtn.innerText = "Start Realtime"
	} else {
		inValidateResults();
		viewlog.startRealtime();
		realtimebtn.setAttribute("class", "btn btn-danger btn-lg")
		showStats();
		realtimebtn.innerText = "Stop Realtime"
	}
}

realtimebtn.addEventListener("click", function(){
	toggleRealtime();
	previous.style.display = 'none';
	previousbottom.style.display = 'none';
	next.style.display = 'none';
	nextbottom.style.display = 'none';
});

next.addEventListener("click", function(){
	skip = skip + maxlogs;
	viewlog.loadHistorical(skip, historicalResponse);
});

previous.addEventListener("click", function(){
	skip = skip - maxlogs;
	viewlog.loadHistorical(skip, historicalResponse);
});

nextbottom.addEventListener("click", function(){
	skip = skip + maxlogs;
	viewlog.loadHistorical(skip, historicalResponse);
});

previousbottom.addEventListener("click", function(){
	skip = skip - maxlogs;
	viewlog.loadHistorical(skip, historicalResponse);
});

var historicalResponse = function(historicalresp) {
	skip = parseInt(historicalresp.Skip)
	if(historicalresp.Skip > 0) {
		previous.style.display = 'inline';
		previousbottom.style.display = 'inline';
	} else {
		previous.style.display = 'none';
		previousbottom.style.display = 'none';
	}
	if(historicalresp.Data.length >= historicalresp.Limit) {
		next.style.display = 'inline';
		nextbottom.style.display = 'inline';
	} else {
		next.style.display = 'none';
		nextbottom.style.display = 'none';
	}
}

historicalbtn.addEventListener("click", function(){
	if (viewlog.realtimeOn()) {
		hideStats();
		toggleRealtime();
	}
	viewlog.loadHistorical(0, historicalResponse);
});

processFilter();