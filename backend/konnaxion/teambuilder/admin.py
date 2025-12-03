# backend/konnaxion/teambuilder/admin.py
from django.contrib import admin
from .models import BuilderSession, Team, TeamMember

class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 0
    readonly_fields = ["match_reason", "suggested_role"]
    autocomplete_fields = ["user"]

class TeamInline(admin.TabularInline):
    model = Team
    extra = 0
    show_change_link = True
    fields = ["name", "metrics"]
    readonly_fields = ["metrics"]

@admin.register(BuilderSession)
class BuilderSessionAdmin(admin.ModelAdmin):
    list_display = ["name", "status", "created_by", "created_at", "candidate_count"]
    list_filter = ["status", "created_at"]
    search_fields = ["name", "description"]
    readonly_fields = ["created_at", "updated_at"]
    filter_horizontal = ["candidates"]
    inlines = [TeamInline]

    def candidate_count(self, obj):
        return obj.candidates.count()
    candidate_count.short_description = "Candidates"

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = ["name", "session", "member_count", "created_at"]
    list_filter = ["session", "created_at"]
    search_fields = ["name", "session__name"]
    inlines = [TeamMemberInline]

    def member_count(self, obj):
        return obj.members.count()
    member_count.short_description = "Members"

@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = ["user", "team", "suggested_role"]
    list_filter = ["team__session", "suggested_role"]
    search_fields = ["user__username", "user__email", "team__name"]
    autocomplete_fields = ["user", "team"]