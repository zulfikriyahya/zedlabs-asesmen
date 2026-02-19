#!/bin/bash
# generate.sh - Generator Blueprint Otomatis
# Menghasilkan DRAFT_FE.md (Next.js frontend) dan DRAFT_BE.md (NestJS backend)
set -euo pipefail

# ============================================
# KONFIGURASI
# ============================================

OUT_FE="DRAFT_FE.md"
OUT_BE="DRAFT_BE.md"
ROOT_FE="${1:-../exam-frontend}"   # path ke repo frontend, override via arg 1
ROOT_BE="${2:-../exam-backend}"    # path ke repo backend, override via arg 2

# ============================================
# POLA EKSKLUSI GLOBAL (berlaku di FE & BE)
# ============================================

EXCLUDE_GLOBAL=(
  ".git/*"
  ".gitignore"
  ".gitattributes"
  ".DS_Store"
  ".vscode/*"
  ".idea/*"
  ".env"
  ".env.local"
  ".env.production"
  ".env.development"
  "node_modules/*"
  "dist/*"
  ".next/*"
  "build/*"
  "coverage/*"
  "*.log"
  "*.lock"
  "package-lock.json"
  "pnpm-lock.yaml"
  "yarn.lock"
  "README.md"
  "SKILLS.md"
  "todo-frontend.md"
  "todo-backend.md"
  "setup-frontend.md"
  "setup-backend.md"
  "generate.sh"
  "DRAFT_FE.md"
  "DRAFT_BE.md"
  # Media & binary
  "*.png" "*.jpg" "*.jpeg" "*.webp" "*.ico" "*.gif" "*.svg" "*.avif"
  "*.woff" "*.woff2" "*.ttf" "*.otf" "*.eot"
  "*.mp3" "*.mp4" "*.wav" "*.avi" "*.webm"
  "*.db" "*.sqlite"
  "*.csv"
  "*.pdf"
  "*.zip" "*.tar" "*.gz"
  # Next.js / build artifacts
  ".astro/*"
  "*.tsbuildinfo"
  "next-env.d.ts"
)

# ============================================
# POLA EKSKLUSI TAMBAHAN — FRONTEND
# ============================================

EXCLUDE_FE=(
  "public/images/*"
  "public/videos/*"
  "public/icons/*"
  "public/fonts/*"
  "playwright-report/*"
  "test-results/*"
)

# ============================================
# POLA EKSKLUSI TAMBAHAN — BACKEND
# ============================================

EXCLUDE_BE=(
  "logs/*"
  "uploads/*"
  "dist/*"
  "prisma/migrations/*"   # migration files biasanya terlalu verbose
  "docs/api/*"
  "scripts/backup.sh"
  "scripts/restore.sh"
)

# ============================================
# URUTAN DIREKTORI PRIORITAS
# ============================================

PRIORITY_FE=("src" "prisma" "public" "tests" "ROOT")
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
  local file="$1"
  local max=3
  local count

  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*(\`+) ]]; then
      count=${#BASH_REMATCH[1]}
      (( count >= max )) && max=$(( count + 1 ))
    fi
  done < "$file"

  printf '%0.s`' $(seq 1 "$max")
}

# ============================================
# HELPER: CEK APAKAH FILE PERLU DIEKSKLUSI
# ============================================

should_exclude() {
  local file="$1"
  shift
  local patterns=("$@")

  for pat in "${patterns[@]}"; do
    # Match absolute path dari root
    if [[ "$file" == $pat ]] || [[ "$file" == */$pat ]] || [[ "$file" == ./$pat ]]; then
      return 0
    fi
    # Match wildcard sederhana
    # shellcheck disable=SC2053
    if [[ "$file" == $pat ]]; then
      return 0
    fi
  done
  return 1
}

# ============================================
# CORE: GENERATE SATU DRAFT FILE
# ============================================

