from app.services.risk_service import calculate_risk_data


def prepare_finding_data(finding_data: dict) -> dict:
    impacto = finding_data.get("impacto", 1)
    urgencia = finding_data.get("urgencia", 1)

    risk_data = calculate_risk_data(impacto, urgencia)

    finding_data["riesgo"] = risk_data["riesgo"]
    finding_data["nivel"] = risk_data["nivel"]

    if "evidencias" not in finding_data:
        finding_data["evidencias"] = []

    if "subrayados" not in finding_data:
        finding_data["subrayados"] = []

    return finding_data


def prepare_finding_update_data(
    update_data: dict,
    existing_finding: dict
) -> dict:
    impacto = update_data.get("impacto", existing_finding.get("impacto", 1))
    urgencia = update_data.get("urgencia", existing_finding.get("urgencia", 1))

    risk_data = calculate_risk_data(impacto, urgencia)

    update_data["riesgo"] = risk_data["riesgo"]
    update_data["nivel"] = risk_data["nivel"]

    return update_data


def should_sync_evidence_fields(update_data: dict) -> bool:
    return "criterio" in update_data or "objetivo" in update_data


def get_evidence_sync_fields(update_data: dict) -> dict:
    evidence_update = {}

    if "criterio" in update_data:
        evidence_update["criterio"] = update_data["criterio"]

    if "objetivo" in update_data:
        evidence_update["objetivo"] = update_data["objetivo"]

    return evidence_update