# Starter food library

Source: Public Health England, McCance and Widdowson’s Composition of Foods Integrated Dataset (CoFID), 2021, worksheet `1.3 Proximates`.

- Publication: https://www.gov.uk/government/publications/composition-of-foods-integrated-dataset-cofid
- Download URL and SHA-256: `source-manifest.json`.
- Contains public sector information licensed under the Open Government Licence v3.0: https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/
- The curated food codes and reviewed preparation states are in `selection.json`. These 89 records are a starter selection, not the full dataset. Names preserve the source’s cooking methods and edible-part qualifiers. No specific branded product is implied.
- Rebuild with `python scripts/nutrition/import-cofid.py /path/to/official-cofid-2021.xlsx`. The generator reads XML using the standard library, checks column identities, and fails on missing/unknown nutrient values. It does not fetch anything.
- Values are per **100 g**, including milk. No density conversion, raw/cooked conversion, portion size or added ingredient is inferred. The user must enter a portion; new selections start blank.
- Dataset `Tr` values are retained in `source.trace` and explicitly shown as trace in the library. They are approximated as zero for arithmetic with an explanation in source details; they are not asserted to be absent. Unknown `N` values are never filled with zero.
- Numeric values use the dataset’s energy/protein/carbohydrate/fat columns. Rounding to four decimal places only removes spreadsheet floating-point representation noise. Calories are not regenerated with 4/4/9 factors.
- Stable UUIDs derive from dataset version and food code. Source metadata is optional on existing food records and retained in meal snapshots. Updating this static library does not change old logged meals or templates. Library definitions are read-only and do not create account records until a user saves a meal or an explicitly edited copy.
- Packet-label ingredients remain separate. Copy & edit creates a new personal ingredient ID and requires review; edited values are not represented as verified CoFID data.
