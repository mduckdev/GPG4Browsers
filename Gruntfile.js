
module.exports = function (grunt) {

    grunt.initConfig({
        shell: {
            nextBuild: {
                command: 'npx next build',
            },
            nextDev: {
                command: 'npx next dev',
                options: {
                    async: true
                }
            },
            tscBuild: {
                command: 'npx tsc -p ./tsconfig.build.json'
            },
            runWebExtDev: {
                command: 'npx web-ext run --source-dir=.next/server/app/',
                options: {
                    async: true
                }
            }
        },
        watch: {
            scripts: {
                files: ['./src/background.ts'],
                tasks: ['compile-if-changed'],
                options: {
                    spawn: false,
                },
            }
        },

        copy: {
            build: {
                files: [
                    {
                        src: 'manifest.json',
                        dest: './out/manifest.json'
                    },
                    {
                        expand: true,
                        cwd: 'icons/',
                        src: '**/*',
                        dest: './out/icons/'
                    }
                ]
            },
            dev: {
                files: [
                    {
                        src: './manifest.json',
                        dest: './.next/server/app/manifest.json'
                    },
                    {
                        expand: true,
                        cwd: 'icons/',
                        src: '**/*',
                        dest: './.next/server/app/icons/'
                    },
                    {
                        expand: true,
                        cwd: './.next/static/',
                        src: '**/*',
                        dest: './.next/server/app/_next/static/'
                    }
                ]
            }

        }

    });

    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-shell-spawn');

    grunt.registerTask('build-all', ['shell:nextBuild', 'shell:tscBuild', 'copy:build']);
    grunt.registerTask('compile-if-changed', function () {
        // Sprawdź, czy plik background.ts uległ zmianie
        if (grunt.file.exists('./src/background.ts')) {
            // Wykonaj kompilację TypeScript
            grunt.task.run('shell:tscBuild');
        }
    });
    grunt.registerTask('ext-dev', ['shell:nextDev', 'shell:tscBuild', 'copy:dev', 'shell:runWebExtDev', 'watch', 'shell:nextDev:kill', 'shell:runWebExtDev:kill']);


    grunt.registerTask('default', ['watch']);

};
