
$logoBase64 = Get-Content "c:\Users\CUENTA VERIFICADA 5\Documents\COLEGIO GYMMART\base64_logo.txt" -Raw
$logoBase64 = $logoBase64.Trim()

$indexPath = "c:\Users\CUENTA VERIFICADA 5\Documents\COLEGIO GYMMART\index.html"
$content = Get-Content $indexPath -Raw

# Reemplazar el logo truncado
$pattern = 'src="data:image/png;base64,[^"]*"'
$replacement = 'src="data:image/png;base64,' + $logoBase64 + '"'
$content = $content -replace $pattern, $replacement

# Arreglar la navegación (asegurar que tpl-settings se carga bien)
# No parece haber error obvio, pero añadiré un log para depurar
$content = $content.Replace("function navigateTo(screenId) {", "function navigateTo(screenId) { console.log('Navegando a:', screenId);")

# Guardar cambios
Set-Content $indexPath $content -NoNewline
