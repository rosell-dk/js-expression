import { Tokenizer, FUNCTION_CALL, FUNCTION_CALL_NO_ARGS, LITERAL, INFIX_OP, PREFIX_OP, IDENTIFIER, GROUPING_BEGIN, GROUPING_END }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'

import assert from 'assert'
/*

describe('PARSER: Misc parsing into Rpn', () => {
  let tests = [
    ['1+2-3-4', [1,2,'+',3,'-',4,'-']],
    ['1+2-3+4-5', [1,2,'+',3,'-',4,'+',5,'-']],
    ['1+2', [1,2,'+']],
    ['1+(2+3)*4', [1,2,3,'+',4,'*','+']],
    ['1+2-3', [1,2,'+',3,'-']],             // left-right associativity
    ['1**2**3', [1,2,3,'**','**']],         // right-left associativity
    ['!true', [true, '!']],
    ['!(true)', [true,'!']],
    ['7+myFunc(8)', [7, 8, 'myFunc', '+']],
    ['7+myFunc()', [7, 'myFunc', '+']],
    ['myFunc(1,2)', [1, 2, ',', 'myFunc']],
    ['-7*1', [7, '+/-', '1', '*']],     // unary minus (first)
    ['+2*3', [2, '3', '*']],     // unary plus is removed
    ['2+(-7*3)', [2, 7, '+/-', '3', '*', '+']],     // unary minus (first after paren)
    ['1+(-7)', [1, 7, '+/-', '+']],
    ['- +1', ['1', '+/-']],
    ['- - -1', ['1', '+/-', '+/-', '+/-']],
    ['typeof -1', ['1', '+/-', 'typeof']],
    ['[]', ['[', ']']],
    ['[1]', ['[', 1, ']']],
    ['[1,2]', ['[', 1, 2, ',', ']']],
    ['[1,2,3]', ['[', 1, 2, ',', 3, ',', ']']],
    ['{}', ['{', '}']],
    ['{lname:"rosell"}', ['{', 'lname', 'rosell', ':', '}']],
    ['{n:1,m:2}', ['{', 'n', 1, ':', 'm', 2, ':', ',', '}']],
    ['true?1:0', [true, 1, 0, ':', '?']],
    ['false?2:true?3:4', [false, 2, true, 3, 4, ':', '?', ':', '?']],
    ['false?a:true?b:c', [false, 'a', true, 'b', 'c', ':', '?', ':', '?']],  // cond a cond2 b:c ? : ?
    ['cond?a:cond2?b:c', ['cond', 'a', 'cond2', 'b', 'c', ':', '?', ':', '?']],  // cond a cond2 b:c ? : ?
    ['myFunc()', ['myFunc']],
    ['myFunc(1)', [1,'myFunc']],
    ['myFunc(1,2)', [1, 2, ',', 'myFunc']],
    ['myFunc(1,2,3)', [1, 2, ',', 3, ',', 'myFunc']],
    ['obj.color', ['obj', 'color', '.']],
    ['obj["color"]', ['obj', '[', 'color', ']']],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedTokenValues = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    //console.log('rpn', tokensRpn);
    let tokenValuesRpn = tokensRpn.map(function(a) {return a[1]});

    it(s + ' => ' + expectedTokenValues.join(' '), () => {
      assert.deepEqual(tokenValuesRpn, expectedTokenValues);
    });
  });
});
*/

describe('PARSER: Misc parsing 2', () => {
  let tests = [
    /*
    ['a[]', [ [IDENTIFIER, 'a'], [GROUPING_BEGIN, '[', [INFIX_OP, '.']], [GROUPING_END, ']']]],  // NOTE the added INFIX_OP
    ['[]', [ [GROUPING_BEGIN, '['], [GROUPING_END, ']']]],  // No added INFIX_OP, as this is not a property accessor
    ['a.b', [ [IDENTIFIER, 'a'], [IDENTIFIER, 'b'], [INFIX_OP, '.'] ]],
    ['a["b"]', [ [IDENTIFIER, 'a'], [GROUPING_BEGIN, '[', [INFIX_OP, '.']], [LITERAL,'b'], [GROUPING_END, ']'] ]],
    ['a["b"+"c"]', [ [IDENTIFIER, 'a'], [GROUPING_BEGIN, '[', [INFIX_OP, '.']], [LITERAL, 'b'], [LITERAL, 'c'], [INFIX_OP, '+'], [GROUPING_END, ']'] ]],
    ['a.b.c', [ [IDENTIFIER, 'a'], [IDENTIFIER, 'b'], [INFIX_OP, '.'], [IDENTIFIER, 'c'], [INFIX_OP, '.'] ]],
    ['a[0]', [ [IDENTIFIER, 'a'], [GROUPING_BEGIN, '[', [INFIX_OP, '.']], [LITERAL,0], [GROUPING_END, ']'] ]],
    */
    ['a+[0]', [ [IDENTIFIER, 'a'], [GROUPING_BEGIN, '['], [LITERAL,0], [GROUPING_END, ']'], [INFIX_OP, '+'] ]],
    //['a[0][1]', [[IDENTIFIER, 'a'], [GROUPING_BEGIN, '['], [LITERAL,0], [GROUPING_END, ']'], [GROUPING_BEGIN, '['], [LITERAL,1], [GROUPING_END, ']']]],
    //['a([])', [ [GROUPING_BEGIN, '['], [GROUPING_END, ']'], [FUNCTION_CALL, 'a']]],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedTokenValues = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    //console.log('rpn', tokensRpn);
    //let tokenValuesRpn = tokensRpn.map(function(a) {return a[1]});

    it(s + ' => ' + JSON.stringify(expectedTokenValues), () => {
      assert.deepEqual(tokensRpn, expectedTokenValues);
    });
  });
});
