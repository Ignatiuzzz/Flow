from fastapi import HTTPException, status

from app.models.enums import RiskLevel


def calculate_risk(impacto: int, urgencia: int) -> int:
    if impacto < 1 or urgencia < 1:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El impacto y la urgencia deben ser mayores o iguales a 1"
        )

    return impacto * urgencia


def calculate_risk_level(riesgo: int) -> RiskLevel:
    if riesgo <= 2:
        return RiskLevel.MUY_BAJO

    if 3 <= riesgo <= 4:
        return RiskLevel.BAJO

    if 5 <= riesgo <= 9:
        return RiskLevel.MEDIO

    if 9 < riesgo < 20:
        return RiskLevel.ALTO

    if riesgo >= 20:
        return RiskLevel.EXTREMO

    raise HTTPException(
        status_code=status.HTTP_400_BAD_REQUEST,
        detail="Valores errados para calcular el nivel de riesgo"
    )


def calculate_risk_data(impacto: int, urgencia: int) -> dict:
    riesgo = calculate_risk(impacto, urgencia)
    nivel = calculate_risk_level(riesgo)

    return {
        "riesgo": riesgo,
        "nivel": nivel
    }