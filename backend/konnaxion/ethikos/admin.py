# FILE: backend/konnaxion/ethikos/admin.py
# konnaxion/ethikos/admin.py
from __future__ import annotations
from typing import Sequence

from django.apps import apps
from django.contrib import admin
from django.utils.html import format_html
from django.utils.translation import gettext_lazy as _

from .models import (
    EthikosArgument,
    EthikosCategory,
    EthikosStance,
    EthikosTopic,
)

# ───────── Mix-in to show created/updated columns ─────────
class TimestampMixin(admin.ModelAdmin):
    date_hierarchy = "created_at"

    def _time_fields(self) -> set[str]:
        return {"created_at", "updated_at"} & {f.name for f in self.model._meta.get_fields()}

    def get_readonly_fields(self, request, obj=None) -> Sequence[str]:
        return (*super().get_readonly_fields(request, obj), *self._time_fields())

    def get_list_display(self, request):
        cols = list(super().get_list_display(request))
        for f in self._time_fields():
            if f not in cols:
                cols.append(f)
        return tuple(cols)

# ───────── Category ─────────
@admin.register(EthikosCategory)
class EthikosCategoryAdmin(admin.ModelAdmin):
    list_display = ("name", "description")
    search_fields = ("name",)
    list_per_page = 30

# ───────── Topic ─────────
@admin.register(EthikosTopic)
class EthikosTopicAdmin(TimestampMixin):
    list_display = (
        "title",
        "category",
        "expertise_category",
        "status_badge",
        "total_votes",
        "created_by",
        "last_activity",
    )
    list_filter = ("status", "category", "expertise_category")
    search_fields = ("title", "description")
    autocomplete_fields = ("category", "expertise_category", "created_by")
    list_select_related = ("category", "expertise_category", "created_by")
    ordering = ("-created_at",)

    @admin.display(description=_("status"), ordering="status")
    def status_badge(self, obj: EthikosTopic) -> str:
        colour = {
            EthikosTopic.OPEN: "green",
            EthikosTopic.CLOSED: "red",
            EthikosTopic.ARCHIVED: "grey",
        }.get(obj.status, "black")
        return format_html(
            '<span style="color:{};font-weight:600;">{}</span>',
            colour,
            obj.get_status_display(),
        )

# ───────── Stance ─────────
@admin.register(EthikosStance)
class EthikosStanceAdmin(admin.ModelAdmin):
    list_display = ("user", "topic", "value", "timestamp")
    list_filter = ("value",)
    search_fields = ("user__username", "topic__title")
    autocomplete_fields = ("user", "topic")
    ordering = ("-timestamp",)

# ───────── Argument ─────────
@admin.register(EthikosArgument)
class EthikosArgumentAdmin(TimestampMixin):
    list_display = ("short_content", "topic", "user", "side", "is_hidden")
    list_filter = ("side", "is_hidden")
    search_fields = ("content", "user__username", "topic__title")
    autocomplete_fields = ("topic", "user", "parent")
    list_select_related = ("topic", "user", "parent")

    @admin.display(description=_("content"))
    def short_content(self, obj: EthikosArgument) -> str:
        return (obj.content[:60] + "…") if len(obj.content) > 60 else obj.content

# ───────── Fallback auto-registration ─────────
cfg = apps.get_app_config("ethikos")
for mdl in cfg.get_models():
    if not admin.site.is_registered(mdl):
        admin.site.register(mdl)
