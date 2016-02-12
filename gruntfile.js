module.exports = function(grunt) {
  grunt.initConfig ({
    browserify: {
      js: {
        src: 'src/js/*.js',
        dest: 'public/js/bundle.js'
      },
    },
    jshint: {
      files: '*.js'
    },
    jade: {
      compile: {
        options: {
          pretty: true,
        },
        files: {
          'public/index.html': 'views/index.jade'
        }
      }
    },
    sass: {
      dist: {
        files: {
          'public/css/style.css' : 'src/sass/style.scss'
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      css: {
        files: ['src/sass/**/*.scss'],
        tasks: ['sass'],
      },
      jade: {
        files: 'views/*.jade',
        tasks: ['jade'],
      },
      jshint: {
        files: '*.js',
        tasks: ['jshint'],
      }
    }
  });

  grunt.loadNpmTasks('grunt-sass');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-jade');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.registerTask('default', ['browserify', 'jshint', 'sass', 'watch']);
};
