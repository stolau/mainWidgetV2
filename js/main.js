'use strict';


// var infoOld = {
// 	ymp : {
// 		"Fiware-Service" : "ymp",
// 		"Fiware-ServicePath" :
// 			["/f/2/221",
// 			"/f/2/213",
// 			"/f/2/246",
// 			"/f/2/265",
// 			"/f/2/249",
// 			"/f/2/201"]
// 	},
// 	tal : {
// 		"Fiware-Service" : "tal",
// 		"Fiware-ServicePath" :
// 			["/f/1/190",
// 			"/f/1/118",
// 			"/f/1/161",
// 			"/f/1/143",
// 			"/f/1/227",
// 			"/f/1/114",
// 			"/f/1/152",
// 			"/f/1/116",
// 			"/f/2/229",
// 			"/f/2/202",
// 			"/f/2/228",
// 			"/f/2/226",
// 			"/f/2/230",
// 			"/f/2/225",
// 			"/f/2/232",
// 			"/f/2/231",
// 			"/f/2/233",
// 			"/f/2/205",
// 			"/f/3/302"]
// 	},
//
// 	jas_oulu : {
// 		"Fiware-Service" : "jas_oulu",
// 		"Fiware-ServicePath" :
// 			["/loc_102"]
// 	},
// 	weather : {
// 		"Fiware-Service" : "weather",
// 		"Fiware-ServicePath" :
// 			["/oulu"]
// 	},
// 	siptronix : {
// 		"Fiware-Service" : "siptronix",
// 		"Fiware-ServicePath" :
// 			["/oulu",
// 			"/oulu/ritaharju_monitoimitalo/alerts"]
// 	},
// 	aqvaio : {
// 		"Fiware-Service" : "aqvaio",
// 		"Fiware-ServicePath" :
// 			["/oulu"]
// 	}
// };

// For CURL widget tests
// var infoC = {
// 	"Room 114" : {
// 		Headers : {
// 			"Fiware-ServicePath" : "/f/1/114",
// 			"Fiware-Service" : "tal",
// 		},
// 		url: "pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/11122/attributes/tk11te22?aggrMethod=max&aggrPeriod=minute&dateFrom=2019-01-01T00:00&dateTo=2019-05-15T00:00",
// 	},
// 	"Room 116" : {
// 		Headers : {
// 			"Fiware-ServicePath" : "/f/1/116",
// 			"Fiware-Service" : "tal",
// 		},
// 		url: "pan0107.panoulu.net:8000/comet/STH/v1/contextEntities/type/AirQualityObserved/id/11121/attributes/tk11te21?aggrMethod=max&aggrPeriod=minute&dateFrom=2019-01-01T00:00&dateTo=2019-05-15T00:00",
// 	},
// };

var aggrMethod = 'max';
var aggrPeriod = 'hour';
var inputDates = ["2019-01-01T00:00", "2019-07-31T00:00"];
var inputNValue = '42';
var minutes = '10';

// Create buttons for every data source on platform
async function mainNew(object) {
	//Mainfunction
	// var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
	// var lastN = "?lastN=100";
	// document.body.innerHTML = '';
	var tab = document.getElementsByClassName("sourceContainer")[0];
	var names = Object.keys(object);
	console.log(object)

	for(var i = 0; i < names.length; i++) {
		var mainBtn = createSourceButton(names[i], object);
		tab.appendChild(mainBtn);
	}

	MashupPlatform.wiring.registerCallback('AggrMethod', function(agmet) {aggrMethod=agmet; console.log("dates: "+ agmet)});
	MashupPlatform.wiring.registerCallback('AggrPeriod', function(agper) {aggrPeriod=agper; console.log("dates: "+ agper)});
	MashupPlatform.wiring.registerCallback('Dates', function(data) {inputDates=data; console.log("dates: "+ data)});
    MashupPlatform.wiring.registerCallback('nValue', function(data2) {inputNValue=data2; console.log(`nvalue: ${data2}`)});
    MashupPlatform.wiring.registerCallback('Minutes', function(mins) {minutes=mins; console.log(`minutes: ${mins}`)});
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
			tab.style.border = "1px ridge green";
			for (var i = 0; i < rooms.length; i++) {
				var roomBtn = createRoomButton(sourceName, rooms[i], object);
				tab.appendChild(roomBtn);
			}
			btn.style.backgroundColor = "#acb9b9";
			activated = true;
		} else {
			console.log("Kaydaaks");
			tab.style.border = "";
			tab.innerHTML = "";
			document.getElementsByClassName("deviceContainer")[0].innerHTML = "";
			document.getElementsByClassName("deviceContainer")[0].style.border = "";
			activated = false;
			btn.style.backgroundColor = "#EAEDED";
		}
	}
	return btn;
}

