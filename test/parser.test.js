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
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedTokenValues = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parseTokens(tokens);
    let tokenValuesRpn = tokensRpn.map(function(a) {return a[1]});

    it(s + ' => ' + JSON.stringify(expectedTokenValues), () => {
      assert.deepEqual(tokenValuesRpn, expectedTokenValues);
    });
  });
});
