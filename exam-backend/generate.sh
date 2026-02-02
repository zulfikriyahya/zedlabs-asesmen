#!/bin/bash
# generate-backend-blueprint.sh - Generator Blueprint Otomatis untuk NestJS Backend
set -euo pipefail

OUT="backend-blueprint.md"
ROOT="."

# Pola eksklusi disesuaikan dengan struktur NestJS project
EXCLUDE_PATTERNS=( 
  "./.git/*" 
  "./.yarn/*" 
  "./.vscode/*" 
  "./README.md" 
  "./.gitignore"
  "./.env"
  "./.env.example"
  "./.env.local"
  "./.env.production"
  "./.gitattributes"
  "./.DS_Store"
  "./node_modules/*" 
  "./dist/*"
  "./build/*"
  "./logs/*"
  "./uploads/*"
  "./coverage/*"
  "./test/fixtures/*"
  "./package-lock.json" 
  "./pnpm-lock.yaml"
  "./yarn.lock"
  "./.prettierrc"
  "./.eslintrc.js"
  "./.eslintrc.cjs"
  "./LICENSE"
  "./$OUT" 
  "./generate-backend-blueprint.sh"
  "./generate-frontend-blueprint.sh"
  # Eksklusi file media dan binary
  "*.png" "*.jpg" "*.jpeg" "*.webp" "*.ico" "*.gif" "*.svg" "*.avif"
  "*.woff" "*.woff2" "*.ttf" "*.otf" "*.eot"
  "*.mp3" "*.mp4" "*.wav" "*.avi" "*.mov"
  "*.db" "*.sqlite" "*.csv" "*.xlsx" "*.xls"
  "*.pdf" "*.doc" "*.docx"
  "*.zip" "*.tar" "*.gz" "*.rar"
  "*.lock" "*.log"
)

# Fungsi untuk menentukan bahasa berdasarkan ekstensi file
lang_for_ext() {
  case "$1" in
    ts)         printf "typescript" ;;
    js)         printf "javascript" ;;
    mjs)        printf "javascript" ;;
    cjs)        printf "javascript" ;;
    json)       printf "json" ;;
    md)         printf "markdown" ;;
    sql)        printf "sql" ;;
    yml|yaml)   printf "yaml" ;;
    sh)         printf "bash" ;;
    Dockerfile) printf "dockerfile" ;;
    Makefile)   printf "makefile" ;;
    conf)       printf "nginx" ;;
    *)          printf "" ;;
  esac
}

