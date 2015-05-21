console.log('Loading a web page');

var states = "";


// initialise CasperJS
var casper = require('casper').create({
	pageSettings: {
        webSecurityEnabled: false
    },
	clientScripts: [] // to allow jQuery
    //verbose: true,
    //logLevel: "debug"
});

// sample event listeners
casper.on('navigation.requested', function(reurl, navigationType, navigationLocked, isMainFrame) {
    console.log('> Trying to navigate to: ' + reurl);
    console.log('> Caused by: ' + navigationType);
});

var url = 'http://localhost:8080/interactions/search.html';
var url = 'http://www.amazon.co.uk/';


function creatState(event, contents, callback) {

    var ID = Date.now(); // random ID

	var SCXML_stateOpen = '<state id="' + ID +'">';
	var SCXML_transition = '<transition event="' + event.type +'" target="'+event.target.id+'"/>';
	var SCXML_data = contents;
	var SCXML_stateClose = '</state>'

	states += SCXML_stateOpen + SCXML_transition + SCXML_data + SCXML_stateClose;

    callback();
}


var writeToFile = function(states) {

	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var myfile = "data-"+year + "-" + month + "-" + day+".html";

	try {
		// require access to file system
		var fs = require('fs');
		fs.write(myfile, SCXML, 'w');
	} catch(e) {
		console.log("Error when writing to file. Details: " + e);
	} finally {
	   console.log("Writing to file was successful.");
	}

}

var getAllParents = function(that) {
	var items = that.evaluate(function () {
        var nodes = $('[class*="search"],[name*="search"],
                       [id*="search"],[type="search"],
                       [placeholder*="search"],[title*="search"]').closest('form'); // bubbles up
        return [].map.call(nodes, function(node) {
            return node.outerHTML;
        });
    });
    //that.echo(items);
    return items;
}

var getLinks = function() {
    var links = $('div[id*="result"]');
    return Array.prototype.map.call(links, function(e) {
        //return e.getAttribute('href');
        return e.outerHTML;
    });
}



// parse the URL we want to listen to
casper.start(url, function() {
	// inject jQuery to simplify selectors, especially for fetching parent nodes
	this.page.injectJs('scripts/jQuery-2.1.3.min.js');

	/*
		omitted rules
	*/

    creatState(this.page.event, this.page.content, function() {});
});

casper.run(function() {
	writeToFile(dataAsHTML);
    this.exit();
});