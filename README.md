# js-expression

This library allows you to tokenize, parse and evaluate javascript expressions. No eval()!

## Usage:

```javascript
let e = new Expression('(1+1)*3');
let result = e.evaluate();   // evaluates to 6
```

Functions can be added like this:

```javascript
let e = new Expression('add(2,4)');
e.addFunction('add', (a,b) => a+b);
let result = e.evaluate();   // evaluates to 6
```

## Supported operators:
',', '??', '||', '&&', '|', '^', '&', '==', '!=', '===', '<', '>', '<=', '>=', '>>', '<<', '>>>', '+', '-', '*', '/', '%', '**', '!', '~'

## Unsupported (working on it)
- Accessing variables passed
- Unary plus and minus, ie "-7" (BEWARE)
- Ternary operator '?'
- Member access, ie `obj.firstName`
- Computed member access, ie `obj['firstName']`
- Object constructors, ie {firstName: 'Bjørn'}
- Array constructors, ie [1,2]

## Unsupported (not going to work at it)
- Optional chaining [?.](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Optional_chaining)
- new
- operators that makes assignments (++, --, =, etc)
- yield

## How it works
The library contains three engines, each in a class of its own, and a class pulling it together for convenience.

### Tokenizer
Converts a string to tokens. A token consists of type information and value.

**Examples:**
```
"7" => [LITERAL, 7]
"+" => [INFIX_OP, "+"]
"!" => [PREFIX_OP, "!"]
```

### Parser
The parser parses tokens into a rpn list ([reverse polish notation](https://en.wikipedia.org/wiki/Reverse_Polish_notation)). Such a list is very suited for being evaluated.

**Examples:** (not showing the token types for simplicity)
```
7+1 => `[7, 1, '+']
1+2*3` => `[1, 2, 3, '*', '+']
(1+2)*3` => `[1, 2, +, '3', '*']
```

### Evaluator
The evaluator evaluates the tokens and operators in the rpn list.

**Examples:**
```
[7, 1, '+'] => 8
```

### Expression
Pulls it all together. It takes care of parsing before evaluating and makes sure not to parse again upon subsequent evaluations (when variables are supported, it will not be necessary to do a reparse in order to reevaluate with new values)
