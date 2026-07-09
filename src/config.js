const { Regex } = require('@companion-module/base')

module.exports = {
	getConfigFields() {
		let self = this

		return [
			{
				type: 'static-text',
				id: 'info',
				width: 12,
				label: 'Information',
				value: 'This module controls Sony Bravia TVs. The TV will need to be configured with a Pre Shared Key (PSK).',
			},
			{
				type: 'textinput',
				id: 'host',
				label: 'Target IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'psk',
				label: 'Pre Shared Key (PSK)',
				width: 6,
			},
			{
				type: 'dropdown',
				id: 'protocols',
				label: 'Protocol',
				width: 6,
				default: 'http',
				choices: [
					{ id: 'http', label: 'HTTP' },
					{ id: 'https', label: 'HTTPS' }
				]
			},
			{
				type: 'checkbox',
				id: 'polling',
				label: 'Enable Polling',
				width: 12,
				default: true,
			},
			{
				type: 'static-text',
				id: 'intervalInfo',
				width: 9,
				label: 'Update Interval',
				value: 'Please enter the amount of time in milliseconds to request new information from the device.',
				isVisible: (configValues) => configValues.polling == true,
			},
			{
				type: 'textinput',
				id: 'interval',
				label: 'Update Interval',
				width: 3,
				default: 1000,
				isVisible: (configValues) => configValues.polling == true,
			},
			{
				type: 'static-text',
				id: 'info2',
				label: 'Verbose Logging',
				width: 12,
				value: `
					<div class="alert alert-info">
						Enabling this option will put more detail in the log, which can be useful for troubleshooting purposes.
					</div>
				`,
			},
			{
				type: 'checkbox',
				id: 'verbose',
				label: 'Enable Verbose Logging',
				default: false,
			},
			{
				type: 'checkbox',
				id: 'allowUnauthorizedCertificates',
				label: 'Allow Unauthorized Certificates',
				width: 6,
				default: false,
				isVisible: (configValues) => configValues.protocols === 'https',
			},
			{
				type: 'static-text',
				id: 'allowUnauthorizedCertificatesInfo',
				width: 12,
				value: `
						<h6>WARNING</h6>
						<p>
							This option is only for development purposees. We DO NOT recommend turning on this option in production.
						</p>
						<hr />
					`,
				isVisible: (configValues) => configValues.protocols === 'https' && configValues.allowUnauthorizedCertificates === true,
			},
		]
	},
}