# Fungsi untuk menghitung jumlah backticks maksimal dalam file
count_max_backticks() {
  local file="$1"
  local max=3
  
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*(\`+) ]]; then
      local count=${#BASH_REMATCH[1]}
      if [ "$count" -ge "$max" ]; then
        max=$((count + 1))
      fi
    fi
  done < "$file"
  
  echo "$max"
}

# Inisialisasi file output dengan header
cat > "$OUT" << 'HEADER'
# Backend Blueprint - NestJS Exam System API

> Auto-generated blueprint untuk backend NestJS
> Sistem Asesmen/Ujian Sekolah & Madrasah
> Offline-First Architecture dengan Multi-Tenant Support

## 📋 Informasi Project

- **Framework**: NestJS (Node.js)
- **Database**: MySQL 8.0
- **Cache**: Redis
- **Authentication**: JWT (Access + Refresh Token)
- **Scale**: 5000 concurrent users
- **Architecture**: Multi-tenant dengan row-level security

---

HEADER

# Kumpulkan semua file
files=()
while IFS= read -r -d '' f; do
  skip=false
  for pat in "${EXCLUDE_PATTERNS[@]}"; do
    if [[ "$f" == $pat ]]; then
      skip=true
      break
    fi
  done
  $skip && continue
  files+=("$f")
done < <(find "$ROOT" -type f -print0)

if [ "${#files[@]}" -eq 0 ]; then
  echo "Tidak ada file ditemukan untuk diproses."
  exit 0
fi

# Kelompokkan file berdasarkan direktori utama
declare -A groups
for f in "${files[@]}"; do
  p="${f#./}"
  if [[ "$p" == */* ]]; then
    top="${p%%/*}"
  else
    top="ROOT"
  fi
  rel="./${p}"
  if [ -z "${groups[$top]:-}" ]; then
    groups[$top]="$rel"
  else
    groups[$top]="${groups[$top]}"$'\n'"$rel"
  fi
done

# Urutan prioritas direktori untuk NestJS Backend
priority_dirs=(
  "src"
  "test" 
  "scripts"
  "docs"
  "ROOT"
)
processed_dirs=()

# Fungsi untuk memproses file
process_files() {
  local dir="$1"
  local files_list="$2"
  
  # Header direktori
  printf "## 📁 Direktori: %s\n\n" "$dir" >> "$OUT"
  
  # Deskripsi direktori
  case "$dir" in
    "src")
      printf "**Core application code** - Modules, controllers, services, entities\n\n" >> "$OUT"
      ;;
    "test")
      printf "**Testing suite** - Unit tests, integration tests, e2e tests\n\n" >> "$OUT"
      ;;
    "scripts")
      printf "**Utility scripts** - Backup, migration, seeding scripts\n\n" >> "$OUT"
      ;;
    "docs")
      printf "**Documentation** - API docs, architecture, deployment guides\n\n" >> "$OUT"
      ;;
    "ROOT")
      printf "**Root configuration files** - Package.json, tsconfig, etc.\n\n" >> "$OUT"
      ;;
  esac
  
  mapfile -t flist < <(printf '%s\n' "$files_list" | sort -V)
  
  for file in "${flist[@]}"; do
    case "$file" in
      "./$OUT" | "$OUT" | "./generate-backend-blueprint.sh" | "generate-backend-blueprint.sh") continue ;;
    esac
    
    filename="$(basename -- "$file")"
    if [[ "$filename" == *.* ]]; then
      ext="${filename##*.}"
    else
      ext="$filename"
    fi
    
    lang="$(lang_for_ext "$ext")"
    
    printf "### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
    
    # Hitung jumlah backticks yang dibutuhkan
    backtick_count=$(count_max_backticks "$file")
    backticks=$(printf '`%.0s' $(seq 1 "$backtick_count"))
    
    if [ -n "$lang" ]; then
      printf '%s%s\n' "$backticks" "$lang" >> "$OUT"
    else
      printf '%s\n' "$backticks" >> "$OUT"
    fi
    
    sed 's/\r$//' "$file" >> "$OUT"
    printf '\n%s\n\n' "$backticks" >> "$OUT"
    printf -- "---\n\n" >> "$OUT"
  done
}

# Proses direktori berdasarkan prioritas
for priority in "${priority_dirs[@]}"; do
  if [ -n "${groups[$priority]:-}" ]; then
    process_files "$priority" "${groups[$priority]}"
    processed_dirs+=("$priority")
  fi
done

# Proses direktori lainnya yang tidak ada dalam prioritas
IFS=$'\n'
for top in $(printf '%s\n' "${!groups[@]}" | sort -V); do
  # Skip jika sudah diproses
  skip=false
  for pd in "${processed_dirs[@]}"; do
    if [ "$top" == "$pd" ]; then
      skip=true
      break
    fi
  done
  $skip && continue
  
  process_files "$top" "${groups[$top]}"
done

# Footer
cat >> "$OUT" << 'FOOTER'

---

## 📊 Summary

**Generated**: $(date)
**Total Directories**: ${#groups[@]}
**Total Files**: ${#files[@]}

## 🎯 Key Features

- ✅ Multi-tenant system with row-level security
- ✅ Offline-first architecture
- ✅ Auto-grading engine
- ✅ Manual grading for essays
- ✅ Real-time monitoring
- ✅ Sync queue with retry mechanism
- ✅ Media upload (chunked)
- ✅ Item analysis & analytics
- ✅ JWT authentication
- ✅ Device fingerprinting

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run migrations
npm run migration:run

# Seed data
npm run seed

# Start development
npm run start:dev
```

---
*Auto-generated by generate-backend-blueprint.sh*
FOOTER

echo "✅ Selesai! File '$OUT' telah dibuat (Mode: NestJS Backend)"
echo "📁 Direktori yang diproses: ${#groups[@]}"
echo "📄 Total file: ${#files[@]}"
echo ""
echo "💡 Tips:"
echo "   - Upload file ini ke Claude untuk analisis kode"
echo "   - Gunakan untuk dokumentasi proyek"
echo "   - Bagikan dengan tim untuk onboarding"