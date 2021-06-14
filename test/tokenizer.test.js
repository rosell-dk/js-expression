import { Tokenizer, FUNCTION_CALL, FUNCTION_CALL_NO_ARGS, LITERAL, INFIX_OP, PREFIX_OP, IDENTIFIER, GROUPING_BEGIN, GROUPING_END }  from '../src/Tokenizer.js'

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
  it('void is a prefix operator', () => {
    assert.deepEqual(Tokenizer.tokenize('void'), [[PREFIX_OP, 'void']]);
  });
});

describe('Tokenizer: Operators (infix)', () => {
  let infixTests = [
    ',', '??', '||', '&&', '|', '^', '&', '==', '!=', '===', '<', '>', '<=', '>=', '>>',
    '<<', '>>>', '*', '/', '%', '**', '?', ':'
  ];
  infixTests.forEach(op => {
    it(op + ' is an infix operator', () => {
      assert.deepEqual(Tokenizer.tokenize(op), [[INFIX_OP, op]]);
    });
  });

  it('+ is an infix operator here: 1+1', () => {
    assert.deepEqual(Tokenizer.tokenize('1+1'), [[LITERAL, 1], [INFIX_OP, '+'], [LITERAL, 1]]);
  });
  it('- is an infix operator here: 1-1', () => {
    assert.deepEqual(Tokenizer.tokenize('1-1'), [[LITERAL, 1], [INFIX_OP, '-'], [LITERAL, 1]]);
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
    ['[', ']'],
    ['{', '}'],
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

describe('Tokenizer: Unary plus/minus', () => {
  let miscTests = [
    ['true+1', [ [LITERAL,true],[INFIX_OP, '+'],[LITERAL, 1] ]],
    ['true-1', [ [LITERAL,true],[INFIX_OP, '-'],[LITERAL, 1] ]],
    ['- -1', [ [PREFIX_OP, '-'],[PREFIX_OP, '-'],[LITERAL, 1] ]],
    ['+ +1', [ [PREFIX_OP, '+'],[PREFIX_OP, '+'],[LITERAL, 1] ]],   // tokenizer keeps unary + (parser deletes it)
    ['2+-1', [ [LITERAL, 2],[INFIX_OP, '+'],[PREFIX_OP, '-'],[LITERAL, 1] ]],
    ['[-1]', [ [GROUPING_BEGIN, '['],[PREFIX_OP, '-'],[LITERAL, 1], [GROUPING_END, ']'] ]],
    ['a(-1, -b)', [ [FUNCTION_CALL, 'a'],[GROUPING_BEGIN, '('],[PREFIX_OP, '-'],[LITERAL, 1],[INFIX_OP, ','],[PREFIX_OP, '-'],[IDENTIFIER, 'b'], [GROUPING_END, ')'] ]],
  ];

  miscTests.forEach(arr => {
    let s = arr[0];
    let expectedTokens = arr[1];
    it(s + ' resolves to: ' + JSON.stringify(expectedTokens), () => {
      assert.deepEqual(Tokenizer.tokenize(s), expectedTokens);
    });
  });

});

describe('Tokenizer: Misc', () => {
  let miscTests = [

    ['name', [[IDENTIFIER,'name']]],
    ['name_2R', [[IDENTIFIER,'name_2R']]],
    ['name["firstName"]', [[IDENTIFIER,'name'],[GROUPING_BEGIN,'['],[LITERAL,'firstName'],[GROUPING_END,']']]],
    ['7*4', [[LITERAL,7],[INFIX_OP, '*'],[LITERAL, 4]]],
    ['7&&&4', [[LITERAL,7],[INFIX_OP, '&&'],[INFIX_OP, '&'],[LITERAL, 4]]],
    ['doit(3)', [[FUNCTION_CALL,'doit'],[GROUPING_BEGIN,'('],[LITERAL,3],[GROUPING_END,')']]],
    ['{}', [[GROUPING_BEGIN, '{'],[GROUPING_END, '}']]],
    ['{lname: "rosell"}', [[GROUPING_BEGIN, '{'],[LITERAL,'lname'],[INFIX_OP,':'],[LITERAL,'rosell'],[GROUPING_END,'}']]],
    ['{"lname": "rosell"}', [[GROUPING_BEGIN, '{'],[LITERAL,'lname'],[INFIX_OP,':'],[LITERAL,'rosell'],[GROUPING_END,'}']]],
    ['obj.id', [[IDENTIFIER, 'obj'],[INFIX_OP, '.'],[IDENTIFIER, 'id']]],   // tokenizer keeps unary + (parser deletes it)
    ['NaN', [[LITERAL, NaN]]],
    ['NaNo', [[IDENTIFIER, 'NaNo']]],
    ['voidish', [ [IDENTIFIER, 'voidish'] ]],
    ['trueish', [ [IDENTIFIER, 'trueish'] ]],
    ['a.trueish', [ [IDENTIFIER, 'a'],[INFIX_OP,'.'],[IDENTIFIER, 'trueish'] ]],
    ['trueish(3)', [[FUNCTION_CALL,'trueish'],[GROUPING_BEGIN,'('],[LITERAL,3],[GROUPING_END,')']]],
    ['obj.constructor2', [[IDENTIFIER, 'obj'],[INFIX_OP, '.'],[IDENTIFIER, 'constructor2']]],
    ['obj.toString', [[IDENTIFIER, 'obj'],[INFIX_OP, '.'],[IDENTIFIER, 'toString']]],
    ['obj.__proto__', [[IDENTIFIER, 'obj'],[INFIX_OP, '.'],[IDENTIFIER, '__proto__']]],
    ['obj.constructor', [[IDENTIFIER, 'obj'],[INFIX_OP, '.'],[IDENTIFIER, 'constructor']]],
  ];

  miscTests.forEach(arr => {
    let s = arr[0];
    let expectedTokens = arr[1];
    it(s + ' resolves to: ' + JSON.stringify(expectedTokens), () => {
      assert.deepEqual(Tokenizer.tokenize(s), expectedTokens);
    });
  });

});

/*
describe('Tokenizer: Misc 2', () => {

  it('obj.constructor is undefined', () => {
    let e = new Expression('obj.constructor');
    assert.equal(e.evaluate({obj:{a:1}}), undefined);
  });
})
*/