function createRoomButton(sourceName, roomName, object) {
	var activated = false;
	var btn = document.createElement("BUTTON");
	var tab = document.getElementsByClassName("deviceContainer")[0];
	var rooms = Object.keys(object[sourceName][roomName].id);
	btn.innerHTML = roomName;
	btn.style.backgroundColor = "#4CAF50";
	btn.style.color = "white";

	btn.onclick = async function() {
		if (!activated) {
			// Siptronix needs to fetch alerts

			if (sourceName === "Siptronix") {
				var headers = await getHeader("/oulu/ritaharju_monitoimitalo/alerts", "siptronix");
				var response = await browser("http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id", headers);
				console.log(response)
				var categories = [];
				var titles = [roomName, "Light bulb status on each alert", "", "Bulb count"];;
				var names = Object.keys(response[0].data.value)
				console.log(names)
				var valueList = [
					{ name: names[0], data: []},
					{ name: names[3], data: []},
					{ name: names[1], data: []},
					{ name: names[4], data: []},
				]
				for (var i=0; i < response.length; i++) {
					var dataButton = createDataButton(sourceName, roomName, rooms[0], object, response[i].id);
					tab.appendChild(dataButton);
					valueList[0].data.push(response[i].data.value.bulbCountBurned);
					valueList[1].data.push(response[i].data.value.bulbCountTotal);
					valueList[2].data.push(response[i].data.value.bulbsBurnedNew);
					valueList[3].data.push(response[i].data.value.bulbsReplacedNew);
					categories.push(new Date(response[i].dateIssued.value) + " - " + response[i].data.value.bulbType);
				}
				console.log(valueList)
				sendGraph(valueList, categories, titles)
			// Other dataset function the same
			} else {
				for (var i = 0; i < rooms.length; i++) {
					var dataButton = createDataButton(sourceName, roomName, rooms[i], object, "");
					tab.appendChild(dataButton);
				}
			}
			tab.style.border = "1px ridge blue";
			btn.style.backgroundColor = "#2f6a31";
			activated = true;
		} else {
			tab.style.border = "";
			console.log("Kaydaaks");
			tab.innerHTML = '';
			btn.style.backgroundColor = "#4CAF50";
			activated = false;
		}
	}
	return btn;
}

