// Assuming a string that has been cut off at cursor
// position (if this is the line with the cursor).
// Match returns null if the line consists of spaces.
// Match returns empty array for the second group if
//   there are no spaces at the end.
// Match returns spaces in second group and index
//   of the last non-space character in the line for a
//   string like 'abc   '
const findFirstWhitespaceLeftRegex = /(\S)(\s*)$/;

const findFirstWhitespaceRightRegex = /^(\s*)(\S)/;

// Return the position of the first whitespace of
// a sequence of whitespaces left or above of position.
// For instance, for this text:
// `function foo() {<>
//    |`
// ... where | is the cursor position, we expect
// to return the position marked <>
const findFirstWhitespaceLeft = (document, line, column) => {
  const textLine = document.lineAt(line);
  // console.log(
  //   `In ffwl with line=${line}, col=${column}, text='${textLine.text}'`
  // );
  const recurse = () =>
    line > 0
      ? findFirstWhitespaceLeft(document, line - 1)
      : {
          line: textLine.range.start.line,
          col: textLine.range.start.character
        };
  if (textLine.isEmptyOrWhitespace) return recurse();
  else {
    const text = textLine.text.slice(
      0,
      typeof column === 'undefined' ? textLine.text.length : column
    );
    const match = text.match(findFirstWhitespaceLeftRegex);
    if (match) {
      const numSpaces = match[2].length;
      return {
        line,
        col: numSpaces > 0 ? match.index + 1 : text.length
      };
    } else {
      return recurse();
    }
  }
};

const findFirstWhitespaceRight = (document, line, column) => {
  const textLine = document.lineAt(line);
  // console.log(
  //   `In ffwr with line=${line}, col=${column}, text='${textLine.text}'`
  // );
  const recurse = () =>
    line < document.lineCount - 1
      ? findFirstWhitespaceRight(document, line + 1)
      : { line: textLine.range.end.line, col: textLine.range.end.character };
  if (textLine.isEmptyOrWhitespace) return recurse();
  else {
    const col = typeof column === 'undefined' ? 0 : column;
    const text = textLine.text.slice(col);
    const match = text.match(findFirstWhitespaceRightRegex);
    if (match) {
      const numSpaces = match[1].length;
      return {
        line,
        col: col + numSpaces
      };
    } else {
      return recurse();
    }
  }
};

module.exports = {
  findFirstWhitespaceLeft,
  findFirstWhitespaceRight
};
