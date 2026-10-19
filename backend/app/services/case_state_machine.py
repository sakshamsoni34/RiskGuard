from fastapi import HTTPException
from typing import Set, Dict

# Finite State Machine for Case Status
ALLOWED_TRANSITIONS: Dict[str, Set[str]] = {
    "NEW": {"UNDER_INVESTIGATION", "CLOSED"},
    "UNDER_INVESTIGATION": {"PENDING_APPROVAL", "ESCALATED", "CLOSED"},
    "PENDING_APPROVAL": {"UNDER_INVESTIGATION", "ESCALATED", "CLOSED"},
    "ESCALATED": {"UNDER_INVESTIGATION", "CLOSED"},
    "CLOSED": {"UNDER_INVESTIGATION"},  # Re-opened
}

def validate_case_transition(current_status: str, next_status: str) -> None:
    if current_status == next_status:
        return

    allowed = ALLOWED_TRANSITIONS.get(current_status, set())
    if next_status not in allowed:
        raise HTTPException(
            status_code=400,
            detail=f"Illegal case status transition from '{current_status}' to '{next_status}'. "
                   f"Permitted next states: {sorted(list(allowed))}"
        )
