/**
 * Which cards in a list of `count` span two columns.
 *
 * The grid is four across on large screens. Picking just enough wide cards to
 * make the total cell count a multiple of four means the bento always closes
 * on a flush bottom edge, whatever the filter leaves behind. The wide cards
 * are spread evenly through the list so the rhythm never bunches up.
 */
export function wideIndexes(count: number): Set<number> {
  if (count < 3) return new Set();
  let wide = (4 - (count % 4)) % 4;
  if (wide === 0 && count >= 8) wide = 4;
  const picks = new Set<number>();
  for (let k = 0; k < wide; k += 1) {
    picks.add(Math.floor((k * count) / wide));
  }
  return picks;
}
