#!/bin/bash
set -e

SOURCE="public/pwa-512x512.png"
BASE_DIR="android-res"

mkdir -p "$BASE_DIR/mipmap-mdpi"
mkdir -p "$BASE_DIR/mipmap-hdpi"
mkdir -p "$BASE_DIR/mipmap-xhdpi"
mkdir -p "$BASE_DIR/mipmap-xxhdpi"
mkdir -p "$BASE_DIR/mipmap-xxxhdpi"
mkdir -p "$BASE_DIR/mipmap-anydpi-v26"
mkdir -p "$BASE_DIR/values"

# Generate ic_launcher.png and ic_launcher_round.png
convert "$SOURCE" -resize 48x48 "$BASE_DIR/mipmap-mdpi/ic_launcher.png"
convert "$SOURCE" -resize 48x48 "$BASE_DIR/mipmap-mdpi/ic_launcher_round.png"

convert "$SOURCE" -resize 72x72 "$BASE_DIR/mipmap-hdpi/ic_launcher.png"
convert "$SOURCE" -resize 72x72 "$BASE_DIR/mipmap-hdpi/ic_launcher_round.png"

convert "$SOURCE" -resize 96x96 "$BASE_DIR/mipmap-xhdpi/ic_launcher.png"
convert "$SOURCE" -resize 96x96 "$BASE_DIR/mipmap-xhdpi/ic_launcher_round.png"

convert "$SOURCE" -resize 144x144 "$BASE_DIR/mipmap-xxhdpi/ic_launcher.png"
convert "$SOURCE" -resize 144x144 "$BASE_DIR/mipmap-xxhdpi/ic_launcher_round.png"

convert "$SOURCE" -resize 192x192 "$BASE_DIR/mipmap-xxxhdpi/ic_launcher.png"
convert "$SOURCE" -resize 192x192 "$BASE_DIR/mipmap-xxxhdpi/ic_launcher_round.png"

# Adaptive icon foregrounds:
# Foreground should have some padding (safe zone is inner 66%)
# 108x108 with 72x72 inner image on transparent background
convert "$SOURCE" -resize 72x72 -gravity center -background none -extent 108x108 "$BASE_DIR/mipmap-mdpi/ic_launcher_foreground.png"
convert "$SOURCE" -resize 108x108 -gravity center -background none -extent 162x162 "$BASE_DIR/mipmap-hdpi/ic_launcher_foreground.png"
convert "$SOURCE" -resize 144x144 -gravity center -background none -extent 216x216 "$BASE_DIR/mipmap-xhdpi/ic_launcher_foreground.png"
convert "$SOURCE" -resize 216x216 -gravity center -background none -extent 324x324 "$BASE_DIR/mipmap-xxhdpi/ic_launcher_foreground.png"
convert "$SOURCE" -resize 288x288 -gravity center -background none -extent 432x432 "$BASE_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png"

# Values ic_launcher_background.xml
cat << 'EOF' > "$BASE_DIR/values/ic_launcher_background.xml"
<?xml version="1.0" encoding="utf-8"?>
<resources>
    <color name="ic_launcher_background">#FFFFFF</color>
</resources>
EOF

# AnyDPI-v26 XMLs
cat << 'EOF' > "$BASE_DIR/mipmap-anydpi-v26/ic_launcher.xml"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

cat << 'EOF' > "$BASE_DIR/mipmap-anydpi-v26/ic_launcher_round.xml"
<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@color/ic_launcher_background"/>
    <foreground android:drawable="@mipmap/ic_launcher_foreground"/>
</adaptive-icon>
EOF

echo "All Android mipmap icons and adaptive XMLs created in $BASE_DIR!"
