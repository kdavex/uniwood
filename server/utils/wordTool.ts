import Filter from "bad-words";
import fbadwords from "filipino-badwords-list";
import badwords from "badwords-list";

export function asterizeProfanicWords(text: string | null | undefined) {
  if (!text) return "";
  const filter = new Filter({
    list: [...fbadwords.array, ...badwords.array],
    placeHolder: "*",
  });
  return filter.clean(text);
}
