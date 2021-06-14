import { Tokenizer }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'
import { Evaluator }  from '../src/Evaluator.js'

import assert from 'assert'

describe('Evaluator: Basic evaluation', () => {
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
    ['2+(-7*3)', -19],
    ['typeof -1', 'number'],   // both are right associative
    ['~!false', -2],   // both are right associative. ~!false => ~true => -2
    ['2+-1', 1],
    ['void 1', undefined],
    //['void 0', 'number'],   // We removed void
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

describe('Evaluator: Custom functions (passed in second argument)', () => {

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
    let result = Evaluator.evaluate(tokensRpn, functions);

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});

describe('Evaluator: Custom variables', () => {

  let variables = {
    'imageType': 'png',
  }

  let tests = [
    ['imageType', 'png'],
    //['nonExist==true']
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let result = Evaluator.evaluate(tokensRpn, variables);

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});

describe('Evaluator: Array constructor', () => {

  let tests = [
    ['[]', []],
    ['[0]', [0]],
    ['[0, 1]', [0, 1]],
    ['[0, 1, 2]', [0, 1, 2]],
    ['[1+1]', [2]],
    ['[1+1,2*4]', [2, 8]],
    // TODO: ['[1,,3]', [1, undefined, 3]],  // https://www.w3resource.com/javascript/variables-literals/literals.php
    ['[1,[2]]', [1, [2]]],
    ['[[1],2]', [[1], 2]],
    ['[[1],[2]]', [[1], [2]]],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    let result = Evaluator.evaluate(tokensRpn);

    it(s + ' => ' + JSON.stringify(expectedResult) + ' - and type is plain Array', () => {
      assert.deepEqual(result, expectedResult);
      assert.equal(result instanceof Array, true);
    });
  });
});

describe('Evaluator: Object constructor', () => {

  let tests = [
    ['{}', {}],
    ['{"a":1}', {'a':1}],
    ['{"one":1, "two":2}', {'one':1, 'two':2}],
    ['{one:1}', {one:1}],
    ['{"two":1+1}', {two:2}],
    //['{"p":{"sub":2}}.one', {"sub":2}],    // TODO: FAILS!
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    //console.log('rpn: ', tokensRpn);
    let result = Evaluator.evaluate(tokensRpn);

    it(s + ' => ' + JSON.stringify(expectedResult) + ' - and type is plain Object', () => {
      assert.deepEqual(result, expectedResult);
      assert.equal(result instanceof Object, true);
    });
  });
});

describe('Evaluator: property accessor', () => {

  let variables = {
    'obj': {"color":"green"},
    'obj2': {"one":{"two":"2"}},
    'obj3': {"one":{"two":{"three": 'abc'}}},
    'arr': ['one', 'two'],
  }

  let tests = [
    ['{"one":1}.one', 1],
    ['obj.color', "green"],
    ['(obj).color', "green"],
    ['obj2.one', {"two":2}],
    ['obj2.one.two', 2],
    ['obj3.one.two.three', 'abc'],
    ['arr[0]', 'one'],
    ['(arr)[0]', 'one'],

    // dynamic
    ['obj2["one"]["two"]', 2],
    ['obj["color"]', "green"],
    ['obj["co" + "lor"]', "green"],
    ['arr[obj2["one"]["two"]-1]', 'two'],
    //['obj3.one["two"].three', 'abc'],   // TODO!
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    //console.log('rpn: ', tokensRpn);

    let result = Evaluator.evaluate(tokensRpn, variables);
    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});


describe('Evaluator: ternary operator', () => {

  let tests = [
    ['true?"a":"b"', "a"],
    ['true?2:3', 2],
    ['false?2:3', 3],
    ['1+2-3+4-5', -1],
    ['false?0:true?1:0', 1],
    ['false?"a":true?"b":"c"', "b"],
    ['false?"a":false?"b":"c"', "c"],
    ['true?"a":true?"b":"c"', "a"],
    ['true?"a":false?"b":"c"', "a"],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    //console.log('rpn: ', tokensRpn);

    let result = Evaluator.evaluate(tokensRpn);
    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});


describe('Evaluator: Misc', () => {

  let variables = {
    'imageType': 'png',
    'options': {method:3, quality:85},
  }

  let tests = [
    ['options["method"] == 3', true],
    ['options["method"] == 2', false],
    ['imageType == "png"', true],
    ['(imageType == "png") && (options["method"] > 2)', true],
    ['(imageType == "png") && (options["method"] > 3)', false],
    ['(imageType == "jpeg") && (options["method"] > 2)', false],
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    let tokens = Tokenizer.tokenize(s);
    let tokensRpn = Parser.parse(tokens);
    //console.log('rpn: ', tokensRpn);

    let result = Evaluator.evaluate(tokensRpn, variables);
    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});
