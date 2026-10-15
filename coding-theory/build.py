"""Rebuild the public course: python build.py (Python standard library only)."""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).parent / 'source' / 'build.py'), run_name='__main__')
