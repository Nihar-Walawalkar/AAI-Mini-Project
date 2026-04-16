# Super-Resolution Demo Project

This project contains:
- `backend/` FastAPI inference API using your trained RRDBNet weights
- `frontend/` React + Vite + Tailwind demo UI

## Final structure

```text
sr_demo_project/
├── backend/
│   ├── app.py
│   ├── image_ops.py
│   ├── model.py
│   ├── outputs/
│   ├── requirements.txt
│   ├── README.md
│   └── weights/
│       └── best_generator_x2_bsds300.pth   <- place your trained file here
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   ├── CompareSlider.jsx
│       │   ├── Gallery.jsx
│       │   ├── Header.jsx
│       │   ├── ResultTabs.jsx
│       │   ├── StatsPanel.jsx
│       │   └── UploadPanel.jsx
│       └── lib/
│           └── api.js
└── README.md
```

## Backend run

```bash
cd backend
pip install -r requirements.txt
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

## Frontend run

```bash
cd frontend
npm install
npm run dev
```

## Notes

- The UI intentionally distinguishes between `Model SR` and `Enhanced output`.
- The enhanced output is a post-processing display pass, not retrained model behavior.
- This keeps the demo strong without misrepresenting the model.
