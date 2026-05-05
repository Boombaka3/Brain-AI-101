param(
  [string]$VendorRoot = "vendor/phetsims"
)

$ErrorActionPreference = "Stop"

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$vendorPath = Join-Path $repoRoot $VendorRoot
New-Item -ItemType Directory -Force -Path $vendorPath | Out-Null

$repositories = @(
  @{ Name = "assert"; Url = "https://github.com/phetsims/assert.git" },
  @{ Name = "axon"; Url = "https://github.com/phetsims/axon.git" },
  @{ Name = "babel"; Url = "https://github.com/phetsims/babel.git" },
  @{ Name = "brand"; Url = "https://github.com/phetsims/brand.git" },
  @{ Name = "chipper"; Url = "https://github.com/phetsims/chipper.git" },
  @{ Name = "dot"; Url = "https://github.com/phetsims/dot.git" },
  @{ Name = "griddle"; Url = "https://github.com/phetsims/griddle.git" },
  @{ Name = "joist"; Url = "https://github.com/phetsims/joist.git" },
  @{ Name = "kite"; Url = "https://github.com/phetsims/kite.git" },
  @{ Name = "neuron"; Url = "https://github.com/phetsims/neuron.git" },
  @{ Name = "perennial-alias"; Url = "https://github.com/phetsims/perennial.git" },
  @{ Name = "phet-core"; Url = "https://github.com/phetsims/phet-core.git" },
  @{ Name = "phetcommon"; Url = "https://github.com/phetsims/phetcommon.git" },
  @{ Name = "phetmarks"; Url = "https://github.com/phetsims/phetmarks.git" },
  @{ Name = "query-string-machine"; Url = "https://github.com/phetsims/query-string-machine.git" },
  @{ Name = "scenery"; Url = "https://github.com/phetsims/scenery.git" },
  @{ Name = "scenery-phet"; Url = "https://github.com/phetsims/scenery-phet.git" },
  @{ Name = "sherpa"; Url = "https://github.com/phetsims/sherpa.git" },
  @{ Name = "sun"; Url = "https://github.com/phetsims/sun.git" },
  @{ Name = "tambo"; Url = "https://github.com/phetsims/tambo.git" },
  @{ Name = "tandem"; Url = "https://github.com/phetsims/tandem.git" },
  @{ Name = "twixt"; Url = "https://github.com/phetsims/twixt.git" },
  @{ Name = "utterance-queue"; Url = "https://github.com/phetsims/utterance-queue.git" }
)

foreach ($repo in $repositories) {
  $targetPath = Join-Path $vendorPath $repo.Name
  if (Test-Path $targetPath) {
    Write-Host "Skipping $($repo.Name): already present"
    continue
  }

  Write-Host "Cloning $($repo.Name)..."
  git clone $repo.Url $targetPath
}

Write-Host ""
Write-Host "PhET sources are ready in $vendorPath"
Write-Host "Next: run scripts/build-phet-neuron.ps1"
