#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.8"
# dependencies = [
#   "pandas",
#   "openpyxl",
# ]
# ///

import pandas as pd
from pathlib import Path

def extract_sheets_to_csv(excel_path: Path, output_folder: Path) -> None:
    """
    Reads every sheet in the given Excel file and writes each to its own CSV.
    """
    output_folder.mkdir(exist_ok=True)
    # Read all sheets into a dict of DataFrames
    sheets = pd.read_excel(excel_path, sheet_name=None)
    for name, df in sheets.items():
        sanitized = "".join(c if c.isalnum() or c in " _-" else "_" for c in name)
        out_file = output_folder / f"{sanitized}.csv"
        df.to_csv(out_file, index=False)
        print(f"Saved {out_file}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: uv run your_script.py <input.xlsx> <output_dir>")
    else:
        excel_file = Path(sys.argv[1])
        csv_dir = Path(sys.argv[2])
        extract_sheets_to_csv(excel_file, csv_dir)
