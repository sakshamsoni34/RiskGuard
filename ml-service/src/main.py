import time
from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from src.schemas import (
    TransactionEvaluationRequest,
    RiskEvaluationResponse,
    ModelMetricsResponse,
    HealthCheckResponse,
)
from src.engine import RiskEngine

risk_engine = RiskEngine.get_instance()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Load ML models & TreeSHAP into memory
    print("RiskGuard microservice starting up... Loading ML weights...")
    try:
        risk_engine.load_artifacts()
    except Exception as e:
        print(f"Warning on startup artifact loading: {e}. Train the model first if not trained.")
    yield
    print("RiskGuard microservice shutting down.")

app = FastAPI(
    title="RiskGuard ML Risk Engine",
    description="Containerized High-Throughput Fraud Detection Microservice with XGBoost & TreeSHAP",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for Next.js web application
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:9000",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:9000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.middleware("http")
async def add_timing_header(request: Request, call_next):
    start_time = time.perf_counter()
    response: Response = await call_next(request)
    duration_ms = (time.perf_counter() - start_time) * 1000
    response.headers["X-Inference-Time-Ms"] = f"{duration_ms:.2f}"
    return response

@app.get("/health", response_model=HealthCheckResponse, tags=["Health"])
async def health_check():
    return HealthCheckResponse(
        status="HEALTHY",
        service="riskguard-ml-service",
        version="1.0.0",
        models_loaded=risk_engine.is_loaded,
    )

@app.get("/v1/model/metrics", response_model=ModelMetricsResponse, tags=["Model Governance"])
async def get_model_metrics():
    metrics = risk_engine.get_metrics()
    if not metrics:
        raise HTTPException(
            status_code=404,
            detail="Model metrics not found. Train the model first to generate evaluation benchmarks.",
        )
    return ModelMetricsResponse(
        totalProcessed=metrics.get("totalProcessed", 25000),
        fraudBlockedAmount=metrics.get("fraudBlockedAmount", 0.0),
        fraudAttemptCount=metrics.get("fraudAttemptCount", 0),
        otpChallengeCount=metrics.get("otpChallengeCount", 0),
        autoApprovedCount=metrics.get("autoApprovedCount", 0),
        precision=metrics.get("precision", 0.0),
        recall=metrics.get("recall", 0.0),
        f1Score=metrics.get("f1Score", 0.0),
        prAuc=metrics.get("prAuc", 0.0),
        rocAuc=metrics.get("rocAuc", 0.0),
        falsePositiveRate=metrics.get("falsePositiveRate", 0.0),
        avgLatencyMs=metrics.get("avgLatencyMs", 0.0),
    )

@app.post("/v1/risk/evaluate", response_model=RiskEvaluationResponse, tags=["Inference"])
def evaluate_transaction(request: TransactionEvaluationRequest):
    try:
        result = risk_engine.evaluate(request)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference failure: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    from src.config import HOST, PORT
    uvicorn.run("src.main:app", host=HOST, port=PORT, reload=False)
