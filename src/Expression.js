import { Tokenizer }  from '../src/Tokenizer.js'
import { Parser }  from '../src/Parser.js'
import { Evaluator }  from '../src/Evaluator.js'

export class Expression {
  constructor(expression) {
    this.tokens = null;
    this.rpn = null;
    this.expression = expression;
    this.functions = {}
  }

  tokenize() {
    this.tokens = Tokenizer.tokenize(this.expression);
  }

  parse() {
    if (this.tokens == null) {
      this.tokenize();
    }
    this.rpn = Parser.parse(this.tokens);
  }

  addFunction(fname, fn) {
    this.functions[fname] = fn;
  }

  setFunctions(functions) {
    this.functions = functions;
  }

  evaluate() {
    if (this.rpn == null) {
      this.parse();
    }
    return Evaluator.evaluate(this.rpn, this.functions);
  }

}
