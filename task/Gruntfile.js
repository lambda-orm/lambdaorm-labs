module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt)
	grunt.initConfig({
		exec: {
			lint: { cmd: 'npx eslint src ' },
			release: { cmd: './task/release.sh' }
		}
	})
	grunt.registerTask('lint', ['exec:lint'])
	grunt.registerTask('release', ['exec:release'])
	grunt.registerTask('default', [])
}
