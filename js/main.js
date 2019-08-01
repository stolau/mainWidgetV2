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

var aggrMethod = 'max';
var aggrPeriod = 'hour';
var inputDates = ["2019-01-01T00:00", "2019-07-31T00:00"];
var inputNValue = '42';
var minutes = '10';
var dateString = "?lastN=100";


function createSourceButton(sourceName, object) {
	var activated = false;
	var tab = document.getElementsByClassName("roomContainer")[0];
	var btn = document.createElement("BUTTON");
	// var rooms = Object.keys(object[sourceName]);
	var rooms = Object.keys(object);

	btn.innerHTML = sourceName;
	btn.style.backgroundColor = "#EAEDED";

	btn.onclick = function() {
		if (!activated) {
			tab.style.border = "1px ridge green";
			for (var i = 0; i < rooms.length; i++) {
				// var roomBtn = createRoomButton(sourceName, rooms[i], object);
				var roomBtn = createRoomButton(sourceName, rooms[i], object[rooms[i]]);
				tab.appendChild(roomBtn);
			}
			btn.style.backgroundColor = "#acb9b9";
			activated = true;
		} else {
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
	// var rooms = Object.keys(object[sourceName][roomName].id);
	console.log(object);
	var rooms = Object.keys(object.id);
	btn.innerHTML = roomName;
	btn.style.backgroundColor = "#4CAF50";
	btn.style.color = "white";

	btn.onclick = async function() {
		if (!activated) {
			
			if (object["AutomatedTime"]) {
				var headers = await getHeader(object["Fiware-AlertServicePath"], object["Fiware-Service"]);
				var response = await browser("http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id", headers);
				console.log(response);
				var categories = [];
				var titles = [roomName, "Light bulb status on each alert", "", "Bulb count"];
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
				for (var i=0; i < response.length; i++) {
					var dataButton = createDataButton(sourceName, roomName, rooms[i], object, response[i].id);
					tab.appendChild(dataButton);
					console.log(response[i]);
					for(var j = 0; j < valueList.length; j++) {
						valueList[j].data.push(response[i].data.value[valueList[j].name]);
					}
					// TO-DO: Find way to find type (response[i].data.value.bulbType
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
			tab.innerHTML = '';
			btn.style.backgroundColor = "#4CAF50";
			activated = false;
		}
	}
	return btn;
}

/* Removed alertButton, place old alertButton same place to deviceName */ 
function createDataButton(sourceName, roomName, deviceName, object, alertButton) {
	var btn = document.createElement("BUTTON");
	if (object["AutomatedTime"]) {
		btn.innerHTML = alertButton;
	} else {
		btn.innerHTML = deviceName;
	}
	btn.style.backgroundColor = "#008CBA";
	btn.style.color = "white";
	btn.style["margin-bottom"] = "1px";


	// Request data from server
	btn.onclick = async function() {
		// console.log(Object.keys(object.id[deviceName]))
		var attribute = Object.keys(object.id[deviceName].attributes);

		var valueList = [];
		
		console.log(object);

		for (var a=0; a < attribute.length; a++) {
			var type = object.id[deviceName].attributes[attribute[a]].type;
			var description = object.id[deviceName].attributes[attribute[a]].description;
			var unit = object.id[deviceName].attributes[attribute[a]].unit;

			if (object["AutomatedTime"]) {
				// TO-DO: Something wrong with alertFrom and alertTo
				var alertDate = new Date(alertButton.slice(31));
				var titles = [roomName, minutes + " minutes around " + alertDate, "", "y-axel"];
				var alertFrom = alertDate.setMinutes(alertDate.getMinutes() - parseInt(minutes));
				var alertTo = alertDate.setMinutes(alertDate.getMinutes() + 2 * parseInt(minutes));
				var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
					cometUrl += "/type/" + type + "/id/" + deviceName;
					cometUrl += "/attributes/" + attribute[a] + "?lastN=100";
					cometUrl += "&dateFrom=" + alertFrom + "&dateTo=" + alertTo;
			}
			else {
				var cometUrl = "https://cors-anywhere.herokuapp.com/pan0107.panoulu.net:8000/comet/STH/v1/contextEntities";
				cometUrl += "/type/" + type + "/id/" + deviceName;
				cometUrl += "/attributes/" + attribute[a] + dateString;
				var titles = [roomName + " - " + deviceName, "TODO", "TODO2", "TODO3"];
			}

			console.log(cometUrl)

			var servicePath = object["Fiware-ServicePath"];
			var service = object["Fiware-Service"];
			var headers = await getHeader(servicePath, service);
			var response = await browser(cometUrl, headers);

			var values = response.contextResponses[0].contextElement.attributes[0].values;
			var categories = [];
				valueList.push({
				name: description,
				data: []
			})
			// Timeperiod data
			// TO-DO: inputValue is not used anymore, some fixes to makeRequest
			/* Alternative solution to change Input widget to change value of inputNValue
			at same time when changing dateString */
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
						// TO-DO: Change time to show only YYYY-MM-DD:HH:mm
						// Easier to compare Dates
						console.log(values[i].recvTime);
						categories.push(new Date(values[i].recvTime));
					}
				}
			}
		}
		sendCSV(categories, valueList);
		sendGraph(valueList, categories, titles)
		console.log(valueList);
		console.log(categories);
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
function sendCSV(dates, values) {
	
	var context = {
		"dates" : dates,
		
		"values" : {
			values,
		}
	};
	MashupPlatform.wiring.pushEvent("sendCSV", context);
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

// Create buttons for every data source on platform
async function mainNew(object) {
	//Mainfunction
	// var url = "http://pan0107.panoulu.net:8000/orion/v2/entities?limit=300&options=count&orderBy=id";
	// var lastN = "?lastN=100";
	// document.body.innerHTML = '';
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
	console.log("WAITING");
}

// mainNew(dataObject);
waitingScreen();
MashupPlatform.wiring.registerCallback('recStartObject', function(content) {mainNew(content)});
