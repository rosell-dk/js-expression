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
    this.tokens = undefined;
    this.rpn = undefined;
  }

  tokenize() {
    if (this.tokens == undefined) {
      this.tokens = Tokenizer.tokenize(this.expression);
    }
    return this.tokens;
  }

  parse() {
    if (this.rpn == undefined) {
      this.rpn = Parser.parse(this.tokenize());
    }
    return this.rpn;
  }

  setLocalContext(context) {
    this.localContext = context;
  }

  static setGlobalContext(context, id='global') {
    Evaluator.setGlobalContext(context, id);
  }

  evaluate(context, globalContextId = undefined) {

    if (context !== undefined) {
      if (typeof context == 'string') {
        // global context id
        globalContextId = context;
      } else {
        this.setLocalContext(context);
      }
    }
    if ((globalContextId == undefined) && (Evaluator.contexts.hasOwnProperty('global'))) {
      globalContextId = 'global';
    }
    return Evaluator.evaluate(this.parse(), this.localContext, globalContextId);
  }

}
