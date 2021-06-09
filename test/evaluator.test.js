import { Tokenizer }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'
import { Evaluator }  from '../src/Evaluator.js'

import assert from 'assert'

describe('Basic evaluation', () => {
  let tests = [
    ['2*3*2', 12],
    ['2**3', 8],
    ['3%2', 1],
    ['4/2', 2],
    ['6/3%2', 0],
    ['true==false', false],
    ['true!=false', true],
    ['true===true', true],
    ['8===8===true', true],
    ['true!==true', false],
    ['null??2', 2],
    ['true||false&&true', true],
    ['2|1', 3],
    ['2&1', 0],
    ['12^9', 5],
    ['1+(2+3)*4', 21],
    ['2<<1', 4],
    ['2>>1', 1],
    ['2>>>1', 1],
    ['2>2', false],
    ['2>=2', true],
    ['2**3**2', 512],
    ['!false', true],
    ['~1', -2],
    ['1,2', [1,2]],
    ['1,2,3', [1,2,3]],
    ['-2*3', -6],
    ['+2*3', 6],
    ['2+(-7*3)', -19]
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let result = Evaluator.evaluate(tokensRpn);

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});

describe('Custom functions ("permanent" functions)', () => {

  Evaluator.addFunction('equals', (a, b) => (a==b));
  Evaluator.addFunction('double', (a) => a*2);
  Evaluator.addFunction('seven', () => 7);
  Evaluator.addFunction('gt', (a,b) => (a>b));
  Evaluator.addFunction('add', (a,b) => (a+b));

  let tests = [
    ['equals(1,3)', false],
    ['equals(1,1)', true],
    ['double(3)', 6],
    ['3+double(3)', 9],
    ['seven()', 7],
    ['7+seven()', 14],
    ['gt(1,-1)', true],
    ['add(-1,-2)', -3],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let result = Evaluator.evaluate(tokensRpn);

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});

describe('Custom functions (passed in second argument)', () => {

  let functions = {
    'hello': () => 'world'
  }
  let tests = [
    ['hello()', 'world'],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let result = Evaluator.evaluate(tokensRpn, {'functions':functions});

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});

describe('Custom variables', () => {

  let variables = {
    'imageType': 'png',
  }

  let tests = [
    ['imageType', 'png'],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let result = Evaluator.evaluate(tokensRpn, {'variables':variables});

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});
