"""
FORGE — Core Admin Base Classes
Shared admin configuration used by all apps.
"""
from django.contrib import admin


class ForgeBaseAdmin(admin.ModelAdmin):
    """
    Base admin class for all FORGE models.
    Provides: readonly timestamps, list display defaults,
    search, ordering.
    """
    readonly_fields = ("id", "created_at", "updated_at")
    list_per_page = 25
    save_on_top = True
    show_full_result_count = False

    def get_readonly_fields(self, request, obj=None):
        base = list(self.readonly_fields)
        if obj:
            base.append("id")
        return base
