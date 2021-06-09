import { Expression }  from '../src/Expression.js'

import assert from 'assert'


describe('Create and evaluate expression', () => {
  let e = new Expression('1+1');
  it('1+1 is 2', () => {
    assert.equal(e.evaluate(), '2');
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
