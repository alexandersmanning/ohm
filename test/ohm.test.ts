import { ohm, OhmNode } from '../src/ohm';
import { expect } from 'chai';

describe('ohm interpreter', function () {
  it('creates a simple node element', function () {
    const simpleCase = ohm`<div>Div1</div>`;
    expect(simpleCase.tag).to.equal('div');
    expect(simpleCase.children[0]).to.equal('Div1');
  });

  it('handles nested elements without special characters', function () {
    const simpleCase = ohm`<div>Text 1<div>Div 1</div><p>Paragraph 1</p></div>`;

    expect(simpleCase.tag).to.equal('div');
    expect(simpleCase.children.length).to.equal(3);
    expect(simpleCase.children[0]).to.equal('Text 1');

    const childOne = simpleCase.children[1] as OhmNode;
    expect(childOne.tag).to.equal('div');
    expect(childOne.children[0]).to.equal('Div 1');

    const childTwo = simpleCase.children[2] as OhmNode;
    expect(childTwo.tag).to.equal('p');
    expect(childTwo.children[0]).to.equal('Paragraph 1');
  });

  it('handles basic formatting', function () {
    const simpleCase = ohm`
      <div>
        Text 1
        <div>Div 1</div>
        <p>Paragraph 1</p>
      </div>
    `;

    expect(simpleCase.tag).to.equal('div');
    expect(simpleCase.children.length).to.equal(3);
    expect(simpleCase.children[0]).to.equal('Text 1');

    const childOne = simpleCase.children[1] as OhmNode;
    expect(childOne.tag).to.equal('div');
    expect(childOne.children[0]).to.equal('Div 1');

    const childTwo = simpleCase.children[2] as OhmNode;
    expect(childTwo.tag).to.equal('p');
    expect(childTwo.children[0]).to.equal('Paragraph 1');
  });
});
