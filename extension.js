const vscode = require('vscode');

const {
  findFirstWhitespaceLeft,
  findFirstWhitespaceRight
} = require('./modules/electricRemoval');

const backspaceFallback = () => {
  // This fallback results in a warning on the console:
  // https://github.com/Microsoft/vscode/blob/a47be8c8c116d79070c015b93609e44f8697b654/src/vs/workbench/api/node/extHost.api.impl.ts#L172
  // It seems safe enough to ignore this, but I don't
  // know how to avoid it. There is no indication that a
  // text editor command *has* to make edits when called...
  vscode.commands.executeCommand('deleteLeft');
};

const deleteFallback = () => {
  // see above re warning
  vscode.commands.executeCommand('deleteRight');
};

const nonEmptySelectionExists = selections => selections.find(s => !s.isEmpty);

const equalPosition = (pos1, pos2) =>
  pos1.line === pos2.line && pos1.character === pos2.character;

const electricRemoval = (getDeleteRangeStart, fallback) => (editor, edit) => {
  const { selections, document } = editor;
  if (nonEmptySelectionExists(selections)) {
    fallback();
  } else {
    const cpos = selections[0].active;
    const rangeStart = getDeleteRangeStart(document, cpos.line, cpos.character);
    const rangeStartPos = new vscode.Position(rangeStart.line, rangeStart.col);
    if (equalPosition(cpos, rangeStartPos)) fallback();
    else edit.delete(new vscode.Range(rangeStartPos, cpos));
  }
};

function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'electricEditing.electricBackspace',
      electricRemoval(findFirstWhitespaceLeft, backspaceFallback)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'electricEditing.electricDelete',
      electricRemoval(findFirstWhitespaceRight, deleteFallback)
    )
  );
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
