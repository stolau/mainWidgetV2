This document will give instructions how to use widget.
---

Purpose
---

Main Widget is used as communication device between other widgets.
It can create CSV files, maps and curls.

CSV_Widget: https://github.com/stolau/CSV_Widget
Map_Widget: https://github.com/stolau/Wirecloud_Map_Widget
CurlWidget: https://github.com/stolau/curlWidget

mainWidget is started by receiving following type of object through recStartObject endpoint:

	Name : {
		"secondary_name_1" : {
			"Fiware-ServicePath" : "<insert_ServicePath>",
			"Fiware-Service" : "<insert_Service>",
			"automatedTime" : false,
			"id" : {
				"<insert_id>" : {
					"attributes" : {
						"<insert_attribute>" : {
							"type" : "<insert_type>",
							"description" : "<insert_description",
							"unitCode" : "<insert_unitCode",
							"unit" : "<insert_unit>"
						},
					},
				},
			},
			"capacity" : "<insert_capacity>",
			"location" : "<insert_location>",
		},
		"secondary_name_2" : {
		...
		
Each "Name" creates First button to navigation screen and opens "secondary_name" once clicked.

Input_Widget (Currently unavailable for public) can be used to set time and type of the search.
More information about that later..

Once widget is connected and started. User can navigate and make searches to given Fiware services.

How to use
---
Upload mainWidgetV2.wgt to Fiware Wirecloud resources.
Insert widget to workspace and connect desired startpoint widget to it's recStartObject endpoint.
Connect wanted additions to widget.

Go to widget's settings and change it's URL and ApiKey.

Customization
---
If you want to customize the widget. Make your customizations, delete old mainWidgetV2.wgt, select all files in the folder, compress them to .zip and change .zip to .wgt manually.

