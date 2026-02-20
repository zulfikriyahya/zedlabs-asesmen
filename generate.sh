#!/bin/bash
# generate.sh — Generator Blueprint Otomatis
# Menghasilkan DRAFT_FE.md dan DRAFT_BE.md dari source tree masing-masing repo.
# Usage: ./generate.sh [path-frontend] [path-backend]
#        Default path: exam-frontend dan exam-backend

set -euo pipefail

OUT_FE="DRAFT_FE.md"
OUT_BE="DRAFT_BE.md"
ROOT_FE="${1:-exam-frontend}"
ROOT_BE="${2:-exam-backend}"

# ============================================
# POLA EKSKLUSI GLOBAL
# ============================================

EXCLUDE_GLOBAL=(
  ".git/*" ".gitignore" ".gitattributes" ".DS_Store"
  ".vscode/*" ".idea/*"
  ".env" ".env.local" ".env.production" ".env.development"
  "node_modules/*" "dist/*" ".next/*" "build/*" "coverage/*"
  "*.log" "*.lock" "package-lock.json" "pnpm-lock.yaml" "yarn.lock"
  "SKILLS.md" "README.md" "README_FE.md" "README_BE.md"
  "DRAFT_FE.md" "DRAFT_BE.md" "generate.sh" "dev-setup.md"
  "setup-frontend.sh" "setup-backend.sh"
  # Binary & media
  "*.png" "*.jpg" "*.jpeg" "*.webp" "*.ico" "*.gif" "*.svg" "*.avif"
  "*.woff" "*.woff2" "*.ttf" "*.otf" "*.eot"
  "*.mp3" "*.mp4" "*.wav" "*.avi" "*.webm"
  "*.db" "*.sqlite" "*.csv" "*.pdf"
  "*.zip" "*.tar" "*.gz"
  # Build artifacts
  "*.tsbuildinfo" "next-env.d.ts"
)

EXCLUDE_FE=(
  "public/images/*" "public/videos/*" "public/icons/*" "public/fonts/*"
  "playwright-report/*" "test-results/*"
)

EXCLUDE_BE=(
  "logs/*" "uploads/*"
  "prisma/migrations/*"
  "docs/api/*"
  "scripts/*"
)

PRIORITY_FE=("src" "public" "tests" "ROOT")
PRIORITY_BE=("src" "prisma" "test" "scripts" "ROOT")

# ============================================
# HELPER: DETEKSI BAHASA DARI EKSTENSI
# ============================================

lang_for_ext() {
  case "$1" in
    ts|tsx)       printf "typescript" ;;
    js|mjs|cjs)   printf "javascript" ;;
    jsx)          printf "jsx" ;;
    json)         printf "json" ;;
    css|scss)     printf "css" ;;
    html)         printf "html" ;;
    yml|yaml)     printf "yaml" ;;
    sh)           printf "bash" ;;
    sql)          printf "sql" ;;
    prisma)       printf "prisma" ;;
    Dockerfile)   printf "dockerfile" ;;
    conf)         printf "nginx" ;;
    md)           printf "markdown" ;;
    *)            printf "" ;;
  esac
}

# ============================================
# HELPER: HITUNG PANJANG FENCE BACKTICK
# Mencegah konflik jika file berisi code block
# ============================================

backtick_fence_for() {
  local file="$1" max=3 count
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*(\`+) ]]; then
      count=${#BASH_REMATCH[1]}
      (( count >= max )) && max=$(( count + 1 ))
    fi
  done < "$file"
  printf '%0.s`' $(seq 1 "$max")
}

# ============================================
# HELPER: CEK EKSKLUSI
# ============================================

should_exclude() {
  local file="$1"; shift
  local patterns=("$@")
  for pat in "${patterns[@]}"; do
    # shellcheck disable=SC2053
    [[ "$file" == $pat ]] && return 0
    [[ "$file" == */$pat ]] && return 0
    [[ "$file" == ./$pat ]] && return 0
  done
  return 1
}

# ============================================
# CORE: GENERATE SATU DRAFT FILE
# ============================================

generate_draft() {
  local root="$1" out="$2"; shift 2
  local priority_dirs=("$@")

  if [ ! -d "$root" ]; then
    echo "SKIP: direktori '$root' tidak ditemukan."
    return 1
  fi

  : > "$out"
  echo "Memproses: $root → $out"

  local files=()
  while IFS= read -r -d '' f; do
    local rel="${f#"$root"/}"
    should_exclude "$rel" "${EXCLUDE_GLOBAL[@]}" && continue
    [ -n "${EXTRA_EXCLUDE:-}" ] && {
      local extra=($EXTRA_EXCLUDE)
      should_exclude "$rel" "${extra[@]}" && continue
    }
    files+=("$rel")
  done < <(find "$root" -type f -print0 | sort -z)

  [ "${#files[@]}" -eq 0 ] && { echo "  Tidak ada file."; return 0; }

  # Kelompokkan per direktori level pertama
  declare -A groups
  for f in "${files[@]}"; do
    local top
    [[ "$f" == */* ]] && top="${f%%/*}" || top="ROOT"
    groups[$top]+="${groups[$top]:+$'\n'}$f"
  done

  local processed=()

  for dir in "${priority_dirs[@]}"; do
    [ -z "${groups[$dir]:-}" ] && continue
    printf "## Direktori: %s\n\n" "$dir" >> "$out"
    _write_group "$root" "$out" "${groups[$dir]}"
    processed+=("$dir")
  done

  for dir in $(printf '%s\n' "${!groups[@]}" | sort); do
    local skip=false
    for p in "${processed[@]}"; do [[ "$dir" == "$p" ]] && skip=true && break; done
    $skip && continue
    printf "## Direktori: %s\n\n" "$dir" >> "$out"
    _write_group "$root" "$out" "${groups[$dir]}"
  done

  echo "  Selesai: ${#files[@]} file → $out"
}

_write_group() {
  local root="$1" out="$2" group_str="$3"
  mapfile -t flist < <(printf '%s\n' "$group_str" | sort -V)

  for rel in "${flist[@]}"; do
    local full="$root/$rel"
    [ -f "$full" ] || continue

    local ext="${rel##*.}"
    [ "$ext" == "$rel" ] && ext="$(basename "$rel")"
    local lang fence
    lang="$(lang_for_ext "$ext")"
    fence="$(backtick_fence_for "$full")"

    printf "### File: \`%s\`\n\n" "$rel" >> "$out"
    [ -n "$lang" ] && printf '%s%s\n' "$fence" "$lang" >> "$out" \
                    || printf '%s\n' "$fence" >> "$out"
    sed 's/\r$//' "$full" >> "$out"
    printf '\n%s\n\n---\n\n' "$fence" >> "$out"
  done
}

# ============================================
# MAIN
# ============================================

echo "=========================================="
echo "Blueprint Generator — exam project"
echo "=========================================="
echo ""

EXTRA_EXCLUDE="${EXCLUDE_FE[*]}"
generate_draft "$ROOT_FE" "$OUT_FE" "${PRIORITY_FE[@]}"

echo ""

EXTRA_EXCLUDE="${EXCLUDE_BE[*]}"
generate_draft "$ROOT_BE" "$OUT_BE" "${PRIORITY_BE[@]}"

echo ""
echo "=========================================="
echo "Selesai!"
printf "  Frontend : %s\n" "$OUT_FE"
printf "  Backend  : %s\n" "$OUT_BE"
echo "=========================================="
