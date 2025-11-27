# Inventory of platform‑specific functionalities

### How to Use These Code Names
Backend (Django) – each code name maps to a service class or module (e.g., services/scoring.py contains multidimensional_scoring); API controllers import these names for actions.
Frontend (Next.js/React) – hooks or context providers invoke the same logical name; e.g., useScoreVisualization() calls the score_visualization endpoint.
Celery / Cron Tasks – periodic jobs reference the same code names, e.g., tasks.emerging_expert_detection.
