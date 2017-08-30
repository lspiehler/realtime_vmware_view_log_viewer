function viewLog(options) {
	
	var self = this;
	var options = options || {};
	var socket = null;
	//this.skip = 0;
	
	var count = 0;
	var realtime = false;
	
	this.addLog = function(data) {
		data.Time = formatDate(data.Time)
		if(options.searchFilterValue.value=="" || options.searchFilterSelect.value=="0") {
			addLogElement(data);
		} else {
			try {
				if(data[options.searchFilterSelect.value].indexOf(options.searchFilterValue.value)>=0) {
					addLogElement(data);
					if(realtime) {
						try {
							var username = data.UserDisplayName.replace('SMHPLUS.ORG\\','').split('').join(' ')
							var severity = data.Severity.replace('_',' ')
							switch(options.filterAction.value) {
								case 'verbal':
									responsiveVoice.speak(severity + ", " + username, "UK English Female");
									options.filterAction.selectedIndex = 0;
									break;
								case 'repeatverbal':
									responsiveVoice.speak(severity + ", " + username, "UK English Female");
									break;
							}
						} catch (e) {
							
						}
					}
				} else {
					//console.log('Log filtered')
					options.filteredElem.innerText = parseInt(options.filteredElem.innerText) + 1;
				}
			} catch(e) {
				
			}
		}
	}
	
	function formatDate(datestr) {
		var date = new Date(datestr)
		return padDate(date.getMonth() + 1) + '-' + padDate(date.getDate()) + '-' + date.getFullYear() + ' ' + padDate(date.getHours()) + ':' + padDate(date.getMinutes()) + ':' + padDate(date.getSeconds())
	}
	
	function padDate(val) {
		if(val < 10) {
			return '0' + val
		} else {
			return val
		}
	}
	
	function addLogElement(data) {
		var properties = ""
		$.each( data, function( key, value ) {
			properties += "<tr><td class=\"tooltip-table-column\">" + key + "</td><td class=\"tooltip-table-column\">" + value + "</td></tr>"
		});
		var paneldefault = document.createElement('div')
		paneldefault.className = "panel panel-default " + data.Severity
		var panelbody = document.createElement('div')
		panelbody.setAttribute("data-toggle","popover")
		panelbody.setAttribute("data-content","<table>" + properties + "</table>")
		panelbody.title = "Header"
		panelbody.innerText = data.Time + ' ' + data.Body
		panelbody.className = "panel-body"
		paneldefault.appendChild(panelbody)
		options.container.insertBefore(paneldefault, options.container.childNodes[0])
		$(panelbody).popover({
			html: true,
			trigger: "hover",
			placement: 'auto'
		})
		if(count>=options.maxLogs) {
			deleteLog();
		} else {
			count = count + 1;
		}
	}
	
	function unloadLog(callback) {
		//alert(options.container.childNodes.length);
		for(var i = options.container.childNodes.length - 1; i >=0; i--) {
			options.container.removeChild(options.container.childNodes[i]);
		}
		count = 0;
		callback();
		
	}
	
	this.loadHistorical = function(skip, callback) {
		if(options.searchFilterSelect.value=="0" || options.searchFilterValue.value=="") {
			var url = "/search/?search=any&value=any&limit="+options.maxLogs+"&skip="+skip
		} else {
			var url = "/search/?search="+options.searchFilterSelect.value+"&value="+options.searchFilterValue.value+"&limit="+options.maxLogs+"&skip="+skip
		}
		//alert(url)
		$.get(url, function(data, status){
			//alert("Data: " + data + "\nStatus: " + status);
			unloadLog(function(){
				for(var i = data.length - 1; i >= 0; i--) {
					data[i].Time = formatDate(data[i].Time)
					addLogElement(data[i]);
				}
				//alert(callback)
				var historicalresp = {
					"Skip": skip,
					"Limit": options.maxLogs,
					"Data": data
				}
				callback(historicalresp);
			});
		});

	}
	
	function deleteLog() {
		options.container.removeChild(options.container.lastChild);
	}
	
	this.stopRealtime = function() {
		socket.disconnect();
	}
	
	this.startRealtime = function() {
		if(socket==null) {
			socket = io.connect('https://' + document.location.hostname + ':443');
			socket.on('message', function(data) {
				options.receivedElem.innerText = parseInt(options.receivedElem.innerText) + 1;
				self.addLog(data);
			});
			socket.on('connect', function(data) {
				options.rtStat.innerHTML = '<font color=\"green\">Connected</font>';
				realtime = true;
			});
			socket.on('disconnect', function(data) {
				options.rtStat.innerHTML = '<font color=\"red\">Disconnected</font>';
				realtime = false;
			});
		} else {
			socket.connect();
		}
	}
	
	this.realtimeOn = function() {
		if(socket==null) {
			return false;
		} else {
			return socket.connected;
		}
	}
	
	if(options.realTime) {
		self.startRealtime();
	}
	
}
