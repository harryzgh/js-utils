var execSync = require('child_process').execSync
var pullAction = function () {
	var timer = setTimeout(function () {
        	execSync('git pull origin master')
		pullAction()
		console.log('test++++')
	}, 3000)
}
pullAction()
