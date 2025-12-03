"""
Celery task: contextual_analysis_batch

Placeholder that will scan entities (publications, answers, etc.)
and call analyse_entity for each. For now, just logs invocation.
"""

import logging
from celery import shared_task

from konnaxion.ekoh.services.contextual_analysis import analyse_entity

LOGGER = logging.getLogger(__name__)


@shared_task(name="contextual_analysis_batch")
def contextual_analysis_batch():
    LOGGER.info("Contextual analysis batch started")
    # TODO: Replace below with real query of new entities
    # For now, simulate one call as proof-of-concept
    dummy_user_id = 1
    dummy_entity_id = None
    analyse_entity(
        user_id=dummy_user_id,
        entity_type="example",
        entity_id=dummy_entity_id,
        domain_code="0000",  # replace with real code
        input_metadata={"note": "stub run"},
    )
    LOGGER.info("Contextual analysis batch completed")
