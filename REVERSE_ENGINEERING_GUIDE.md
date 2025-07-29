# Guide de Reverse Engineering avancé pour Mchose ACE68 Air

## Méthodes pour obtenir plus d'informations :

### 1. Utiliser USBlyzer ou similaire (Windows)
- Télécharger USBlyzer (version d'essai gratuite)
- Capturer le trafic USB pendant que vous changez les couleurs
- Analyser les paquets envoyés au clavier

### 2. Utiliser Process Monitor (ProcMon)
- Télécharger ProcMon de Microsoft Sysinternals
- Filtrer par processus qui accèdent à votre clavier
- Observer les opérations d'écriture

### 3. Analyser le logiciel officiel
- Installer le logiciel officiel Mchose si disponible
- Utiliser Process Monitor pour voir les communications
- Identifier les patterns de paquets

### 4. Wireshark avec USBPcap
- Installer USBPcap et Wireshark
- Capturer le trafic USB direct
- Analyser les communications HID

### 5. Informations que nous avons déjà :
- VID: 0x41E4
- PID: 0x2120
- Interfaces: MI_00, MI_01, MI_02
- Classes: Keyboard, HIDClass

### 6. Prochaines étapes si SignalRGB ne détecte toujours pas :
1. Modifier le Validate() pour accepter différentes interfaces
2. Tester différents formats de paquets HID
3. Analyser les rapports HID disponibles
4. Essayer des endpoints différents

### 7. Commandes utiles pour plus d'analyse :
```powershell
# Obtenir plus de détails sur les interfaces HID
Get-WmiObject -Class Win32_PnPEntity | Where-Object {$_.DeviceID -like "*VID_41E4*"}

# Examiner les pilotes
Get-WmiObject -Class Win32_SystemDriver | Where-Object {$_.Name -like "*hid*"}
```

### 8. Si rien ne fonctionne :
- Le clavier utilise peut-être un protocole propriétaire
- Il faut peut-être d'abord envoyer une commande d'initialisation
- Certains claviers nécessitent des paquets de "réveil" spéciaux
