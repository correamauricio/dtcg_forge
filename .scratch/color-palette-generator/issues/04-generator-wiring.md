# 04: Generator Wiring

**What to build:** Connect the color editing actions to the generator. Changing a single color in the compact view makes it the "seed", triggering the script to regenerate the rest of the group automatically.

**Blocked by:** 01-services, 02-compact-ui, 03-generator-modal

**Status:** done

- [x] Listen to color value changes in `PrimitiveGroupNodeComponent`.
- [x] When a color is modified, invoke `PaletteGeneratorService.generate` with the new color as the seed.
- [x] Emit update events for all other tokens in the group based on the generator script's returned values.
- [x] Add integration/unit tests for the end-to-end wiring.