function createDataButton(sourceName, roomName, deviceName, object, alertButton) {
	var btn = document.createElement("BUTTON");
	if (sourceName === "Siptronix") {
		btn.innerHTML = alertButton;
	} else {
		btn.innerHTML = deviceName;
	}
	btn.style.backgroundColor = "#008CBA";
	btn.style.color = "white";
	btn.style["margin-bottom"] = "1px";


	// Request data from server
	btn.onclick = async function() {
		console.log(Object.keys(object[sourceName][roomName].id[deviceName]))
		var attribute = Object.keys(object[sourceName][roomName].id[deviceName].attributes);

		var valueList = [];

		for (var a=0; a < attribute.length; a++) {
			var type = object[sourceName][roomName].id[deviceName].attributes[attribute[a]].type;
			var description = object[sourceName][roomName].id[deviceName].attributes[attribute[a]].description;
			var unit = object[sourceName][roomName].id[deviceName].attributes[attribute[a]].unit;

			if (sourceName === "Siptronix") {
				var alertDate = new Date(alertButton.slice(31));
				var titles = [roomName, minutes + " minutes around " + alertDate, "", "y-axel"];
				var alertFrom = alertDate.setMinutes(alertDate.getMinutes() - parseInt(minutes));
				var alertTo = alertDate.setMinutes(alertDate.getMinutes() + 2*parseInt(minutes));
				var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
					cometUrl += "/type/" + type + "/id/" + deviceName;
					cometUrl += "/attributes/" + attribute[a] + "?lastN=100";
					cometUrl += "&dateFrom=" + alertFrom + "&dateTo=" + alertTo;
			// Timeperiod search
			} else if (!inputNValue) {
				var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
					cometUrl += "/type/" + type + "/id/" + deviceName;
					cometUrl += "/attributes/" + attribute[a] + "?aggrMethod=" + aggrMethod + "&aggrPeriod=" + aggrPeriod;
					cometUrl += "&dateFrom=" + inputDates[0] + "&dateTo=" + inputDates[1];
				var titles = [roomName, "From " + inputDates[0] + " to " + inputDates[1], "", unit];
			// LastN search
			} else {
				var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
					cometUrl += "/type/" + type + "/id/" + deviceName;
					cometUrl += "/attributes/" + attribute[a] + "?lastN=" + inputNValue;
				var titles = [roomName + " - " + deviceName, "Last " + inputNValue + " measurements", "", unit];
			}

		console.log(cometUrl)

		var servicePath = object[sourceName][roomName]["Fiware-ServicePath"];
		var service = object[sourceName][roomName]["Fiware-Service"];
		var headers = await getHeader(servicePath, service);
		var response = await browser(cometUrl, headers);
		console.log(response)

		var values = response.contextResponses[0].contextElement.attributes[0].values;
		var categories = [];
		valueList.push({
			name: description,
			data: []
		})

		// Timeperiod data
		if (!inputNValue) {
			for (var i=0; i < values.length; i++) {
				for (var j=0; j < values[i].points.length; j++) {
					var date = new Date(values[i]._id.origin);
					valueList[a].data.push(values[i].points[j].max);
					if (aggrPeriod === "minute") {
						date.setMinutes(date.getMinutes() + values[i].points[j].offset);
					} else if (aggrPeriod === "hour") {
						date.setHours(date.getHours() + values[i].points[j].offset);
					} else if (aggrPeriod === "day") {
						date.setDate(date.getDate() + values[i].points[j].offset);
					} else if (aggrPeriod === "month") {
						date.setMonth(date.getMonth() + values[i].points[j].offset);
					}
					categories.push(new Date(date));
				}
			}
		// LastN search
		} else {
			for (var i=0; i < values.length; i++) {
				if (typeof values[i].attrValue === "object") {
					var valueL1 = values[i].attrValue.L1;
					var valueL2 = values[i].attrValue.L2;
					var valueL3 = values[i].attrValue.L3;
					var avgValue = (valueL1 + valueL2 + valueL3) / 3;
					valueList[a].data.push(parseFloat(parseFloat(avgValue).toFixed(1)));
					categories.push(new Date(values[i].recvTime));
				} else {
					valueList[a].data.push(parseFloat(parseFloat(values[i].attrValue).toFixed(1)));
					categories.push(new Date(values[i].recvTime));
				}
			}
		}

		console.log("values:");
		console.log(valueList);
		// console.log(categories);
		}
		sendGraph(valueList, categories, titles)
	}
	return btn;
}

