const vscode = require('vscode');

// Assuming a string that has been cut off at cursor
// position (if this is the line with the cursor).
// Match returns null if the line consists of spaces.
// Match returns empty array for the second group if
//   there are no spaces at the end.
// Match returns spaces in second group and index
//   of the last non-space character in the line for a
//   string like 'abc   '
const re = /(\S)(\s*)$/;

// Return the position of the first whitespace of
// a sequence of whitespaces left or above of position.
// For instance, for this text:
// `function foo() {<>
//    |`
// ... where | is the cursor position, we expect
// to return the position marked <>
const findFirstWhitespaceLeft = (document, line, column) => {
  const textLine = document.lineAt(line);
  if (textLine.isEmptyOrWhitespace)
    return line > 0
      ? findFirstWhitespaceLeft(document, line - 1, 0)
      : new vscode.Position(0, 0);
  else {
    const text = textLine.text.slice(0, column || textLine.text.length);
    const match = text.match(re);
    const numSpaces = match[2].length;
    return new vscode.Position(
      line,
      numSpaces > 0 ? match.index + 1 : text.length
    );
  }
};

const nonEmptySelectionExists = selections => selections.find(s => !s.isEmpty);

const equalPosition = (pos1, pos2) =>
  pos1.line === pos2.line && pos1.character === pos2.character;

const backspaceFallback = () => {
  // This fallback results in a warning on the console:
  // https://github.com/Microsoft/vscode/blob/a47be8c8c116d79070c015b93609e44f8697b654/src/vs/workbench/api/node/extHost.api.impl.ts#L172
  // It seems safe enough to ignore this, but I don't
  // know how to avoid it. There is no indication that a
  // text editor command *has* to make edits when called...
  vscode.commands.executeCommand('deleteLeft');
};

const electricBackspace = (editor, edit) => {
  const { selections, document } = editor;
  if (nonEmptySelectionExists(selections)) {
    backspaceFallback();
  } else {
    const cpos = selections[0].active;
    const rangeStart = findFirstWhitespaceLeft(
      document,
      cpos.line,
      cpos.character
    );
    if (equalPosition(cpos, rangeStart)) backspaceFallback();
    else edit.delete(new vscode.Range(rangeStart, cpos));
  }
};

function activate(context) {
  let disposable = vscode.commands.registerTextEditorCommand(
    'electricEditing.electricBackspace',
    electricBackspace
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
