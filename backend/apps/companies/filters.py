import django_filters
from .models import Company


class CompanyFilter(django_filters.FilterSet):
    status = django_filters.ChoiceFilter(choices=Company.Status.choices)
    is_featured = django_filters.BooleanFilter()
    industry = django_filters.UUIDFilter(field_name="industry__id")

    class Meta:
        model = Company
        fields = ["status", "is_featured", "industry"]
