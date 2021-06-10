import { Tokenizer }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'

import assert from 'assert'


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
    ['obj.name', ['obj', 'name', '.']],
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
