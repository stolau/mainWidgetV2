'use strict';

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

/* TODO:

   Probleemia:  - Datoja yhdistettäessä, eroja mittausajoissa ei huomioida. Päivitetään aina viimeisimmän datan aikapisteet graafiin.
              	  Luo ongelmia ainakin Talvikankaassa LastN-haulla, kun muutama huone on lopettanut datan tuottamisen tammikuussa ja muilla tulee edelleen.
				- Siptronixilla napin painallukset jää näkyviin vaikka hakee uuden datapointin.
				- cors-anywhere.herokuapp.com/ ei toimi curlissa
*/

var dateString = "?lastN=100";
/* Alternative solution to handle graphdata
	categories contain complete set of time points
	data is list of lists containing each displayble graph
var GraphDataContainer = {
	categories : []
	data : []
}	
*/

var GraphData = {
	data: [],
	categories: [],
	titles: [[], []],
	id: [],
};

/*
// Function receives times and places them in order
function validateTime(categories) {
	new Date(values[i].recvTime).toLocaleString()
	
	var cat = GraphsDataContainer.categories;
	for(var i = 0; i < cat.length; i++) {
		if(categories[0] == cat[i]) {
			// Proceeds to adding 
		}
	}
}	
*/


// Creates the data source buttons and handles their functionality
function createSourceButton(sourceName, object) {
	var activated = false;
	var tab = document.getElementsByClassName("roomContainer")[0];
	var btn = document.createElement("BUTTON");
	var rooms = Object.keys(object);
	var btnList = [];
	btn.innerHTML = sourceName;
	btn.style.backgroundColor = "#EAEDED";

	btn.onclick = function() {
		// Create room buttons
		if (!activated) {
			tab.style.border = "1px ridge green";
			for(var i = 0; i < rooms.length; i++) {
				var roomBtn = createRoomButton(sourceName, rooms[i], object[rooms[i]]);
				btnList.push(roomBtn);
			}

			// Draw buttons
			for (var i=0; i < btnList.length; i++) {
				tab.appendChild(btnList[i])
			}
			btn.style.backgroundColor = "#acb9b9";
			tab.style.border = "1px ridge green";
			activated = true;
		} else {
			// Close the data source aka close room buttons
			for (var i=0; i < btnList.length; i++) {
				tab.removeChild(btnList[i])
				document.getElementsByClassName("deviceContainer")[0].innerHTML = "";
				document.getElementsByClassName("deviceContainer")[0].style.border = "";
			}
			if (!tab.innerHTML) {
				tab.style.border = "";
				btn.style.backgroundColor = "#EAEDED";
			} else {
				tab.style.border = "1px ridge green";
				btn.style.backgroundColor = "#EAEDED";
			}
			// Clear Highcharts widget when "closing the data source"
			btnList = [];
			activated = false;
			GraphData.data = [];
			GraphData.titles = [[], []];
			GraphData.categories = [];
			GraphData.id = [];
			sendGraph()
		}
	}
	return btn;
}

// Creates room / alert buttons and handles their functionality
function createRoomButton(sourceName, roomName, object) {
	var activated = false;
	var btn = document.createElement("BUTTON");
	var tab = document.getElementsByClassName("deviceContainer")[0];
	var rooms = Object.keys(object.id);
	var btnList = [];
	btn.innerHTML = roomName;
	btn.style.backgroundColor = "#4CAF50";
	btn.style.color = "white";
	btn.onclick = async function() {
		// Create data buttons
		if (!activated) {

			// Handling dataset with alerts
			if (object.AutomatedTime) {
				var headers = await getHeader(object["Fiware-AlertServicePath"], object["Fiware-Service"]);
				// Orionille toimiii SSL, cometilla ei tällä hetkellä
				var response = await browser("https://pan0107.panoulu.net/orion/v2/entities?limit=300&options=count&orderBy=id", headers);
				console.log(response);
				var names = Object.keys(response[0].data.value);
				console.log(names);
				var valueList = [];
				// Creates valueList
				// Checks if value is integer
				for(var i = 0; i < names.length; i++) {
					var b = response[i].data.value[names[i]];
					if((typeof(b) == "number") || (typeof(b) == "float")) {
						valueList.push({name: names[i], data: []});
					}
				}
				// Draws alerts on Highcharts widget
				console.log(response[i].id)
				for (var i=0; i < response.length; i++) {
					var dataButton = createDataButton(sourceName, roomName, rooms[0], object, response[i].id);
					btnList.push(dataButton);
					for(var j = 0; j < valueList.length; j++) {
						valueList[j].data.push(response[i].data.value[valueList[j].name]);
					}
					GraphData.categories.push(new Date(response[i].dateIssued.value).toLocaleString() + " - " + response[i].data.value[names[2]]);
				}
				GraphData.titles[0] = roomName;
				GraphData.titles[1].push("Light bulb status on each alert");
				GraphData.data.push(valueList);
				sendGraph()
			// Other datasets
			} else {
				for (var i = 0; i < rooms.length; i++) {
					var dataButton = createDataButton(sourceName, roomName, rooms[i], object, "");
					btnList.push(dataButton);
				}
			}
		activated = true;

		// Buttons are drawn here
		for (var i=0; i < btnList.length; i++) {
			tab.appendChild(btnList[i])
		}
		tab.style.border = "1px ridge blue";
		btn.style.backgroundColor = "#2f6a31";

		// Buttons are closed here
		} else {
			// Since this createRoom() always creates single set of buttons,
			// all buttons on the list can be deleted
			for (var i=0; i < btnList.length; i++) {
				tab.removeChild(btnList[i])
			}
			if (!tab.innerHTML) {
				tab.style.border = "";
				btn.style.backgroundColor = "#4CAF50";
			} else {
				tab.style.border = "1px ridge blue";
				btn.style.backgroundColor = "#4CAF50";
			}
			btnList = [];
			activated = false;

			var buttons = Object.keys(object.id);

			// Delete all graphs listed under the room
			for (var j=0; j<buttons.length; j++) {
				var index = GraphData.id.indexOf(buttons[j]);
				if (index > -1) {
					GraphData.id.splice(index, 1);
					GraphData.titles[1].splice(index, 1);
					GraphData.data.splice(index, 1);
				}
			}
			// Update graph
			sendGraph()
		}
	}
	return btn;
}

