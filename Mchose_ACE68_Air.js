export function Name() { return "Mchose ACE68 Air"; } 
export function VendorId() { return 0x258a; }
export function ProductId() { return 0x0109; }  // ID différent pour ce modèle spécifique
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
log:Plugin spécifique pour Mchose ACE68 Air
*/

const vKeyNames = [
	"Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_", "=+", "Backspace", "Delete",
	"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Page Up",
	"CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter", "Page Down",
	"Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift", "Up Arrow",
	"Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Fn", "Right Ctrl", "Left Arrow", "Down Arrow", "Right Arrow"
];

const vKeys = [
	0, 6, 12, 18, 24, 30, 36, 42, 48, 54, 60, 66, 72, 78, 84,
	1, 7, 13, 19, 25, 31, 37, 43, 49, 55, 61, 67, 73, 79, 85,
	2, 8, 14, 20, 26, 32, 38, 44, 50, 56, 62, 68, 74, 86,
	3, 9, 15, 21, 27, 33, 39, 45, 51, 57, 63, 69, 81,
	4, 10, 16, 34, 52, 58, 64, 70, 76, 82
];

const vKeyPositions = [
	[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0],
	[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1],
	[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [14, 2],
	[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [13, 3],
	[0, 4], [1, 4], [2, 4], [6, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4]
];

/*
Public function
Operation
*/

function hexToRgb(hex) 
{
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	let colors = [];
	colors[0] = parseInt(result[1], 16);
	colors[1] = parseInt(result[2], 16);
	colors[2] = parseInt(result[3], 16);

	return colors;
}

/*
Public function
key
*/

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
	device.log("Mchose ACE68 Air initialized");
}

export function Render() 
{
	sendColors();
	device.pause(1);
}

/*
Get RGB
*/
function sendColors(shutdown = false)
{
	let rgbdata = grabColors(shutdown);
	let packet = [0x06,0x08,0x00,0x00,0x01,0x00,0x7a,0x01];
	packet = packet.concat(rgbdata);	
	device.send_report(packet, 520);
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

	// Padding pour atteindre la taille requise
	let Fill = new Array(24).fill(0);
	rgbdata = rgbdata.concat(Fill);
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
