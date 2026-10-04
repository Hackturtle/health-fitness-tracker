# Exercise catalogue strategy

The goal is a searchable library that feels exhaustive in day-to-day gym use without pretending there is one universal name for every commercial machine.

## Equipment families
Current prototype:
- Machine.
- Cable.
- Dumbbell.
- Barbell.
- Smith.
- Bodyweight.

Add later categories only when they improve search rather than create noise.

## Why the catalogue should be data-driven
Different gyms label the same movement pattern differently. The data model should distinguish:
- Stable internal ID.
- Canonical display name.
- Search aliases.
- Equipment family.
- Primary muscle.
- Secondary muscles.
- Optional machine/brand alias.
- Custom user name.
- Active/archived state.

## Search behaviour target
A user should be able to type terms such as `pulldown`, `lat`, `neutral`, `machine`, or a gym-specific alias and reach useful results.

## Custom exercises
Custom movements should behave exactly like catalogue movements once selected.

## Historical safety
Never hard-delete an exercise that has workout history. Archive it instead.

## Catalogue expansion approach
Expand in reviewed batches:
1. Chest presses/flys.
2. Vertical pulls.
3. Horizontal rows.
4. Delts/traps.
5. Biceps/triceps.
6. Quad-dominant lower body.
7. Hamstrings/glutes.
8. Calves.
9. Core.
10. Specialist/less common machines.
