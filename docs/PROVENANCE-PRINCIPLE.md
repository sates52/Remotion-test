# The Provenance Principle (P2.0)

## The rule

> A story bible is a *claimant*, never an *authority*, about where a motif
> comes from.

The P1.1 firewall proved scene-contract ⊆ bible. P2.0 adds the missing
half: **bible ↔ external truth**. Authority lives in code-owned registries
that are physically unable to be edited by the authoring process.

## Lookup order for a rendered motif

```
prop.type
  │
  ├─ 1. motif-world.json origins[motif] exists?
  │       ├─ origin === scene worldId  → OK (provenance proven)
  │       └─ origin !== scene worldId  → FOREIGN_WORLD   (hard)
  │
  ├─ 2. shared-generic-motifs.json contains motif?
  │                                          → OK (generic vocabulary)
  │
  └─ 3. every content token grounded in scene narration / bible vocabulary?
            ├─ yes → OK (locally grounded)
            └─ no  → VOCABULARY_NOT_GROUNDED (hard)
```

Steps 1 and 2 are answered only by `test/data/*.json`, which the bible
authoring step cannot write to. Step 3 never consults the scene contract's
own `allowedMotifs` — that would recreate the tautology.

## The four P2.0 checks

| Code | Level | Severity | Proves |
|---|---|---|---|
| `FOREIGN_WORLD` | bible claim + scene use | hard | a motif owned by another world was claimed/used |
| `VOCABULARY_NOT_GROUNDED` | scene use | hard | an unregistered, unshared motif has no narrative basis |
| `IDENTITY_DUPLICATE` | bible cast | hard | two cast keys are the same identity (same name, or 1 edit apart) |
| `CONTRACT_VACUOUS` | config | **diagnostic only** | the contract carries no narrative discrimination |

`FOREIGN_WORLD` and `VOCABULARY_NOT_GROUNDED` are deliberately **separate
codes**: "wrong world" and "no basis at all" are different failures with
different remediations (fix the bible vs. ground the vocabulary).

## Why CONTRACT_VACUOUS is diagnostic-only

Measured during P2.0 forensics: the healthy Republic book has the *identical*
vacuous signature as the contaminated Verity book (1 constant relation, 1
unknown chapter, empty `visualSubject` everywhere) while its rendered visuals
are correct. Degenerate ≠ wrong. The signal is reported on every run so it
can be tracked; whether it ever becomes a hard failure is a separate,
measurement-driven decision (re-measure after P2.0b).

## Adding a new book (no code change)

1. Author `story-bible.json` normally. Declare only motifs that are either
   generic (already in the shared pool) or literally present in your
   narration.
2. If your book introduces a genuinely book-specific concept motif, add it to
   `test/data/motif-world.json` with your `worldId` — a **code review**, by
   design. This is the one intentional friction: ownership is settled by a
   human, not by the claimant.
3. Run `node scripts/test-bible-integrity.js` — Test B is the contract that
   new books stay green.
