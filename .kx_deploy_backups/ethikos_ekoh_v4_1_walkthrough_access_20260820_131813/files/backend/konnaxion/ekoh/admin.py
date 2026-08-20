from django.contrib import admin

from konnaxion.ekoh.models.taxonomy import ExpertiseCategory
from konnaxion.ekoh.models.scores import UserExpertiseScore, UserEthicsScore
from konnaxion.ekoh.models.audit import ContextAnalysisLog, ScoreHistory
from konnaxion.ekoh.models.config import ScoreConfiguration
from konnaxion.ekoh.models.privacy import ConfidentialitySetting


@admin.register(ExpertiseCategory)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ("code", "name", "depth", "parent")
    list_filter = ("depth",)
    search_fields = ("code", "name")


@admin.register(UserExpertiseScore)
class ExpertiseScoreAdmin(admin.ModelAdmin):
    list_display = ("user", "category", "weighted_score")
    list_filter = ("category",)
    search_fields = ("user__username", "category__code")


@admin.register(UserEthicsScore)
class EthicsAdmin(admin.ModelAdmin):
    list_display = ("user", "ethical_score")


@admin.register(ConfidentialitySetting)
class PrivacyAdmin(admin.ModelAdmin):
    list_display = ("user", "level")
    list_filter = ("level",)


@admin.register(ContextAnalysisLog)
class AnalysisLogAdmin(admin.ModelAdmin):
    list_display = ("entity_type", "entity_id", "created_at")
    readonly_fields = ("input_metadata", "adjustments_applied")
    list_filter = ("entity_type", "created_at")


@admin.register(ScoreConfiguration)
class ConfigAdmin(admin.ModelAdmin):
    list_display = ("weight_name", "field", "weight_value")
    list_filter = ("field",)
    search_fields = ("weight_name",)
