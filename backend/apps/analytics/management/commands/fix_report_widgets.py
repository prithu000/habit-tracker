from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.analytics.models import CustomWidget

User = get_user_model()

class Command(BaseCommand):
    help = "Ensures no user has more than 4 widgets included in reports."

    def handle(self, *args, **options):
        users = User.objects.all()
        fixed_count = 0

        for user in users:
            # Get active widgets that are included in reports
            widgets = CustomWidget.objects.filter(
                user=user, 
                is_active=True, 
                show_in_reports=True
            ).order_by('display_order', 'created_at')

            if widgets.count() > 4:
                # Keep the top 4, disable the rest
                widgets_to_disable = widgets[4:]
                for w in widgets_to_disable:
                    w.show_in_reports = False
                    w.save(update_fields=['show_in_reports'])
                    fixed_count += 1
                
                self.stdout.write(f"Fixed {len(widgets_to_disable)} widgets for {user.email}")

        self.stdout.write(self.style.SUCCESS(f"Successfully processed users. Fixed {fixed_count} widgets overall."))
