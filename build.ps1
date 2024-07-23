param(
	[string]$vault = "../test-vault",
	[bool]$prod = $false
)

# build...

$prodFlag = If($prod) {"production"} Else {""}

node .\esbuild.config.mjs -- $prodFlag

if($LASTEXITCODE -ne 0) {
}

$pluginName = "sqlite3-opfs-test-plugin"

$TARGET = "$vault/.obsidian/plugins/$pluginName"
mkdir -Force $TARGET
Write-Output "" > "$TARGET/.hotreload"
Copy-Item -Force "build/plugin/main.js" "$TARGET"
Copy-Item -Force "build/plugin/styles.css" "$TARGET"
Copy-Item -Force "build/plugin/sqlite3.wasm" "$TARGET"
Copy-Item -Force manifest.json "$TARGET"
Write-Output "Installed plugin `"$pluginName`" to `"$TARGET`""

# #!/usr/bin/env bash
# Builds the plugin and allows you to provide a path to the vault that it should be installed in.
# Useful for when you want to dry-run the plugin in a vault other than the test vault.

## PLUGIN_NAME="datacore"
## VAULT="$1"
## TARGET="$VAULT/.obsidian/plugins/$PLUGIN_NAME/"
## mkdir -p "$TARGET"
## cp -f build/plugin/main.js build/plugin/styles.css "$TARGET"
## cp -f manifest-beta.json "$TARGET/manifest.json"
## echo Installed plugin "$PLUGIN_NAME" to "$TARGET"
