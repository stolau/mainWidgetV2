'use strict';


var info = {
	ymp : {
		"Fiware-Service" : "ymp",
		"Fiware-ServicePath" :
			["/f/2/221",
			"/f/2/213",
			"/f/2/246",
			"/f/2/265",
			"/f/2/249",
			"/f/2/201"]
	},	
}
var infoOld = {
	ymp : {
		"Fiware-Service" : "ymp",
		"Fiware-ServicePath" :
			["/f/2/221",
			"/f/2/213",
			"/f/2/246",
			"/f/2/265",
			"/f/2/249",
			"/f/2/201"]
	},
	tal : {
		"Fiware-Service" : "tal",
		"Fiware-ServicePath" : 
			["/f/1/190",
			"/f/1/118",
			"/f/1/161",
			"/f/1/143",
			"/f/1/227",
			"/f/1/114",
			"/f/1/152",
			"/f/1/116",
			"/f/2/229",
			"/f/2/202",
			"/f/2/228",
			"/f/2/226",
			"/f/2/230",
			"/f/2/225",
			"/f/2/232",
			"/f/2/231",
			"/f/2/233",
			"/f/2/205",
			"/f/3/302"]
	},
	
	jas_oulu : {
		"Fiware-Service" : "jas_oulu",
		"Fiware-ServicePath" : 
			["/loc_102"]
	},
	weather : {
		"Fiware-Service" : "weather",
		"Fiware-ServicePath" :
			["/oulu"]
	},
	siptronix : {
		"Fiware-Service" : "siptronix",
		"Fiware-ServicePath" :
			["/oulu",
			"/oulu/ritaharju_monitoimitalo/alerts"]
	},
};



// For CURL widget tests
var infoC = {
	"Room 114" : {
		Headers : {
			"Fiware-ServicePath" : "/f/1/114",
			"Fiware-Service" : "tal",
		},
		url: "pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/11122/attributes/tk11te22?aggrMethod=max&aggrPeriod=minute&dateFrom=2019-01-01T00:00&dateTo=2019-05-15T00:00",
	},
	"Room 116" : {
		Headers : {
			"Fiware-ServicePath" : "/f/1/116",
			"Fiware-Service" : "tal",
		},
		url: "pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/11121/attributes/tk11te21?aggrMethod=max&aggrPeriod=minute&dateFrom=2019-01-01T00:00&dateTo=2019-05-15T00:00",
	},
};

//Tests Curl widget
function sendCurl(info) {
	MashupPlatform.wiring.pushEvent("sendCurl", info);
}

function browser(searchUrl, searchHeaders) {

	// Sends all the requests based on URL and headers, returns JSON
	return new Promise(resolve => {
		setTimeout(() => {
			
			console.log(searchUrl);
			console.log(searchHeaders);
			var cList = [];
			MashupPlatform.http.makeRequest(searchUrl,{
			method: 'GET',
			contentType: 'application/json',
			requestHeaders: searchHeaders,
			onSuccess: async function (response) {

				var jsonData = JSON.parse(response.responseText);
				// takes keys of the site, these keys can be used to find correct data
				var keys = Object.keys(jsonData);
				resolve(jsonData);

			},
			on404: function (response) {
				MashupPlatform.widget.log("Error 404: Not Found");
				return cList;
			},
			on401: function (response) {
				MashupPlatform.widget.log("Error 401: Authentication failed");
				return cList;
			},
			on403: function (response) {
				MashupPlatform.widget.log("Error 403: Authorization failed");
				return cList;
			},
			onFailure: function (response) {
				MashupPlatform.widget.log("Unexpected response from the server");
				return cList;
			}
			});
		}, 50);
	});

}

function getHeader(servicePath, service) {
	// Returns headers
	// Api Key is storied in app, and might be vulnerable if published
	return new Promise(resolve => {
		setTimeout(() => {
			var header = {
			// "Platform-ApiKey": MashupPlatform.prefs.get('apiKey'),
			"Platform-Apikey": "pfzGgAJEB0qxPPzk0LTVJstcAfZv3YmN",
			"Accept": "application/json",
			"Fiware-Service": service,
			"Fiware-ServicePath": servicePath,
			};
			resolve(header);
		}, 50);
	});
}

function createMainButton(service, servicePaths) {

	var activated = false;

	var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";

	var tab = document.getElementsByClassName("tabcontent")[0];

	var btn = document.createElement("BUTTON");
	btn.innerHTML = service;
	btn.onclick = async function () {
		// Makes init search
		if(!activated) {
			for(var i = 0; i < servicePaths.length; i++) {
				var servicePath = servicePaths[i];
				var headers = await getHeader(servicePath, service);
				var response = await browser(url, headers);
				for(var j = 0; j < response.length; j++) {
					var namesResponse = Object.keys(response[j]);
					for(var g = 0; g < namesResponse.length; g++) {
						var k = namesResponse[g];
						if(k !== 'type' && k !== 'common_name' && k !== "location" && k !== "id" && k !== "TimeInstant" && 
							k !== 'area' && k !== 'capacity') {
							var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
							cometUrl = cometUrl + "/type/" + response[j]["type"] + "/id/" + response[j]["id"];
							cometUrl = cometUrl + "/attributes/" + namesResponse[g] + "?lastN=50";

							var name = response[j]["type"] + " " + response[j]["id"] + " " + namesResponse[g];
							var subBtn = createSubButton(name, headers, cometUrl);
							tab.appendChild(subBtn);
						}
					}

				}
			}
			activated = true;
		}
		else {
			console.log("Kaydaaks");
			tab.innerHTML = '';
			activated = false;
		}
	}
	return btn;
}

function createSubButton(name, headers, url) {


	var btn = document.createElement("BUTTON") ;
	btn.innerHTML = name;
	btn.onclick = async function () {
		var response = await browser(url, headers);
		console.log(response);
	}
	return btn;
}


async function mainNew(info) {

	//Mainfunctiob 
	var tab = document.getElementsByClassName("tabContainer")[0];
	var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
	var lastN = "?lastN=100";
	// document.body.innerHTML = '';
	var names = Object.keys(info);
	console.log(info);
	for(var i = 0; i < names.length; i++) {
		var service = info[names[i]]["Fiware-Service"];
		var servicePaths = info[names[i]]["Fiware-ServicePath"];
		var mainBtn = createMainButton(service, servicePaths);
		console.log(tab);
		console.log(mainBtn);
		tab.appendChild(mainBtn);
		console.log(tab);
	}
}

function createOptionsButtons() {
	// TO-DO : Create optons lastN, aggrMethord etc..
	// use document.getElementsByClassNAme("options")[0] to store created buttons
}



// TO-DO: main gets initialized by another widget sending infoOld type object to it.
mainNew(infoOld);
