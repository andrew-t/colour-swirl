window.addEventListener('resize', setSize);
document.addEventListener('DOMContentLoaded', setSize);
function setSize(e) {
	const scale = window.innerHeight / window.innerWidth;
	const els = document.getElementsByClassName('background');
	for (let i = 0; i < els.length; ++i)
		els[i].style.transform = `scale(1, ${scale})`;
}

let lastFrame,
	t;
const rects = [];
const spin = {
	omega: Math.random() * 0.0001 + 0.00003,
	phase: Math.random()
};
document.addEventListener('DOMContentLoaded', firstFrame);
function firstFrame() {
	lastFrame = Date.now();
	for (let i = 1; true; ++i) {
		const rect = document.getElementById(`c${i}`);
		if (!rect) break;
		rects.push({
			rect,
			gradient: document.getElementById(`g${i}`),
			startStop: document.getElementById(`s${i}`),
			endStop: document.getElementById(`e${i}`),
			hue: {
				omega: Math.random() * 0.0001 + 0.00003,
				phase: Math.random()
			},
			spinOffset: Math.PI * 2 * i / 3
		});
	}
	drawFrame(t = 0);
	window.requestAnimationFrame(frame);
}
function frame() {
	const now = Date.now(),
		dt = Math.min(now - lastFrame, 150);
	lastFrame = now;
	drawFrame(t += dt);
	window.requestAnimationFrame(frame);
}

function drawFrame(t) {
	// colour
	const hues = rects.map(rect => rect.hue);
	hues.forEach(v => {
		v.value = t * v.omega + v.phase;
		v.rgb = hslToRgb(v.value % 1, 0.5, 0.5);
	});
	for (let i = 0; i < 3; ++i) {
		let total = hues.reduce((c, n) => c + n.rgb[i], 0),
			min = Math.min(...hues.map(v => v.rgb[i])),
			max = Math.max(...hues.map(v => v.rgb[i]));
		if (min == max) {
			min -= 0.1;
			max += 0.1;
		}
		// hues.forEach(v => v.rgb[i] = Math.round(v.rgb[i] * 255 / total));
		// hues.forEach(v => v.rgb[i] = Math.round((v.rgb[i] - min) * 255 / (total - min * 3)));
		// hues.forEach(v => v.rgb[i] = Math.round((v.rgb[i] - min) * 255 / (max - min)));
		hues[hues.length - 1].rgb[i] = 255 - (total - hues[hues.length - 1].rgb[i]);
	}
	rects.forEach(r => {
		r.endStop.setAttribute('stop-color',
			`rgb(${r.hue.rgb.join(', ')})`);
	});

	// spin
	const theta = t * spin.omega + spin.phase;
	rects.forEach(r => {
		const x = Math.sin(theta + r.spinOffset) / 2,
			y = Math.cos(theta + r.spinOffset) / 2;
		r.gradient.setAttribute('x1', x + 0.5);
		r.gradient.setAttribute('y1', y + 0.5);
		r.gradient.setAttribute('x2', 0.5 - x);
		r.gradient.setAttribute('y2', 0.5 - y);
	});
}

// https://stackoverflow.com/a/9493060/1491108
function hslToRgb(h, s, l){
    var r, g, b;

    if (s == 0)
        r = g = b = l; // achromatic
    else {
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return [ Math.round(r * 255), Math.round(g * 255), Math.round(b * 255) ];
}
function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2/3 - t) * 6;
    return p;
}
