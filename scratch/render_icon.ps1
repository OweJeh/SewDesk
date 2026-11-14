Add-Type -AssemblyName System.Drawing

function Parse-SvgPath {
    param([string]$d, [float]$scale = 1.0, [float]$offsetX = 0.0, [float]$offsetY = 0.0)
    $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
    $tokens = $d -split '\s+' | Where-Object { $_.Trim() -ne '' }
    $i = 0
    $curX = [float]0
    $curY = [float]0
    $startX = [float]0
    $startY = [float]0

    while ($i -lt $tokens.Count) {
        $cmd = $tokens[$i]
        if ($cmd -eq 'M') {
            $curX = ([float]$tokens[$i+1] * $scale) + $offsetX
            $curY = ([float]$tokens[$i+2] * $scale) + $offsetY
            $startX = $curX
            $startY = $curY
            $i += 3
            # If followed by more numbers, treat as L
            while ($i -lt $tokens.Count -and ($tokens[$i] -notmatch '^[A-Za-z]$')) {
                $nextX = ([float]$tokens[$i] * $scale) + $offsetX
                $nextY = ([float]$tokens[$i+1] * $scale) + $offsetY
                $path.AddLine($curX, $curY, $nextX, $nextY)
                $curX = $nextX
                $curY = $nextY
                $i += 2
            }
        } elseif ($cmd -eq 'C') {
            $i++
            while ($i -lt $tokens.Count -and ($tokens[$i] -notmatch '^[A-Za-z]$')) {
                $p1x = ([float]$tokens[$i] * $scale) + $offsetX
                $p1y = ([float]$tokens[$i+1] * $scale) + $offsetY
                $p2x = ([float]$tokens[$i+2] * $scale) + $offsetX
                $p2y = ([float]$tokens[$i+3] * $scale) + $offsetY
                $p3x = ([float]$tokens[$i+4] * $scale) + $offsetX
                $p3y = ([float]$tokens[$i+5] * $scale) + $offsetY
                $path.AddBezier($curX, $curY, $p1x, $p1y, $p2x, $p2y, $p3x, $p3y)
                $curX = $p3x
                $curY = $p3y
                $i += 6
            }
        } elseif ($cmd -eq 'Z' -or $cmd -eq 'z') {
            $path.CloseFigure()
            $curX = $startX
            $curY = $startY
            $i++
        } else {
            $i++
        }
    }
    return $path
}

$bmp = [System.Drawing.Bitmap]::new(512, 512)
$g = [System.Drawing.Graphics]::FromImage($bmp)
$g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
$g.Clear([System.Drawing.Color]::FromArgb(255, 0, 0, 0)) # Pure black background

# Let's test reading public/icons/sewdesk-symbol.svg
$svgContent = Get-Content -Raw "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\sewdesk-symbol.svg"
# Find all paths with their d, fill, and transform
$pattern = '(?s)<path\s+d="([^"]+)"\s+fill="([^"]+)"(?:\s+transform="translate\(([^,]+),([^)]+)\)")?'
$matches = [regex]::Matches($svgContent, $pattern)

# SewDesk symbol viewBox is 0 0 330 360
# Target icon 512x512 with 48px padding: target width ~ 360, height ~ 392
$scale = 512.0 / 460.0 # scale factor ~1.11
$targetBoxW = 330.0 * $scale
$targetBoxH = 360.0 * $scale
$baseOffsetX = (512.0 - $targetBoxW) / 2.0
$baseOffsetY = (512.0 - $targetBoxH) / 2.0

foreach ($m in $matches) {
    $d = $m.Groups[1].Value
    $fillHex = $m.Groups[2].Value
    $tx = if ($m.Groups[3].Success) { [float]$m.Groups[3].Value } else { [float]0 }
    $ty = if ($m.Groups[4].Success) { [float]$m.Groups[4].Value } else { [float]0 }
    
    $offsetX = $baseOffsetX + ($tx * $scale)
    $offsetY = $baseOffsetY + ($ty * $scale)
    
    $path = Parse-SvgPath -d $d -scale $scale -offsetX $offsetX -offsetY $offsetY
    
    # On black background, draw white/light gray logo
    $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::White)
    $g.FillPath($brush, $path)
    $brush.Dispose()
    $path.Dispose()
}

$g.Dispose()
$bmp.Save("c:\Users\Dev OJ\Desktop\SewDesk\public\icons\test_render.png", [System.Drawing.Imaging.ImageFormat]::Png)
$bmp.Dispose()
Write-Output "Rendered test_render.png successfully!"
