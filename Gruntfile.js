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
			push: {
				cmd: 'git add . && git commit -m "chore(release): <%= version %>" && git push'
			},
			createReleaseBranch: {
				cmd: 'git checkout -b release/<%= version %> && git push --set-upstream origin release/<%= version %>'
			},
			mergeToMain: {
				cmd: 'git checkout main && git merge release/<%= version %> -m "chore(release): release <%= version %>" && git push'
			},
			mergeToOriginalBranch: {
				cmd: 'git checkout <%= originalBranch %> && git merge release/<%= version %> -m "chore(release): release <%= version %>" && git push'
			},
			removeLocalReleaseBranch: {
				cmd: 'git branch -D release/<%= version %>'
			},
			removeOriginReleaseBranch: {
				cmd: 'git push origin --delete release/<%= version %> --no-verify'
			}
		}
	})

	grunt.registerTask('get-version', 'get version from package.json', function () {
		const version = grunt.file.readJSON('./package.json').version
		grunt.config.set('version', version)
	})

	grunt.registerTask('exec-release', ['exec:standardVersion', 'get-version', 'exec:push', 'exec:createReleaseBranch', 'exec:mergeToMain', 'exec:mergeToOriginalBranch', 'exec:removeLocalReleaseBranch, exec:removeOriginReleaseBranch'])
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
