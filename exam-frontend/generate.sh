#!/bin/bash
# generate-frontend-blueprint.sh - Generator Blueprint Otomatis untuk Astro Frontend
set -euo pipefail

OUT="frontend-blueprint.md"
ROOT="."

# Pola eksklusi disesuaikan dengan struktur Astro project
EXCLUDE_PATTERNS=( 
  "./.git/*" 
  "./.astro/*" 
  "./.yarn/*" 
  "./.vscode/*" 
  "./README.md" 
  "./.gitignore"
  "./.env"
  "./.env.example"
  "./.env.local"
  "./.env.production"
  "./.gitattributes"
  "./.yarnrc.yml"
  "./.DS_Store"
  "./node_modules/*" 
  "./dist/*"
  "./public/images/*"
  "./public/videos/*"
  "./public/icons/*"
  "./public/fonts/*"
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
  # Eksklusi file media
  "*.png" "*.jpg" "*.jpeg" "*.webp" "*.ico" "*.gif" "*.svg" "*.avif"
  "*.woff" "*.woff2" "*.ttf" "*.otf" "*.eot"
  "*.mp3" "*.mp4" "*.wav" "*.avi" "*.mov"
  "*.db" "*.sqlite" "*.csv"
  "*.lock" "*.log"
)

# Fungsi untuk menentukan bahasa berdasarkan ekstensi file
lang_for_ext() {
  case "$1" in
    astro)      printf "astro" ;;
    tsx)        printf "tsx" ;;
    ts)         printf "typescript" ;;
    jsx)        printf "jsx" ;;
    js)         printf "javascript" ;;
    mjs)        printf "javascript" ;;
    cjs)        printf "javascript" ;;
    json)       printf "json" ;;
    md)         printf "markdown" ;;
    mdx)        printf "markdown" ;;
    html)       printf "html" ;;
    css)        printf "css" ;;
    scss)       printf "scss" ;;
    yml|yaml)   printf "yaml" ;;
    sh)         printf "bash" ;;
    conf)       printf "nginx" ;;
    Dockerfile) printf "dockerfile" ;;
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
# Frontend Blueprint - Astro Exam System

> Auto-generated blueprint untuk frontend Astro
> Sistem Asesmen/Ujian Sekolah & Madrasah
> Offline-First Multi-Tenant Web Application

## 📋 Informasi Project

- **Framework**: Astro (SSR + SSG)
- **Styling**: TailwindCSS + DaisyUI
- **State**: Nanostores (with persistence)
- **Database**: IndexedDB (Dexie.js)
- **PWA**: Service Worker enabled
- **Target**: Android WebView optimized

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

# Urutan prioritas direktori untuk Astro Frontend
priority_dirs=(
  "src"
  "public"
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
      printf "**Core application code** - Components, pages, layouts, lib, stores\n\n" >> "$OUT"
      ;;
    "public")
      printf "**Static assets** - Service worker, manifest, robots.txt\n\n" >> "$OUT"
      ;;
    "ROOT")
      printf "**Root configuration files** - Astro config, Tailwind config, package.json\n\n" >> "$OUT"
      ;;
  esac
  
  # Sub-direktori khusus untuk src/
  if [ "$dir" == "src" ]; then
    # Kelompokkan file src berdasarkan sub-direktori
    declare -A src_groups
    
    while IFS= read -r file; do
      if [[ "$file" =~ ^\./src/([^/]+)/ ]]; then
        subdir="${BASH_REMATCH[1]}"
        if [ -z "${src_groups[$subdir]:-}" ]; then
          src_groups[$subdir]="$file"
        else
          src_groups[$subdir]="${src_groups[$subdir]}"$'\n'"$file"
        fi
      else
        # File langsung di src/
        if [ -z "${src_groups[_root]:-}" ]; then
          src_groups[_root]="$file"
        else
          src_groups[_root]="${src_groups[_root]}"$'\n'"$file"
        fi
      fi
    done <<< "$files_list"
    
    # Urutan sub-direktori src
    src_priority=("components" "pages" "layouts" "lib" "stores" "types" "styles" "middleware" "_root")
    
    for subdir in "${src_priority[@]}"; do
      if [ -n "${src_groups[$subdir]:-}" ]; then
        if [ "$subdir" != "_root" ]; then
          printf "### 📂 Sub-direktori: src/%s\n\n" "$subdir" >> "$OUT"
        fi
        
        mapfile -t flist < <(printf '%s\n' "${src_groups[$subdir]}" | sort -V)
        
        for file in "${flist[@]}"; do
          case "$file" in
            "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
          esac
          
          filename="$(basename -- "$file")"
          if [[ "$filename" == *.* ]]; then
            ext="${filename##*.}"
          else
            ext="$filename"
          fi
          
          lang="$(lang_for_ext "$ext")"
          
          printf "#### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
          
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
      fi
    done
    
    # Proses sub-direktori lainnya
    for subdir in "${!src_groups[@]}"; do
      skip=false
      for sp in "${src_priority[@]}"; do
        if [ "$subdir" == "$sp" ]; then
          skip=true
          break
        fi
      done
      $skip && continue
      
      printf "### 📂 Sub-direktori: src/%s\n\n" "$subdir" >> "$OUT"
      
      mapfile -t flist < <(printf '%s\n' "${src_groups[$subdir]}" | sort -V)
      
      for file in "${flist[@]}"; do
        case "$file" in
          "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
        esac
        
        filename="$(basename -- "$file")"
        if [[ "$filename" == *.* ]]; then
          ext="${filename##*.}"
        else
          ext="$filename"
        fi
        
        lang="$(lang_for_ext "$ext")"
        
        printf "#### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
        
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
    done
    
  else
    # Proses direktori non-src seperti biasa
    mapfile -t flist < <(printf '%s\n' "$files_list" | sort -V)
    
    for file in "${flist[@]}"; do
      case "$file" in
        "./$OUT" | "$OUT" | "./generate-frontend-blueprint.sh" | "generate-frontend-blueprint.sh") continue ;;
      esac
      
      filename="$(basename -- "$file")"
      if [[ "$filename" == *.* ]]; then
        ext="${filename##*.}"
      else
        ext="$filename"
      fi
      
      lang="$(lang_for_ext "$ext")"
      
      printf "### 📄 File: \`%s\`\n\n" "$file" >> "$OUT"
      
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
  fi
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

- ✅ Offline-first architecture
- ✅ IndexedDB for local storage
- ✅ Media recording (audio/video)
- ✅ Auto-save every 30 seconds
- ✅ Sync queue with retry
- ✅ Device fingerprinting
- ✅ Activity logging
- ✅ Dark mode support
- ✅ Accessibility features
- ✅ Arabic/Quran support
- ✅ PWA installable
- ✅ Android WebView optimized

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start development
npm run dev

# Build for production
npm run build
```

## 📱 Critical Pages

1. **`/siswa/ujian/[id]`** - The exam page (MOST IMPORTANT!)
2. **`/siswa/ujian/download`** - Exam download manager
3. **`/login`** - Authentication with device lock

---
*Auto-generated by generate-frontend-blueprint.sh*
FOOTER

echo "✅ Selesai! File '$OUT' telah dibuat (Mode: Astro Frontend)"
echo "📁 Direktori yang diproses: ${#groups[@]}"
echo "📄 Total file: ${#files[@]}"
echo ""
echo "💡 Tips:"
echo "   - Upload file ini ke Claude untuk analisis kode"
echo "   - Gunakan untuk dokumentasi proyek"
echo "   - Bagikan dengan tim untuk onboarding"