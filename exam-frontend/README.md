# Exam Frontend

Web-based examination system frontend built with Astro.

## Features

- 📝 Multiple question types support
- 🔒 Offline-first architecture
- 🎯 Real-time monitoring
- 📊 Analytics and reporting
- 🎙️ Media recording capabilities
- 📖 Madrasah-specific features (Quran, Hafalan)

## Project Structure

```
exam-frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Route pages
│   ├── lib/            # Utilities and helpers
│   ├── stores/         # State management (Nanostores)
│   ├── types/          # TypeScript type definitions
│   └── styles/         # Global styles
├── public/             # Static assets
└── [config files]
```

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Tech Stack

- **Framework**: Astro
- **Styling**: Tailwind CSS
- **State Management**: Nanostores
- **Database**: IndexedDB (Dexie)
- **API Client**: Axios
- **TypeScript**: Type safety

## User Roles

- **Siswa** (Student): Take exams, view results
- **Guru** (Teacher): Create questions, manage exams, grading
- **Pengawas** (Proctor): Monitor exam sessions
- **Operator**: Manage sessions, rooms, participants
- **Superadmin**: System administration

## License

Private/Proprietary
