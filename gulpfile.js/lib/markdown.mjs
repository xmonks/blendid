import { marked } from "marked";
import { mangle } from "marked-mangle";
import { markedHighlight } from "marked-highlight";
import { gfmHeadingId } from "marked-gfm-heading-id";

marked.use(
  gfmHeadingId(),
  markedHighlight({
    langPrefix: "language-",
    highlight(code, lang) {
      return code;
    }
  }),
  mangle()
);

export { marked };
