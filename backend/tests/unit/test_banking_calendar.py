"""
Unit tests for RBI Banking Clearing Calendar (RBI/2015-16/160)
"""

from datetime import date, datetime
from zoneinfo import ZoneInfo
from app.services.banking_calendar import RbiBankingCalendar, IST_TIMEZONE


def test_saturday_rbi_rule_january_2025():
    """
    In January 2025:
    - Jan 4: 1st Saturday -> WORKING DAY
    - Jan 11: 2nd Saturday -> STATUTORY RBI HOLIDAY
    - Jan 18: 3rd Saturday -> WORKING DAY
    - Jan 25: 4th Saturday -> STATUTORY RBI HOLIDAY
    """
    assert RbiBankingCalendar.is_second_or_fourth_saturday(date(2025, 1, 4)) is False
    assert RbiBankingCalendar.is_business_day(date(2025, 1, 4)) is True

    assert RbiBankingCalendar.is_second_or_fourth_saturday(date(2025, 1, 11)) is True
    assert RbiBankingCalendar.is_banking_holiday(date(2025, 1, 11)) is True

    assert RbiBankingCalendar.is_second_or_fourth_saturday(date(2025, 1, 18)) is False
    assert RbiBankingCalendar.is_business_day(date(2025, 1, 18)) is True

    assert RbiBankingCalendar.is_second_or_fourth_saturday(date(2025, 1, 25)) is True
    assert RbiBankingCalendar.is_banking_holiday(date(2025, 1, 25)) is True


def test_fifth_saturday_is_working_day():
    """
    Months with 5 Saturdays (e.g. August 2024: Aug 3, 10, 17, 24, 31).
    Aug 31 is the 5th Saturday -> WORKING DAY.
    """
    d = date(2024, 8, 31)
    assert d.weekday() == 5
    assert RbiBankingCalendar.is_second_or_fourth_saturday(d) is False
    assert RbiBankingCalendar.is_business_day(d) is True


def test_fixed_gazette_and_rbi_annual_closing():
    """
    April 1 is Annual Accounts Closing (Banking Holiday).
    Jan 26 (Republic Day), Aug 15 (Independence Day), Oct 2 (Gandhi Jayanti) are holidays.
    """
    assert RbiBankingCalendar.is_banking_holiday(date(2025, 4, 1)) is True
    assert RbiBankingCalendar.is_banking_holiday(date(2025, 1, 26)) is True
    assert RbiBankingCalendar.is_banking_holiday(date(2025, 8, 15)) is True
    assert RbiBankingCalendar.is_banking_holiday(date(2025, 10, 2)) is True


def test_business_days_addition_and_between():
    """
    Test settlement window computation skipping weekends and holidays.
    From Friday 2025-01-10:
    - Next day is Jan 11 (2nd Saturday -> Holiday)
    - Next day is Jan 12 (Sunday -> Holiday)
    - Next business day is Monday Jan 13!
    """
    friday = date(2025, 1, 10)
    next_bday = RbiBankingCalendar.next_business_day(friday)
    assert next_bday == date(2025, 1, 13)

    # 1 business day after Friday Jan 10 is Monday Jan 13
    assert RbiBankingCalendar.add_business_days(friday, 1) == date(2025, 1, 13)
    # 2 business days after Friday Jan 10 is Tuesday Jan 14
    assert RbiBankingCalendar.add_business_days(friday, 2) == date(2025, 1, 14)

    # Business days between Jan 10 and Jan 14 = 2
    assert RbiBankingCalendar.business_days_between(friday, date(2025, 1, 14)) == 2


def test_ist_timezone_precision():
    """Verify timezone conversions resolve to Asia/Kolkata with +05:30 offset."""
    now_ist = RbiBankingCalendar.get_current_ist_time()
    assert str(now_ist.tzinfo) == "Asia/Kolkata"
    assert now_ist.utcoffset().total_seconds() == 19800  # 5 hours 30 minutes = 19800s
