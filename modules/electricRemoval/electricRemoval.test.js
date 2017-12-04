/* global describe, it */

const assert = require('assert');

const { findFirstWhitespaceLeft, findFirstWhitespaceRight } = require('.');

const assertPos = (p, l, c) => {
  assert.equal(p.line, l);
  assert.equal(p.col, c);
};

const lineAt = text => line => {
  return {
    text: text[line],

    range: {
      start: { line, character: 0 },
      end: { line, character: text[line].length }
    },
    isEmptyOrWhitespace: !!text[line].match(/^\s*$/)
  };
};

const document = text => ({ lineAt: lineAt(text), lineCount: text.length });

describe('electric removal', function() {
  describe('findFirstWhitespaceLeft', function() {
    it('several empty lines with stop point, text trailing', function() {
      const text = ['nth', '  ', '  ', '   barg'];
      const pos = findFirstWhitespaceLeft(document(text), 3, 2);
      assertPos(pos, 0, 3);
    });

    it('in text, no ws around', function() {
      const text = ['nth', '  ', '  ', '   barg'];
      const pos = findFirstWhitespaceLeft(document(text), 3, 5);
      assertPos(pos, 3, 5);
    });

    it('at the end of text, no ws', function() {
      const text = ['nth', '  ', '  ', '   barg'];
      const pos = findFirstWhitespaceLeft(document(text), 3, 7);
      assertPos(pos, 3, 7);
    });

    it('at the end of text, ws to the left, stopping point in same line', function() {
      const text = ['nth', '  ', '  ', '   barg    '];
      const pos = findFirstWhitespaceLeft(document(text), 3, 9);
      assertPos(pos, 3, 7);
    });

    it('several empty lines with stop point, no text trailing', function() {
      const text = ['nth', '  ', '  ', '   '];
      const pos = findFirstWhitespaceLeft(document(text), 3, 3);
      assertPos(pos, 0, 3);
    });

    it('one line, at end, no ws', function() {
      const text = ['nth'];
      const pos = findFirstWhitespaceLeft(document(text), 0, 3);
      assertPos(pos, 0, 3);
    });

    it('one line, at end, no ws, text trailing', function() {
      const text = ['nth nth'];
      const pos = findFirstWhitespaceLeft(document(text), 0, 3);
      assertPos(pos, 0, 3);
    });

    it('one line, at start, text trailing', function() {
      const text = ['nth nth'];
      const pos = findFirstWhitespaceLeft(document(text), 0, 0);
      assertPos(pos, 0, 0);
    });

    it('several empty lines with stop point, no text trailing, at start', function() {
      const text = ['nth', '  ', '  ', ''];
      const pos = findFirstWhitespaceLeft(document(text), 3, 0);
      assertPos(pos, 0, 3);
    });
  });

  describe('findFirstWhitespaceRight', function() {
    it('several empty lines with stop point, text trailing', function() {
      const text = ['nth', '  ', '  ', '    barg'];
      const pos = findFirstWhitespaceRight(document(text), 0, 3);
      assertPos(pos, 3, 4);
    });

    it('several empty lines with stop point, start of line', function() {
      const text = ['nth', '  ', '  ', '    barg'];
      const pos = findFirstWhitespaceRight(document(text), 3, 0);
      assertPos(pos, 3, 4);
    });

    it('several empty lines with stop point, in between ws', function() {
      const text = ['nth', '  ', '  ', '    barg'];
      const pos = findFirstWhitespaceRight(document(text), 2, 1);
      assertPos(pos, 3, 4);
    });

    it('all the way at the end', function() {
      const text = ['nth', '  ', '  ', '    barg'];
      const pos = findFirstWhitespaceRight(document(text), 3, 8);
      assertPos(pos, 3, 8);
    });

    it('right at the start, no ws', function() {
      const text = ['nth', '  ', '  ', '    barg'];
      const pos = findFirstWhitespaceRight(document(text), 0, 0);
      assertPos(pos, 0, 0);
    });

    it('in the middle, no ws', function() {
      const text = ['nth', '  ', '  ', '    barg'];
      const pos = findFirstWhitespaceRight(document(text), 3, 6);
      assertPos(pos, 3, 6);
    });
  });
});
