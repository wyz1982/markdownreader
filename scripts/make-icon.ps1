# 生成应用图标源图（512px PNG）：蓝色底 + 白色 MD 字样（双色分层）
# 之后由 `pnpm tauri icon` 派生全部尺寸
Add-Type -AssemblyName System.Drawing

$size = 512
$bmp = New-Object System.Drawing.Bitmap -ArgumentList $size, $size
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

# 主色：GitHub 蓝，上下双色分层
$cTop = [System.Drawing.Color]::FromArgb(255, 31, 111, 235)
$cBottom = [System.Drawing.Color]::FromArgb(255, 7, 84, 168)
$topBrush = New-Object System.Drawing.SolidBrush -ArgumentList $cTop
$bottomBrush = New-Object System.Drawing.SolidBrush -ArgumentList $cBottom
$half = [int]($size / 2)
$g.FillRectangle($topBrush, 0, 0, $size, $half)
$g.FillRectangle($bottomBrush, 0, $half, $size, $half)

# 白色 MD 字样居中
$style = [System.Drawing.FontStyle]::Bold
$unit = [System.Drawing.GraphicsUnit]::Pixel
$font = New-Object System.Drawing.Font -ArgumentList "Segoe UI", 168, $style, $unit
$format = New-Object System.Drawing.StringFormat
$format.Alignment = [System.Drawing.StringAlignment]::Center
$format.LineAlignment = [System.Drawing.StringAlignment]::Center
$rectF = New-Object System.Drawing.RectangleF -ArgumentList 0, 0, $size, $size
$whiteBrush = New-Object System.Drawing.SolidBrush -ArgumentList ([System.Drawing.Color]::White)
$g.DrawString("MD", $font, $whiteBrush, $rectF, $format)

$outPath = Join-Path $PSScriptRoot "..\src-tauri\icons\app-icon.png"
$bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
$g.Dispose()
$bmp.Dispose()
Write-Output "icon-generated: $outPath"
