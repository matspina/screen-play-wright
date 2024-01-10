import { exec } from 'child_process'
import colors from 'colors'

const checkGitLfs = () => {
	const MESSAGES = {
		LFS_NOT_FOUND:
			`\n${colors.bold.red('>>> ERROR:')} GIT LFS not found. ` +
			'Please install it prior to commit images or content files. ' +
			`${colors.yellow('Check out ./README.md')} for help.\n`,
		LFS_NOT_STARTED:
			`\n${colors.bold.red('>>> ERROR:')} GIT LFS not started. Please run "${colors.yellow('git lfs install')}".\n` +
			`${colors.bold.yellow('>>> IMPORTANT:')} As you already added files to this commit without GIT LFS, ` +
			"you'll need to unstage and then add the files again, so that GIT LFS can track these files.\n"
	}
	const FILTER = {
		PNG: '1 A. .*\\.png|1 M. .*\\.png',
		JPEG: '1 A. .*\\.jpeg|1 M. .*\\.jpeg',
		JPG: '1 A. .*\\.jpg|1 M. .*\\.jpg',
		SITE_CONTENT: '1 A. .*site-content/.*/ui.content/.*original|1 M. .*site-content/.*/ui.content/.*original'
	}

	// First exec checks if there are files added to the commit which should be stored with GIT LFS
	exec(
		`git status --porcelain=2 | grep -E "${FILTER.PNG}|${FILTER.JPEG}|${FILTER.JPG}|${FILTER.SITE_CONTENT}"`,
		(empty, stdout, stderr) => {
			if (stderr) {
				console.error(`stderr: ${stderr}`)
				process.exit(1)
			}
			if (empty) return
			if (stdout) {
				// If so, checks if GIT LFS is installed
				exec('git lfs -v', (error, stdout1, stderr1) => {
					if (error) {
						console.error(MESSAGES.LFS_NOT_FOUND)
						process.exit(1)
					}
					if (stderr1) {
						console.error(stderr1)
						process.exit(1)
					}
					if (stdout1) {
						// If so, checks if GIT LFS is started locally, by getting the LFS keyword in the git-lfs status
						// It should return the files which are added to the commit with LFS
						// Note: If contains "LFS:.* -> Git:" it means that it's reverting the LFS to normal Git file and should give error
						exec('git lfs status | grep LFS: | grep -v "LFS:.* -> Git:"', (error1, _stdout2, stderr2) => {
							if (error1) {
								console.error(MESSAGES.LFS_NOT_STARTED)
								process.exit(1)
							}
							if (stderr2) {
								console.error(stderr2)
								process.exit(1)
							}
						})
					}
				})
			}
		}
	)
}

checkGitLfs()
