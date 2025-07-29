export function Name() { return "Mchose ACE68 Air Test"; }
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

let workingInterface = -1;
let validatedInterface = false;

export function LedNames() {
	return vLedNames;
}

export function LedPositions() {
	return vLedPositions;
}

export function Initialize() {
	device.log("=== Mchose ACE68 Air Test - Initialisation ===");
	device.log("VID:41E4 PID:2120 - Test des interfaces");
	validatedInterface = false;
	workingInterface = -1;
}

export function Render() {
	if (!validatedInterface) {
		device.log("Interface non validée, ignorant le rendu");
		return;
	}
	
	sendColors();
}

export function Shutdown() {
	if (validatedInterface) {
		sendColors(true);
	}
}

function sendColors(shutdown = false) {
	// Construire les données RGB pour 67 LEDs
	let rgbData = [];
	
	for(let i = 0; i < 67; i++) {
		let color;
		if(shutdown) {
			color = hexToRgb(shutdownColor);
		} else if(LightingMode === "Forced") {
			color = hexToRgb(forcedColor);
		} else if(i < vLedPositions.length) {
			color = device.color(vLedPositions[i][0], vLedPositions[i][1]);
		} else {
			color = [0, 0, 0]; // LED non mappée = noir
		}
		
		rgbData.push(color[0], color[1], color[2]);
	}
	
	// Test de différents formats basés sur l'interface utilisée
	let success = false;
	
	// Format spécifique pour interface 0 (clavier standard)
	if(workingInterface === 0) {
		try {
			// Format simple pour interface clavier
			let packet = [0x02, 0x01].concat(rgbData);
			while(packet.length < 64) packet.push(0); // Padding standard HID
			device.send_report(packet, 64);
			success = true;
			device.log("✓ Format interface 0 réussi (64 octets)");
		} catch(e) {
			device.log("✗ Format interface 0 échoué: " + e.message);
		}
	}
	
	// Format spécifique pour interface 1 (générique)
	if(workingInterface === 1 && !success) {
		try {
			// Format étendu pour interface générique
			let packet = [0x06, 0x08, 0x00, 0x00, 0x01, 0x00, 0x7a, 0x01].concat(rgbData);
			while(packet.length < 520) packet.push(0); // Padding étendu
			device.send_report(packet, 520);
			success = true;
			device.log("✓ Format interface 1 réussi (520 octets)");
		} catch(e) {
			device.log("✗ Format interface 1 échoué: " + e.message);
		}
	}
	
	// Format spécifique pour interface 2 (contrôles HID)
	if(workingInterface === 2 && !success) {
		try {
			// Format contrôle HID
			let packet = [0x07, 0x03, 0x01].concat(rgbData);
			while(packet.length < 256) packet.push(0); // Padding moyen
			device.send_report(packet, 256);
			success = true;
			device.log("✓ Format interface 2 réussi (256 octets)");
		} catch(e) {
			device.log("✗ Format interface 2 échoué: " + e.message);
		}
	}
	
	// Fallback: données brutes
	if(!success) {
		try {
			device.send_report(rgbData, rgbData.length);
			success = true;
			device.log("✓ Format brut réussi (" + rgbData.length + " octets)");
		} catch(e) {
			device.log("✗ Tous les formats ont échoué: " + e.message);
		}
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

// Fonction de validation très permissive qui log tout
export function Validate(endpoint) {
	device.log(`[TEST-VALIDATE] Interface=${endpoint.interface}, usage=0x${endpoint.usage.toString(16).padStart(4, '0')}, usage_page=0x${endpoint.usage_page.toString(16).padStart(4, '0')}, collection=${endpoint.collection}`);
	
	// Accepter toutes les interfaces pour les tests
	if(endpoint.interface === 0) {
		device.log("[TEST-VALIDATE] ✓ Interface 0 - Clavier standard");
		workingInterface = 0;
		validatedInterface = true;
		return true;
	}
	
	if(endpoint.interface === 1) {
		device.log("[TEST-VALIDATE] ✓ Interface 1 - Interface générique");
		workingInterface = 1;
		validatedInterface = true;
		return true;
	}
	
	if(endpoint.interface === 2) {
		device.log("[TEST-VALIDATE] ✓ Interface 2 - Contrôles HID");
		workingInterface = 2;
		validatedInterface = true;
		return true;
	}
	
	// Accepter tout le reste pour voir
	device.log("[TEST-VALIDATE] ✓ Interface inconnue acceptée pour test");
	workingInterface = endpoint.interface;
	validatedInterface = true;
	return true;
}
