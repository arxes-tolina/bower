var util = require('util');
var fs = require('graceful-fs');
var mout = require('mout');
var path = require('path');
var Resolver = require('./Resolver');
var FsResolver = require('./FsResolver');
var createError = require('../../util/createError');

function Bo2Resolver(decEndpoint, config, logger) {
    Resolver.call(this, decEndpoint, config, logger);

    this._source = Bo2Resolver.bo2Path.resolve(this._config.cwd, this._source);

    // If target was specified, simply reject the promise
    if (this._target !== '*') {
        throw createError('File system sources can\'t resolve targets', 'ENORESTARGET');
    }

    // If the name was guessed
    if (this._guessedName) {
        // Remove extension
        this._name = this._name.substr(0, this._name.length - path.extname(this._name).length);
    }
}

util.inherits(Bo2Resolver, FsResolver);
mout.object.mixIn(Bo2Resolver, FsResolver);

// We want to be able to resolve anything from anywhere inside this directory structure:
// <ROOT>
//   Projects
//     Web
//       <Project>
//         bower.json
//
//     Core
//       <Project>
//         bower.json
//
//   TestClients
//     <Project>
//       bower.json
//
// Valid-Syntax:
//   "foo": "bo2://<Project>
//
//  "foo": "bo2@<Project>
Bo2Resolver.bo2Path = {
    resolve: function(cwd, source) {
        // Get the project name
        var projectName = source.replace('bo2://', '').replace('bo2@', '');

        // Make sure that we are inside the expected directory structure
        var indexProjects = cwd.lastIndexOf(path.sep + "Projects" + path.sep);
        var indexTestClients = cwd.lastIndexOf(path.sep + "TestClients" + path.sep);
        var index = Math.max(indexProjects, indexTestClients);
        if (index < 0) {
            throw createError('Invalid bo2 directory structure', 'EINVEND');
        }

        var root = cwd.substring(0, index);

        // Make sure that our root directory has the expected structure
        var scanDirs = [];
        scanDirs.push(path.join(root, 'Projects', 'Web'));
        scanDirs.push(path.join(root, 'Projects', 'Core'));
        scanDirs.push(path.join(root, 'TestClients'));
        mout.array.forEach(scanDirs, function(scanDir) {
            var isDirectory;
            try {
                isDirectory = fs.statSync(scanDir).isDirectory();
            } catch(e) {
                isDirectory = false;
            }
            if (!isDirectory) {
                throw createError('Invalid bo2 directory structure', 'EINVEND');
            }
        });

        // Look for likely candidates
        var candidates = mout.array.map(scanDirs, function(scanDir) {
            return path.join(scanDir, projectName);
        });

        // Filter non-existent, non-directory candidates
        var sources = mout.array.filter(candidates, function(candidate) {
            try {
                return fs.statSync(candidate).isDirectory();
            } catch(e) {
                return false;
            }
        });


        if (!sources.length) {
            throw createError('Project ' + projectName + ' not found', 'ENOTFOUND');
        }

        // Make sure that we only have one match
        if (sources.length > 1) {
            throw createError('Ambiguous project name ' + projectName + ' in the bo2 directory structure', 'EAMBSOURCE');
        }

        return sources[0];
    }
};

module.exports = Bo2Resolver;