function sendGraph(values, categories, titles) {
	// Function gets tempList and name outputs graph to Highcharts
	// Connect Graph to Highcharts Options in wiring mode.
	MashupPlatform.wiring.pushEvent("Graph", {
        titles: titles,
        categories: categories,
        data: values,
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

// function createMainButton(name) {
//
// 	var activated = false;
//
// 	var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
//
// 	var tab = document.getElementsByClassName("tabcontent")[0];
//
// 	var btn = document.createElement("BUTTON");
// 	btn.innerHTML = name;
// 	btn.onclick = async function () {
// 		// Makes init search
// 		if(!activated) {
// 			for(var i = 0; i < servicePaths.length; i++) {
// 				var servicePath = servicePaths[i];
// 				var headers = await getHeader(servicePath, service);
// 				var response = await browser(url, headers);
// 				console.log(response)
// 				if (service === "aqvaio") {
// 					console.log("---------------asdasdasd")
// 				}
// 					// ----------------------------
// 					for(var j = 0; j < response.length; j++) {
// 						var namesResponse = Object.keys(response[j]);
// 						for(var g = 0; g < namesResponse.length; g++) {
// 							var k = namesResponse[g];
// 							if(k !== 'type' && k !== 'common_name' && k !== "location" && k !== "id" && k !== "TimeInstant" &&
// 								k !== 'area' && k !== 'capacity') {
// 								var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
// 								cometUrl = cometUrl + "/type/" + response[j]["type"] + "/id/" + response[j]["id"];
// 								cometUrl = cometUrl + "/attributes/" + namesResponse[g] + "?lastN=50";
//
// 								var name = response[j]["type"] + " " + response[j]["id"] + " " + namesResponse[g];
// 								// console.log(name)
// 								// console.log(headers)
// 								// console.log(cometUrl)
// 								var subBtn = createSubButton(name, headers, cometUrl);
// 								console.log(subBtn)
// 								tab.appendChild(subBtn);
// 							}
// 						}
// 					}
// 					// ----------------------------
// 			}
// 			activated = true;
// 		}
// 		else {
// 			console.log("Kaydaaks");
// 			tab.innerHTML = '';
// 			activated = false;
// 		}
// 	}
// 	return btn;
// }

// function createSubButton(name, headers, url) {
//
//
// 	var btn = document.createElement("BUTTON") ;
// 	btn.innerHTML = name;
// 	btn.onclick = async function () {
// 		var response = await browser(url, headers);
// 		console.log(response);
// 	}
// 	return btn;
// }

// function createOptionsButtons() {
// 	// TO-DO : Create optons lastN, aggrMethord etc..
// 	// use document.getElementsByClassNAme("options")[0] to store created buttons
// }

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
							"unit" : "Celsius (°C)"
						},
					},
				},
				"Device:0004815870800252" : {
					"attributes" : {
						"value" : {
							"type" : "Device",
							"description" : "water reading",
							"unitCode" : "MTQ",
							"unit" : "litres"
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
							"unit" : "Celsius (°C)"
						},
					},
				},
				"Device:0010588167080077" : {
					"attributes" : {
						"value" : {
							"type" : "Device",
							"description" : "water reading",
							"unitCode" : "MTQ",
							"unit" : "litres"
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
							"unit" : "Celsius (°C)"
						},
					},
				},
				"Device:0010588195080042" : {
					"attributes" : {
						"value" : {
							"type" : "Device",
							"description" : "water reading",
							"unitCode" : "MTQ",
							"unit" : "litres"
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
							"unit" : "Watt (W)"
						},
						"apparentPower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Apparent power",
							"unitCode" : " ",
							"unit" : "Volt-ampere (VA)"
						},
						"current" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Current",
							"unitCode" : " ",
							"unit" : "Ampere (A)"
						},
						"frequency" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Frequency",
							"unitCode" : " ",
							"unit" : "Hertz (Hz)"
						},
						"powerFactor" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Powerfactor",
							"unitCode" : " ",
							"unit" : "Number between -1 and 1"
						},
						"reactivePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Reactive power",
							"unitCode" : " ",
							"unit" : "Volt-ampere reactive (VAR)"
						},
						"totalActiveEnergyImport" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total active energy import",
							"unitCode" : " ",
							"unit" : "Kilowatt hour (kWh)"
						},
						"totalActivePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total active power",
							"unitCode" : " ",
							"unit" : "Watt (W)"
						},
						"totalApparentPower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total apparent power",
							"unitCode" : " ",
							"unit" : "Volt-ampere (VA)"
						},
						"totalReactivePower" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Total reactive power",
							"unitCode" : " ",
							"unit" : "Watt (W)"
						},
						"voltage" : {
							"type" : "3PhaseACMeasurement",
							"description" : "Voltage",
							"unitCode" : " ",
							"unit" : "Volt (V)"
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
						"unit" : "Celsius (°C)"
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
							"unit" : "Celsius (°C)"
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
							"unit" : "Celsius (°C)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"tk08te22" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
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
							"unit" : "Celsius (°C)"
						},
						"tk04qe20" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon Dioxide",
							"unitCode" : "59",
							"unit" : "Parts-per notation (PPM)"
						},
					},
				},
				"1622" : {
					"attributes" : {
						"lks6te22" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
					},
				},
				"1623" : {
					"attributes" : {
						"lks6te23" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
						"tk04qe24" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon Dioxide",
							"unitCode" : "59",
							"unit" : "Parts-per notation (PPM)"
						},
					},
				},
				"1624" : {
					"attributes" : {
						"lks6te24" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
					},
				},
				"1625" : {
					"attributes" : {
						"lks6te25" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
						"tk04qe22" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon Dioxide",
							"unitCode" : "59",
							"unit" : "Parts-per notation (PPM)"
						},
					},
				},
				"1626" : {
					"attributes" : {
						"lks6te26" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"tk03_te22" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
					},
				},
				"k2s0323" : {
					"attributes" : {
						"tk03_qe23" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
							"unit" : "Parts-per notation (PPM)"
						},
						"tk03_te23" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
					},
				},
				"rio202" : {
					"attributes" : {
						"rio202_c" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
							"unit" : "Parts-per notation (PPM)"
						},
						"rio202_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
						"rio202_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
						"rio202_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
						},
					},
				},
				"rio202m" : {
					"attributes" : {
						"rio202m_m" : {
							"type" : "AirQualityObserved",
							"description" : "Number of people",
							"unitCode" : " ",
							"unit" : "Number"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio205_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio205_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio205_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
						},
					},
				},
	            "rio205m" : {
					"attributes" : {
						"rio205m_m" : {
							"type" : "AirQualityObserved",
							"description" : "Number of people",
							"unitCode" : " ",
							"unit" : "Number"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio225_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio225_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio225_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio226_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio226_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio226_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio227_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio227_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio227_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio228_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio228_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio228_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio229_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio229_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio229_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio230_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio230_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio230_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio231_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio231_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio231_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio232_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio232_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio232_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"rio233_h" : {
							"type" : "AirQualityObserved",
							"description" : "Relative humidity",
							"unitCode" : "P1",
							"unit" : "Percentage (%)"
						},
	                    "rio233_t" : {
							"type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
	                    "rio233_v" : {
							"type" : "AirQualityObserved",
							"description" : "Volatile organic compound",
							"unitCode" : "61",
							"unit" : "Parts-per notation (PPM)"
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
							"unit" : "Parts-per notation (PPM)"
						},
						"tk03te20" : {
	                        "type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
					},
				},
	            "30321" : {
					"attributes" : {
						"tk03qe21" : {
							"type" : "AirQualityObserved",
							"description" : "Carbon dioxide",
							"unitCode" : "59",
							"unit" : "Parts-per notation (PPM)"
						},
						"tk03te21" : {
	                        "type" : "AirQualityObserved",
							"description" : "Temperature",
							"unitCode" : "CEL",
							"unit" : "Celsius (°C)"
						},
					},
				},
	        },
	    },
	}
}

// TO-DO: main gets initialized by another widget sending infoOld type object to it.
mainNew(dataObject);
