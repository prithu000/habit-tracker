"""
FORGE — Pagination Classes
"""
from rest_framework.pagination import CursorPagination as BaseCursorPagination
from rest_framework.pagination import PageNumberPagination


class CursorPagination(BaseCursorPagination):
    page_size = 20
    ordering = "-created_at"
    cursor_query_param = "cursor"


# Alias used throughout the app
ForgeCursorPagination = CursorPagination


class SmallPagePagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 50


class LargePagePagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = "page_size"
    max_page_size = 200


class ForgePagePagination(PageNumberPagination):
    """Standard FORGE pagination with metadata in response."""
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 100

