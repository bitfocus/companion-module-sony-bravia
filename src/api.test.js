const api = require('./api.js')

test('parse device resource URI', () => {
	expect(api.parseDeviceResourceURI('extInput:hdmi?port=1')).toEqual({ kind: 'hdmi', port: 1 })
	expect(api.parseDeviceResourceURI('extInput:component?port=4')).toEqual({ kind: 'component', port: 4 })
	expect(api.parseDeviceResourceURI('foo:component?port=4')).toEqual(undefined)
	expect(api.parseDeviceResourceURI('')).toEqual(undefined)
	expect(api.parseDeviceResourceURI(undefined)).toEqual(undefined)
})

test('parse web app URL', () => {
	expect(
		api.parseWebAppURL(
			'com.sony.dtv.com.google.android.youtube.tv.com.google.android.apps.youtube.tv.activity.ShellActivity',
		),
	).toEqual({
		type: 'activity',
		value: 'com.sony.dtv.com.google.android.youtube.tv.com.google.android.apps.youtube.tv.activity.ShellActivity',
	})
	expect(api.parseWebAppURL('localapp://webappruntime?url=https%3A%2F%2Fpro-bravia.sony.net%2F')).toEqual({
		type: 'url',
		value: 'https://pro-bravia.sony.net/',
	})
	expect(api.parseWebAppURL('localapp://webappruntime?manifest=http%3A%2F%2F192.168.0.100%3A3000%2F')).toEqual({
		type: 'manifest',
		value: 'http://192.168.0.100:3000/',
	})
	expect(api.parseWebAppURL('localapp://webappruntime?auid=my-app-id-defined-in-manifest')).toEqual({
		type: 'auid',
		value: 'my-app-id-defined-in-manifest',
	})
	expect(api.parseWebAppURL('localapp://webappruntime?foo=bar')).toEqual(undefined)
	expect(api.parseWebAppURL('localapp://foo?bar=baz')).toEqual(undefined)
	expect(api.parseWebAppURL('http://example.com')).toEqual(undefined)
	expect(api.parseWebAppURL('https://example.com')).toEqual(undefined)
	expect(api.parseWebAppURL('')).toEqual(undefined)
	expect(api.parseWebAppURL(undefined)).toEqual(undefined)
})
