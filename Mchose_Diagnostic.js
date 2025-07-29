export function Name() { return "Mchose Diagnostic"; }
export function VendorId() { return 0x41E4; }
export function ProductId() { return 0x2120; }
export function Publisher() { return "GitHub Copilot"; }
export function Size() { return [16, 5]; }
export function DefaultPosition(){return [10, 100];}
export function DefaultScale(){return 8.0;}
export function ControllableParameters(){
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#ff0000"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Forced"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#00ff00"},
	];
}

const vLedNames = [
	"Esc", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-_", "=+", "Backspace", "Delete",
	"Tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\", "Page Up", 
	"CapsLock", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "Enter", "Page Down",
	"Left Shift", "Z", "X", "C", "V", "B", "N", "M", ",", ".", "/", "Right Shift", "Up Arrow",
	"Left Ctrl", "Left Win", "Left Alt", "Space", "Right Alt", "Fn", "Right Ctrl", "Left Arrow", "Down Arrow", "Right Arrow"
];

const vLedPositions = [
	[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0],
	[0, 1], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1], [9, 1], [10, 1], [11, 1], [12, 1], [13, 1], [14, 1],
	[0, 2], [1, 2], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [14, 2],
	[0, 3], [1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3], [11, 3], [13, 3],
	[0, 4], [1, 4], [2, 4], [6, 4], [10, 4], [11, 4], [12, 4], [13, 4], [14, 4], [15, 4]
];

let currentInterface = -1;
let currentUsage = -1;
let currentUsagePage = -1;
let currentCollection = -1;

export function LedNames() {
	return vLedNames;
}

export function LedPositions() {
	return vLedPositions;
}

export function Initialize() {
	device.log("=== DIAGNOSTIC MCHOSE ACE68 AIR ===");
	device.log(`Interface validée: ${currentInterface}`);
	device.log(`Usage: 0x${currentUsage.toString(16).padStart(4, '0')}`);
	device.log(`Usage Page: 0x${currentUsagePage.toString(16).padStart(4, '0')}`);
	device.log(`Collection: ${currentCollection}`);
	device.log("=====================================");
}

export function Render() {
	// Test simple: envoyer du rouge fixe
	sendDiagnosticColors();
}

export function Shutdown() {
	sendDiagnosticColors(true);
}

function sendDiagnosticColors(shutdown = false) {
	// Couleurs de diagnostic simples
	let rgbData = [];
	let testColor = shutdown ? [0, 0, 0] : [255, 0, 0]; // Rouge ou noir
	
	// 67 LEDs * 3 couleurs = 201 octets
	for(let i = 0; i < 67; i++) {
		rgbData.push(testColor[0], testColor[1], testColor[2]);
	}
	
	device.log(`=== TEST INTERFACE ${currentInterface} ===`);
	
	// Test 1: Format classique Mchose
	try {
		let packet1 = [0x06, 0x08, 0x00, 0x00, 0x01, 0x00, 0x7a, 0x01].concat(rgbData);
		while(packet1.length < 520) packet1.push(0);
		device.send_report(packet1, 520);
		device.log("✓ FORMAT 1 RÉUSSI - Mchose Standard (520 octets)");
		return;
	} catch(e) {
		device.log("✗ Format 1 échoué: " + e.message);
	}
	
	// Test 2: Format simple HID
	try {
		let packet2 = [0x02, 0x01].concat(rgbData);
		while(packet2.length < 64) packet2.push(0);
		device.send_report(packet2, 64);
		device.log("✓ FORMAT 2 RÉUSSI - HID Simple (64 octets)");
		return;
	} catch(e) {
		device.log("✗ Format 2 échoué: " + e.message);
	}
	
	// Test 3: Format moyen
	try {
		let packet3 = [0x07, 0x03, 0x01].concat(rgbData);
		while(packet3.length < 256) packet3.push(0);
		device.send_report(packet3, 256);
		device.log("✓ FORMAT 3 RÉUSSI - Moyen (256 octets)");
		return;
	} catch(e) {
		device.log("✗ Format 3 échoué: " + e.message);
	}
	
	// Test 4: Données brutes
	try {
		device.send_report(rgbData, rgbData.length);
		device.log("✓ FORMAT 4 RÉUSSI - Brut (201 octets)");
		return;
	} catch(e) {
		device.log("✗ Format 4 échoué: " + e.message);
	}
	
	// Test 5: Header alternatif
	try {
		let packet5 = [0x08, 0x02, 0xFF, 0x00].concat(rgbData);
		while(packet5.length < 512) packet5.push(0);
		device.send_report(packet5, 512);
		device.log("✓ FORMAT 5 RÉUSSI - Alternatif (512 octets)");
		return;
	} catch(e) {
		device.log("✗ Format 5 échoué: " + e.message);
	}
	
	device.log("✗ TOUS LES FORMATS ONT ÉCHOUÉ");
}

function hexToRgb(hex) {
	if(hex.indexOf("#") === 0) {
		hex = hex.slice(1);
	}
	
	let r = parseInt(hex.substring(0, 2), 16);
	let g = parseInt(hex.substring(2, 4), 16);
	let b = parseInt(hex.substring(4, 6), 16);
	
	return [r, g, b];
}

// Accepter ABSOLUMENT TOUT et logger
export function Validate(endpoint) {
	device.log("==========================================");
	device.log("🔍 VALIDATION ENDPOINT:");
	device.log(`   Interface: ${endpoint.interface}`);
	device.log(`   Usage: 0x${endpoint.usage.toString(16).padStart(4, '0')}`);
	device.log(`   Usage Page: 0x${endpoint.usage_page.toString(16).padStart(4, '0')}`);
	device.log(`   Collection: ${endpoint.collection}`);
	device.log("==========================================");
	
	// Sauvegarder les infos
	currentInterface = endpoint.interface;
	currentUsage = endpoint.usage;
	currentUsagePage = endpoint.usage_page;
	currentCollection = endpoint.collection;
	
	// ACCEPTER TOUT pour diagnostic
	device.log("✅ DIAGNOSTIC - ACCEPTATION FORCÉE");
	return true;
}
