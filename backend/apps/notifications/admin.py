from django.contrib import admin
from django.utils import timezone
from .models import EmailReminderSchedule, NotificationPreference

@admin.register(EmailReminderSchedule)
class EmailReminderScheduleAdmin(admin.ModelAdmin):
    list_display = ('user', 'task_name', 'priority', 'frequency', 'deadline', 'is_active')
    list_filter = ('is_active', 'frequency', 'priority')
    search_fields = ('user__email', 'task_name')



@admin.register(NotificationPreference)
class NotificationPreferenceAdmin(admin.ModelAdmin):
    list_display = ('user', 'morning_mail_enabled', 'night_mail_enabled', 'push_notifications_enabled')
    search_fields = ('user__email',)
    list_filter = ('push_notifications_enabled',)
