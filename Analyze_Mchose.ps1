# Script PowerShell pour analyser les périphériques USB
# Sauvegardez ce fichier et exécutez-le pour obtenir plus d'infos

Write-Host "=== ANALYSE DU CLAVIER MCHOSE ACE68 AIR ===" -ForegroundColor Green

# 1. Informations détaillées sur le périphérique
Write-Host "`n1. Périphériques avec VID 41E4:" -ForegroundColor Yellow
Get-PnpDevice | Where-Object {$_.InstanceId -like "*VID_41E4*"} | 
    ForEach-Object {
        Write-Host "  - $($_.FriendlyName)" -ForegroundColor Cyan
        Write-Host "    InstanceId: $($_.InstanceId)" -ForegroundColor Gray
        Write-Host "    Class: $($_.Class)" -ForegroundColor Gray
        Write-Host "    Status: $($_.Status)" -ForegroundColor Gray
        Write-Host ""
    }

# 2. Détails du registre
Write-Host "2. Recherche dans le registre USB:" -ForegroundColor Yellow
$usbDevices = Get-ChildItem "HKLM:\SYSTEM\CurrentControlSet\Enum\USB" -ErrorAction SilentlyContinue
foreach ($device in $usbDevices) {
    if ($device.Name -like "*VID_41E4*PID_2120*") {
        Write-Host "  Trouvé: $($device.Name)" -ForegroundColor Green
        $subKeys = Get-ChildItem $device.PSPath -ErrorAction SilentlyContinue
        foreach ($subKey in $subKeys) {
            try {
                $props = Get-ItemProperty $subKey.PSPath -ErrorAction SilentlyContinue
                if ($props.DeviceDesc) {
                    Write-Host "    Description: $($props.DeviceDesc)" -ForegroundColor Cyan
                }
                if ($props.Mfg) {
                    Write-Host "    Fabricant: $($props.Mfg)" -ForegroundColor Cyan
                }
            } catch {}
        }
    }
}

# 3. Informations WMI
Write-Host "`n3. Informations WMI:" -ForegroundColor Yellow
Get-WmiObject -Class Win32_USBDevice | Where-Object {$_.DeviceID -like "*VID_41E4*PID_2120*"} | 
    ForEach-Object {
        Write-Host "  Device: $($_.Name)" -ForegroundColor Cyan
        Write-Host "  DeviceID: $($_.DeviceID)" -ForegroundColor Gray
        Write-Host "  Status: $($_.Status)" -ForegroundColor Gray
    }

Write-Host "`n=== INFORMATIONS TROUVÉES ===" -ForegroundColor Green
Write-Host "VendorID (VID): 0x41E4" -ForegroundColor Yellow
Write-Host "ProductID (PID): 0x2120" -ForegroundColor Yellow
Write-Host "`nUtilisez ces valeurs dans votre plugin SignalRGB!" -ForegroundColor Green

# 4. Export des informations
$exportData = @{
    VendorID = "0x41E4"
    ProductID = "0x2120"
    Date = Get-Date
    Devices = @()
}

Get-PnpDevice | Where-Object {$_.InstanceId -like "*VID_41E4&PID_2120*"} | 
    ForEach-Object {
        $exportData.Devices += @{
            Name = $_.FriendlyName
            InstanceId = $_.InstanceId
            Class = $_.Class
            Status = $_.Status
        }
    }

$exportData | ConvertTo-Json -Depth 3 | Out-File "Mchose_ACE68_Air_Analysis.json" -Encoding UTF8
Write-Host "`nAnalyse sauvegardée dans: Mchose_ACE68_Air_Analysis.json" -ForegroundColor Green
