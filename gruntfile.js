module.exports = function(grunt) {
  grunt.initConfig ({
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
          'public/stylesheets/style.css' : 'sass/style.scss'
        }
      }
    },
    watch: {
      options: {
        livereload: true
      },
      css: {
        files: ['sass/**/*.scss'],
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
  grunt.registerTask('default', ['jshint', 'sass', 'watch']);
};
