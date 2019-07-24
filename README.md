This document will give instructions how to use widget.
---

---
Widget receives object which it displays in simple text area.

{
	"Name1" : {
		Headers : {
			"Fiware-ServicePath" : "servicePath_1",
			"Fiware-Service" : "service_1",
		},
		url: "{DOMAIN_1}"
	},
	"Name2" : {
		Headers : {
			"Fiware-ServicePath" : "servicePath_2",
			"Fiware-Service" : "service_2",
		},
		url: "{DOMAIN_2}"
	},
}
Each call will init widget. Call can send as many objects as user wants. Each object must contain Headers and url.
# mainWidgetV2
