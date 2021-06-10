import { Tokenizer, FUNCTION_CALL, FUNCTION_CALL_NO_ARGS, LITERAL, INFIX_OP, PREFIX_OP, VARIABLE, DOT, GROUPING_BEGIN, GROUPING_END }  from '../src/Tokenizer.js'

import assert from 'assert'


describe('Tokenizer: Literals', () => {
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

describe('Tokenizer: Operators (prefix)', () => {
  it('! is a prefix operator', () => {
    assert.deepEqual(Tokenizer.tokenize('!'), [[PREFIX_OP, '!']]);
  });
  it('~ is a prefix operator', () => {
    assert.deepEqual(Tokenizer.tokenize('~'), [[PREFIX_OP, '~']]);
  });
  it('typeof is a prefix operator', () => {
    assert.deepEqual(Tokenizer.tokenize('typeof'), [[PREFIX_OP, 'typeof']]);
  });
});

describe('Tokenizer: Operators (infix)', () => {
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

describe('Tokenizer: Function calls', () => {
  it('doit() is a function call (FUNCTION_CALL_NO_ARGS)', () => {
    assert.deepEqual(Tokenizer.tokenize('doit()'), [[FUNCTION_CALL_NO_ARGS, 'doit']]);
  });

  it('doit(1) is a function call (FUNCTION_CALL)', () => {
    assert.deepEqual(Tokenizer.tokenize('doit(1)'), [[FUNCTION_CALL, 'doit'],[GROUPING_BEGIN,'('],[LITERAL, 1],[GROUPING_END,')']]);
  });
});

describe('Tokenizer: Groupings', () => {
  let tests = [
    ['(', ')'],
    ['[', ']']
  ];
  tests.forEach(test => {
    it(test[0] + ' is a GROUPING_BEGIN', () => {
      assert.deepEqual(Tokenizer.tokenize(test[0]), [[GROUPING_BEGIN, test[0]]]);
    });
    it(test[1] + ' is a GROUPING_END', () => {
      assert.deepEqual(Tokenizer.tokenize(test[1]), [[GROUPING_END, test[1]]]);
    });
  });

});

describe('Tokenizer: Misc', () => {
  let miscTests = [
    ['name', [[VARIABLE,'name']]],
    ['name.firstName', [[VARIABLE,'name'],[DOT,'.'],[VARIABLE,'firstName']]],
    ['name["firstName"]', [[VARIABLE,'name'],[GROUPING_BEGIN,'['],[LITERAL,'firstName'],[GROUPING_END,']']]],
    ['true+1', [[LITERAL,true],[INFIX_OP, '+'],[LITERAL, 1]]],
    ['true-1', [[LITERAL,true],[INFIX_OP, '-'],[LITERAL, 1]]],
    ['7*4', [[LITERAL,7],[INFIX_OP, '*'],[LITERAL, 4]]],
    ['7&&&4', [[LITERAL,7],[INFIX_OP, '&&'],[INFIX_OP, '&'],[LITERAL, 4]]],
    ['doit(3)', [[FUNCTION_CALL,'doit'],[GROUPING_BEGIN,'('],[LITERAL,3],[GROUPING_END, ')']]],
    ['- +1', [[INFIX_OP, '-'],[INFIX_OP, '+'],[LITERAL, 1]]],    // Notice that "INFIX_OP" is not quite right...

  ];

  miscTests.forEach(arr => {
    let s = arr[0];
    let expectedTokens = arr[1];
    it(s + ' resolves to: ' + JSON.stringify(expectedTokens), () => {
      assert.deepEqual(Tokenizer.tokenize(s), expectedTokens);
    });
  });

});
