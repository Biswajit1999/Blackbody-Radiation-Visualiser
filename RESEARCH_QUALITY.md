# Research Quality Upgrade

This repository has been upgraded with a compact research-quality layer: reference anchors, validation checks, and explicit scientific/software boundaries.

## Scope

Interactive Planck-law laboratory for stellar spectra, Wien displacement, Stefan-Boltzmann scaling and colour-temperature intuition.

## Equations And Models

- Planck spectral radiance B_lambda(T)
- Wien displacement lambda_max T = b
- Stefan-Boltzmann flux F = sigma T^4

## Reference Anchors

The file `data/research-reference.json` stores benchmark anchors used by `scripts/validate_repository.mjs`. These are intentionally small and auditable so the repository can be checked without network access.

## Reproducibility Upgrade

The validation layer checks source files, reference data, README citations, and incomplete scaffold markers.

## References

- Planck, M., 1901. On the law of distribution of energy in the normal spectrum. Annalen der Physik, 4, pp.553-563.
