# Seed-Guard Web

Seed-Guard Web is a secure and user-friendly application for encoding and decoding BIP39 seed phrases using secret sharing. It provides a clean React frontend and a FastAPI backend for splitting seed phrases into encrypted shares, with optional password protection.

---

## 🌱 Features

- 🔐 **Encode BIP39 seed phrases** into secure shares
- 🔓 **Decode seed phrases** using primary and recovery shares
- 🔑 Optional password-based encryption
- 🧩 Adjustable number of shares and required recovery threshold
- 📷 Copy and display QR codes for secure transfer
- 🖥️ Cross-platform ready (macOS builds via GitHub Actions; Windows support coming soon)
- 🧪 Development mode with CORS and Swagger docs

---

## 🛠 Tech Stack

- **Frontend**: React + Tailwind CSS
- **Backend**: FastAPI (Python 3)
- **Build Tools**: Vite (for frontend), Uvicorn, GitHub Actions
- **Packaging**: PyInstaller for macOS (and future Windows) builds

---

## 🚀 Getting Started

### Prerequisites

- Python 3.9+
- Node.js + npm

### Clone the Repo

```bash
git clone https://github.com/yourusername/seed-guard-web.git
cd seed-guard-web
```

### Install Backend

```bash
cd backend
pip install -r requirements.txt
```

### Install Frontend

```bash
cd ../frontend
npm install
npm run build  # for production
```

### Run in Development Mode

```bash
# from root directory
export SEEDGUARD_ENV=dev
uvicorn main:app --reload
```

Frontend will be served via Vite dev server separately, or as static files in production.

---

## 🧪 API Endpoints (FastAPI)

- `POST /encode`: Split seed phrase into shares
- `POST /decode`: Reconstruct seed phrase from shares
- `POST /shutdown`: Stop backend server (used by UI button)

Swagger docs available at `/docs` in dev mode.

---

## 📦 Build & Release

- The `VERSION` file controls semantic versioning
- GitHub Actions checks for changes to version and creates a release tag
- macOS executables are built with PyInstaller

### To Build Locally (macOS)

```bash
pyinstaller seed_guard.spec  # assuming spec file exists
```

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first to discuss improvements.

---

## 📄 License

MIT License (or your preferred license)

---

Seed-Guard: Guard your seeds, guard your future. 🌿

