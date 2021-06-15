import { JsExpression }  from '../src/JsExpression.js'

import assert from 'assert'


describe('Create and evaluate expression', () => {
  let e = new JsExpression('1+1');
  it('1+1 is 2', () => {
    assert.equal(e.evaluate(), '2');
  });
});

describe('Adding custom variables', () => {
  let e = new JsExpression('imageType');
  let vars = {
    imageType: 'png',
    shoeSize: 10,
    person: {
      name: 'Joe',
      age: 22
    }
  }
  it('"imageType" evaluates to "png", after adding the variable', () => {
    assert.equal(e.evaluate(vars), 'png');
  });

  let e2 = new JsExpression('shoeSize + 2');
  it('"shoeSize + 2" evaluates to 12, after adding the variable', () => {
    assert.equal(e2.evaluate(vars), 12);
  });

  let e3 = new JsExpression('person');
  it('"person" evaluates to {"name"=>"Joe", age:22}, after adding the variable', () => {
    assert.deepEqual(e3.evaluate(vars), {"name":"Joe", age:22});
  });

  /*
  let e = new JsExpression('imageType');
  e.setVariable('imageType', 'png');
  it('"imageType" evaluates to "png", after adding the variable', () => {
    assert.equal(e.evaluate(), 'png');
  });

  let e2 = new JsExpression('shoeSize + 2');
  e2.setVariable('shoeSize', 10);
  it('"shoeSize + 2" evaluates to 12, after adding the variable', () => {
    assert.equal(e2.evaluate(), 12);
  });

  let e3 = new JsExpression('person');
  let obj = {"name":"Joe", age:22};
  e3.setVariable('person', obj);
  it('"person" evaluates to {"name"=>"Joe", age:32}, after adding the variable', () => {
    assert.equal(e3.evaluate(), obj);
  });
  */
});


describe('Changing variable', () => {

  let context = {
    'shoeSize': 10
  }
  let e = new JsExpression('shoeSize');
  e.setLocalContext(context);
  let result1 = e.evaluate();

  context.shoeSize = 12
  let result2 = e.evaluate();

  it('"shoeSize" evaluates to 10, after setting the variable', () => {
    assert.equal(result1, 10);
  });
  it('"shoeSize" evaluates to 12, after changing the variable to 12 and running eval again', () => {
    assert.equal(result2, 12);
  });

});


describe('Adding function', () => {
  let vars = {
    tripple: (n) => n*3
  }
  let e = new JsExpression('tripple(2)');
  let firstResult = e.evaluate(vars);

  let vars2 = {

  }
  // redefine expression (toggles reparse)
  e.setExpression('tripple(2)+1');
  let secondResult = e.evaluate(vars);

  it('Added "tripple" function and tripple(2) evaluates to 6', () => {
    assert.equal(firstResult, '6');
  });
  it('Changed expression to "tripple(2)+", it now evaluates to 7', () => {
    assert.equal(secondResult, '7');
  });

  // Redefine function
  vars['tripple'] = (n) => n.toString() + n.toString() + n.toString()

  let e2 = new JsExpression();
  //e2.setFunction('tripple', (n) => n*3);

  e2.setExpression('tripple(2)');

  it('Redefined "tripple" function so tripple(2) now evaluates to 222', () => {
    assert.equal(e2.evaluate(vars), '222');
  });

  /*
  let e = new JsExpression('tripple(2)');
  e.setFunction('tripple', (n) => n*3)
  let firstResult = e.evaluate();

  // redefine expression (toggles reparse)
  e.setExpression('tripple(2)+1');
  let secondResult = e.evaluate();

  it('Added "tripple" function and tripple(2) evaluates to 6', () => {
    assert.equal(firstResult, '6');
  });
  it('Changed expression to "tripple(2)+", it now evaluates to 7', () => {
    assert.equal(secondResult, '7');
  });

  let e2 = new JsExpression();
  e2.setFunction('tripple', (n) => n*3);
  e2.setExpression('tripple(2)');
  e2.evaluate();
  e2.setFunctions(
    {'tripple': (n) => n.toString() + n.toString() + n.toString()}
  );

  it('Redefined "tripple" function so tripple(2) now evaluates to 222', () => {
    assert.equal(e2.evaluate(), '222');
  });
  */
});


