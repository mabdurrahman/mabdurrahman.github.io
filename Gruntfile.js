'use strict';

module.exports = function(grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    connect: {
      server: {
        options: {
          base: '.',
          port: 7070,
        },
      },
    },
    watch: {
      assets: {
        files: [
          'index.html',
          'assets/**/*.*'
        ],
      },
      options: {
        livereload: true,
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-contrib-watch');

  grunt.registerTask('default', [
    'connect',
    'watch',
  ]);
};
