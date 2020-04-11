const MODE_TEXT = 0;
const MODE_TAG = 1;
const MODE_CLOSING = 2;
const MODE_PROPS = 3;
const MODE_PROPS_VALUE = 4;

interface OhmDOM {
  tag: string;
  children: OhmDOM[];
}

class OhmNode {
  public parent: OhmNode | void;
  public tag: string;
  public children: Array<OhmNode | string>;
  public props: Record<string, string>;

  constructor(parent: OhmNode | void) {
    this.parent = parent;
    this.children = [];
    this.props = {};
    this.tag = '';
  }
}

/*
 * TODO:
 *  1. Handle comments.
 *  2. Handle attributes / props.
 */

// STEP 1: Assume just tags, text, and inner tags.
function ohm(
  staticFields: TemplateStringsArray,
  ...dynamicFields: string[]
): OhmNode {
  const mainVirtualDOM: OhmNode = new OhmNode();
  let currentString: string;
  let current: OhmNode = mainVirtualDOM;
  let buffer: string[] = [];
  let currentChar = '';
  let mode = MODE_TEXT;
  let child;
  let currentProp: string;

  for (let idx = 0; idx < staticFields.length; idx++) {
    // TODO review pointers for JS perf.
    [staticFields, dynamicFields].forEach((fieldList) => {
      currentString = fieldList[idx] || '';
      for (let charIdx = 0; charIdx < currentString.length; charIdx++) {
        currentChar = currentString[charIdx];
        if (mode === MODE_TEXT) {
          switch (currentChar) {
            case '<': {
              const line = buffer.join('').trim();

              if (line.length) {
                current.children.push(line);
              }

              if (currentString[charIdx + 1] === '/') {
                mode = MODE_CLOSING;
                charIdx += 1;
              } else {
                mode = MODE_TAG;
                buffer = [];
                if (current.tag) {
                  child = new OhmNode(current);
                  current.children.push(child);
                  current = child;
                }
              }
              break;
            }
            default:
              buffer.push(currentChar);
              break;
          }
        } else if (mode === MODE_TAG) {
          switch (currentChar) {
            case '>':
              if (!current.tag) {
                current.tag = buffer.join('').trim();
              }
              buffer = [];
              mode = MODE_TEXT;
              break;
            case ' ':
              if (!current.tag) {
                current.tag = buffer.join('').trim();
              }
              buffer = [];
              mode = MODE_PROPS;
              break;
            default:
              buffer.push(currentChar);
              break;
          }
        } else if (mode === MODE_CLOSING && currentChar === '>') {
          if (current.parent) {
            current = current.parent;
            mode = MODE_TEXT;
            buffer = [];
          } else {
            break;
          }
        } else if (mode === MODE_PROPS) {
          switch (currentChar) {
            // TODO: fix assumption that there is always a quote
            case '"': {
              const line = buffer.join('').trim();
              if (line.length) {
                currentProp = line;
              }
              buffer = [];
              mode = MODE_PROPS_VALUE;
              break;
            }
            case '>': {
              const line = buffer.join('').trim();
              if (line.length) {
                current.props[line] = '';
                currentProp = '';
              }
              buffer = [];
              mode = MODE_TEXT;
              break;
            }
            case '=':
              break;
            default:
              buffer.push(currentChar);
              break;
          }
        } else if (mode === MODE_PROPS_VALUE) {
          switch (currentChar) {
            case '"': {
              const line = buffer.join('').trim();
              if (line.length) {
                current.props[currentProp] = line;
              }
              buffer = [];
              currentProp = '';
              mode = MODE_PROPS;
              break;
            }
            default:
              buffer.push(currentChar);
              break;
          }
        }
      }
    });
  }

  return mainVirtualDOM;
}

export { ohm, OhmNode };
