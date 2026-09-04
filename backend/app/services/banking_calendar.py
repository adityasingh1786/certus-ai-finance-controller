"""
AI Finance Controller — RBI Banking Clearing Calendar & IST Engine

Compliant with Reserve Bank of India (RBI) Regulations:
1. RBI Circular RBI/2015-16/160 (DBR.No.Leg.BC.37/09.07.005/2015-16):
   - All 2nd and 4th Saturdays of every month are public bank holidays.
   - All 1st, 3rd, and 5th Saturdays are active working/clearing days.
2. Sundays:
   - Non-clearing days for RTGS, NEFT bulk settlement, and physical clearing houses.
3. Official Real-Time Settlement Timings & Annual Closing:
   - April 1st: Annual Bank Accounts Closing Day (non-clearing for public transactions).
4. National & Major Gazetted RTGS/NEFT Clearing Holidays (2024-2027):
   - Republic Day (Jan 26)
   - Independence Day (Aug 15)
   - Mahatma Gandhi Jayanti (Oct 2)
   - Labour Day / Maharashtra Day (May 1)
   - Christmas (Dec 25)
   - Key festival holidays (Diwali/Deepavali, Holi, Eid, Good Friday).
5. Indian Standard Time (IST):
   - All settlement SLAs (T+1, T+2 per PSS Act) strictly evaluate in Asia/Kolkata (UTC+05:30).
"""

from datetime import date, datetime, timedelta
from typing import Set, Tuple, Optional
from zoneinfo import ZoneInfo
import calendar

IST_TIMEZONE = ZoneInfo("Asia/Kolkata")


class RbiBankingCalendar:
    """
    High-precision, calendar-aware statutory banking schedule validator.
    Used by Compliance, Reconciliation, and Treasury forecasting engines.
    """

    # Static Gazette / Clearing holidays in (month, day) format
    FIXED_HOLIDAYS: Set[Tuple[int, int]] = {
        (1, 26),   # Republic Day
        (4, 1),    # Annual Bank Accounts Closing
        (5, 1),    # Maharashtra Day / Labour Day
        (8, 15),   # Independence Day
        (10, 2),   # Mahatma Gandhi Jayanti
        (12, 25),  # Christmas Day
    }

    # Variable festival dates (ISO strings YYYY-MM-DD) for 2024 - 2027
    VARIABLE_HOLIDAYS: Set[str] = {
        # 2024
        "2024-03-25",  # Holi
        "2024-03-29",  # Good Friday
        "2024-04-11",  # Id-ul-Fitr
        "2024-04-17",  # Ram Navami
        "2024-06-17",  # Bakri Eid
        "2024-07-17",  # Muharram
        "2024-10-12",  # Dussehra
        "2024-11-01",  # Diwali Laxmi Pujan
        "2024-11-15",  # Guru Nanak Jayanti

        # 2025
        "2025-03-14",  # Holi
        "2025-03-31",  # Id-ul-Fitr
        "2025-04-18",  # Good Friday
        "2025-06-07",  # Bakri Eid
        "2025-08-27",  # Ganesh Chaturthi
        "2025-10-20",  # Diwali
        "2025-10-21",  # Diwali Balipratipada
        "2025-11-05",  # Guru Nanak Jayanti

        # 2026
        "2026-03-03",  # Holi
        "2026-03-20",  # Id-ul-Fitr
        "2026-04-03",  # Good Friday
        "2026-05-27",  # Bakri Eid
        "2026-11-08",  # Diwali
        "2026-11-24",  # Guru Nanak Jayanti
    }

    @classmethod
    def get_current_ist_time(cls) -> datetime:
        """Return current real timestamp in official IST (Asia/Kolkata)."""
        return datetime.now(IST_TIMEZONE)

    @classmethod
    def to_ist(cls, dt: datetime) -> datetime:
        """Convert any timezone-aware or naive datetime into IST."""
        if dt.tzinfo is None:
            # Assume UTC if naive, or localize directly
            return dt.replace(tzinfo=ZoneInfo("UTC")).astimezone(IST_TIMEZONE)
        return dt.astimezone(IST_TIMEZONE)

    @classmethod
    def is_second_or_fourth_saturday(cls, d: date) -> bool:
        """
        Calculates if the given date is a 2nd or 4th Saturday.
        Under RBI/2015-16/160, 2nd & 4th Saturdays are statutory bank holidays.
        1st, 3rd, and 5th Saturdays are active working days.
        """
        if d.weekday() != 5:  # 5 is Saturday (Monday=0, Sunday=6)
            return False

        # Saturday index in current month (1-indexed: 1st, 2nd, 3rd, 4th, 5th)
        saturday_index = (d.day - 1) // 7 + 1
        return saturday_index in (2, 4)

    @classmethod
    def is_sunday(cls, d: date) -> bool:
        """Check if day is Sunday (standard weekly off)."""
        return d.weekday() == 6

    @classmethod
    def is_banking_holiday(cls, d: date) -> bool:
        """
        True if the bank/clearing house is closed on date `d`.
        Checks:
        - Sundays
        - 2nd and 4th Saturdays (RBI circular)
        - Annual Accounts Closing (April 1)
        - Fixed Gazette Holidays (Jan 26, Aug 15, Oct 2, May 1, Dec 25)
        - Variable RTGS/NEFT Clearing Holidays
        """
        if cls.is_sunday(d):
            return True

        if cls.is_second_or_fourth_saturday(d):
            return True

        # Fixed annual holidays
        if (d.month, d.day) in cls.FIXED_HOLIDAYS:
            return True

        # Variable holiday list
        iso_str = d.isoformat()
        if iso_str in cls.VARIABLE_HOLIDAYS:
            return True

        return False

    @classmethod
    def is_business_day(cls, d: date) -> bool:
        """True if the day is an active commercial banking clearing day."""
        return not cls.is_banking_holiday(d)

    @classmethod
    def next_business_day(cls, d: date) -> date:
        """Returns the next immediate active business clearing day strictly after `d`."""
        curr = d + timedelta(days=1)
        while cls.is_banking_holiday(curr):
            curr += timedelta(days=1)
        return curr

    @classmethod
    def add_business_days(cls, start_date: date, num_days: int) -> date:
        """
        Adds `num_days` business clearing days to `start_date`.
        Respects all weekend, RBI Saturday, and statutory holiday closures.
        """
        curr = start_date
        added = 0
        while added < num_days:
            curr += timedelta(days=1)
            if cls.is_business_day(curr):
                added += 1
        return curr

    @classmethod
    def business_days_between(cls, d1: date, d2: date) -> int:
        """
        Computes the number of business days between d1 and d2 (exclusive of start, inclusive of end).
        If d1 > d2, returns negative count.
        """
        if d1 == d2:
            return 0
        if d1 > d2:
            return -cls.business_days_between(d2, d1)

        curr = d1 + timedelta(days=1)
        count = 0
        while curr <= d2:
            if cls.is_business_day(curr):
                count += 1
            curr += timedelta(days=1)
        return count
