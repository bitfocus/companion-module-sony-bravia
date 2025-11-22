module.exports = {
	initActions: function () {
		let self = this
		let actions = {}

		actions.power_on = {
			name: 'Power On',
			options: [],
			callback: async function (action) {
				let params = { status: true }
				self.sendCommand('system', 'setPowerStatus', params)
			},
		}

		actions.power_off = {
			name: 'Power Off',
			options: [],
			callback: async function (action) {
				let params = { status: false }
				self.sendCommand('system', 'setPowerStatus', params)
			},
		}

		actions.reboot = {
			name: 'Reboot',
			options: [],
			callback: async function (action) {
				self.sendCommand('system', 'requestReboot', {})
			},
		}

		actions.volume_up = {
			name: 'Volume Up',
			options: [],
			callback: async function (action) {
				let params = { target: 'speaker', volume: '+1' }
				self.sendCommand('audio', 'setAudioVolume', params)
			},
		}

		actions.volume_down = {
			name: 'Volume Down',
			options: [],
			callback: async function (action) {
				let params = { target: 'speaker', volume: '-1' }
				self.sendCommand('audio', 'setAudioVolume', params)
			},
		}

		actions.volume_mute = {
			name: 'Volume Mute',
			options: [],
			callback: async function (action) {
				let params = { status: true }
				self.sendCommand('audio', 'setAudioMute', params)
			},
		}

		actions.volume_unmute = {
			name: 'Volume Unmute',
			options: [],
			callback: async function (action) {
				let params = { status: false }
				self.sendCommand('audio', 'setAudioMute', params)
			},
		}

		actions.change_external_input = {
			name: 'Change External Input',
			options: [
				{
					type: 'dropdown',
					label: 'Kind',
					id: 'kind',
					choices: [
						{ id: 'hdmi', label: 'HDMI' },
						// TODO(Someone): Add CEC, but the URI has a type and port is optional
						{ id: 'component', label: 'Component' },
						{ id: 'composite', label: 'Composite' },
						{ id: 'scart', label: 'SCART' },
						{ id: 'widi', label: 'Wi-Fi Display' },
					],
				},
				{
					type: 'dropdown',
					label: 'Port',
					id: 'port',
					choices: [
						{ id: '1', label: '1' },
						{ id: '2', label: '2' },
						{ id: '3', label: '3' },
						{ id: '4', label: '4' },
					],
				},
			],
			callback: async function (action) {
				let opt = action.options
				let uri = 'extInput:' + opt.kind + '?port=' + opt.port
				let params = { uri: uri }
				self.sendCommand('avContent', 'setPlayContent', params)
			},
		}

		actions.set_active_app = {
			name: 'Launch App',
			options: [
				{
					type: 'dropdown',
					label: 'Type',
					id: 'type',
					choices: [
						{ id: 'activity', label: 'Android Activity' },
						{ id: 'url', label: 'URL' },
						{ id: 'manifest', label: 'Manifest' },
						{ id: 'auid', label: 'Application ID' },
					],
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'app_value',
					default: '',
					required: true,
				},
			],
			callback: async function (action) {
				let opt = action.options
				const rawValue = opt.app_value.trim()
				const value = encodeURIComponent(rawValue)
				let params = {
					uri: opt.type === 'activity' ? '' : 'localapp://webappruntime?',
				}
				if (opt.type === 'url') {
					params.uri += 'url=' + value
				} else if (opt.type === 'manifest') {
					params.uri += 'manifest=' + value
				} else if (opt.type === 'auid') {
					params.uri += 'auid=' + value
				} else if (opt.type === 'activity') {
					params.uri += rawValue
				}
				self.sendCommand('appControl', 'setActiveApp', params)
			},
		}

		actions.terminate_apps = {
			name: 'Terminate All Apps',
			callback: async function (action) {
				let params = {}
				self.sendCommand('appControl', 'terminateApps', null)
			},
		}

		const PICTURE_SETTINGS = [
			{ id: 'color', label: 'Color', default: 50, min: 0, max: 100 },
			{ id: 'brightness', label: 'Brightness', default: 40, min: 0, max: 50 },
			{ id: 'contrast', label: 'Contrast', default: 90, min: 0, max: 100 },
			{ id: 'sharpness', label: 'Sharpness', default: 50, min: 0, max: 100 },
		]

		PICTURE_SETTINGS.forEach((setting) => {
			actions['set_' + setting.id] = {
				name: setting.label,
				options: [
					{
						type: 'number',
						label: setting.label,
						id: 'value',
						default: setting.default,
						min: setting.min,
						max: setting.max,
					},
				],
				callback: async function (action) {
					let opt = action.options
					let params = {
						settings: [
							{
								target: setting.id,
								value: opt.value.toString(),
							},
						],
					}
					self.sendCommand('video', 'setPictureQualitySettings', params)
				},
			}
		})

		self.setActionDefinitions(actions)
	},
}