/* Removed alertButton, place old alertButton same place to deviceName */
function createDataButton(sourceName, roomName, deviceName, object, alertButton) {
	var activated = false;
	var btn = document.createElement("BUTTON");
	if (object.AutomatedTime) {
		btn.innerHTML = alertButton;
	} else {
		btn.innerHTML = roomName + ": " + deviceName;
	}
	btn.style.backgroundColor = "#008CBA";
	btn.style.color = "white";
	btn.style["margin-bottom"] = "1px";

	// Request data from server
	btn.onclick = async function() {
		// Fetch data from Comet and draw it on Highcharts widget
		if (!activated) {
			var attribute = Object.keys(object.id[deviceName].attributes);
			var valueList = [];

			for (var a=0; a < attribute.length; a++) {
				var type = object.id[deviceName].attributes[attribute[a]].type;
				var description = object.id[deviceName].attributes[attribute[a]].description;
				var unit = object.id[deviceName].attributes[attribute[a]].unit;

				// Create Url's
					// Specific url for alert based data source
				if (object.AutomatedTime) {
					var minutes = '20';
					var alertDate = new Date(alertButton.slice(31));
					var titles = [roomName, minutes + " minutes around " + alertDate];
					var alertFrom = alertDate.setMinutes(alertDate.getMinutes() - parseInt(minutes));
					var alertTo = alertDate.setMinutes(alertDate.getMinutes() + 2 * parseInt(minutes));
					var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
						cometUrl += "/type/" + type + "/id/" + deviceName;
						cometUrl += "/attributes/" + attribute[a] + "?lastN=100";
						cometUrl += "&dateFrom=" + alertFrom + "&dateTo=" + alertTo;
					GraphData.data = [];
					GraphData.categories = [];
					GraphData.titles[1] = [];
					GraphData.id = [];
					sendGraph()
					GraphData.titles[0] = roomName + " - " + deviceName;
					GraphData.titles[1].push(minutes + " minutes around " + alertButton);
				}
				// General url for other data sources
				else {
					var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
						cometUrl += "/type/" + type + "/id/" + deviceName;
						cometUrl += "/attributes/" + attribute[a] + dateString;
				}

				// Fetch data
				var servicePath = object["Fiware-ServicePath"];
				var service = object["Fiware-Service"];
				var headers = await getHeader(servicePath, service);
				var response = await browser(cometUrl, headers);
				var values = response.contextResponses[0].contextElement.attributes[0].values;
				valueList.push({
					name: description + ` (${object.id[deviceName].attributes[attribute[a]].unit}) ` + deviceName,
					data: []
				})

				// Clear the categories(time stamps) in order to use the most recent time stamps for the graph
				GraphData.categories = [];
				// LastN search
				console.log(values)
				if (dateString.slice(1,6) === "lastN" || object.AutomatedTime) {
					for (var i=0; i < values.length; i++) {
						// Handle data with 3PhaseMeasurements
						if (typeof values[i].attrValue === "object") {
							var valueL1 = values[i].attrValue.L1;
							var valueL2 = values[i].attrValue.L2;
							var valueL3 = values[i].attrValue.L3;
							var avgValue = (valueL1 + valueL2 + valueL3) / 3;
							valueList[a].data.push(parseFloat(parseFloat(avgValue).toFixed(1)));
							GraphData.categories.push(new Date(values[i].recvTime.toLocaleString()));
						// Single value data
						} else {
							valueList[a].data.push(parseFloat(parseFloat(values[i].attrValue).toFixed(1)));
							GraphData.categories.push(new Date(values[i].recvTime).toLocaleString());
						}
					}
				// Timeperiod search
				} else {
					for (var i=0; i < values.length; i++) {
						for (var j=0; j < values[i].points.length; j++) {
							var date = new Date(values[i]._id.origin);
							// If value is undefined push null so that highcharts can still draw graph
							if (!values[i].points[j].max) {
								valueList[a].data.push(null);
							} else {
								valueList[a].data.push(values[i].points[j].max);
							}
							if (cometUrl.search("minute") > 0) {
								date.setMinutes(date.getMinutes() + values[i].points[j].offset);
							} else if (cometUrl.search("hour") > 0) {
								date.setHours(date.getHours() + values[i].points[j].offset);
							} else if (cometUrl.search("day") > 0) {
								date.setDate(date.getDate() + values[i].points[j].offset);
							} else if (cometUrl.search("month") > 0) {
								date.setMonth(date.getMonth() + values[i].points[j].offset);
							}
							GraphData.categories.push(new Date(date).toLocaleString());
						}
					}
				}
				// Send Curl everytime data is requested from Comet
				sendCurl(cometUrl, headers)
			}

			GraphData.titles[0] = sourceName;
			GraphData.titles[1].push(roomName);
			GraphData.data.push(valueList)

			// Send data to CSV Widget
			console.log(GraphData.categories);
			sendCSV(GraphData.categories, GraphData.data);

			// Different button id's for alert based data sources
			console.log(object)
			if (object.AutomatedTime) {
				GraphData.id.push(alertButton)
			} else {
				GraphData.id.push(deviceName)
			}
			// If data is not found send info through Highcharts widget
			if (values.length === 0) {
				sendGraph("Not found")
			} else {
				sendGraph()
			}
			btn.style.backgroundColor = "#006080";
			activated = true;
		// If button is pressed again, delete graphs from Highcharts widget
		} else {
		// Find the correct data source and delete the exact data from Highcharts widget
			// Different button id's for alert based data sources
			if (object.AutomatedTime) {
				var index = GraphData.id.indexOf(alertButton);
			} else {
				var index = GraphData.id.indexOf(deviceName);
			}
			if (index > -1) {
				GraphData.id.splice(index, 1);
				GraphData.titles[1].splice(index, 1);
				GraphData.data.splice(index, 1);
			}
			btn.style.backgroundColor = "#008CBA";
			sendGraph()
			activated = false;
		}
	}
	return btn;
}

