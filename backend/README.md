# Backend

1. Place your trained model at:
   `backend/weights/best_generator_x2_bsds300.pth`
2. Install requirements:
   `pip install -r requirements.txt`
3. Run the API:
   `uvicorn app:app --reload --host 0.0.0.0 --port 8000`
