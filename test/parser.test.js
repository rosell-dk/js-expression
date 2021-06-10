import { Tokenizer }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'

import assert from 'assert'


describe('Parsing into Rpn', () => {
  let tests = [
    ['1+2', [1,2,'+']],
    ['1+(2+3)*4', [1,2,3,'+',4,'*','+']],
    ['1+2-3', [1,2,'+',3,'-']],             // left-right associativity
    ['1**2**3', [1,2,3,'**','**']],         // right-left associativity
    ['!(true)', [true,'!']],
    ['doit(3)', [3,'doit']],
    ['doit()', ['doit']],
    ['7+doit(8)', [7, 8, 'doit', '+']],
    ['7+doit()', [7, 'doit', '+']],
    ['doit(1,2)', [1, 2, ',', 'doit']],
    ['-7*1', [7, '+/-', '1', '*']],     // unary minus (first)
    ['+2*3', [2, '+/+', '3', '*']],     // unary plus
    ['2+(-7*3)', [2, 7, '+/-', '3', '*', '+']],     // unary minus (first after paren)
    ['1+(-7)', [1, 7, '+/-', '+']],
    ['- +1', ['1', '+/+', '+/-']],
    ['- - -1', ['1', '+/-', '+/-', '+/-']],
    ['typeof -1', ['1', '+/-', 'typeof']],
    //['!true', [true, '!']],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedTokenValues = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let tokenValuesRpn = tokensRpn.map(function(a) {return a[1]});

    it(s + ' => ' + JSON.stringify(expectedTokenValues), () => {
      assert.deepEqual(tokenValuesRpn, expectedTokenValues);
    });
  });
});
