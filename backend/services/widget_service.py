class WidgetService:
    @staticmethod
    def calculate_completion_pct(total_progress: int, goal: int, period_days: int = 1) -> int:
        """
        Calculates the completion percentage of a widget.
        Ensures a single source of truth across Dashboard, Reports, Analytics, and PDF.
        percentage = completed / (goal * period_days) * 100
        """
        expected_total = goal * max(1, period_days)
        if expected_total <= 0:
            return 0
        return min(100, int((total_progress / expected_total) * 100))
