module.exports = function (grunt) {
    grunt.initConfig({
        shell: {

            runWebExtDev: {
                command: 'npx web-ext run --devtools --source-dir=./dist/',
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            runWebpackDev: {
                command: 'npx webpack -w --config ./webpack.dev.js',
                options: {
                    stdout: true,
                    stderr: true
                }
            },
            runWebpackProd:{
                command: 'npx webpack -w --config ./webpack.prod.js',
                options: {
                    stdout: true,
                    stderr: true
                }
            }
        },
        copy: {
            build: {
                files: [
                    {
                        src: 'manifest.json',
                        dest: './dist/manifest.json'
                    },
                    {
                        src: './src/popup.html',
                        dest: './dist/popup.html'
                    },
                    {
                        expand: true,
                        cwd: 'icons/',
                        src: '**/*',
                        dest: './dist/icons/'
                    }
                ]
            }
        },
        clean: {
            dist: "./dist/*",
          },
        concurrent: {
            dev: [
                'shell:runWebpackDev',
                'shell:runWebExtDev'
            ],
            options: {
                logConcurrentOutput: true
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell-spawn');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');

    grunt.registerTask('ext-dev', [
        'clean:dist',
        'copy:build',
        'concurrent:dev'
    ]);
    grunt.registerTask('ext-prod', [
        'clean:dist',
        'copy:build',
        'shell:runWebpackProd',
        'shell:runWebpackProd:kill'

    ]);

    grunt.registerTask('default', ['ext-dev']);
};
