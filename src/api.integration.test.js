const http = require('node:http')
const { InstanceStatus } = require('@companion-module/base')
const api = require('./api')
const actions = require('./actions')
const variables = require('./variables')
const feedbacks = require('./feedbacks')

const waitFor = async (condition) => {
	const deadline = Date.now() + 3000
	while (!condition()) {
		if (Date.now() > deadline) throw new Error('Timed out waiting for Bravia response')
		await new Promise((resolve) => setTimeout(resolve, 10))
	}
}

let server, instance, requests, rejectAuth
beforeEach(async () => {
	requests = []
	rejectAuth = false
	server = http.createServer((req, res) => {
		let body = ''
		req.on('data', (chunk) => (body += chunk))
		req.on('end', () => {
			const command = JSON.parse(body)
			requests.push({ path: req.url, headers: req.headers, command })
			res.setHeader('Content-Type', 'application/json')
			if (rejectAuth) {
				res.writeHead(403)
				res.end('{}')
				return
			}
			const results = {
				getCurrentExternalInputsStatus: [[{ uri: 'extInput:hdmi?port=2', title: 'HDMI 2' }]],
				getPowerStatus: [{ status: 'active' }],
				getVolumeInformation: [[{ volume: 42, mute: true }]],
				getPlayingContentInfo: [{ uri: 'extInput:hdmi?port=2' }],
			}
			res.end(JSON.stringify({ id: 1, result: results[command.method] || [] }))
		})
	})
	await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
	instance = {
		...api,
		...actions,
		...variables,
		...feedbacks,
		config: { host: `127.0.0.1:${server.address().port}`, psk: 'loopback-secret', polling: false },
		DATA: {},
		INTERVAL: null,
		CHOICES_INPUTS: [{ id: 'extInput:hdmi?port=1', label: 'HDMI 1' }],
		log: jest.fn(),
		updateStatus: jest.fn(),
		checkFeedbacks: jest.fn(),
		setVariableValues: jest.fn(),
		initPresets: jest.fn(),
		setFeedbackDefinitions(definitions) {
			this.feedbacks = definitions
		},
		setActionDefinitions(definitions) {
			this.actions = definitions
		},
	}
})
afterEach(async () => {
	instance.stopInterval()
	await new Promise((resolve) => server.close(resolve))
})

test('poll responses update variables, feedbacks and discovered inputs through real HTTP with PSK', async () => {
	instance.initConnection()
	await waitFor(() => instance.DATA.volumeLevel === 42 && instance.DATA.input && instance.DATA.inputs)
	expect(requests).toHaveLength(4)
	for (const request of requests) {
		expect(request.headers['x-auth-psk']).toBe('loopback-secret')
		expect(request.headers['content-type']).toContain('application/json')
		expect(request.command).toMatchObject({ version: '1.0', id: 1, params: [] })
	}
	expect(instance.DATA.powerState).toBe(true)
	expect(instance.DATA.muteState).toBe(true)
	expect(instance.CHOICES_INPUTS).toEqual([{ id: 'extInput:hdmi?port=2', label: 'HDMI 2' }])
	expect(instance.feedbacks.powerStatus.callback({ options: { state: true } })).toBe(true)
	expect(instance.feedbacks.muteStatus.callback({ options: { state: true } })).toBe(true)
	expect(instance.feedbacks.currentInput.callback({ options: { input: 'extInput:hdmi?port=2' } })).toBe(true)
	expect(instance.setVariableValues).toHaveBeenLastCalledWith({
		powerState: 'On',
		muteState: 'Muted',
		volumeLevel: 42,
		input: 'extInput:hdmi?port=2',
	})
})

test('all actions send Sony service, method and parameters using host-prepared options', async () => {
	instance.initActions()
	// API 1.13+ host prepares action options before invoking the SDK callback.
	const cases = [
		['power_on', 'system', 'setPowerStatus', { status: true }],
		['power_off', 'system', 'setPowerStatus', { status: false }],
		['volume_up', 'audio', 'setAudioVolume', { target: 'speaker', volume: '+1' }],
		['volume_down', 'audio', 'setAudioVolume', { target: 'speaker', volume: '-1' }],
		['volume_mute', 'audio', 'setAudioMute', { status: true }],
		['volume_unmute', 'audio', 'setAudioMute', { status: false }],
		['change_external_input', 'avContent', 'setPlayContent', { uri: 'extInput:hdmi?port=2' }],
	]
	for (const [id] of cases) await instance.actions[id].callback({ options: { kind: 'hdmi', port: '2' } })
	await waitFor(() => instance.checkFeedbacks.mock.calls.length === cases.length)
	for (const [, service, method, params] of cases) {
		expect(requests).toContainEqual(
			expect.objectContaining({
				path: `/sony/${service}`,
				command: { method, version: '1.0', id: 1, params: [params] },
			}),
		)
	}
})

test('missing PSK prevents requests; rejected PSK stops polling', async () => {
	instance.config.psk = ''
	instance.sendCommand('system', 'getPowerStatus', {})
	expect(instance.updateStatus).toHaveBeenCalledWith(InstanceStatus.BadConfig, 'No PSK set, not sending.')
	expect(requests).toHaveLength(0)
	instance.config.psk = 'wrong'
	rejectAuth = true
	instance.config.polling = true
	instance.config.interval = 1000
	instance.setupInterval()
	expect(instance.INTERVAL).not.toBeNull()
	instance.getInformation()
	await waitFor(() => instance.INTERVAL === null)
	expect(instance.updateStatus).toHaveBeenCalledWith(
		InstanceStatus.ConnectionFailure,
		'Error 403, PSK may be incorrect.',
	)
})

test('polling can be enabled, reconfigured and disabled', async () => {
	instance.config.polling = true
	instance.config.interval = 30
	instance.setupInterval()
	const first = instance.INTERVAL
	await waitFor(() => requests.length >= 6)
	instance.config.interval = 1000
	instance.setupInterval()
	expect(instance.INTERVAL).not.toBe(first)
	instance.config.polling = false
	instance.setupInterval()
	expect(instance.INTERVAL).toBeNull()
	await waitFor(() => instance.checkFeedbacks.mock.calls.length === requests.length)
})
