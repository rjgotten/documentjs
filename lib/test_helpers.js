var Browser = require("zombie"),
	connect = require("connect"),
	getPort = require("get-port");




var find = function(browser, property, callback, done){
	var start = new Date();
	var check = function(){
		if(browser.window && browser.window[property]) {
			callback(browser.window[property]);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done("failed to find "+property);
		}
	};
	check();
};
var waitFor = function(browser, checker, callback, done){
	var start = new Date();
	var check = function(){
		if(checker(browser.window)) {
			callback(browser.window);
		} else if(new Date() - start < 2000){
			setTimeout(check, 20);
		} else {
			done(new Error("checker was never true"));
		}
	};
	check();
};


var open = function(url, callback, done){
	getPort().then(function(port){
		var server = connect().use(connect.static(path.join(__dirname))).listen(port);
		var browser = new Browser();
		
		browser.visit("http://localhost:"+port+"/"+url)
			.then(function(){
				callback(browser, function(){
					server.close();
				})
			}).catch(function(e){
				server.close();
				done(e)
			});
	});
};

module.exports = {
	find: find,
	waitFor: waitFor,
	open: open
}
