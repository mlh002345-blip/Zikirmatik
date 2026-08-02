Add-Type -AssemblyName System.Drawing

# Niyet — marka ikonlarini ve Play Store grafiklerini uretir.
# Calistirmak icin: powershell -File scripts\generate-icons.ps1
# Bicimi degistirmek isterseniz asagidaki yaricap/renk degerlerini duzenleyip
# yeniden calistirin; tum varliklar ayni star8 geometrisinden turetilir.
$Root = Split-Path -Parent $PSScriptRoot
$Assets = Join-Path $Root 'assets'
$Store = Join-Path $Root 'store-assets'
if (-not (Test-Path $Store)) { New-Item -ItemType Directory -Path $Store | Out-Null }

$EmeraldDeep = [System.Drawing.ColorTranslator]::FromHtml('#0A2B20')
$EmeraldSoft = [System.Drawing.ColorTranslator]::FromHtml('#285943')
$Gold        = [System.Drawing.ColorTranslator]::FromHtml('#C9A24B')
$GoldBright  = [System.Drawing.ColorTranslator]::FromHtml('#E8C97A')
$GoldPale    = [System.Drawing.ColorTranslator]::FromHtml('#FFF6DC')
$Cream       = [System.Drawing.ColorTranslator]::FromHtml('#FBF6EA')
$Mist        = [System.Drawing.ColorTranslator]::FromHtml('#8A9A91')

# app/constants icindeki MotifPattern.starPoints ile ayni geometri (star8).
function Get-StarPoints($cx, $cy, $points, $outerR, $innerR, $rotDeg) {
  $list = New-Object 'System.Collections.Generic.List[System.Drawing.PointF]'
  $step = [Math]::PI / $points
  for ($i = 0; $i -lt $points * 2; $i++) {
    if ($i % 2 -eq 0) { $r = $outerR } else { $r = $innerR }
    $angle = $i * $step - [Math]::PI / 2 + ($rotDeg * [Math]::PI / 180)
    $x = $cx + $r * [Math]::Cos($angle)
    $y = $cy + $r * [Math]::Sin($angle)
    $list.Add((New-Object System.Drawing.PointF([float]$x, [float]$y)))
  }
  return $list.ToArray()
}

function New-Canvas($w, $h) {
  $bmp = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  return @($bmp, $g)
}

# Zumrut zeminde, yildizin arkasindan gelen yumusak bir nur parlamasi.
function Draw-EmeraldBackground($g, $w, $h, $glowCx, $glowCy) {
  $g.Clear($EmeraldDeep)
  $r = [Math]::Max($w, $h) * 0.62
  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $path.AddEllipse([float]($glowCx - $r), [float]($glowCy - $r), [float]($r * 2), [float]($r * 2))
  $pgb = New-Object System.Drawing.Drawing2D.PathGradientBrush($path)
  $pgb.CenterColor = $EmeraldSoft
  $pgb.SurroundColors = @($EmeraldDeep)
  $pgb.CenterPoint = New-Object System.Drawing.PointF([float]$glowCx, [float]$glowCy)
  $g.FillRectangle($pgb, 0, 0, $w, $h)
  $pgb.Dispose(); $path.Dispose()
}

# Altin nur gradyani: MotifPattern'daki gibi asagidan yukari gold -> goldBright -> pale.
function New-GoldBrush($cx, $cy, $r) {
  $rect = New-Object System.Drawing.RectangleF([float]($cx - $r), [float]($cy - $r), [float]($r * 2), [float]($r * 2))
  $b = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $Gold, $GoldPale, 270.0)
  $blend = New-Object System.Drawing.Drawing2D.ColorBlend(3)
  $blend.Colors = @($Gold, $GoldBright, $GoldPale)
  $blend.Positions = @(0.0, 0.55, 1.0)
  $b.InterpolationColors = $blend
  return $b
}

# Marka isareti: 8 koseli Selcuk yildizi + merkezde zumrut cekirdek ve altin nokta.
function Draw-Mark($g, $cx, $cy, $outerR, $solidColor, $withCore) {
  $pts = Get-StarPoints $cx $cy 8 $outerR ($outerR * 0.476) 0
  if ($solidColor -eq $null) {
    $brush = New-GoldBrush $cx $cy $outerR
  } else {
    $brush = New-Object System.Drawing.SolidBrush($solidColor)
  }
  $g.FillPolygon($brush, $pts)
  $brush.Dispose()

  if ($withCore) {
    # Ic ice gecen yildiz katmani — klasik Selcuk yildiz isciligindeki gibi
    # 22.5 derece dondurulmus, zeminle ayni zumrut tonunda.
    $corePts = Get-StarPoints $cx $cy 8 ($outerR * 0.34) ($outerR * 0.155) 22.5
    $coreBrush = New-Object System.Drawing.SolidBrush($EmeraldDeep)
    $g.FillPolygon($coreBrush, $corePts)
    $coreBrush.Dispose()
  }
}

