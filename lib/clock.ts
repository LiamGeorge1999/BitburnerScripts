export function localeHHMMSS(ms: number = 0) {
	var now = new Date().getTime();
	if (!ms) {
		return new Date(now).toLocaleTimeString();
	}
	return new Date(ms + now).toLocaleTimeString();
}

export function getTimeString(ms: number = 0) {
	return localeHHMMSS(ms);
}