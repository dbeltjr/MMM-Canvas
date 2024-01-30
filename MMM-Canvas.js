/* Magic Mirror
 * Module: MMM-CANVAS
 *
 * By Dale Belt
 *
 */
Module.register("MMM-Canvas", {

    // Module config defaults.
    defaults: {
		accessKey: "", //Access key
    updateInterval: 60 * 60 * 1000, //One hour
    colors: ["blue",],
    courses: ["28733",],
    urlbase: "dummyurl.edu",
    assignMaxLen: 35,
    assignToDisplay: 12,
    },

    getStyles: function() {
        return ["canvas.css"];
    },

    getScripts: function() {
        return ["moment.js"];
    },


	start: function() {
        Log.info("Starting module: " + this.name);
        this.CANVAS = {};
        this.scheduleUpdate();
    },


getDom: function() {
    var wrapper = document.createElement("div");
    wrapper.className = "wrapper";

    if (!this.loaded) {
        wrapper.innerHTML = this.translate("Loading Canvas . . .");
        wrapper.classList.add("bright", "light", "small");
        return wrapper;
    }

    var CANVAS = this.CANVAS;
	
    // Create legend for class-color association
	var legend = document.createElement("div");
	legend.classList.add("legend");

	for (var i = 0; i < this.config.courses.length; i++) {
		var legendItem = document.createElement("span");
		legendItem.classList.add("legend-item");
		legendItem.style.color = this.config.colors[i];
		legendItem.innerHTML = this.config.courseDesignators[i];
		legend.appendChild(legendItem);
	}
	// Legend title
	var legendContainer = document.createElement("div");
	legendContainer.classList.add("legend-container");

	// Add a title
	var title = document.createElement("div");
	title.classList.add("title", "align-left", "small", "bright");
	title.innerHTML = "Classes:";

	// Add the title and legend to the container
	legendContainer.appendChild(title);
	legendContainer.appendChild(legend);

	// Apply CSS to make title and legend inline, center them, and add space
	title.style.display = "inline-block";
	title.style.marginRight = "20px"; // Adjust the space to your preference
	legend.style.display = "inline-block";
	legend.style.verticalAlign = "top"; // Vertically center the legend

	wrapper.appendChild(legendContainer);

    // Create table
    var table = document.createElement("table");

    // Create header row
    var headerRow = document.createElement("tr");
    var headerColumn = document.createElement("th");
    headerColumn.classList.add("align-left", "small", "bright", "Currency");
    headerColumn.innerHTML = "Upcoming Assignments";
    headerRow.appendChild(headerColumn);

    var headerDueDate = document.createElement("th");
    headerDueDate.classList.add("align-left", "small", "bright", "DueDate");
    headerDueDate.innerHTML = "Due";
    headerRow.appendChild(headerDueDate);

    table.appendChild(headerRow);

    // Sort CANVAS data by due date
    CANVAS[1].sort((a, b) => new moment(a[1]) - new moment(b[1]));

    var assignToDisplay = this.config.assignToDisplay +1;
    for (var i = 0; i < Math.min(CANVAS[1].length, assignToDisplay); i++) {
        var row = document.createElement("tr");
        var classColumn = document.createElement("td");
        var dueDateColumn = document.createElement("td");

        classColumn.classList.add("align-left", "small");
        dueDateColumn.classList.add("align-left", "small");

        if (CANVAS[1][i][0] != "") {

		// Display class and color it based on the legend
		classColumn.innerHTML = CANVAS[1][i][0].slice(0, this.config.assignMaxLen);
		var courseValueString = String(CANVAS[1][i][2]);

		// Use the course value directly as an index for colors
		var courseIndex = parseInt(courseValueString, 10); // Assuming course values are numeric
		classColumn.style.color = this.config.colors[courseIndex] || "";

		// Display due date
		var m = moment(CANVAS[1][i][1]);
		dueDateColumn.innerHTML = m.format("M/D");
        }

        row.appendChild(classColumn);
        row.appendChild(dueDateColumn);
        table.appendChild(row);
    }

    wrapper.appendChild(table);

    // Display timestamp
    var timestamp = document.createElement("div");
    timestamp.classList.add("small", "bright", "timestamp");
    timestamp.innerHTML = "Last Checked " + moment().format('h:mm a') + " today";
    timestamp.style.fontSize = "x-small";
    wrapper.appendChild(timestamp);

    return wrapper;
},

    /////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_CANVAS') {
            this.hide();
        }  else if (notification === 'SHOW_CANVAS') {
            this.show(1000);
        }

    },


    processCANVAS: function(data) {
        this.CANVAS = data;
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getCANVAS();
        }, this.config.updateInterval);
        this.getCANVAS();
    },

    getCANVAS: function() {
        var payload = [this.config.accessKey, this.config.courses, this.config.urlbase];
        this.sendSocketNotification('GET_CANVAS', payload);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "CANVAS_RESULT") {
            this.processCANVAS(payload);

            this.updateDom();
        }
        this.updateDom();
    },
});
