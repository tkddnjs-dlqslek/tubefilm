#!/usr/bin/env bash
# TubeFilm — Chrome Web Store 업로드용 zip 패키징
#
# 사용법: bash scripts/build.sh
# 출력: dist/tubefilm-<version>.zip

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

VERSION="$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")"
OUT_DIR="$ROOT/dist"
OUT_FILE="$OUT_DIR/tubefilm-${VERSION}.zip"

mkdir -p "$OUT_DIR"
rm -f "$OUT_FILE"

INCLUDE=(
  manifest.json
  content
  icons
)

EXCLUDE=(
  -x "*.DS_Store"
  -x "__MACOSX/*"
  -x "*.map"
)

zip -r "$OUT_FILE" "${INCLUDE[@]}" "${EXCLUDE[@]}" >/dev/null

echo "built: $OUT_FILE"
ls -lh "$OUT_FILE" | awk '{print "  size:", $5}'
