module.exports = function (grunt) {
	require('load-grunt-tasks')(grunt)
	grunt.initConfig({
		exec: {
			lint: { cmd: 'npx eslint src ' },
			getOriginalBranch: {
				cmd: 'git branch | sed -n -e \'s/^\\* \\(.*\\)/\\1/p\'',
				callback: function (error, stdout, stderr) {
					if (error) {
						grunt.log.error(stderr)
					} else {
						grunt.config.set('originalBranch', stdout.trim())
					}
				}
			},
			standardVersion: {
				cmd: 'standard-version'
			},
			gitFlowRelease: {
				cmd: `git add . && git commit -m "chore(release): <%= version %>" && git push
				  &&  git checkout main && git merge develop -m "chore(release): <%= version %>" && git push
				  &&  git checkout develop
				`
			}
		}
	})
	grunt.registerTask('get-version', 'get version from package.json', function () {
		const version = grunt.file.readJSON('./package.json').version
		grunt.config.set('version', version)
	})
	grunt.registerTask('changelog-format', 'apply format to changelog', function () {
		const changelog = grunt.file.read('CHANGELOG.md')
		let newChangelog = changelog.replace(/https:\/\/github.com\/FlavioLionelRita\/lambdaorm-cli\/issues\//g, 'https://github.com/lambda-orm/lambdaorm/issues/')
		newChangelog = newChangelog.replace(/\n### Bug Fixes/g, '**Bug Fixes:**')
		newChangelog = newChangelog.replace(/\n### Features/g, '**Features:**')
		grunt.file.write('CHANGELOG.md', newChangelog)
	})	
	grunt.registerTask('exec-release', ['exec:standardVersion', 'changelog-format', 'get-version', 'exec:gitFlowRelease'])
	grunt.registerTask('run-release-if-applicable', 'run release if applicable', function () {
		const originalBranch = grunt.config.get('originalBranch')
		if (originalBranch === 'develop' || originalBranch.startsWith('hotfix')) {
			grunt.task.run('exec-release')
		} else {
			grunt.log.writeln('Current branch ' + originalBranch + ', cannot release from branch different from develop or hotfix.')
		}
	})
	grunt.registerTask('lint', ['exec:lint'])
	grunt.registerTask('release', ['exec:getOriginalBranch', 'run-release-if-applicable'])
	grunt.registerTask('default', [])
}
