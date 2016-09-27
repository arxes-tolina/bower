'use strict';

var tmp = require('tmp');
var childProcess = require('child_process');
var arraydiff = require('arr-diff');
var fs = require('fs');
var wrench = require('wrench');
var inquirer = require('inquirer');
var path = require('path');

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
        eslint: {
            options: {
                fix: true
            },
            files: [
                'Gruntfile.js',
                'bin/*',
                'lib/**/*.js',
                'test/**/*.js',
                '!test/assets/**/*',
                '!test/reports/**/*',
                '!test/sample/**/*',
                '!test/tmp/**/*'
            ]
        },
        simplemocha: {
            options: {
                reporter: 'spec',
                timeout: '15000'
            },
            full: {
                src: ['test/test.js']
            },
            short: {
                options: {
                    reporter: 'dot'
                },
                src: ['test/test.js']
            }
        },
        exec: {
            'assets': {
                command: 'node test/packages.js && node test/packages-svn.js'
            },
            'assets-force': {
                command: 'node test/packages.js --force && node test/packages-svn.js --force'
            },
            'cover': {
                command: 'node node_modules/istanbul/lib/cli.js cover --dir ./test/reports node_modules/mocha/bin/_mocha -- --timeout 30000 -R dot test/test.js'
            }
        },
        watch: {
            files: ['<%= eslint.files %>'],
            tasks: ['eslint', 'simplemocha:short']
        }
    });

    grunt.registerTask('assets', ['exec:assets-force']);
    grunt.registerTask('test', ['eslint', 'exec:assets', 'simplemocha:full']);
    grunt.registerTask('cover', 'exec:cover');
    grunt.registerTask('travis', ['eslint', 'exec:assets', 'exec:cover']);
    grunt.registerTask('default', 'test');
};
