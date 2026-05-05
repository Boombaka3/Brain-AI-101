param(
  [string]$VendorRoot = "vendor/phetsims",
  [string]$OutputRoot = "public/vendor/phet/neuron"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$vendorPath = Join-Path $repoRoot $VendorRoot
$neuronPath = Join-Path $vendorPath "neuron"
$chipperPath = Join-Path $vendorPath "chipper"
$perennialPath = Join-Path $vendorPath "perennial-alias"
$outputPath = Join-Path $repoRoot $OutputRoot
$junctionRoot = Join-Path $env:TEMP "aiweb-phetsims"
$junctionVendorPath = Join-Path $junctionRoot "vendor"

if (-not (Test-Path $neuronPath)) {
  throw "Missing $neuronPath. Run scripts/setup-phet-neuron.ps1 first."
}

if (Test-Path $junctionVendorPath) {
  Remove-Item -Force $junctionVendorPath
}

New-Item -ItemType Directory -Force -Path $junctionRoot | Out-Null
New-Item -ItemType Junction -Path $junctionVendorPath -Target $vendorPath | Out-Null

$junctionChipperPath = Join-Path $junctionVendorPath "chipper"
$junctionPerennialPath = Join-Path $junctionVendorPath "perennial-alias"
$junctionNeuronPath = Join-Path $junctionVendorPath "neuron"

foreach ($installPath in @($junctionChipperPath, $junctionPerennialPath, $junctionNeuronPath)) {
  if (-not (Test-Path $installPath)) {
    throw "Missing dependency folder: $installPath"
  }

  Write-Host "Installing npm dependencies in $installPath"
  Push-Location $installPath
  try {
    npm install
  }
  finally {
    Pop-Location
  }
}

Write-Host "Building adapted-from-phet neuron simulation"
Push-Location $junctionNeuronPath
try {
  npx grunt --brands=adapted-from-phet
}
finally {
  Pop-Location
}

$buildPath = Join-Path $junctionNeuronPath "build/adapted-from-phet"
if (-not (Test-Path $buildPath)) {
  throw "Expected build output at $buildPath"
}

if (Test-Path $outputPath) {
  Remove-Item -Recurse -Force $outputPath
}

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
Copy-Item -Recurse -Force (Join-Path $buildPath "*") $outputPath

Remove-Item -Force $junctionVendorPath

Write-Host ""
Write-Host "Copied PhET neuron build to $outputPath"
Write-Host "Set VITE_PHET_NEURON_URL=/vendor/phet/neuron/neuron_en_adapted-from-phet.html to use the local build."
