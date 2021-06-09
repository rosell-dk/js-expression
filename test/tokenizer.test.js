import { Tokenizer, FUNCTION_CALL, FUNCTION_CALL_NO_ARGS, LITERAL, INFIX_OP, PREFIX_OP, VARIABLE, LEFT_PAREN, RIGHT_PAREN, DOT, PROPERTY_ACCESSOR_LEFT, PROPERTY_ACCESSOR_RIGHT }  from '../src/Tokenizer.js'

import assert from 'assert'


describe('Literals', () => {
  let literalTests = [
    ['""', ''],
    ['\'\'', ''],
    ['"hi"', 'hi'],
    ['null', null],
    ['undefined', undefined],
    ['NaN', NaN],
    ['7', 7],
    //['-7', -7],   TODO: Unary minus
    ['2.14', 2.14],
  ];

  literalTests.forEach(arr => {
    let s = arr[0];
    let val = arr[1];
    it(s + ' is a literal with value:' + s, () => {
      assert.deepEqual(Tokenizer.tokenize(s), [[LITERAL, val]]);
    });
  });
});

describe('Operators (prefix)', () => {
  it('! is a prefix operator', () => {
    assert.deepEqual(Tokenizer.tokenize('!'), [[PREFIX_OP, '!']]);
  });
  it('~ is a prefix operator', () => {
    assert.deepEqual(Tokenizer.tokenize('~'), [[PREFIX_OP, '~']]);
  });
});

describe('Operators (infix)', () => {
  let infixTests = [
    ',', '??', '||', '&&', '|', '^', '&', '==', '!=', '===', '<', '>', '<=', '>=', '>>',
    '<<', '>>>', '+', '-', '*', '/', '%', '**'
  ];
  infixTests.forEach(op => {
    it(op + ' is an infix operator', () => {
      assert.deepEqual(Tokenizer.tokenize(op), [[INFIX_OP, op]]);
    });
  });
});

describe('Function calls', () => {
  it('doit() is a function call (FUNCTION_CALL_NO_ARGS)', () => {
    assert.deepEqual(Tokenizer.tokenize('doit()'), [[FUNCTION_CALL_NO_ARGS, 'doit']]);
  });
});

describe('Misc', () => {
  let miscTests = [
    ['(', [[LEFT_PAREN,'(']]],
    [')', [[RIGHT_PAREN,')']]],
    ['name', [[VARIABLE,'name']]],
    ['name.firstName', [[VARIABLE,'name'],[DOT,'.'],[VARIABLE,'firstName']]],
    ['name["firstName"]', [[VARIABLE,'name'],[PROPERTY_ACCESSOR_LEFT,'['],[LITERAL,'firstName'],[PROPERTY_ACCESSOR_RIGHT,']']]],
    ['true+1', [[LITERAL,true],[INFIX_OP, '+'],[LITERAL, 1]]],
    ['true-1', [[LITERAL,true],[INFIX_OP, '-'],[LITERAL, 1]]],
    ['7*4', [[LITERAL,7],[INFIX_OP, '*'],[LITERAL, 4]]],
    ['7&&&4', [[LITERAL,7],[INFIX_OP, '&&'],[INFIX_OP, '&'],[LITERAL, 4]]],
    ['doit(3)', [[FUNCTION_CALL,'doit'],[LEFT_PAREN,'('],[LITERAL,3],[RIGHT_PAREN, ')']]],
  ];

  miscTests.forEach(arr => {
    let s = arr[0];
    let expectedTokens = arr[1];
    it(s + ' resolves to: ' + JSON.stringify(expectedTokens), () => {
      assert.deepEqual(Tokenizer.tokenize(s), expectedTokens);
    });
  });

});
