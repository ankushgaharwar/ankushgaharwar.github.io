$python = Get-Command python -ErrorAction SilentlyContinue

if (-not $python) {
  $bundled = 'C:\Users\Ankush\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
  if (Test-Path $bundled) {
    $pythonPath = $bundled
  } else {
    throw 'Python was not found. Install Python or update serve.ps1 to point at a local interpreter.'
  }
} else {
  $pythonPath = $python.Source
}

& $pythonPath -m http.server 8123 --bind 127.0.0.1 --directory $PSScriptRoot