function sendGraph(notFound) {
	// Function gets tempList and name outputs graph to Highcharts
	// Connect Graph to Highcharts Options in wiring mode.
	var dataList = [];

	if (notFound) {
		MashupPlatform.wiring.pushEvent("Graph", {
	        titles: ["Data not found, try other search parameters."],
	        categories: [],
	        data: [],
	    });
	} else {
		for (var i=0; i < GraphData.data.length; i++) {
			for (var j=0; j < GraphData.data[i].length; j++) {
				dataList.push(GraphData.data[i][j])
			}
		}

		MashupPlatform.wiring.pushEvent("Graph", {
	        titles: GraphData.titles,
	        categories: GraphData.categories,
	        data: dataList,
	    });
	}
}

// Sends Curl to Curl Widget
function sendCurl(url, headers) {
	var info = {
		headers : headers,
		url: url,
	}
	MashupPlatform.wiring.pushEvent("sendCurl", info);
}

// Sends data object to CSV_Object
function sendCSV(dates, values) {

	var context = {
		dates,
		values,
	};
	console.log(context);
	MashupPlatform.wiring.pushEvent("sendCSV", context);
}

function browser(searchUrl, searchHeaders) {
	// Sends all the requests based on URL and headers, returns JSON
	return new Promise(resolve => {
		setTimeout(() => {
			var cList = [];
			MashupPlatform.http.makeRequest(searchUrl,{
				// NGSI.Connection(searchUrl, {
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
			"Accept": "application/json",
			"Fiware-Service": service,
			"Fiware-ServicePath": servicePath,
			"Platform-ApiKey": "pfzGgAJEB0qxPPzk0LTVJstcAfZv3YmN",
			};
			resolve(header);
		}, 50);
	});
}

// Create buttons for every data source on platform
async function mainNew(object) {
	// Mainfunction
	// var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
	// var lastN = "?lastN=100";
	var tab = document.getElementsByClassName("sourceContainer")[0];
	var names = Object.keys(object);

	for(var i = 0; i < names.length; i++) {
		var mainBtn = createSourceButton(names[i], object[names[i]]);
		tab.appendChild(mainBtn);
	}
	MashupPlatform.wiring.registerCallback('recSearchInfo', function(string) {dateString=string; console.log("dates: "+ string)});
}

function waitingScreen() {
	// TO-DO: Waiting screen
	// document.body.innerHTML = '';
	// document.body.innerHTML = 'WAITING FOR INPUT OBJECT';
	// console.log("WAITING");
	// if (document.body.innerHTML) {
	// 	console.log("DONE")
	// }
}

waitingScreen();
MashupPlatform.wiring.registerCallback('recStartObject', function(content) {mainNew(content)});
