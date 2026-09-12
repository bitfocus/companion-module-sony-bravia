module.exports = {
	initVariables: function () {
		let self = this

		let variables = []

		variables.push({ variableId: 'powerState', name: 'Power State' })
		variables.push({ variableId: 'muteState', name: 'Mute State' })
		variables.push({ variableId: 'volumeLevel', name: 'Current Volume Level' })
		variables.push({ variableId: 'input', name: 'Current Input' })
		variables.push({ variableId: 'webAppState', name: 'Current Web App State' })
		variables.push({ variableId: 'webAppType', name: 'Current Web App Type' })
		variables.push({ variableId: 'webAppValue', name: 'Current Web App Value' })
		variables.push({ variableId: 'webAppUrl', name: 'Current Web App URL' })

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
				webAppType: self.DATA.webAppType,
				webAppValue: self.DATA.webAppValue,
				webAppUrl: self.DATA.webAppUrl,
			})
		} catch (error) {
			self.log('error', 'Error setting variables: ' + error)
		}
	},
}
