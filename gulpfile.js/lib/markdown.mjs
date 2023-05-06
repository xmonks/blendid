import { marked } from "marked";
import { mangle } from "marked-mangle";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";

marked.use({
  headerIds: undefined,
  headerPrefix: undefined,
});
marked.use(gfmHeadingId());
marked.use(
  markedHighlight({
    langPrefix: "language-",
    highlight(code, lang) {
      return code;
    },
  })
);
marked.use(mangle());

export { marked };
