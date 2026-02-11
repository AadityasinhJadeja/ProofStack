# ProofStack: The AI Audit Layer for Cybersecurity

[![Hackathon Status](https://img.shields.io/badge/Hackathon-Demo_Ready-blueviolet)](https://github.com/AadityasinhJadeja/ProofStack)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **"Don’t give me an answer. Give me an answer I can trust — with receipts."**

ProofStack is a verification layer designed for cybersecurity professionals who rely on AI for incident analysis, risk assessment, and policy interpretation. It transforms confident-but-unverifiable AI outputs into structured, evidence-backed, and audit-ready artifacts.

---

## 🚀 30-Second Pitch
In high-pressure security environments, teams cannot act on answers they cannot prove. ProofStack breaks AI-generated security briefs into atomic **verifiable claims**, cross-references them against your **ground-truth evidence**, and generates a **Trust Report** with deterministic risk scoring.

---

## ✨ Core Features
- **Claim Decomposition**: Automatically extracts checkable facts from free-form AI text.
- **Source-Grounded Retrieval**: Cross-references claims only against your uploaded security documents (PDF, TXT, MD).
- **Adversarial Verification**: Actively attempts to disprove claims to identify hallucinations.
- **Trust Scoring**: A deterministic 0-100 score based on evidence coverage and claim criticality.
- **Auto-Redlined Fix**: Rewrites security briefs using *only* supported claims.
- **Exportable Trust Artifacts**: Generate audit-ready reports for incident response leaders or regulators.

---

## 🎨 Design Philosophy: "Airy Premium"
ProofStack isn't just a tool; it's a professional environment. We've built a custom **"Airy Premium"** aesthetic that prioritizes clarity and focus.

- **Mathematical Centering**: A unique 3-column grid system ensures navigation and content are always balanced on the viewer's axis.
- **Glassmorphism**: Layered backgrounds and soft blurs create a light, professional feel.
- **Micro-Animations**: Floating assets and 3D-lift hover effects provide tactile feedback without clutter.
- **Zero-Friction UX**: No sign-in required. No settings maze. Just upload, audit, and export.

---

## 🛠️ Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS.
- **Design System**: Custom CSS Variables, Google Fonts (Outfit), and absolute-axis grid layouts.
- **State Management**: React Hooks + Local Session Storage.
- **Pipeline**: Structured JSON extraction for claim/evidence mapping.

---

## 🏁 Getting Started (Hackathon Demo)

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/AadityasinhJadeja/ProofStack.git
cd ProofStack

# Install dependencies
npm install
```

### 2. Run Locally
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

### 3. Verification Walkthrough
1. **Load Sample Data**: Click "Load sample dataset" (demo1) on the home page.
2. **Review Incident**: Paste a security brief or incident report.
3. **Run Audit**: Hit "Run Verification Engine".
4. **Inspect & Export**: Navigate to the "Report" tab to see the redlined fix and download your audit report.

---

## 📂 Repository Structure
- `/src/app`: Modern App Router structure (Home, Report, Claims).
- `/src/components`: UI components including the new `TopBarActions` logic.
- `/docs`: Technical source of truth.
  - `masterplan.md`: The high-level vision.
  - `designupdate.md`: Deep dive into the current design system.
  - `implementation-plan.md`: Technical roadmap.
- `/datasets`: Pre-configured security incident data for demos.

---

## 📜 Roadmap
- [x] **MVP**: End-to-end verification flow + Markdown export.
- [ ] **V1**: PDF export + SOC 2 compliance mapping.
- [ ] **V2**: CI/CD integration for automated PR auditing.

---

Developed for the **[Hackathon Name]** 2026. Audit everything. Trust ProofStack.
