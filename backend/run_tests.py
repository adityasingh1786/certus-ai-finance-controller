"""
AI Finance Controller — Python Test Runner
Invokes pytest programmatically with correct sys.path configuration.
"""

import sys
import os
import pytest

if __name__ == "__main__":
    current_dir = os.path.dirname(os.path.abspath(__file__))
    if current_dir not in sys.path:
        sys.path.insert(0, current_dir)

    print("Running AI Finance Controller test suite...")
    exit_code = pytest.main(["-v", os.path.join(current_dir, "tests")])
    sys.exit(exit_code)
