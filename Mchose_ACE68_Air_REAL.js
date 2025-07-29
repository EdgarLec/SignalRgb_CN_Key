export function Name() { return "Mchose ACE68 Air (Vraie Config)"; } 
export function VendorId() { return 0x41E4; }    // VID trouvé dans le système
export function ProductId() { return 0x2120; }   // PID trouvé dans le système
export function Publisher() { return "GitHub Copilot"; } 
export function DefaultPosition(){return [75, 25];}
export function DefaultScale(){return 8.0;}

export function ControllableParameters() 
{
	return [
		{"property":"shutdownColor", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"000000"},
		{"property":"LightingMode", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"009bde"}
	];
}

/* 
Time:2025/1/29
Author: GitHub Copilot
Version:V1.0
log:Plugin pour Mchose ACE68 Air avec vrais VID/PID (41E4:2120)
*/

const vKeyNames = [
	"Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "Backspace", "Delete",
	"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Page Up",
	"CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter", "Page Down",
	"Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift", "Up Arrow",
	"Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Fn", "Right Ctrl", "Left Arrow", "Down Arrow", "Right Arrow"
];

// Configuration 1: Layout séquentiel simple
const vKeys = [
	0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14,
	15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
	30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43,
	44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56,
	57, 58, 59, 60, 61, 62, 63, 64, 65, 66
];

const vKeyPositions = [
	[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0],
	[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1],
	[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [14, 2],
	[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [13, 3],
	[0, 4], [1, 4], [2, 4], [6, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4]
];

function hexToRgb(hex) 
{
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	let colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);

	return colors;
}

export function LedNames() 
{
	return vKeyNames;
}

export function LedPositions() 
{
	return vKeyPositions;
}

export function Initialize() 
{
	device.setControllableLeds(vKeyNames, vKeyPositions);
	device.setName("Mchose ACE68 Air");
	device.setSize([16, 5]);
	device.log("Mchose ACE68 Air initialized with VID:41E4 PID:2120");
}

export function Render() 
{
	sendColors();
	device.pause(1);
}

function sendColors(shutdown = false)
{
	let rgbdata = grabColors(shutdown);
	
	// Essayons différents formats de paquets
	let packet1 = [0x06, 0x08, 0x00, 0x00, 0x01, 0x00, 0x7a, 0x01];
	let packet2 = [0x07, 0x01, 0x02, 0x00, 0x01, 0x00, 0x7a, 0x01];
	let packet3 = [0x05, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x01];
	
	// Essayer le format principal d'abord
	try {
		packet1 = packet1.concat(rgbdata);
		device.send_report(packet1, 520);
	} catch (e) {
		device.log("Packet format 1 failed, trying alternative...");
		try {
			packet2 = packet2.concat(rgbdata);
			device.send_report(packet2, 264);
		} catch (e2) {
			device.log("Packet format 2 failed, trying simple format...");
			device.send_report(rgbdata, rgbdata.length);
		}
	}
}

function grabColors(shutdown = false) 
{
	let rgbdata = [];

	for(let iIdx = 0; iIdx < vKeys.length; iIdx++)
	{
		let iPxX = vKeyPositions[iIdx][0];
		let iPxY = vKeyPositions[iIdx][1];
		let color;

		if(shutdown)
		{
			color = hexToRgb(shutdownColor);
		}
		else if (LightingMode === "Forced")
		{
			color = hexToRgb(forcedColor);
		}
		else
		{
			color = device.color(iPxX, iPxY);
		}

		let iLedIdx = vKeys[iIdx] * 3;
		rgbdata[iLedIdx] = color[0];
		rgbdata[iLedIdx+1] = color[1];
		rgbdata[iLedIdx+2] = color[2];
	}

	// Padding pour différentes tailles possibles
	while(rgbdata.length < 512) {
		rgbdata.push(0);
	}
	
	return rgbdata;
}

export function Shutdown() 
{
	sendColors(true);
}

export function Validate(endpoint) 
{
	return endpoint.interface === 1 && endpoint.usage === 0x0001 && endpoint.usage_page === 0xff00;
}
