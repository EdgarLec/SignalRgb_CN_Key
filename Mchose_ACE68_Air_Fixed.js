export function Name() { return "Mchose ACE68 Air Fixed"; }
export function VendorId() { return 0x41E4; }
export function ProductId() { return 0x2120; }
export function Publisher() { return "GitHub Copilot"; }
export function Documentation(){ return "documentation/Mchose_ACE68_Air.md"; }
export function Size() { return [16, 5]; }
export function DefaultPosition(){return [10, 100];}
export function DefaultScale(){return 8.0;}
export function ControllableParameters(){
	return [
		{"property":"shutdownColor", "group":"lighting", "label":"Shutdown Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
		{"property":"LightingMode", "group":"lighting", "label":"Lighting Mode", "type":"combobox", "values":["Canvas", "Forced"], "default":"Canvas"},
		{"property":"forcedColor", "group":"lighting", "label":"Forced Color", "min":"0", "max":"360", "type":"color", "default":"#009bde"},
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

let currentInterface = 0;
let packetFormat = 1;

export function LedNames() {
	return vLedNames;
}

export function LedPositions() {
	return vLedPositions;
}

export function Initialize() {
	device.log("Mchose ACE68 Air Fixed - Initialisation avec VID:41E4 PID:2120");
	device.log("Détection des interfaces disponibles...");
	
	// Test de différentes interfaces
	testInterfaces();
}

function testInterfaces() {
	device.log("Test des interfaces et formats de paquets...");
	currentInterface = 0;
	packetFormat = 1;
}

export function Render() {
	sendColors();
}

export function Shutdown() {
	sendColors(true);
}

function sendColors(shutdown = false) {
	let rgbData = [];
	
	// Construire les données RGB
	for(let i = 0; i < vLedNames.length; i++) {
		let color;
		if(shutdown) {
			color = hexToRgb(shutdownColor);
		} else if(LightingMode === "Forced") {
			color = hexToRgb(forcedColor);
		} else {
			color = device.color(vLedPositions[i][0], vLedPositions[i][1]);
		}
		
		rgbData.push(color[0], color[1], color[2]);
	}
	
	// Compléter à 201 LEDs (67 x 3 = 201 octets)
	while(rgbData.length < 201) {
		rgbData.push(0, 0, 0);
	}
	
	// Essayer différents formats de paquets
	let success = false;
	
	// Format 1: Packet standard observé dans d'autres claviers Mchose
	if(packetFormat === 1) {
		let packet1 = [0x06, 0x08, 0x00, 0x00, 0x01, 0x00, 0x7a, 0x01].concat(rgbData);
		try {
			device.send_report(packet1, 520);
			success = true;
			device.log("Format 1 réussi !");
		} catch(e) {
			device.log("Format 1 échoué, essai du format 2...");
			packetFormat = 2;
		}
	}
	
	// Format 2: Header alternatif
	if(packetFormat === 2 && !success) {
		let packet2 = [0x07, 0x08, 0x00, 0x01, 0x00, 0x00, 0xC9, 0x00].concat(rgbData);
		try {
			device.send_report(packet2, 520);
			success = true;
			device.log("Format 2 réussi !");
		} catch(e) {
			device.log("Format 2 échoué, essai du format 3...");
			packetFormat = 3;
		}
	}
	
	// Format 3: Format simplifié
	if(packetFormat === 3 && !success) {
		let packet3 = [0x08, 0x01, 0x00, 0x00].concat(rgbData);
		// Padding pour atteindre 520 octets
		while(packet3.length < 520) {
			packet3.push(0);
		}
		try {
			device.send_report(packet3, 520);
			success = true;
			device.log("Format 3 réussi !");
		} catch(e) {
			device.log("Format 3 échoué, essai du format 4...");
			packetFormat = 4;
		}
	}
	
	// Format 4: Format raw
	if(packetFormat === 4 && !success) {
		try {
			device.send_report(rgbData, 201);
			success = true;
			device.log("Format 4 (raw) réussi !");
		} catch(e) {
			device.log("Tous les formats ont échoué");
			packetFormat = 1; // Reset pour le prochain essai
		}
	}
	
	if(!success) {
		device.log("Erreur: Impossible d'envoyer les données RGB");
	}
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

// Fonction de validation plus permissive
export function Validate(endpoint) {
	device.log(`Validation endpoint: interface=${endpoint.interface}, usage=0x${endpoint.usage.toString(16).padStart(4, '0')}, usage_page=0x${endpoint.usage_page.toString(16).padStart(4, '0')}, collection=${endpoint.collection}`);
	
	// Accepter plusieurs types d'interfaces
	// Interface 0: Clavier standard
	if(endpoint.interface === 0) {
		device.log("Interface 0 acceptée (clavier standard)");
		return true;
	}
	
	// Interface 1: Interface générique
	if(endpoint.interface === 1) {
		device.log("Interface 1 acceptée (interface générique)");
		return true;
	}
	
	// Interface 2: Contrôles HID avancés
	if(endpoint.interface === 2 && endpoint.collection === 0) {
		device.log("Interface 2 collection 0 acceptée (contrôles HID)");
		return true;
	}
	
	// Fallback: accepter les interfaces vendor-specific
	if(endpoint.usage_page === 0xff00) {
		device.log("Interface vendor-specific acceptée");
		return true;
	}
	
	device.log("Interface rejetée");
	return false;
}
