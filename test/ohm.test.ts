import { ohm, OhmNode } from '../src/ohm';
import { expect } from 'chai';

describe('ohm interpreter', function () {
  describe('plain html', function () {
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

    describe('html with attributes', function () {
      it('handles props at the top level', function () {
        const ohmObject = ohm`
          <div class="cOne cTwo">Text 1</div>
        `;

        expect(ohmObject.tag).to.equal('div');
        expect(ohmObject.props).to.haveOwnProperty('class');
        expect(ohmObject.props.class).to.equal('cOne cTwo');
        expect(ohmObject.children[0]).to.equal('Text 1');
      });

      it('handles multiple props at the top level', function () {
        const ohmObject = ohm`
          <div
            class="cOne cTwo"
            style="background-color: red; color: blue"
          >Text 1</div>
        `;

        expect(ohmObject.tag).to.equal('div');
        expect(ohmObject.props).to.haveOwnProperty('class');
        expect(ohmObject.props.class).to.equal('cOne cTwo');
        expect(ohmObject.props).to.haveOwnProperty('style');
        expect(ohmObject.props.style).to.equal(
          'background-color: red; color: blue'
        );
        expect(ohmObject.children[0]).to.equal('Text 1');
      });

      it('handle props without values', function () {
        const ohmObject = ohm`
          <button
            class="cOne cTwo"
            style="background-color: red; color: blue"
            disabled
          >Text 1</button>
        `;

        expect(ohmObject.tag).to.equal('button');
        expect(ohmObject.props).to.haveOwnProperty('class');
        expect(ohmObject.props.class).to.equal('cOne cTwo');
        expect(ohmObject.props).to.haveOwnProperty('style');
        expect(ohmObject.props.style).to.equal(
          'background-color: red; color: blue'
        );
        expect(ohmObject.props).to.haveOwnProperty('disabled');
        expect(ohmObject.props.disabled).to.equal('');
        expect(ohmObject.children[0]).to.equal('Text 1');
      });

      it('handles multi level props', function () {
        const ohmObject = ohm`
          <div customAttribute="divClass1 divClass2">
            <button
              class="cOne cTwo"
              style="background-color: red; color: blue"
              disabled
            >Text 1</button>
            Text 2
          </div>
        `;

        expect(ohmObject.tag).to.equal('div');
        expect(ohmObject.props).to.haveOwnProperty('customAttribute');
        expect(ohmObject.props.customAttribute).to.equal('divClass1 divClass2');

        const button = ohmObject.children[0] as OhmNode;
        expect(button.tag).to.equal('button');
        expect(button.props).to.haveOwnProperty('class');
        expect(button.props.class).to.equal('cOne cTwo');
        expect(button.props).to.haveOwnProperty('style');
        expect(button.props.style).to.equal(
          'background-color: red; color: blue'
        );
        expect(button.props).to.haveOwnProperty('disabled');
        expect(button.props.disabled).to.equal('');
        expect(button.children[0]).to.equal('Text 1');

        expect(ohmObject.children[1]).to.equal('Text 2');
      });
    });
  });

  describe('html with dynamic properties', function () {
    it('handles simple text replacement', function () {
      const dynamicText = 'dynamic text 1';
      const ohmObject = ohm`
          <div customAttribute="divClass1 divClass2">
            ${dynamicText}
          </div>
        `;

      expect(ohmObject.children.length).to.equal(1);
      expect(ohmObject.children[0]).to.equal(dynamicText);
    });

    it('handles the creation of dynamic tags', function () {
      const count = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
      const ohmObject = ohm`
          <ul customAttribute="divClass1 divClass2">
            ${count
              .map((val) => `<li key="key-${val}">Val is ${val}</li>`)
              .join('\n')}
          </ul>
        `;

      expect(ohmObject.tag).to.equal('ul');
      expect(ohmObject.children.length).to.equal(count.length);
      count.forEach((val) => {
        const child = ohmObject.children[val] as OhmNode;
        expect(child.tag).to.equal('li');
        expect(child.children.length).to.equal(1);
        expect(child.children[0]).to.equal(`Val is ${val}`);
        expect(child.props).to.haveOwnProperty('key');
        expect(child.props.key).to.equal(`key-${val}`);
      });
    });
  });
});
