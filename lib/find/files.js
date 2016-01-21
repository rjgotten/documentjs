var Glob = require("glob").Glob,
	Q = require("q"),
	_ = require("lodash"),
	minimatch = require("minimatch"),
	util = require("util"),
	EventEmitter = require("events");

/**
 * @function documentjs.find.files
 * 
 * @parent documentjs.find.methods
 * 
 * @signature `.find.files(options)`
 * 
 * @param {Object} options Options that configure the behavior of the
 * files that will be processed.  
 * 
 * @option {String|documentjs.find.globObject} glob The glob
 * option either specifies a [minmatch](https://github.com/isaacs/minimatch) 
 * pattern like:
 * 
 *     documentjs.find.files({glob: "*.js"})
 * 
 * Or a [documentjs.find.globObject GlobObject] that specifies the 
 * a [minmatch](https://github.com/isaacs/minimatch) pattern and
 * other options like:
 * 
 *     documentjs.find.files({
 *       glob: {
 *         pattern: "*.js",
 *         cwd: __dirname  
 *       }
 *     })
 * 
 * @return {documentjs.process.types.FileEventEmitter} An event emitter that
 * emits events for matched files.
 */
module.exports = function( options ) {
	var
		emitter = new EventEmitter(),
		remaining;
	
	options = options.glob;
	
	if (!util.isArray(options)) {
		options = [options];
	}
	
	remaining = options.length;

	options.forEach( function( options ) {
		var
			pattern,
			glob,
			ignore;
		
		if (typeof options === "string") {
			pattern = options;
			options = {};
		} else {
			pattern = options.pattern;
			options = _.extend({}, options);
			delete options.pattern;
		}
		
		glob = new Glob(pattern, options);
		ignore = options.ignore;

		if (ignore && !util.isArray(ignore)) {
			ignore = [ignore];
		}
		
		glob.on( "match", function( filepath ) {
			for (var i = 0; ignore && (i < ignore.length); i++) {
				if (minimatch(filepath, ignore[i])) return;
			}

			emitter.emit( "match", filepath, glob.cwd );
		});
		
		glob.on( "end", function() {
			if ( --remaining === 0 ) {
				emitter.emit( "end" );
			}
		})

	});

	return emitter;
};