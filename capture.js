console.log('Loading a web page');

//phantomjs
var page = require('webpage').create();
var states = "";
var content = "";

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
// navigationType : Possible values include: 'Undefined', 'LinkClicked', 'FormSubmitted', 'BackOrForward', 'Reload', 'FormResubmitted', 'Other'
/*casper.on('navigation.requested', function(reurl, navigationType, navigationLocked, isMainFrame) {
    this.echo('> Trying to navigate to: ' + reurl);
    this.echo('> Caused by: ' + navigationType);
    addState(this.getHTML(), navigationType);
});*/

casper.on('load.finished', function() {
	// capture the full page once it's loaded
	addState(this.getHTML(), "onLoad");
});

casper.on('click', function() {
    addState(this.getHTML(), "click");
});

casper.on('mouse.click', function() {
    addState(this.getHTML(), "mouse.click");
});

casper.on('mouse.down', function() {
    addState(this.getHTML(), "mouse.down");
});


casper.on('mouse.up', function() {
    addState(this.getHTML(), "mouse.up");
});


casper.on('back', function() {
    addState(this.getHTML(), "back");
});



// var url = 'http://localhost:8080/interactions/search.html';
var url = 'http://www.amazon.co.uk/';
//var url =  'http://mysmallwebpage.com/';

// parse the URL we want to listen to
casper.start(url, function() {
	// inject jQuery to simplify selectors, especially for fetching parent nodes
	//console.log("injecting jQuery");
	//this.page.injectJs('scripts/jQuery-2.1.3.min.js');
	//console.log("jQuery injected");

	// sample user journey of buying the book "art of war"
	// 1. navigate to search bar
	console.log("1.  navigate to search bar");
	selector = "form[name=site-search] input[name='field-keywords']";
	this.click(selector);
	this.captureSelector('img'+Date.now()+'.png', selector);
	// 2. type in "art of war" in the search bar
	console.log("2. type in \"art of war\" in the search bar");
	selector = "input[name='field-keywords']", "art of war\r";
	this.sendKeys(selector);
	this.captureSelector('img'+Date.now()+'.png', selector);
	// 3. press Enter
	console.log("3. press Enter");
	selector = "form[name=site-search] input[type=submit][value='Go']";
	this.click(selector);
	this.captureSelector('img'+Date.now()+'.png', selector);
	
});

casper.thenOpen('http://www.amazon.co.uk/s/ref=nb_sb_noss?url=search-alias%3Daps&field-keywords=art+of+war&rh=i%3Aaps%2Ck%3Aart+of+war', function() {
    // 4. click on first result
	console.log("4. click on first result");
	selector = "#result_0 .s-access-image.cfMarker";
	this.click(selector);
	this.captureSelector('img'+Date.now()+'.png', selector);
});


casper.thenOpen('http://www.amazon.co.uk/Art-War-Sun-Tzu/dp/0981162614/ref=sr_1_1?ie=UTF8&qid=1433193464&sr=8-1&keywords=art+of+war', function() {
    // 5. add to basket
	console.log("5. add to basket");
	selector = "form#addToCart input[type=submit][value='Add to Basket']";
	this.click(selector);
	this.captureSelector('img'+Date.now()+'.png', selector);
});

casper.thenOpen('http://www.amazon.co.uk/gp/huc/view.html?ie=UTF8&newItems=C2QUQWE1PVMR8V%2C1', function() {
	// 6. get to "proceed to checkout" page
	console.log("Done.");
});



casper.run(function() {
	console.log("writing to file...");
	writeToFile(states);
	console.log("writing to file finished!");
	console.log("Exiting...");
    this.exit();
});



















var addState = function(html, event) {
    var ID = Date.now(); // random ID
	var SCXML_stateOpen = '<state id="' + ID +'">\n';
	var SCXML_transition = "";
	if (event.type) {
		SCXML_transition = '<transition event="' + event.type +'" target="'+event.target.id+'"/>\n';
	} else {
		SCXML_transition = '<transition event="' + event +'" target="NEXT"/>\n';
	} 
	var SCXML_data = html+'\n';
	var SCXML_stateClose = '</state>\n'
	states += SCXML_stateOpen + SCXML_transition + SCXML_data + SCXML_stateClose;
}

var writeToFile = function(states) {
	var currentTime = new Date();
	var month = currentTime.getMonth() + 1;
	var day = currentTime.getDate();
	var year = currentTime.getFullYear();
	var myfile = "data-"+year + "-" + month + "-" + day+".html";
	var content = '<?xml version="1.0" encoding="UTF-8"?>\n<journey>\n' + states + '</journey>';
	try {
		// require access to file system
		var fs = require('fs');
		fs.write(myfile, content, 'w');
	} catch(e) {
		console.log("Error when writing to file. Details: " + e);
	} finally {
	   console.log("Writing to file was successful.");
	}

}


var getAllParents = function(that) {
	var items = that.evaluate(function () {
        var nodes = $('[class*="search"],[name*="search"],[id*="search"],[type="search"],[placeholder*="search"],[title*="search"]').closest('form'); // bubbles up
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