generate_draft() {
  local root="$1"
  local out="$2"
  shift 2
  local priority_dirs=("$@")

  if [ ! -d "$root" ]; then
    echo "SKIP: Direktori '$root' tidak ditemukan."
    return 1
  fi

  : > "$out"

  echo "Memproses: $root → $out"

  # Kumpulkan semua file
  local files=()
  while IFS= read -r -d '' f; do
    # Normalisasi: strip root prefix, gunakan path relatif
    local rel="${f#$root/}"

    # Cek eksklusi global
    if should_exclude "$rel" "${EXCLUDE_GLOBAL[@]}"; then
      continue
    fi

    # Cek eksklusi spesifik (diteruskan via variabel global FE/BE)
    local extra_exclude_var="$EXTRA_EXCLUDE"
    if [ -n "${extra_exclude_var:-}" ]; then
      local extra=($extra_exclude_var)
      if should_exclude "$rel" "${extra[@]}"; then
        continue
      fi
    fi

    files+=("$rel")
  done < <(find "$root" -type f -print0 | sort -z)

  if [ "${#files[@]}" -eq 0 ]; then
    echo "  Tidak ada file ditemukan di '$root'."
    return 0
  fi

  # Kelompokkan file berdasarkan direktori level pertama
  declare -A groups
  for f in "${files[@]}"; do
    local top
    if [[ "$f" == */* ]]; then
      top="${f%%/*}"
    else
      top="ROOT"
    fi

    if [ -z "${groups[$top]:-}" ]; then
      groups[$top]="$f"
    else
      groups[$top]+=$'\n'"$f"
    fi
  done

  local processed=()

  # Tulis sesuai urutan prioritas
  for dir in "${priority_dirs[@]}"; do
    [ -z "${groups[$dir]:-}" ] && continue

    printf "## Direktori: %s\n\n" "$dir" >> "$out"
    _write_files_in_group "$root" "$out" "${groups[$dir]}"
    processed+=("$dir")
  done

  # Tulis direktori lain yang tidak ada di daftar prioritas
  for dir in $(printf '%s\n' "${!groups[@]}" | sort); do
    local already=false
    for p in "${processed[@]}"; do
      [ "$dir" == "$p" ] && already=true && break
    done
    $already && continue

    printf "## Direktori: %s\n\n" "$dir" >> "$out"
    _write_files_in_group "$root" "$out" "${groups[$dir]}"
  done

  local total="${#files[@]}"
  echo "  Selesai: $total file → $out"
}

# ============================================
# HELPER INTERNAL: TULIS FILE DALAM SATU GRUP
# ============================================

_write_files_in_group() {
  local root="$1"
  local out="$2"
  local group_str="$3"

  mapfile -t flist < <(printf '%s\n' "$group_str" | sort -V)

  for rel in "${flist[@]}"; do
    local full="$root/$rel"
    [ -f "$full" ] || continue

    local ext="${rel##*.}"
    [ "$ext" == "$rel" ] && ext="$(basename "$rel")" # file tanpa ekstensi (Dockerfile dll)

    local lang
    lang="$(lang_for_ext "$ext")"

    local fence
    fence="$(backtick_fence_for "$full")"

    printf "### File: \`%s\`\n\n" "$rel" >> "$out"

    if [ -n "$lang" ]; then
      printf '%s%s\n' "$fence" "$lang" >> "$out"
    else
      printf '%s\n' "$fence" >> "$out"
    fi

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

# Generate frontend
EXTRA_EXCLUDE="${EXCLUDE_FE[*]}"
generate_draft "$ROOT_FE" "$OUT_FE" "${PRIORITY_FE[@]}"

echo ""

# Generate backend
EXTRA_EXCLUDE="${EXCLUDE_BE[*]}"
generate_draft "$ROOT_BE" "$OUT_BE" "${PRIORITY_BE[@]}"

echo ""
echo "=========================================="
echo "Selesai!"
echo "  Frontend : $OUT_FE"
echo "  Backend  : $OUT_BE"
echo "=========================================="
