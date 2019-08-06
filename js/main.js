'use strict';


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
	aqvaio : {
		"Fiware-Service" : "aqvaio",
		"Fiware-ServicePath" :
			["/oulu"]
	}
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

// Create buttons for every data source on platform
async function mainNew(object) {
	//Mainfunction
	// var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
	// var lastN = "?lastN=100";
	// document.body.innerHTML = '';
	var tab = document.getElementsByClassName("sourceContainer")[0];
	var names = Object.keys(object);

	for(var i = 0; i < names.length; i++) {
		var mainBtn = createSourceButton(names[i], object);
		console.log(object)
		tab.appendChild(mainBtn);
	}
}

function createSourceButton(sourceName, object) {
	var activated = false;
	var tab = document.getElementsByClassName("roomContainer")[0];
	var btn = document.createElement("BUTTON");
	var rooms = Object.keys(object[sourceName]);

	btn.innerHTML = sourceName;
	btn.style.backgroundColor = "#EAEDED";

	btn.onclick = function() {
		if (!activated) {
			for (var i = 0; i < rooms.length; i++) {
				var roomBtn = createRoomButton(sourceName, rooms[i], object);
				tab.appendChild(roomBtn);
			}
			btn.style.backgroundColor = "MediumSeaGreen";
			activated = true;
		} else {
			console.log("Kaydaaks");
			tab.innerHTML = '';
			activated = false;
			btn.style.backgroundColor = "#EAEDED";
		}
	}
	return btn;
}

function createRoomButton(sourceName, roomName, object) {
	var activated = false;
	var btn = document.createElement("BUTTON");
	var tab = document.getElementsByClassName("tabcontent")[0];
	var rooms = Object.keys(object[sourceName][roomName].id);
	btn.innerHTML = roomName;
	btn.style.backgroundColor = "#EAEDED";

	btn.onclick = function() {
		if (!activated) {
			for (var i = 0; i < rooms.length; i++) {
				var dataButton = createDataButton(sourceName, roomName, rooms[i], object);
				tab.appendChild(dataButton);
			}
			btn.style.backgroundColor = "MediumSeaGreen";
			activated = true;
		} else {
			console.log("Kaydaaks");
			tab.innerHTML = '';
			btn.style.backgroundColor = "#EAEDED";
			activated = false;
		}
	}
	return btn;
}

function createDataButton(sourceName, roomName, deviceName, object) {
	var btn = document.createElement("BUTTON");

	btn.innerHTML = deviceName;
	btn.style.backgroundColor = "#EAEDED";

	// Request data from server
	btn.onclick = async function() {
		console.log("dataaaaa"+ deviceName)
		var attribute = Object.keys(object[sourceName][roomName].id[deviceName].attributes);
		var type = object[sourceName][roomName].id[deviceName].attributes[attribute].type;
		var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
		cometUrl = cometUrl + "/type/" + type + "/id/" + deviceName;
		cometUrl = cometUrl + "/attributes/" + attribute + "?lastN=50";
		console.log(cometUrl)

		var servicePath = object[sourceName][roomName]["Fiware-ServicePath"];
		var service = object[sourceName][roomName]["Fiware-Service"];

		console.log("Haetaan dataa")
		var headers = await getHeader(servicePath, service);
		var response = await browser(cometUrl, headers);
		console.log("Data haettu:")

		console.log(response)
	}

	return btn;
}

function sendGraph(values, titles, update) {
	// Function gets tempList and name outputs graph to Highcharts
	// Connect Graph to Highcharts Options in wiring mode.

	// valueList contains list of lists where [0] = data values,
	// [1] = xAxis label
	// [2] = name of the value
	var compValueList = [];

    console.log(values)

	for (var i = 0; i < values.length; i++) {
        for (var j = 0; j < values[i].length; j++) {
            compValueList.push({
        		name : values[i][j][2],
        		data : values[i][j][0],
    		});
        }
	}
    console.log(compValueList)

	MashupPlatform.wiring.pushEvent("Graph", {
        titles: titles,
        categories: values[0][0][1],
        data: compValueList,
        update: update,
    });
}

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

