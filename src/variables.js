module.exports = {
	initVariables: function () {
		let self = this

		let variables = []

		variables.push({ variableId: 'powerState', name: 'Power State' })
		variables.push({ variableId: 'muteState', name: 'Mute State' })
		variables.push({ variableId: 'volumeLevel', name: 'Current Volume Level' })
		variables.push({ variableId: 'input', name: 'Current Input' })
		variables.push({ variableId: 'webAppState', name: 'Current Web App State' })
		variables.push({ variableId: 'webAppUrl', name: 'Current Web App URL' })
		variables.push({ variableId: 'color', name: 'Picture Settings - Color' })
		variables.push({ variableId: 'brightness', name: 'Picture Settings - Brightness' })
		variables.push({ variableId: 'contrast', name: 'Picture Settings - Contrast' })
		variables.push({ variableId: 'sharpness', name: 'Picture Settings - Sharpness' })

		self.setVariableDefinitions(variables)
	},

	checkVariables: function () {
		let self = this

		try {
			self.setVariableValues({
				powerState: self.DATA.powerState ? 'On' : 'Off',
				muteState: self.DATA.muteState ? 'Muted' : 'Unmuted',
				volumeLevel: self.DATA.volumeLevel,
				input: self.DATA.input,
				webAppState: self.DATA.webAppState ? 'Active' : 'Inactive',
				webAppUrl: self.DATA.webAppUrl,
				color: self.DATA.color,
				brightness: self.DATA.brightness,
				contrast: self.DATA.contrast,
				sharpness: self.DATA.sharpness,
			})
		} catch (error) {
			self.log('error', 'Error setting variables: ' + error)
		}
	},
}
