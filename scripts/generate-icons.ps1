Add-Type -AssemblyName System.Drawing

$srcPath = "C:\Users\BENJAMIN\.gemini\antigravity\brain\29e8f773-afff-4574-b198-0f058703c401\.user_uploaded\media_1794325826577_1fc85554.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

# Bounding box of content: X=322..778, Y=148..490
$minX = 322
$maxX = 778
$minY = 148
$maxY = 490
$cropW = $maxX - $minX + 1
$cropH = $maxY - $minY + 1

# 1. Tightly cropped horizontal logo with clean transparent padding
$pad = 12
$logoW = $cropW + ($pad * 2)
$logoH = $cropH + ($pad * 2)
$cropped = New-Object System.Drawing.Bitmap($logoW, $logoH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g1 = [System.Drawing.Graphics]::FromImage($cropped)
$g1.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
$g1.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g1.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g1.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g1.Clear([System.Drawing.Color]::Transparent)

$srcRect = New-Object System.Drawing.Rectangle($minX, $minY, $cropW, $cropH)
$dstCropRect = New-Object System.Drawing.Rectangle($pad, $pad, $cropW, $cropH)
$g1.DrawImage($src, $dstCropRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g1.Dispose()

$cropped.Save("public\logo.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created public\logo.png ($($cropped.Width)x$($cropped.Height))"

# 2. Square icon 512x512 with centered content for app icons / favicon / PWA
$squareSize = 512
$square = New-Object System.Drawing.Bitmap($squareSize, $squareSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g2 = [System.Drawing.Graphics]::FromImage($square)
$g2.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceOver
$g2.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g2.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g2.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g2.Clear([System.Drawing.Color]::Transparent)

# Fit into 440x440 box inside 512x512
$targetBox = 440
$scale = [Math]::Min($targetBox / $cropW, $targetBox / $cropH)
$targetW = [int]($cropW * $scale)
$targetH = [int]($cropH * $scale)
$targetX = [int](($squareSize - $targetW) / 2)
$targetY = [int](($squareSize - $targetH) / 2)

$dstSquareRect = New-Object System.Drawing.Rectangle($targetX, $targetY, $targetW, $targetH)
$g2.DrawImage($src, $dstSquareRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
$g2.Dispose()

$square.Save("public\icon-512.png", [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save("src\app\icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
$square.Save("src\app\apple-icon.png", [System.Drawing.Imaging.ImageFormat]::Png)
Write-Host "Created src\app\icon.png and apple-icon.png (512x512)"

# 3. Create crisp 32x32 and 16x16 icon for favicon.ico
$icon32 = New-Object System.Drawing.Bitmap(32, 32, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g3 = [System.Drawing.Graphics]::FromImage($icon32)
$g3.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g3.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$g3.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g3.Clear([System.Drawing.Color]::Transparent)
$rect32 = New-Object System.Drawing.Rectangle(0, 0, 32, 32)
$g3.DrawImage($square, $rect32)
$g3.Dispose()

$icon32.Save("public\icon-32.png", [System.Drawing.Imaging.ImageFormat]::Png)

$hIcon = $icon32.GetHicon()
$icon = [System.Drawing.Icon]::FromHandle($hIcon)
if (Test-Path "src\app\favicon.ico") { Remove-Item "src\app\favicon.ico" -Force }
$fs = [System.IO.File]::OpenWrite("src\app\favicon.ico")
$icon.Save($fs)
$fs.Close()

Copy-Item "src\app\favicon.ico" "public\favicon.ico" -Force
Write-Host "Saved favicon.ico in src\app\ and public\"

$icon32.Dispose()
$square.Dispose()
$cropped.Dispose()
$src.Dispose()
