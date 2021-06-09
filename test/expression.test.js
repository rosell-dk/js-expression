import { Expression }  from '../src/Expression.js'

import assert from 'assert'


describe('Create and evaluate expression', () => {
  let e = new Expression('1+1');
  it('1+1 is 2', () => {
    assert.equal(e.evaluate(), '2');
  });
});

describe('Adding custom variables', () => {

  let e = new Expression('imageType');
  e.setVariable('imageType', 'png');
  it('"imageType" evaluates to "png", after adding the variable', () => {
    assert.equal(e.evaluate(), 'png');
  });

  let e2 = new Expression('shoeSize + 2');
  e2.setVariable('shoeSize', 10);
  it('"shoeSize + 2" evaluates to 12, after adding the variable', () => {
    assert.equal(e2.evaluate(), 12);
  });

  let e3 = new Expression('person');
  let obj = {"name":"Joe", age:22};
  e3.setVariable('person', obj);
  it('"person" evaluates to {"name"=>"Joe", age:32}, after adding the variable', () => {
    assert.equal(e3.evaluate(), obj);
  });
});


describe('Changing variable', () => {

  let e = new Expression('shoeSize');
  e.setVariable('shoeSize', 10);
  let result1 = e.evaluate();
  e.setVariable('shoeSize', 12);
  let result2 = e.evaluate();

  it('"shoeSize" evaluates to 10, after setting the variable', () => {
    assert.equal(result1, 10);
  });
  it('"shoeSize" evaluates to 12, after changing the variable to 12 and running eval again', () => {
    assert.equal(result2, 12);
  });

});


describe('Adding custom function', () => {

  let e = new Expression('tripple(2)');
  e.addFunction('tripple', (n) => n*3)
  it('Added "tripple" function and tripple(2) evaluates to 6', () => {
    assert.equal(e.evaluate(), '6');
  });

  let e2 = new Expression('tripple(2)');
  e2.addFunction('tripple', (n) => n*3);
  e2.evaluate();
  e2.setFunctions(
    {'tripple': (n) => n.toString() + n.toString() + n.toString()}
  );

  it('Redefined "tripple" function so tripple(2) now evaluates to 222', () => {
    assert.equal(e2.evaluate(), '222');
  });
});
