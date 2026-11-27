# Sources

## Apartment-price Reel (EXORBITANT)

| Item | Source | Accessed | File |
|---|---|---|---|
| Word level and gloss of EXORBITANT | EnglishU Master Word Bank (Google Sheet "Master Word Bank", sheet "Adjectives", row 90): Difficulty Advanced; Hebrew מופקע, מופרז. `/mnt/project/Master_Word_Bank_Difficulty.csv` was not available, so the CEFR level is unverified | 2026-11-26 | |
| Dwellings Price Index, bi-monthly, base average 1993=100, 1994-2026 | Central Bureau of Statistics, Price Statistics Monthly No. 10/2026, Table 2.1 "Dwellings Price Index" (sheets "AA.2.1" and "AA.2.1 1994-2010"). https://www.cbs.gov.il/he/publications/Madad/DocLib/2026/price10aa/aa2_1_e.xlsx | 2026-11-27 | `data/cbs_table2.1_dwellings_price_index_PSM10-2026.xlsx` |
| Average price of dwellings, all Israel, 2025 annual average NIS 2,330.8 thousand | CBS, Price Statistics Monthly No. 10/2026, Table 2.2 "Average Prices of Dwellings". https://www.cbs.gov.il/he/publications/Madad/DocLib/2026/price10aa/aa2_2_e.xlsx | 2026-11-27 | `data/cbs_table2.2_avg_prices_dwellings_PSM10-2026.xlsx` |
| Methodology of the Dwellings Price Index (series updates, quality adjustment) | CBS, "Methodology for Calculating the Index of Prices of Dwellings, and Quarterly and Annual Averages" (July 15, 2025). https://www.cbs.gov.il/he/publications/Madad/DocLib/2025/price12aa/aa1_1_e.pdf | 2026-11-27 | |
| Average monthly wage per employee job, total economy, current prices, annual, 2011-2025 | CBS Series DataBank, series 615908 (path 33-1-2-1-671: Labour Data Based on Reports of NII, Economy Classification 2011 > Employee Jobs, Total Wages and Average Wages, Incl. Jobs of Foreign Workers > Wages Per Employee Job > Total). API: https://apis.cbs.gov.il/series/data/path?id=33,1,2,1,671 | 2026-11-27 | `data/cbs_series_33-1-2-1-671_wage_per_employee_job.json` |
| Chart values (annual averages, rebased 2011=100) | Calculated from the two CBS series above | 2026-11-27 | `data/apartment_chart_2011-2025.csv` |
| Photos (Tel Aviv residential building, "for sale" sign) | to be chosen from Wikimedia Commons (public domain or CC) | | Stage 2 |
