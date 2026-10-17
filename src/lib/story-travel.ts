export type StoryKind = "hero" | "about" | "project";
/** Allocate real document travel to each sequence, rather than discarding wheel input.
 * Caps keep a large monitor from turning the narrative into a prolonged scroll.
 */
const sceneTravel = { hero: [1.25, 1200], about: [1.05, 1000], project: [1.15, 1100] } as const;
export function storyTravel(kind: StoryKind, viewportHeight: number) {
  const [fraction, maximum] = sceneTravel[kind];
  return Math.min(Math.max(0, viewportHeight) * fraction, maximum);
}
