# 性能基准：冷启动耗时（主窗口出现）+ 空载内存
# 用法：powershell -NoProfile -ExecutionPolicy Bypass -File scripts\bench.ps1
# 注意：运行前需关闭 dev 会话（单实例机制会干扰测量）
$exe = Join-Path $PSScriptRoot "..\src-tauri\target\release\markdown-reader.exe"
if (-not (Test-Path $exe)) { Write-Output "exe-not-found: $exe"; exit 1 }

$sw = [System.Diagnostics.Stopwatch]::StartNew()
$p = Start-Process -FilePath $exe -PassThru
while ($p.MainWindowHandle -eq 0 -and $sw.ElapsedMilliseconds -lt 20000) {
    Start-Sleep -Milliseconds 30
    $p.Refresh()
}
$sw.Stop()
Write-Output ("startup-ms: " + $sw.ElapsedMilliseconds)

Start-Sleep -Seconds 2
$p.Refresh()
Write-Output ("memory-mb: " + [math]::Round($p.WorkingSet64 / 1MB, 1))

if (Get-Process -Id $p.Id -ErrorAction SilentlyContinue) {
    Stop-Process -Id $p.Id -Force
    Write-Output "stopped"
}