describe('Global context', () => {
  let globalContext = {
    "double": (n) => n*2,
    "PI": Math.PI
  }
  JsExpression.setGlobalContext(globalContext);

  it('double(5) evaluates to 10', () => {
    let e = new JsExpression('double(5)');
    assert.equal(e.evaluate(), 10);
  });

  it('PI equals PI', () => {
    let e = new JsExpression('PI');
    assert.equal(e.evaluate(), Math.PI);
  });

  let sweden = {
    lang: 'swedish'
  }
  let denmark = {
    lang: 'danish'
  }
  JsExpression.setGlobalContext(sweden, 'se');
  JsExpression.setGlobalContext(denmark, 'dk');
  let e = new JsExpression("'they speak: ' + lang");

  it('They speak swedish in sweden context', () => {
    assert.equal(e.evaluate('se'), 'they speak: swedish');
  });
  it('They speak danish in denmark context', () => {
    assert.equal(e.evaluate('dk'), 'they speak: danish');
  });

});



describe('tokenize()', () => {
  it('e.tokenize() returns tokens', () => {
    let e = new JsExpression('1+2');
    let tokens = e.tokenize();
    tokens = tokens.map(function(a) {return a[1]});
    assert.deepEqual(tokens, [1, '+', 2]);
  });
});

describe('parse()', () => {
  it('e.tokenize() returns tokens in rpn order', () => {
    let e = new JsExpression('1+2');
    let rpn = e.parse();
    rpn = rpn.map(function(a) {return a[1]});
    assert.deepEqual(rpn, [1, 2, '+']);
  });
});

/*
describe('Evaluator: Custom functions ("permanent" functions)', () => {

  JsExpression.setFunction('equals', (a, b) => (a==b));
  JsExpression.setFunction('double', (a) => a*2);
  JsExpression.setFunction('seven', () => 7);
  JsExpression.setFunction('gt', (a,b) => (a>b));
  JsExpression.setFunction('add', (a,b) => (a+b));

  let tests = [
    ['equals(1,3)', false],
    ['equals(1,1)', true],
    ['double(3)', 6],
    ['3+double(3)', 9],
    ['seven()', 7],
    ['7+seven()', 14],
    ['gt(1,-1)', true],
    ['add(-1,-2)', -3],
    //['- -1', 1],  // TODO
  ];

  tests.forEach(arr => {
    let s = arr[0];
    let expectedResult = arr[1];

    //let tokens = Tokenizer.tokenize(s);
    //let tokensRpn = Parser.parse(tokens);
    //let result = JsExpression.evaluate(tokensRpn);
    let result = new JsExpression(s).evaluate();

    it(s + ' => ' + JSON.stringify(expectedResult), () => {
      assert.deepEqual(result, expectedResult);
    });
  });
});*/

describe('security', () => {
  it('window is undefined', () => {
    assert.equal(new JsExpression('window').evaluate(), undefined);
  });

  it('global is undefined', () => {
    let e = new JsExpression('global');
    assert.equal(e.evaluate(), undefined);
  });

  it('console is undefined', () => {
    let e = new JsExpression('console');
    assert.equal(e.evaluate(), undefined);
  });

  it('toString is undefined', () => {
    let e = new JsExpression('toString');
    assert.equal(e.evaluate(), undefined);
  });

  //Expression.setVariable("obj", {a: 'h'});
  it('typeof obj.constructor is "function"', () => {
    let e = new JsExpression('typeof obj.constructor');
    assert.equal(e.evaluate({obj:{a:1}}), 'function');
  });

  /*
  TODO: catch error
  JsExpression.setVariable("s", "hello");
  it('Executing methods is disallowed.', () => {
    let e = new JsExpression('s.toString()');
    assert.equal(e.evaluate(), 'function');
  });
  */


});
