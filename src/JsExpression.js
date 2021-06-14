import { Tokenizer }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'
import { Evaluator }  from '../src/Evaluator.js'

export class JsExpression {
  constructor(expression = '') {
    this.setExpression(expression);

    this.extra = {
      'functions': {},
      'variables': {}
    }
  }

  setExpression(expression = '') {
    this.expression = expression;
    this.tokens = null;
    this.rpn = null;
  }

  tokenize() {
    if (this.tokens == null) {
      this.tokens = Tokenizer.tokenize(this.expression);
    }
    return this.tokens;
  }

  parse() {
    if (this.rpn == null) {
      this.rpn = Parser.parse(this.tokenize());
    }
    return this.rpn;
  }

  static staticVars = [];

  static setFunction(functionName, f) {
    JsExpression.staticVars[functionName] = f;
  }

  static setVariable(name, value) {
    JsExpression.staticVars[name] = value;
  }

  evaluate(vars = {}) {
    let v = {};
    Object.assign(v, JsExpression.staticVars);
    Object.assign(v, vars);


    return Evaluator.evaluate(this.parse(), v);
  }

}