function createMainButton(name) {

	var activated = false;

	var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";

	var tab = document.getElementsByClassName("tabcontent")[0];

	var btn = document.createElement("BUTTON");
	btn.innerHTML = name;
	btn.onclick = async function () {
		// Makes init search
		if(!activated) {
			for(var i = 0; i < servicePaths.length; i++) {
				var servicePath = servicePaths[i];
				var headers = await getHeader(servicePath, service);
				var response = await browser(url, headers);
				console.log(response)
				if (service === "aqvaio") {
					console.log("---------------asdasdasd")
				}
					// ----------------------------
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
								// console.log(name)
								// console.log(headers)
								// console.log(cometUrl)
								var subBtn = createSubButton(name, headers, cometUrl);
								console.log(subBtn)
								tab.appendChild(subBtn);
							}
						}
					}
					// ----------------------------
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

function createOptionsButtons() {
	// TO-DO : Create optons lastN, aggrMethord etc..
	// use document.getElementsByClassNAme("options")[0] to store created buttons
}

// dataObject - Will be seperate widget later
var dataObject = {
	Aqvaio : {
		"Ritaharju sportcenter" : {
			"Fiware-ServicePath" : "/oulu",
			"Fiware-Service" : "aqvaio",
			"id" : {
				"AirQualityObserved:0004815870800252" : {
					"attributes" : {
						"temperature" : {
							"type" : "AirQualityObserved",
							"description" : "temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"Device:0004815870800252" : {
					"attributes" : {
						"value" : {
							"type" : "Device",
							"description" : "water reading",
							"unitCode" : "MTQ"
						},
					},
				},
			},
		},
		"Environment house" : {
			"Fiware-ServicePath" : "/oulu",
			"Fiware-Service": "aqvaio",
			"id" : {
				"AirQualityObserved:0010588167080077" : {
					"attributes" : {
						"temperature" : {
							"type" : "AirQualityObserved",
							"description" : "temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"Device:0010588167080077" : {
					"attributes" : {
						"value" : {
							"type" : "Device",
							"description" : "water reading",
							"unitCode" : "MTQ"
						},
					},
				},
			},
		},
		"Pikku-Iikka daycare center" : {
			"Fiware-ServicePath" : "/oulu",
			"Fiware-Service" : "aqvaio",
			"id" : {
				"AirQualityObserved:0010588195080042" : {
					"attributes" : {
						"temperature" : {
							"type" : "AirQualityObserved",
							"description" : "temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"Device:0010588195080042" : {
					"attributes" : {
						"value" : {
							"type" : "Device",
							"description" : "water reading",
							"unitCode" : "MTQ"
						},
					},
				},
			},
		},
	},

	Siptronix : {
		"Siptronix" : {
			"Fiware-ServicePath" : "/oulu",
			"Fiware-Service" : "siptronix",
			"id" : {
				"Ritaharju_POS39_lighting" : {
					"attributes" : {
						"activePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Active power",
							"unitCode" : " ",
						},
						"apparentPower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Apparent power",
							"unitCode" : " ",
						},
						"current" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Current",
							"unitCode" : " ",
						},
						"frequency" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Frequency",
							"unitCode" : " ",
						},
						"powerFactor" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Powerfactor",
							"unitCode" : " ",
						},
						"reactivePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Reactive power",
							"unitCode" : " ",
						},
						"totalActiveEnergyImport" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total active energy import",
							"unitCode" : " ",
						},
						"totalActivePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total active power",
							"unitCode" : " ",
						},
						"totalApparentPower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total apparent power",
							"unitCode" : " ",
						},
						"totalReactivePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total reactive power",
							"unitCode" : " ",
						},
						"voltage" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Voltage",
							"unitCode" : " ",
						},
					},
				},
			},
		},
	},

	Talvikangas : {
		"Room 114" : {
			"Fiware-ServicePath" : "/f/1/114",
			"Fiware-Service" : "tal",
			"id" : {
				"11122" : {
					"attributes" : {
						"tk11te22" : {
						"type" : "AirQualityObserved",
						"description" : "Temperature",
						"unitCode" : "CEL",
						},
					},
				},
			},
			"capacity" : "20",
			"location" : "NA",
		},
		"Room 116" : {
			"Fiware-ServicePath" : "/f/1/116",
			"Fiware-Service" : "tal",
			"id" : {
				"11121" : {
					"attributes" : {
						"tk11te21" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
			},
			"capacity" : "NA",
			"location" : "NA",
		},
		"Room 118" : {
			"Fiware-ServicePath" : "/f/1/118",
			"Fiware-Service" : "tal",
			"id" : {
				"11120" : {
					"attributes" : {
						"tk11te20" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
			},
			"capacity" : "NA",
			"location" : "NA",
		},
	    "Room 161" : {
			"Fiware-ServicePath" : "/f/1/161",
			"Fiware-Service" : "tal",
			"id" : {
				"10822" : {
					"attributes" : {
						"tk08qe22" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"tk08te22" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
			},
			"capacity" : "NA",
			"location" : "NA",
		},
		"Room 190" : {
			"Fiware-ServicePath" : "/f/1/190",
			"Fiware-Service" : "tal",
			"id" : {
				"1621" : {
					"attributes" : {
						"lks6te21" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
						"tk04qe20" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon Dioxide",
							"unitCode" : "59",
						},
					},
				},
				"1622" : {
					"attributes" : {
						"lks6te22" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"1623" : {
					"attributes" : {
						"lks6te23" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
						"tk04qe24" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon Dioxide",
							"unitCode" : "59",
						},
					},
				},
				"1624" : {
					"attributes" : {
						"lks6te24" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"1625" : {
					"attributes" : {
						"lks6te25" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
						"tk04qe22" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon Dioxide",
							"unitCode" : "59",
						},
					},
				},
				"1626" : {
					"attributes" : {
						"lks6te26" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
			},
		},
		"Room 202" : {
			"Fiware-ServicePath" : "/f/2/202",
			"Fiware-Service" : "tal",
			"id" : {
				"k2s0322" : {
					"attributes" : {
						"tk03_qe22" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"tk03_te22" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"k2s0323" : {
					"attributes" : {
						"tk03_qe23" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"tk03_te23" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
				"rio202" : {
					"attributes" : {
						"rio202_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio202_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
						"rio202_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
						"rio202_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
				"rio202m" : {
					"attributes" : {
						"rio202m_m" : {
							"type" : "AirQualityObserved",
							"description" : "Number of people",
							"unitCode" : " ",
						},
					},
				},
			},
		},
	    "Room 205" : {
			"Fiware-ServicePath" : "/f/2/205",
			"Fiware-Service" : "tal",
			"id" : {
				"rio205" : {
					"attributes" : {
						"rio205_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio205_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio205_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio205_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	            "rio205m" : {
					"attributes" : {
						"rio205m_m" : {
							"type" : "AirQualityObserved",
							"description" : "Number of people",
							"unitCode" : " ",
						},
					},
				},
	        },
	    },
	    "Room 225" : {
			"Fiware-ServicePath" : "/f/2/225",
			"Fiware-Service" : "tal",
			"id" : {
				"rio225" : {
					"attributes" : {
						"rio225_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio225_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio225_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio225_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 226" : {
			"Fiware-ServicePath" : "/f/2/226",
			"Fiware-Service" : "tal",
			"id" : {
				"rio226" : {
					"attributes" : {
						"rio226_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio226_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio226_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio226_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 227" : {
			"Fiware-ServicePath" : "/f/2/227",
			"Fiware-Service" : "tal",
			"id" : {
				"rio227" : {
					"attributes" : {
						"rio227_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio227_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio227_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio227_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 228" : {
			"Fiware-ServicePath" : "/f/2/228",
			"Fiware-Service" : "tal",
			"id" : {
				"rio228" : {
					"attributes" : {
						"rio228_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio228_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio228_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio228_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 229" : {
			"Fiware-ServicePath" : "/f/2/229",
			"Fiware-Service" : "tal",
			"id" : {
				"rio229" : {
					"attributes" : {
						"rio229_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio229_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio229_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio229_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 230" : {
			"Fiware-ServicePath" : "/f/2/230",
			"Fiware-Service" : "tal",
			"id" : {
				"rio230" : {
					"attributes" : {
						"rio230_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio230_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio230_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio230_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 231" : {
			"Fiware-ServicePath" : "/f/2/231",
			"Fiware-Service" : "tal",
			"id" : {
				"rio231" : {
					"attributes" : {
						"rio231_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio231_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio231_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio231_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 232" : {
			"Fiware-ServicePath" : "/f/2/232",
			"Fiware-Service" : "tal",
			"id" : {
				"rio232" : {
					"attributes" : {
						"rio232_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio232_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio232_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio232_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 233" : {
			"Fiware-ServicePath" : "/f/2/233",
			"Fiware-Service" : "tal",
			"id" : {
				"rio233" : {
					"attributes" : {
						"rio233_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"rio233_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
						},
	                    "rio233_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
	                    "rio233_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
						},
					},
				},
	        },
	    },
	    "Room 302" : {
			"Fiware-ServicePath" : "/f/3/302",
			"Fiware-Service" : "tal",
			"id" : {
				"30320" : {
					"attributes" : {
						"tk03qe20" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"tk03te20" : {
	                        "type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
	            "30321" : {
					"attributes" : {
						"tk03qe21" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
						},
						"tk03te21" : {
	                        "type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
						},
					},
				},
	        },
	    },
	}
}

// TO-DO: main gets initialized by another widget sending infoOld type object to it.
mainNew(dataObject);
