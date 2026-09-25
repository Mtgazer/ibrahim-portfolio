# Ibrahim Khalil — Portfolio & Work Archive

> A living archive of my work, experiments, projects, and ongoing engineering journey.

[![Live Portfolio](https://img.shields.io/badge/Live%20Portfolio-Visit%20Site-black?style=for-the-badge)](https://ibrahim-portfolio-flax.vercel.app)

---

## About

This repository contains my personal portfolio and professional work archive.

The website is designed to document not only my major projects, but also the work I continuously build and explore across software development, UI/UX, AI, Data Science, Machine Learning, and data visualization.

Instead of being a static portfolio, the goal is to make it a long-term record of my technical growth and work.

## What You'll Find

### Selected Work

Major projects and case studies that represent larger pieces of work.

### Field Notes

Smaller and more frequent work such as:

* AI experiments
* Data Science projects
* Machine Learning experiments
* Power BI dashboards
* Data analysis
* Data visualization
* UI/UX explorations
* Frontend experiments
* Backend experiments
* DevOps and cloud work

### Professional Identity

Information about my background, skills, interests, and professional journey.

---

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS

### Backend & Data

* Supabase
* PostgreSQL
* Supabase Auth
* Supabase Storage
* Row Level Security (RLS)
* Server Actions

### Deployment

* Vercel

---

## Architecture

The portfolio uses a Supabase-backed content architecture.

```text
Admin Dashboard
       ↓
   Supabase
       ↓
Published Content
       ↓
Public Portfolio
```

Projects are managed dynamically through the admin dashboard, including:

* Project information
* Publishing state
* Featured state
* Links
* Images
* Primary images
* Ordering
* Presentation data

The long-term architecture also supports an independent Field Notes system for documenting ongoing work and experiments.

---

## Project Structure

The portfolio is built around three main content concepts:

### Projects

Major, curated case studies and portfolio work.

### Field Notes

Frequent and lightweight records of recent work, experiments, dashboards, AI projects, Data Science work, and technical exploration.

### Profile

Professional identity, background, interests, and contact information.

This structure allows the portfolio to evolve continuously without turning every new piece of work into a large case study.

---

## Features

* Figma-driven editorial portfolio
* Responsive public website
* Supabase-backed project management
* Admin authentication
* Admin allowlisting
* Project CRUD
* Project publishing and ordering
* Project link management
* Project image management
* Primary image management
* Supabase Storage integration
* PostgreSQL Row Level Security
* Presentation data for project layouts
* Server-side data access
* Protected Server Actions
* Vercel deployment

---

## Design

The portfolio follows an editorial visual direction based on the original Figma design.

Key characteristics:

* Dark visual system
* Editorial layouts
* Strong typography
* 12-column grid
* Asymmetrical compositions
* Structured spacing
* Responsive layouts

Typography:

* Space Mono
* Epilogue

The public interface is intentionally designed as a single editorial experience rather than a traditional dashboard-style portfolio.

---

## Security

The admin system uses:

* Supabase Authentication
* Admin allowlisting
* Row Level Security
* Protected Server Actions
* Server-side mutations

Public users can only access published content.

Sensitive server credentials are never exposed to the client.

---

## Image Standards

Project visuals are designed around consistent aspect ratios.

Recommended project visuals:

* Main / Hero / Secondary: `16:10`
* Mobile screens: `9:16`

Example dimensions:

```text
1600 × 1000
1920 × 1200
2400 × 1500

Mobile:
1080 × 1920
```

Preferred formats:

* WebP
* PNG

Maximum upload size:

```text
10 MB
```

---

## Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

Run TypeScript checks:

```bash
npx tsc --noEmit
```

Run lint:

```bash
npm run lint
```

Build for production:

```bash
npm run build
```

---

## Deployment

The production website is deployed on Vercel.

Live website:

[https://ibrahim-portfolio-flax.vercel.app](https://ibrahim-portfolio-flax.vercel.app)

The repository is connected to Vercel, so changes pushed to the `main` branch can trigger a new deployment.

---

## AI-Assisted Development

This project was developed with AI assistance.

AI is used as an engineering copilot for implementation, debugging, exploration, and iteration.

Architecture, product direction, design decisions, security requirements, testing, review, and final acceptance remain human-driven.

The goal is to use AI as a development tool while maintaining understanding and ownership of the resulting system.

---

## Project Status

This project is actively evolving.

The long-term goal is to turn the portfolio into a professional work archive where new projects, experiments, dashboards, AI work, Data Science work, and technical explorations can be continuously documented without rebuilding the website.

The website is intended to grow alongside my career.

---

## License

This repository contains my personal portfolio and project work.

All rights reserved unless otherwise stated.
