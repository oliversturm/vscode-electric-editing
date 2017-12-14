const vscode = require('vscode');

const {
  findFirstWhitespaceLeft,
  findFirstWhitespaceRight
} = require('./modules/electricRemoval');

let eeConfig = {
  backspace: true,
  delete: true
};

const readEeConfig = () => {
  const config = vscode.workspace.getConfiguration('electricEditing');
  eeConfig = {
    backspace: config.get('electricBackspace', true),
    delete: config.get('electricDelete', true),
    bracket: config.get('electricBracket')
  };
};

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

const electricRemoval = (getDeleteRangeStart, fallback, optionName) => (
  editor,
  edit
) => {
  const { selections, document } = editor;
  if (!eeConfig[optionName] || nonEmptySelectionExists(selections)) {
    fallback();
  } else {
    const cpos = selections[0].active;
    const rangeStart = getDeleteRangeStart(document, cpos.line, cpos.character);
    const rangeStartPos = new vscode.Position(rangeStart.line, rangeStart.col);
    if (equalPosition(cpos, rangeStartPos)) fallback();
    else edit.delete(new vscode.Range(rangeStartPos, cpos));
  }
};

const getPair = (pairList, triggerKey) =>
  pairList.find(
    e =>
      (typeof e.triggerKey === 'string' && e.triggerKey === triggerKey) ||
      (Array.isArray(e.triggerKey) && e.triggerKey.includes(triggerKey))
  ) || { start: triggerKey, end: triggerKey };

const electricBracket = (editor, edit, params) => {
  const { selections, document } = editor;
  const { triggerKey } = params;

  if (!triggerKey) {
    console.error('Electric Bracket called without triggerKey parameter.');
    return;
  }

  const pair = getPair(eeConfig.bracket, triggerKey);
  for (const s of selections)
    edit.replace(s, `${pair.start}${document.getText(s)}${pair.end}`);
};

function activate(context) {
  readEeConfig();
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(readEeConfig)
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'electricEditing.electricBackspace',
      electricRemoval(findFirstWhitespaceLeft, backspaceFallback, 'backspace')
    )
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'electricEditing.electricDelete',
      electricRemoval(findFirstWhitespaceRight, deleteFallback, 'delete')
    )
  );
  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      'electricEditing.electricBracket',
      electricBracket
    )
  );
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