function Save-Png($bmp, $g, $path) {
  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "yazildi: $path"
}

# ---------- 1. assets/icon.png (1024, tam zeminli) ----------
$c = New-Canvas 1024 1024
$bmp = $c[0]; $g = $c[1]
Draw-EmeraldBackground $g 1024 1024 512 430
Draw-Mark $g 512 512 340 $null $true
Save-Png $bmp $g (Join-Path $Assets 'icon.png')

# ---------- 2. store-assets/play-store-icon.png (512, tam zeminli) ----------
$c = New-Canvas 512 512
$bmp = $c[0]; $g = $c[1]
Draw-EmeraldBackground $g 512 512 256 215
Draw-Mark $g 256 256 170 $null $true
Save-Png $bmp $g (Join-Path $Store 'play-store-icon.png')

# ---------- 3. assets/android-icon-background.png (512, sadece zemin) ----------
$c = New-Canvas 512 512
$bmp = $c[0]; $g = $c[1]
Draw-EmeraldBackground $g 512 512 256 215
Save-Png $bmp $g (Join-Path $Assets 'android-icon-background.png')

# ---------- 4. assets/android-icon-foreground.png (512, saydam) ----------
# Adaptif ikon guvenli alani ic %66 => yaricap <= 169; 152 ile pay birakiyoruz.
$c = New-Canvas 512 512
$bmp = $c[0]; $g = $c[1]
Draw-Mark $g 256 256 152 $null $true
Save-Png $bmp $g (Join-Path $Assets 'android-icon-foreground.png')

# ---------- 5. assets/android-icon-monochrome.png (512, duz beyaz siluet) ----------
$c = New-Canvas 512 512
$bmp = $c[0]; $g = $c[1]
Draw-Mark $g 256 256 152 ([System.Drawing.Color]::White) $false
Save-Png $bmp $g (Join-Path $Assets 'android-icon-monochrome.png')

# ---------- 6. assets/splash-icon.png (1024, saydam) ----------
$c = New-Canvas 1024 1024
$bmp = $c[0]; $g = $c[1]
Draw-Mark $g 512 512 470 $null $true
Save-Png $bmp $g (Join-Path $Assets 'splash-icon.png')

# ---------- 7. assets/favicon.png (48, tam zeminli) ----------
$c = New-Canvas 48 48
$bmp = $c[0]; $g = $c[1]
Draw-EmeraldBackground $g 48 48 24 20
Draw-Mark $g 24 24 17 $null $false
Save-Png $bmp $g (Join-Path $Assets 'favicon.png')

# ---------- 8. store-assets/feature-graphic.png (1024x500) ----------
$serifPfc = New-Object System.Drawing.Text.PrivateFontCollection
$serifPfc.AddFontFile((Join-Path $Root 'node_modules\@expo-google-fonts\source-serif-4\600SemiBold\SourceSerif4_600SemiBold.ttf'))
$sansPfc = New-Object System.Drawing.Text.PrivateFontCollection
$sansPfc.AddFontFile((Join-Path $Root 'node_modules\@expo-google-fonts\manrope\500Medium\Manrope_500Medium.ttf'))

$c = New-Canvas 1024 500
$bmp = $c[0]; $g = $c[1]
Draw-EmeraldBackground $g 1024 500 300 250
Draw-Mark $g 250 250 148 $null $true

$titleFont = New-Object System.Drawing.Font($serifPfc.Families[0], 92.0, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$subFont = New-Object System.Drawing.Font($sansPfc.Families[0], 30.0, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)

$creamBrush = New-Object System.Drawing.SolidBrush($Cream)
$goldBrush = New-Object System.Drawing.SolidBrush($GoldBright)
$mistBrush = New-Object System.Drawing.SolidBrush($Mist)

# Turkce karakterler PowerShell 5.1'de bozulmasin diye UTF-8 dosyadan okunuyor.
$tagline = (Get-Content -Path (Join-Path $PSScriptRoot 'feature-text.txt') -Encoding UTF8 -TotalCount 1).Trim()

$g.DrawString('Niyet', $titleFont, $creamBrush, 470.0, 160.0)
$g.DrawString('Zikirmatik', $subFont, $goldBrush, 478.0, 270.0)
$g.DrawString($tagline, $subFont, $mistBrush, 478.0, 316.0)

$creamBrush.Dispose(); $goldBrush.Dispose(); $mistBrush.Dispose()
$titleFont.Dispose(); $subFont.Dispose()
Save-Png $bmp $g (Join-Path $Store 'feature-graphic.png')

Write-Output 'TAMAM'
