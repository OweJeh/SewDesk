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

function Generate-AppIcon {
    param([int]$size, [string]$outPath)
    $bmp = [System.Drawing.Bitmap]::new($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::FromArgb(255, 10, 10, 10)) # Deep premium black #0A0A0A

    $svgContent = Get-Content -Raw "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\sewdesk-symbol.svg"
    $pattern = '(?s)<path\s+d="([^"]+)"\s+fill="([^"]+)"(?:\s+transform="translate\(([^,]+),([^)]+)\)")?'
    $matches = [regex]::Matches($svgContent, $pattern)

    # Safe inner area: 70% of size (for Android adaptive maskable safe zone)
    $safeH = $size * 0.70
    $scale = $safeH / 360.0
    $targetBoxW = 330.0 * $scale
    $targetBoxH = 360.0 * $scale
    $baseOffsetX = ($size - $targetBoxW) / 2.0
    $baseOffsetY = ($size - $targetBoxH) / 2.0

    foreach ($m in $matches) {
        $d = $m.Groups[1].Value
        $tx = if ($m.Groups[3].Success) { [float]$m.Groups[3].Value } else { [float]0 }
        $ty = if ($m.Groups[4].Success) { [float]$m.Groups[4].Value } else { [float]0 }
        
        $offsetX = $baseOffsetX + ($tx * $scale)
        $offsetY = $baseOffsetY + ($ty * $scale)
        
        $path = Parse-SvgPath -d $d -scale $scale -offsetX $offsetX -offsetY $offsetY
        $brush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(255, 255, 255, 255))
        $g.FillPath($brush, $path)
        $brush.Dispose()
        $path.Dispose()
    }

    $g.Dispose()
    $bmp.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $bmp.Dispose()
    Write-Output "Generated $outPath ($size x $size)"
}

Generate-AppIcon -size 512 -outPath "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\icon-512.png"
Generate-AppIcon -size 192 -outPath "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\icon-192.png"
Generate-AppIcon -size 180 -outPath "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\apple-touch-icon.png"
Generate-AppIcon -size 32  -outPath "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\favicon-32x32.png"
Generate-AppIcon -size 16  -outPath "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\favicon-16x16.png"

# Clean up test files
Remove-Item "c:\Users\Dev OJ\Desktop\SewDesk\public\icons\test*.png" -ErrorAction SilentlyContinue
